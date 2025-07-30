import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { apiCall } from '../utils/api'

/**
 * 🚀 CONCURRENT ORDER HANDLING COMPOSABLE
 * 7 kullanıcının aynı anda sipariş girişi için optimize edilmiş
 */
export function useConcurrentOrderHandling() {
    const toast = useToast()

    // State management
    const activeOrders = ref(new Set()) // Aktif sipariş işlemleri
    const systemLoad = ref('normal') // normal, high, critical
    const lastOrderTime = ref(null)
    const orderQueue = ref([]) // Sipariş kuyruğu

    // System status
    const isSystemBusy = computed(() => activeOrders.value.size >= 5)
    const canSubmitOrder = computed(() =>
        systemLoad.value !== 'critical' && activeOrders.value.size < 7
    )

    /**
     * 📊 System Load Monitoring
     */
    const updateSystemLoad = () => {
        const activeCount = activeOrders.value.size

        if (activeCount >= 6) {
            systemLoad.value = 'critical'
        } else if (activeCount >= 3) {
            systemLoad.value = 'high'
        } else {
            systemLoad.value = 'normal'
        }
    }

    /**
     * ⚡ Optimistic Order Creation with Concurrency Control
     */
    const createOrderSafe = async (orderData, userId = 'anonymous') => {
        const orderId = `order_${Date.now()}_${userId}`

        // 1. Pre-submission checks
        if (!canSubmitOrder.value) {
            throw new Error('🚨 Sistem yoğun. Lütfen birkaç saniye bekleyip tekrar deneyin.')
        }

        // 2. Rate limiting check
        const now = Date.now()
        if (lastOrderTime.value && (now - lastOrderTime.value) < 2000) {
            throw new Error('⏰ Çok hızlı sipariş girişi. 2 saniye bekleyin.')
        }

        // 3. Add to active orders
        activeOrders.value.add(orderId)
        updateSystemLoad()
        lastOrderTime.value = now

        try {
            // 4. Show user feedback
            if (systemLoad.value === 'high') {
                toast.warning('⚠️ Sistem yoğun - İşleminiz biraz gecikebilir')
            }

            // 5. Create order with retry mechanism
            const result = await createOrderWithRetry(orderData, orderId)

            // 6. Success feedback
            toast.success('✅ Sipariş başarıyla oluşturuldu!')
            return result

        } catch (error) {
            // 7. Error handling
            console.error(`❌ Order creation failed for ${orderId}:`, error)

            if (error.message.includes('concurrent load')) {
                toast.error('🚨 Çok fazla eş zamanlı işlem. Lütfen bekleyip tekrar deneyin.')
                // Add to queue for retry
                orderQueue.value.push({ orderData, userId, retryCount: 0 })
                processQueue()
            } else {
                toast.error(`❌ Sipariş oluşturulamadı: ${error.message}`)
            }

            throw error

        } finally {
            // 8. Cleanup
            activeOrders.value.delete(orderId)
            updateSystemLoad()
        }
    }

    /**
     * 🔄 Retry Mechanism
     */
    const createOrderWithRetry = async (orderData, orderId, maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await apiCall('/siparis', {
                    method: 'POST',
                    data: orderData,
                    timeout: 15000, // 15s timeout for concurrent operations
                    headers: {
                        'X-Order-ID': orderId,
                        'X-Attempt': attempt.toString()
                    }
                })

                return result

            } catch (error) {
                console.warn(`Attempt ${attempt}/${maxRetries} failed for ${orderId}:`, error.message)

                if (attempt === maxRetries) {
                    throw error
                }

                // Exponential backoff
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    /**
     * 📋 Queue Processing for Failed Orders
     */
    const processQueue = async () => {
        if (orderQueue.value.length === 0 || !canSubmitOrder.value) {
            return
        }

        const queuedOrder = orderQueue.value.shift()
        if (!queuedOrder) return

        try {
            await createOrderSafe(queuedOrder.orderData, queuedOrder.userId)
            toast.success('✅ Bekleyen sipariş işlendi!')

        } catch (error) {
            queuedOrder.retryCount++

            if (queuedOrder.retryCount < 3) {
                // Add back to queue
                orderQueue.value.push(queuedOrder)
                setTimeout(processQueue, 5000) // Retry after 5 seconds
            } else {
                toast.error('❌ Sipariş işlenemedi. Lütfen manuel olarak tekrar deneyin.')
            }
        }
    }

    /**
     * 🎮 User Experience Helpers
     */
    const getSystemStatusMessage = computed(() => {
        switch (systemLoad.value) {
            case 'critical':
                return {
                    message: '🔴 Sistem çok yoğun - Lütfen bekleyin',
                    color: 'error',
                    showProgress: true
                }
            case 'high':
                return {
                    message: '🟡 Sistem yoğun - İşlem gecikebilir',
                    color: 'warning',
                    showProgress: true
                }
            default:
                return {
                    message: '🟢 Sistem normal',
                    color: 'success',
                    showProgress: false
                }
        }
    })

    const getSubmitButtonState = computed(() => ({
        disabled: !canSubmitOrder.value,
        loading: isSystemBusy.value,
        text: canSubmitOrder.value
            ? 'Sipariş Oluştur'
            : `Bekliyor (${activeOrders.value.size}/7)`,
        color: canSubmitOrder.value ? 'primary' : 'grey'
    }))

    /**
     * 📈 Performance Monitoring
     */
    const getPerformanceStats = () => ({
        activeOrders: activeOrders.value.size,
        systemLoad: systemLoad.value,
        queueLength: orderQueue.value.length,
        canSubmit: canSubmitOrder.value,
        lastOrderTime: lastOrderTime.value
    })

    /**
     * 🧹 Cleanup Function
     */
    const cleanup = () => {
        activeOrders.value.clear()
        orderQueue.value = []
        systemLoad.value = 'normal'
        lastOrderTime.value = null
    }

    // Auto-cleanup queue processing
    setInterval(processQueue, 3000)

    return {
        // State
        activeOrders: computed(() => activeOrders.value.size),
        systemLoad: computed(() => systemLoad.value),
        isSystemBusy,
        canSubmitOrder,

        // Functions
        createOrderSafe,
        getSystemStatusMessage,
        getSubmitButtonState,
        getPerformanceStats,
        cleanup,

        // Queue
        queueLength: computed(() => orderQueue.value.length)
    }
}

/**
 * 🎯 DEBOUNCED INPUT HELPER
 * Prevent rapid form submissions
 */
export function useOrderFormDebounce(delay = 2000) {
    const lastSubmission = ref(null)
    const isDebouncing = ref(false)

    const canSubmit = computed(() => {
        if (!lastSubmission.value) return true
        return Date.now() - lastSubmission.value >= delay
    })

    const submitWithDebounce = async (submitFunction) => {
        if (!canSubmit.value) {
            throw new Error(`⏰ Çok hızlı! ${Math.ceil((delay - (Date.now() - lastSubmission.value)) / 1000)} saniye bekleyin.`)
        }

        isDebouncing.value = true
        lastSubmission.value = Date.now()

        try {
            const result = await submitFunction()
            return result
        } finally {
            // Keep debouncing for the full delay
            setTimeout(() => {
                isDebouncing.value = false
            }, delay)
        }
    }

    return {
        canSubmit,
        isDebouncing,
        submitWithDebounce,
        remainingTime: computed(() => {
            if (canSubmit.value) return 0
            return Math.ceil((delay - (Date.now() - lastSubmission.value)) / 1000)
        })
    }
} 