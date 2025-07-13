<template>
  <!-- Bu component artık sadece programmatik interface sağlar -->
  <!-- Tüm UI NotificationPanel component'inde gösterilir -->
  <div style="display: none;"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRealtimeStore } from '../stores/realtime.js'

// Router
const router = useRouter()

// Store
const realtimeStore = useRealtimeStore()

// Settings
const isEnabled = ref(true)
const settings = ref({
  critical: true,
  warning: true,
  info: false
})

// Methods
const addNotification = (notification) => {
  if (!isEnabled.value) return
  
  // Check if this type is enabled
  if (notification.type === 'critical' && !settings.value.critical) return
  if (notification.type === 'warning' && !settings.value.warning) return
  if (notification.type === 'info' && !settings.value.info) return

  // Icon mapping
  const iconMap = {
    critical: 'mdi-alert-circle',
    warning: 'mdi-alert',
    success: 'mdi-check-circle',
    info: 'mdi-information'
  }

  // Add to realtime store
  realtimeStore.addNotification({
    type: notification.type || 'info',
    title: notification.title,
    message: notification.message,
    icon: notification.icon || iconMap[notification.type] || 'mdi-bell',
    details: notification.details,
    action: notification.action,
    actionText: notification.actionText,
    autoRemove: notification.autoHide !== false,
    orderId: notification.orderId
  })

  // Handle action navigation if provided
  if (notification.action && typeof notification.action === 'string') {
    // Store the action for later use in NotificationPanel
    const lastNotification = realtimeStore.notifications[0]
    if (lastNotification) {
      lastNotification.navigationAction = notification.action
    }
  }
}

const clearAllNotifications = () => {
  realtimeStore.clearAll()
}

const dismissNotification = (id) => {
  realtimeStore.removeNotification(id)
}

const updateSettings = () => {
  // Save to localStorage
  localStorage.setItem('stockNotificationSettings', JSON.stringify({
    enabled: isEnabled.value,
    ...settings.value
  }))
}

const loadSettings = () => {
  try {
    const saved = localStorage.getItem('stockNotificationSettings')
    if (saved) {
      const parsed = JSON.parse(saved)
      isEnabled.value = parsed.enabled !== false
      settings.value = {
        critical: parsed.critical !== false,
        warning: parsed.warning !== false,
        info: parsed.info === true
      }
    }
  } catch (e) {
    console.warn('Bildirim ayarları yüklenemedi:', e)
  }
}

// Lifecycle
onMounted(() => {
  loadSettings()
})

// Expose methods for global use
defineExpose({
  addNotification,
  clearAllNotifications,
  dismissNotification
})
</script>

<!-- Artık CSS'e ihtiyaç yok - UI NotificationPanel'de --> 