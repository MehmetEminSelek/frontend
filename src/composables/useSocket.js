// composables/useSocket.js - Socket.IO Client Composable
import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../config'

let socket = null
let realtimeStore = null
let toast = null
let authStore = null

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

const getAuthStore = () => {
    if (!authStore) {
        const { useAuthStore } = require('../stores/auth.js')
        authStore = useAuthStore()
    }
    return authStore
}

export function useSocket() {
    const isConnecting = ref(false)
    const reconnectAttempts = ref(0)
    const maxReconnectAttempts = 5

    const connect = () => {
        const aStore = getAuthStore()
        const token = aStore?.accessToken || localStorage.getItem('accessToken')

        if (!socket) {
            socket = io(SOCKET_URL, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                auth: token ? { token } : undefined
            })
        }
        return socket
    }

    const disconnect = () => {
        if (socket) {
            socket.disconnect()
            socket = null
        }
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

    const emit = (event, data) => {
        if (socket?.connected) {
            socket.emit(event, data)
        } else {
            console.warn('Socket not connected, cannot emit:', event)
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