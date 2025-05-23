<template>
  <div class="notification-panel">
    <!-- Notification Bell Icon -->
    <v-btn
      icon
      size="large"
      class="notification-button"
      @click="togglePanel"
      :color="hasUnread ? 'primary' : 'default'"
    >
      <v-icon :color="hasUnread ? 'white' : 'grey'">
        {{ hasUnread ? 'mdi-bell-ring' : 'mdi-bell' }}
      </v-icon>
      <v-badge
        v-if="unreadCount > 0"
        :content="unreadCount > 99 ? '99+' : unreadCount"
        color="error"
        offset-x="8"
        offset-y="8"
      />
    </v-btn>

    <!-- Notification Panel -->
    <v-menu
      v-model="isOpen"
      :close-on-content-click="false"
      location="bottom end"
      width="400"
      max-height="600"
    >
      <template v-slot:activator="{ props }">
        <span v-bind="props"></span>
      </template>

      <v-card class="notification-card">
        <!-- Header -->
        <v-card-title class="d-flex justify-space-between align-center pa-4 bg-primary">
          <div class="text-white">
            <h3>Bildirimler</h3>
            <div class="d-flex align-center">
              <v-icon
                :color="realtimeStore.isConnected ? 'success' : 'error'"
                size="small"
                class="mr-1"
              >
                {{ realtimeStore.isConnected ? 'mdi-wifi' : 'mdi-wifi-off' }}
              </v-icon>
              <span class="text-caption">
                {{ realtimeStore.isConnected ? 'Canlı' : 'Bağlantı Yok' }}
              </span>
            </div>
          </div>
          <div class="d-flex">
            <v-btn
              icon
              size="small"
              variant="text"
              @click="markAllRead"
              class="text-white mr-2"
            >
              <v-icon>mdi-check-all</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              @click="clearAll"
              class="text-white"
            >
              <v-icon>mdi-delete-sweep</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <!-- Notifications List -->
        <v-card-text class="pa-0" style="max-height: 400px; overflow-y: auto;">
          <v-list v-if="notifications.length > 0" class="pa-0">
            <template v-for="(notification, index) in notifications" :key="notification.id">
              <v-list-item
                :class="{
                  'notification-item': true,
                  'unread': !notification.read,
                  'critical': notification.type === 'critical'
                }"
                @click="markAsRead(notification.id)"
              >
                <template v-slot:prepend>
                  <v-avatar
                    :color="getNotificationColor(notification)"
                    size="40"
                    class="mr-3"
                  >
                    <v-icon :color="notification.type === 'warning' || notification.type === 'error' ? 'white' : 'primary'">
                      {{ notification.icon || 'mdi-bell' }}
                    </v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-body-2 font-weight-medium">
                  {{ notification.title }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ notification.message }}
                </v-list-item-subtitle>
                <v-list-item-subtitle class="text-caption mt-1">
                  {{ formatTime(notification.timestamp) }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <div class="d-flex flex-column align-center">
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="removeNotification(notification.id)"
                    >
                      <v-icon size="16">mdi-close</v-icon>
                    </v-btn>
                    <v-chip
                      v-if="!notification.read"
                      size="x-small"
                      color="primary"
                      class="mt-1"
                    >
                      Yeni
                    </v-chip>
                  </div>
                </template>
              </v-list-item>
              <v-divider v-if="index < notifications.length - 1" />
            </template>
          </v-list>

          <!-- Empty State -->
          <div v-else class="d-flex flex-column align-center justify-center pa-8">
            <v-icon size="64" color="grey-lighten-2">mdi-bell-off</v-icon>
            <p class="text-body-2 text-grey mt-4">Henüz bildirim yok</p>
          </div>
        </v-card-text>

        <!-- Footer -->
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn
            size="small"
            variant="text"
            @click="viewAllNotifications"
          >
            Tümünü Görüntüle
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

    <!-- Connection Status Snackbar -->
    <v-snackbar
      v-model="showConnectionStatus"
      :color="realtimeStore.isConnected ? 'success' : 'error'"
      timeout="3000"
      location="bottom"
    >
      <v-icon class="mr-2">
        {{ realtimeStore.isConnected ? 'mdi-wifi' : 'mdi-wifi-off' }}
      </v-icon>
      {{ realtimeStore.isConnected ? 'Bağlantı kuruldu' : 'Bağlantı kesildi' }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRealtimeStore } from '../stores/realtime.js'
// import { socketService } from '../composables/useSocket.js' // Socket.IO disabled

const realtimeStore = useRealtimeStore()
const isOpen = ref(false)
const showConnectionStatus = ref(false)

// Computed
const notifications = computed(() => realtimeStore.notifications)
const unreadCount = computed(() => realtimeStore.unreadNotifications)
const hasUnread = computed(() => unreadCount.value > 0)

// Methods
const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const markAsRead = (notificationId) => {
  realtimeStore.markAsRead(notificationId)
}

const markAllRead = () => {
  realtimeStore.markAllAsRead()
}

const removeNotification = (notificationId) => {
  realtimeStore.removeNotification(notificationId)
}

const clearAll = () => {
  realtimeStore.clearAll()
}

const viewAllNotifications = () => {
  isOpen.value = false
  // Navigate to detailed notifications page
  // router.push('/notifications')
}

const getNotificationColor = (notification) => {
  const colorMap = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
    critical: 'error'
  }
  return colorMap[notification.type] || 'primary'
}

const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInMinutes = Math.floor((now - time) / 60000)
  
  if (diffInMinutes < 1) {
    return 'Şimdi'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} dk önce`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours} saat önce`
  } else {
    return time.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// Watch connection status
watch(
  () => realtimeStore.isConnected,
  (newStatus, oldStatus) => {
    if (oldStatus !== undefined && newStatus !== oldStatus) {
      showConnectionStatus.value = true
    }
  }
)

// Initialize socket connection
onMounted(() => {
  // Socket.IO temporarily disabled
  // const token = localStorage.getItem('token')
  // if (token) {
  //   socketService.connect()
  // }
})

onUnmounted(() => {
  // Don't disconnect here as other components might be using it
  // socketService.disconnect()
})
</script>

<style scoped>
.notification-panel {
  position: relative;
}

.notification-button {
  position: relative;
}

.notification-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.notification-item {
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.notification-item.unread {
  background-color: rgba(25, 118, 210, 0.05);
  border-left-color: #1976d2;
}

.notification-item.critical {
  background-color: rgba(244, 67, 54, 0.05);
  border-left-color: #f44336;
  animation: pulse 2s infinite;
}

.notification-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}
</style> 