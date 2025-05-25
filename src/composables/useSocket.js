// composables/useSocket.js - Socket.IO Client Composable
import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

let socket = null
let realtimeStore = null
let toast = null

// Lazy load dependencies
const getRealtimeStore = () => {
    if (!realtimeStore) {
        const { useRealtimeStore } = require('../stores/realtime.js')
        realtimeStore = useRealtimeStore()
    }
    return realtimeStore
}

const getToast = () => {
    if (!toast) {
        const { useToast } = require('vue-toastification')
        toast = useToast()
    }
    return toast
}

// Socket URL'ini environment'a göre belirle
const getSocketUrl = () => {
    // Production build'de environment variable'ı kullan
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL.replace('/api', '');
    }

    // Development ortamında localhost kullan
    if (import.meta.env.DEV) {
        return 'http://localhost:3000';
    }

    // Fallback: current origin
    return window.location.origin;
};

export function useSocket() {
    const isConnecting = ref(false)
    const reconnectAttempts = ref(0)
    const maxReconnectAttempts = 5

    const connect = () => {
        if (socket?.connected) {
            console.log('Socket already connected')
            return socket
        }

        const socketUrl = getSocketUrl()
        console.log('🔌 Socket bağlantısı kuruluyor:', socketUrl)

        isConnecting.value = true

        socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
        })

        // Connection events
        socket.on('connect', () => {
            console.log('✅ Socket bağlantısı kuruldu:', socket.id)
            isConnecting.value = false
            reconnectAttempts.value = 0
            try {
                getRealtimeStore().setConnectionStatus(true)
            } catch (e) {
                console.warn('Store not available for connection status update')
            }

            // Join relevant rooms
            joinRooms()
        })

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket bağlantısı kesildi:', reason)
            try {
                getRealtimeStore().setConnectionStatus(false)
            } catch (e) {
                console.warn('Store not available for connection status update')
            }

            if (reason === 'io server disconnect') {
                // Server initiated disconnect, try to reconnect
                setTimeout(() => {
                    if (reconnectAttempts.value < maxReconnectAttempts) {
                        reconnectAttempts.value++
                        connect()
                    }
                }, 3000)
            }
        })

        socket.on('connect_error', (error) => {
            console.error('🔥 Socket bağlantı hatası:', error)
            isConnecting.value = false
            try {
                getRealtimeStore().setConnectionStatus(false)
            } catch (e) {
                console.warn('Store not available for connection status update')
            }

            if (error.message === 'Authentication required' || error.message === 'Invalid token') {
                try {
                    getToast().error('Oturum süresi doldu, lütfen tekrar giriş yapın')
                } catch (e) {
                    console.warn('Toast not available')
                }
                // Redirect to login or refresh token
                localStorage.removeItem('token')
                window.location.href = '/login'
            }
        })

        // Real-time event listeners
        setupEventListeners()

        return socket
    }

    const joinRooms = () => {
        if (!socket?.connected) return

        const user = JSON.parse(localStorage.getItem('user') || '{}')

        // Join stock updates room for all users
        socket.emit('join_stock_room')

        // Join cargo updates room
        socket.emit('join_cargo_room')

        console.log('Joined real-time rooms')
    }

    const joinOrderRoom = (orderId) => {
        if (!socket?.connected) return
        socket.emit('join_order_room', orderId)
        console.log(`Joined order room: ${orderId}`)
    }

    const setupEventListeners = () => {
        if (!socket) return

        // New order notifications (for admins)
        socket.on('new_order', (data) => {
            console.log('New order received:', data)
            try {
                getRealtimeStore().addNotification({
                    type: 'info',
                    title: 'Yeni Sipariş',
                    message: `${data.customerName} - ₺${data.amount}`,
                    icon: 'mdi-cart-plus',
                    color: 'success',
                    orderId: data.orderId
                })

                // Add to order updates
                getRealtimeStore().addOrderUpdate({
                    orderId: data.orderId,
                    customerName: data.customerName,
                    amount: data.amount,
                    status: data.status,
                    delivery: data.delivery,
                    type: 'new_order'
                })

                // Show toast notification
                getToast().success(`Yeni sipariş: ${data.customerName}`)
            } catch (e) {
                console.warn('Store/Toast not available for new order notification')
            }
        })

        // Order status updates
        socket.on('order_updated', (data) => {
            console.log('Order updated:', data)
            try {
                getRealtimeStore().addOrderUpdate({
                    orderId: data.orderId,
                    ...data,
                    type: 'status_update'
                })

                getToast().info(`Sipariş #${data.orderId} güncellendi`)
            } catch (e) {
                console.warn('Store/Toast not available for order update')
            }
        })

        // Order notifications (general)
        socket.on('order_notification', (data) => {
            console.log('Order notification:', data)
            try {
                getRealtimeStore().addNotification({
                    type: 'info',
                    title: 'Sipariş Bildirimi',
                    message: `Sipariş #${data.orderId} - ${data.data.status || 'Güncellendi'}`,
                    icon: 'mdi-bell',
                    color: 'info'
                })
            } catch (e) {
                console.warn('Store not available for order notification')
            }
        })

        // Stock updates
        socket.on('stock_updated', (data) => {
            console.log('Stock updated:', data)
            try {
                getRealtimeStore().addStockAlert(data)

                if (data.isLowStock) {
                    getToast().warning(`Düşük stok: ${data.productName}`)
                }
            } catch (e) {
                console.warn('Store/Toast not available for stock update')
            }
        })

        // Low stock alerts
        socket.on('low_stock_alert', (data) => {
            console.log('Low stock alert:', data)
            try {
                getRealtimeStore().addNotification({
                    type: 'warning',
                    title: 'KRİTİK STOK UYARISI',
                    message: `${data.productName}: ${data.currentStock}g kaldı`,
                    icon: 'mdi-alert-circle',
                    color: 'error'
                })

                getToast().error(`KRİTİK STOK: ${data.productName}`)
            } catch (e) {
                console.warn('Store/Toast not available for low stock alert')
            }
        })

        // Cargo updates
        socket.on('cargo_updated', (data) => {
            console.log('Cargo updated:', data)
            try {
                getRealtimeStore().addCargoUpdate(data)
            } catch (e) {
                console.warn('Store not available for cargo update')
            }
        })

        // System notifications
        socket.on('system_notification', (data) => {
            try {
                getRealtimeStore().addNotification({
                    type: data.type || 'info',
                    title: data.title,
                    message: data.message,
                    icon: data.icon || 'mdi-information',
                    color: data.color || 'info'
                })
            } catch (e) {
                console.warn('Store not available for system notification')
            }
        })
    }

    const disconnect = () => {
        if (socket) {
            console.log('🔌 Socket bağlantısı kapatılıyor...')
            socket.disconnect()
            socket = null
            try {
                getRealtimeStore().setConnectionStatus(false)
            } catch (e) {
                console.warn('Store not available for connection status update')
            }
            console.log('Socket manually disconnected')
        }
    }

    const emit = (event, data) => {
        if (socket?.connected) {
            socket.emit(event, data)
        } else {
            console.warn('⚠️ Socket bağlı değil, event gönderilemedi:', event)
        }
    }

    const getSocket = () => socket

    return {
        connect,
        disconnect,
        joinOrderRoom,
        emit,
        getSocket,
        isConnecting,
        reconnectAttempts
    }
}

// Global socket service - safe lazy initialization
class SocketService {
    constructor() {
        this._instance = null
    }

    getInstance() {
        if (!this._instance) {
            this._instance = useSocket()
        }
        return this._instance
    }

    connect() {
        return this.getInstance().connect()
    }

    disconnect() {
        return this.getInstance().disconnect()
    }

    joinOrderRoom(orderId) {
        return this.getInstance().joinOrderRoom(orderId)
    }

    emit(event, data) {
        return this.getInstance().emit(event, data)
    }

    getSocket() {
        return this.getInstance().getSocket()
    }
}

export const socketService = new SocketService() 