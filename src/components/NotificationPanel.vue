<template>
  <div class="notification-panel">
    <!-- Normal Mode - Bell Button & Dropdown -->
    <div v-if="!embedded">
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
          <v-card-title class="d-flex justify-space-between align-center pa-4 notification-header">
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
            <NotificationList
              :notifications="notifications"
              :embedded="false"
              @notification-click="handleNotificationClick"
              @remove-notification="removeNotification"
            />
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
    </div>

    <!-- Embedded Mode - Direct Notifications List -->
    <div v-else class="embedded-panel">
      <NotificationList
        :notifications="notifications"
        :embedded="true"
        @notification-click="handleNotificationClick"
        @remove-notification="removeNotification"
      />
    </div>

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

    <!-- Tümünü Göster Dialog -->
    <v-dialog v-model="showAllDialog" max-width="700" persistent>
      <v-card class="notification-dialog">
        <v-card-title class="d-flex justify-space-between align-center pa-4 notification-header text-white">
          <div>
            <h3>📋 Tüm Bildirimler</h3>
            <div class="text-caption">
              {{ notifications.length }} bildirim • {{ unreadCount }} okunmamış
            </div>
          </div>
          <v-btn icon size="small" @click="showAllDialog = false" class="text-white">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-0">
          <NotificationList
            :notifications="notifications"
            :embedded="false"
            :dialog-mode="true"
            @notification-click="handleDialogNotificationClick"
            @remove-notification="removeNotification"
          />
        </v-card-text>

        <!-- Dialog Footer -->
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn
            variant="text"
            color="grey-darken-1"
            @click="showAllDialog = false"
          >
            <v-icon class="mr-1">mdi-close</v-icon>
            Kapat
          </v-btn>
          
          <v-spacer />
          
          <v-btn
            v-if="unreadCount > 0"
            variant="tonal"
            color="primary"
            @click="markAllReadInDialog"
          >
            <v-icon class="mr-1">mdi-check-all</v-icon>
            Tümünü Okundu İşaretle
          </v-btn>
          
          <v-btn
            variant="tonal"
            color="warning"
            @click="goToStockPage"
          >
            <v-icon class="mr-1">mdi-warehouse</v-icon>
            Stok Sayfasına Git
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRealtimeStore } from '../stores/realtime.js'
import NotificationList from './NotificationList.vue'

// Props
const props = defineProps({
  embedded: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const realtimeStore = useRealtimeStore()
const isOpen = ref(false)
const showConnectionStatus = ref(false)
const showAllDialog = ref(false)

// Computed
const notifications = computed(() => realtimeStore.notifications)
const unreadCount = computed(() => realtimeStore.unreadNotifications)
const hasUnread = computed(() => unreadCount.value > 0)

// Auto-read notifications
const autoMarkAsRead = () => {
  notifications.value.forEach(notification => {
    if (notification.autoRemove && !notification.readTimer && !notification.read) {
      notification.readTimer = setTimeout(() => {
        console.log('⏰ Otomatik okundu işareti:', notification.title)
        markAsRead(notification.id)
      }, 8000)
    }
  })
}

// Methods
const togglePanel = () => {
  console.log('🔔 Bell buton tıklandı. Panel açık mı?', isOpen.value)
  isOpen.value = !isOpen.value
}

const handleNotificationClick = (notification) => {
  console.log('🔔 Notification tıklandı:', notification)
  
  markAsRead(notification.id)
  
  if (notification.navigationAction) {
    console.log('🧭 Navigation action var, yönlendiriliyor...')
    navigateToAction(notification)
  }
}

const navigateToAction = (notification) => {
  console.log('🧭 Navigation başlatılıyor:', notification.navigationAction)
  
  if (notification.navigationAction) {
    try {
      isOpen.value = false
      
      setTimeout(() => {
        router.push(notification.navigationAction)
          .then(() => {
            console.log('✅ Navigation başarılı:', notification.navigationAction)
          })
          .catch((error) => {
            console.error('❌ Router navigation hatası:', error)
            window.location.href = notification.navigationAction
          })
      }, 200)
      
    } catch (error) {
      console.error('❌ Navigation exception:', error)
      setTimeout(() => {
        window.location.href = notification.navigationAction
      }, 300)
    }
  }
}

const markAsRead = (notificationId) => {
  console.log('✅ Notification read olarak işaretleniyor:', notificationId)
  realtimeStore.markAsRead(notificationId)
}

const markAllRead = () => {
  console.log('✅ Tüm bildirimler read olarak işaretleniyor')
  realtimeStore.markAllAsRead()
}

const removeNotification = (notificationId) => {
  console.log('🗑️ Notification siliniyor:', notificationId)
  realtimeStore.removeNotification(notificationId)
}

const clearAll = () => {
  console.log('🧹 Tüm bildirimler temizleniyor')
  realtimeStore.clearAll()
}

const viewAllNotifications = () => {
  console.log('📋 Tümünü göster butonuna tıklandı')
  isOpen.value = false
  showAllDialog.value = true
}

const handleDialogNotificationClick = (notification) => {
  console.log('🔔 Dialog içindeki notification tıklandı:', notification)
  markAsRead(notification.id)
  if (notification.navigationAction) {
    navigateFromDialog(notification)
  }
}

const navigateFromDialog = (notification) => {
  console.log('🧭 Dialog içinden navigation başlatılıyor:', notification.navigationAction)
  if (notification.navigationAction) {
    try {
      showAllDialog.value = false
      
      setTimeout(() => {
        router.push(notification.navigationAction)
          .then(() => {
            console.log('✅ Navigation başarılı:', notification.navigationAction)
          })
          .catch((error) => {
            console.error('❌ Router navigation hatası:', error)
            window.location.href = notification.navigationAction
          })
      }, 200)
      
    } catch (error) {
      console.error('❌ Dialog navigation exception:', error)
      setTimeout(() => {
        window.location.href = notification.navigationAction
      }, 300)
    }
  }
}

const markAllReadInDialog = () => {
  console.log('✅ Dialog içindeki tüm bildirimler read olarak işaretleniyor')
  realtimeStore.markAllAsRead()
}

const goToStockPage = () => {
  console.log('📋 Stok sayfasına git butonuna tıklandı')
  showAllDialog.value = false
  setTimeout(() => {
    router.push('/main/stok-yonetimi')
      .then(() => {
        console.log('✅ Stok sayfasına yönlendirme başarılı')
      })
      .catch((error) => {
        console.error('❌ Stok sayfasına yönlendirme hatası:', error)
        window.location.href = '/main/stok-yonetimi'
      })
  }, 200)
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

// Watch notifications for auto-remove
watch(
  () => notifications.value,
  (newNotifications, oldNotifications) => {
    console.log('📬 Notifications değişti:', {
      yeni: newNotifications?.length || 0,
      eski: oldNotifications?.length || 0
    })
    autoMarkAsRead()
  },
  { deep: true }
)

onMounted(() => {
  console.log('🔔 NotificationPanel mount edildi, embedded:', props.embedded)
  console.log('📊 Başlangıç notification sayısı:', realtimeStore.notifications.length)
})

onUnmounted(() => {
  // Cleanup
})
</script>

<style scoped>
.notification-panel {
  position: relative;
  height: 100%;
}

.embedded-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.notification-button {
  position: relative;
}

.notification-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.notification-header {
  background: linear-gradient(135deg, #455a64 0%, #37474f 100%) !important;
  color: #ffffff !important;
}

/* Dialog Styles */
.notification-dialog {
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden;
}

.notification-dialog .v-card-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
</style> 