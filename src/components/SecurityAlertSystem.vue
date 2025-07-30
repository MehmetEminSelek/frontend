<template>
  <div class="security-alerts">
    <transition-group name="alert" tag="div">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        :class="[
          'security-alert',
          `alert-${alert.type}`,
          { 'alert-dismissible': alert.autoClose }
        ]"
      >
        <!-- Alert Icon -->
        <div class="alert-icon">
          <v-icon :icon="getAlertIcon(alert.type)" :color="getAlertColor(alert.type)" />
        </div>
        
        <!-- Alert Content -->
        <div class="alert-content">
          <h4 class="alert-title">{{ alert.title }}</h4>
          <p class="alert-message">{{ alert.message }}</p>
          <small class="alert-timestamp">
            {{ formatTime(alert.timestamp) }}
          </small>
        </div>
        
        <!-- Alert Actions -->
        <div v-if="alert.actions && alert.actions.length" class="alert-actions">
          <v-btn
            v-for="action in alert.actions"
            :key="action.text"
            :color="action.color || 'primary'"
            :variant="action.variant || 'text'"
            size="small"
            @click="handleAction(action, alert)"
          >
            {{ action.text }}
          </v-btn>
        </div>
        
        <!-- Dismiss Button -->
        <div class="alert-dismiss">
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="$emit('dismiss', alert.id)"
          />
        </div>
        
        <!-- Progress Bar for Auto-close -->
        <div
          v-if="alert.autoClose"
          class="alert-progress"
          :style="{ animationDuration: `${alert.duration}ms` }"
        />
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  alerts: {
    type: Array,
    required: true
  }
})

// Emits
const emit = defineEmits(['dismiss'])

// Methods
const getAlertIcon = (type) => {
  const icons = {
    success: 'mdi-check-circle',
    info: 'mdi-information',
    warning: 'mdi-alert',
    error: 'mdi-alert-circle',
    security: 'mdi-shield-alert'
  }
  return icons[type] || 'mdi-information'
}

const getAlertColor = (type) => {
  const colors = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
    security: 'red'
  }
  return colors[type] || 'info'
}

const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp))
}

const handleAction = (action, alert) => {
  if (action.action) {
    action.action(alert)
  }
  
  // Dismiss alert after action if specified
  if (action.dismissAfter !== false) {
    emit('dismiss', alert.id)
  }
}
</script>

<style scoped>
.security-alerts {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  pointer-events: none;
}

.security-alert {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  pointer-events: auto;
  max-width: 100%;
  word-wrap: break-word;
}

.alert-success {
  border-left-color: #4caf50;
}

.alert-info {
  border-left-color: #2196f3;
}

.alert-warning {
  border-left-color: #ff9800;
}

.alert-error,
.alert-security {
  border-left-color: #f44336;
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.alert-message {
  margin: 0 0 8px 0;
  font-size: 13px;
  line-height: 1.4;
  color: #666;
}

.alert-timestamp {
  font-size: 11px;
  color: #999;
}

.alert-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.alert-dismiss {
  flex-shrink: 0;
  margin-left: auto;
}

.alert-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #4caf50, #2196f3);
  animation: progressBar linear forwards;
  border-radius: 0 0 8px 8px;
}

@keyframes progressBar {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Transition animations */
.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.alert-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.alert-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .security-alerts {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .security-alert {
    padding: 12px;
    margin-bottom: 8px;
  }
  
  .alert-title {
    font-size: 13px;
  }
  
  .alert-message {
    font-size: 12px;
  }
}
</style> 