// stores/realtime.js - Real-time Notifications Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRealtimeStore = defineStore('realtime', () => {
    // State
    const isConnected = ref(false) // Socket.IO disabled
    const notifications = ref([])
    const activeUsers = ref(0)
    const orderUpdates = ref([])
    const stockAlerts = ref([])
    const cargoUpdates = ref([])

    // Getters
    const unreadNotifications = computed(() =>
        notifications.value.filter(n => !n.read).length
    )

    const criticalAlerts = computed(() =>
        notifications.value.filter(n => n.type === 'critical' && !n.read)
    )

    const recentOrderUpdates = computed(() =>
        orderUpdates.value.slice(0, 10)
    )

    // Actions
    function addNotification(notification) {
        const newNotification = {
            id: Date.now() + Math.random(),
            timestamp: new Date(),
            read: false,
            ...notification
        }
        notifications.value.unshift(newNotification)

        // Auto-remove old notifications (keep last 50)
        if (notifications.value.length > 50) {
            notifications.value = notifications.value.slice(0, 50)
        }
    }

    function markAsRead(notificationId) {
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification) {
            notification.read = true
        }
    }

    function markAllAsRead() {
        notifications.value.forEach(n => n.read = true)
    }

    function removeNotification(notificationId) {
        const index = notifications.value.findIndex(n => n.id === notificationId)
        if (index > -1) {
            notifications.value.splice(index, 1)
        }
    }

    function addOrderUpdate(update) {
        orderUpdates.value.unshift({
            id: Date.now() + Math.random(),
            timestamp: new Date(),
            ...update
        })

        // Keep last 20 updates
        if (orderUpdates.value.length > 20) {
            orderUpdates.value = orderUpdates.value.slice(0, 20)
        }
    }

    function addStockAlert(alert) {
        stockAlerts.value.unshift({
            id: Date.now() + Math.random(),
            timestamp: new Date(),
            ...alert
        })

        // Auto-notification for critical stock
        if (alert.isLowStock) {
            addNotification({
                type: 'warning',
                title: 'Düşük Stok Uyarısı',
                message: `${alert.productName} stoku kritik seviyede: ${alert.currentStock}g`,
                icon: 'mdi-alert-circle',
                color: 'warning'
            })
        }
    }

    function addCargoUpdate(update) {
        cargoUpdates.value.unshift({
            id: Date.now() + Math.random(),
            timestamp: new Date(),
            ...update
        })

        // Notification for status changes
        addNotification({
            type: 'info',
            title: 'Kargo Güncellemesi',
            message: `Sipariş #${update.orderId} - ${update.status}`,
            icon: 'mdi-truck',
            color: 'info'
        })
    }

    function setConnectionStatus(status) {
        // Socket.IO temporarily disabled - always false
        isConnected.value = false
    }

    function setActiveUsers(count) {
        activeUsers.value = count
    }

    function clearAll() {
        notifications.value = []
        orderUpdates.value = []
        stockAlerts.value = []
        cargoUpdates.value = []
    }

    return {
        // State
        isConnected,
        notifications,
        activeUsers,
        orderUpdates,
        stockAlerts,
        cargoUpdates,

        // Getters
        unreadNotifications,
        criticalAlerts,
        recentOrderUpdates,

        // Actions
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        addOrderUpdate,
        addStockAlert,
        addCargoUpdate,
        setConnectionStatus,
        setActiveUsers,
        clearAll
    }
}) 