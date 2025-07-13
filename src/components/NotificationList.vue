<template>
  <div class="notification-list" :class="{ 'embedded': embedded, 'dialog-mode': dialogMode }">
    <v-list v-if="notifications.length > 0" class="pa-0" :class="listClasses">
      <template v-for="(notification, index) in notifications" :key="notification.id">
        <v-list-item
          :class="getNotificationClasses(notification)"
          @click="$emit('notificationClick', notification)"
          :style="{ cursor: 'pointer' }"
        >
          <template v-slot:prepend>
            <v-avatar
              :color="getNotificationColor(notification)"
              :size="embedded ? 32 : (dialogMode ? 48 : 40)"
              class="mr-3"
            >
              <v-icon :color="getIconColor(notification)" :size="embedded ? 18 : (dialogMode ? 24 : 20)">
                {{ notification.icon || 'mdi-bell' }}
              </v-icon>
            </v-avatar>
          </template>

          <div class="flex-grow-1">
            <v-list-item-title :class="getTitleClasses()">
              {{ notification.title }}
            </v-list-item-title>
            <v-list-item-subtitle :class="getSubtitleClasses()">
              {{ notification.message }}
            </v-list-item-subtitle>
            
            <!-- Detaylar -->
            <v-list-item-subtitle v-if="notification.details" :class="getDetailsClasses()">
              <v-icon v-if="dialogMode" size="12" class="mr-1">mdi-information</v-icon>
              {{ notification.details }}
            </v-list-item-subtitle>
            
            <!-- Sipariş ID -->
            <v-chip
              v-if="notification.orderId"
              :size="embedded ? 'x-small' : 'small'"
              color="primary"
              variant="outlined"
              class="mt-1 mr-2"
            >
              <v-icon v-if="!embedded" size="14" class="mr-1">mdi-package</v-icon>
              Sipariş #{{ notification.orderId }}
            </v-chip>
            
            <!-- Action Button -->
            <v-btn
              v-if="!embedded && (notification.navigationAction || notification.actionText)"
              :size="dialogMode ? 'small' : 'x-small'"
              :variant="dialogMode ? 'tonal' : 'outlined'"
              :color="getNotificationColor(notification)"
              class="mt-1"
              @click.stop="$emit('notificationClick', notification)"
            >
              <v-icon :size="dialogMode ? 16 : 12" class="mr-1">mdi-open-in-new</v-icon>
              {{ notification.actionText || 'Detay' }}
            </v-btn>
            
            <!-- Zaman -->
            <v-list-item-subtitle :class="getTimeClasses()">
              <v-icon v-if="dialogMode" size="12" class="mr-1">mdi-clock</v-icon>
              {{ formatTime(notification.timestamp) }}
            </v-list-item-subtitle>
          </div>

          <template v-slot:append>
            <div class="d-flex flex-column align-center">
              <!-- Okunmamış işareti -->
              <v-chip
                v-if="!notification.read"
                :size="embedded ? 'x-small' : 'small'"
                :color="dialogMode ? 'error' : 'primary'"
                :variant="dialogMode ? 'flat' : 'elevated'"
                :class="dialogMode ? 'mb-2' : 'mt-1'"
              >
                <v-icon v-if="dialogMode" size="12" class="mr-1">mdi-circle</v-icon>
                Yeni
              </v-chip>
              
              <!-- Silme butonu -->
              <v-btn
                icon
                :size="embedded ? 'x-small' : 'small'"
                variant="text"
                @click.stop="$emit('removeNotification', notification.id)"
                :class="embedded ? 'mt-1' : (dialogMode ? 'mt-2' : '')"
              >
                <v-icon :size="embedded ? 12 : 16">{{ dialogMode ? 'mdi-delete' : 'mdi-close' }}</v-icon>
              </v-btn>
            </div>
          </template>
        </v-list-item>
        <v-divider v-if="index < notifications.length - 1" />
      </template>
    </v-list>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <v-icon :size="embedded ? 48 : 64" color="grey-lighten-2">mdi-bell-off</v-icon>
      <p :class="getEmptyStateTextClasses()">
        {{ embedded ? 'Bildirim yok' : 'Henüz bildirim yok' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  notifications: {
    type: Array,
    required: true
  },
  embedded: {
    type: Boolean,
    default: false
  },
  dialogMode: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['notificationClick', 'removeNotification'])

// Computed
const listClasses = computed(() => ({
  'embedded-list': props.embedded,
  'dialog-list': props.dialogMode,
  'normal-list': !props.embedded && !props.dialogMode
}))

// Methods
const getNotificationClasses = (notification) => {
  return {
    'notification-item': true,
    'notification-item-embedded': props.embedded,
    'notification-item-dialog': props.dialogMode,
    'unread': !notification.read,
    'critical': notification.type === 'critical',
    'warning-snake': notification.type === 'warning-snake'
  }
}

const getTitleClasses = () => {
  if (props.embedded) return 'text-caption font-weight-medium'
  if (props.dialogMode) return 'text-body-1 font-weight-medium'
  return 'text-body-2 font-weight-medium'
}

const getSubtitleClasses = () => {
  if (props.embedded) return 'text-caption'
  if (props.dialogMode) return 'text-body-2 mt-1'
  return 'text-caption'
}

const getDetailsClasses = () => {
  if (props.embedded) return 'text-caption text-grey-darken-1 mt-1'
  if (props.dialogMode) return 'text-caption text-grey-darken-1 mt-2'
  return 'text-caption text-grey-darken-1 mt-1'
}

const getTimeClasses = () => {
  if (props.embedded) return 'text-caption mt-1'
  if (props.dialogMode) return 'text-caption mt-2 d-flex align-center'
  return 'text-caption mt-2'
}

const getEmptyStateTextClasses = () => {
  if (props.embedded) return 'text-caption text-grey mt-2'
  if (props.dialogMode) return 'text-body-1 text-grey mt-4'
  return 'text-body-2 text-grey mt-4'
}

const getNotificationColor = (notification) => {
  const colorMap = {
    success: 'green-darken-1',
    error: 'red-darken-2',
    warning: 'amber-darken-2',
    'warning-snake': 'amber-darken-2',
    info: 'blue-grey-darken-1',
    critical: 'red-darken-3'
  }
  return colorMap[notification.type] || 'blue-grey-darken-1'
}

const getIconColor = (notification) => {
  return 'white'
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
</script>

<style scoped>
.notification-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.notification-list.embedded {
  max-height: 100%;
  overflow-y: auto;
}

.notification-list.dialog-mode {
  max-height: 500px;
}

/* List Styles */
.embedded-list {
  height: 100%;
  overflow-y: auto;
}

.dialog-list {
  max-height: 500px;
  overflow-y: auto;
}

.normal-list {
  max-height: 400px;
  overflow-y: auto;
}

/* Notification Item Styles */
.notification-item {
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.notification-item-embedded {
  padding: 8px 12px !important;
  min-height: 56px !important;
}

.notification-item-dialog {
  padding: 16px !important;
}

.notification-item.unread {
  background-color: rgba(69, 90, 100, 0.08);
  border-left-color: #455a64;
}

.notification-item.critical {
  background-color: rgba(183, 28, 28, 0.08);
  border-left-color: #d32f2f;
}

.notification-item.warning-snake {
  background-color: rgba(255, 143, 0, 0.08);
  border-left-color: #ff8f00;
}

.notification-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.notification-item-embedded:hover {
  background-color: rgba(0, 0, 0, 0.02);
  transform: translateX(2px);
}

.notification-item-dialog:hover {
  background-color: rgba(0, 0, 0, 0.02);
  transform: translateX(2px);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  flex: 1;
}

.embedded .empty-state {
  padding: 24px 12px;
}

.dialog-mode .empty-state {
  padding: 48px 16px;
}

/* Scrollbar Styles */
.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Embedded Mode Scrollbar */
.embedded .notification-list::-webkit-scrollbar {
  width: 4px;
}

.embedded .notification-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
}

/* Dialog Mode Scrollbar */
.dialog-list::-webkit-scrollbar {
  width: 8px;
}

.dialog-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.dialog-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.dialog-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .notification-item-embedded {
    padding: 6px 8px !important;
    min-height: 48px !important;
  }
  
  .empty-state {
    padding: 20px 12px;
  }
}
</style> 