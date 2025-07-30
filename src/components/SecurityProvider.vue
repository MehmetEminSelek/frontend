<template>
  <div class="security-provider">
    <!-- Security Alert System -->
    <SecurityAlertSystem 
      v-if="showSecurityAlerts"
      :alerts="securityAlerts"
      @dismiss="dismissAlert"
    />
    
    <!-- Session Timeout Warning -->
    <SessionTimeoutWarning
      v-if="showSessionWarning"
      :timeRemaining="sessionTimeRemaining"
      @extend="extendSession"
      @logout="handleLogout"
    />
    
    <!-- Account Locked Modal -->
    <AccountLockedModal
      v-if="isAccountLocked"
      :lockExpiry="lockExpiry"
    />
    
    <!-- Security Level Indicator -->
    <SecurityLevelIndicator
      v-if="showSecurityLevel && isAuthenticated"
      :level="securityLevel"
      :position="securityIndicatorPosition"
    />
    
    <!-- Main Content Slot -->
    <slot />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { securityErrorHandler, SECURITY_LEVELS } from '@/utils/security'
import SecurityAlertSystem from './SecurityAlertSystem.vue'
import SessionTimeoutWarning from './SessionTimeoutWarning.vue'
import AccountLockedModal from './AccountLockedModal.vue'
import SecurityLevelIndicator from './SecurityLevelIndicator.vue'

// Props
const props = defineProps({
  showSecurityAlerts: {
    type: Boolean,
    default: true
  },
  showSessionWarning: {
    type: Boolean,
    default: true
  },
  showSecurityLevel: {
    type: Boolean,
    default: false // Only show for admins or in dev mode
  },
  securityIndicatorPosition: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value)
  },
  sessionWarningThreshold: {
    type: Number,
    default: 5 // Show warning when 5 minutes left
  }
})

// Stores
const authStore = useAuthStore()

// Reactive state
const securityAlerts = ref([])
const sessionCheckInterval = ref(null)
const csrfRefreshInterval = ref(null)
const activityListeners = ref([])

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated)
const sessionTimeRemaining = computed(() => authStore.sessionTimeRemaining)
const isAccountLocked = computed(() => authStore.isAccountLocked)
const lockExpiry = computed(() => authStore.lockExpiry)
const securityLevel = computed(() => authStore.securityLevel)

const showSessionWarning = computed(() => {
  return props.showSessionWarning &&
         isAuthenticated.value &&
         sessionTimeRemaining.value > 0 &&
         sessionTimeRemaining.value <= props.sessionWarningThreshold
})

// Security alert management
const addSecurityAlert = (alert) => {
  const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  securityAlerts.value.push({
    id: alertId,
    type: alert.type || 'info',
    title: alert.title || 'Security Notice',
    message: alert.message,
    timestamp: new Date(),
    autoClose: alert.autoClose !== false,
    duration: alert.duration || 5000,
    actions: alert.actions || []
  })

  // Auto-remove alert after duration
  if (alert.autoClose !== false) {
    setTimeout(() => {
      dismissAlert(alertId)
    }, alert.duration || 5000)
  }
}

const dismissAlert = (alertId) => {
  const index = securityAlerts.value.findIndex(alert => alert.id === alertId)
  if (index !== -1) {
    securityAlerts.value.splice(index, 1)
  }
}

const clearAllAlerts = () => {
  securityAlerts.value = []
}

// Session management
const initializeSessionMonitoring = () => {
  // Check session status every minute
  sessionCheckInterval.value = setInterval(() => {
    if (isAuthenticated.value) {
      checkSessionStatus()
    }
  }, 60000)

  // Refresh CSRF token every 30 minutes
  csrfRefreshInterval.value = setInterval(async () => {
    if (isAuthenticated.value) {
      try {
        await authStore.fetchCSRFToken()
        console.log('CSRF token refreshed automatically')
      } catch (error) {
        console.error('Failed to refresh CSRF token:', error)
        addSecurityAlert({
          type: 'warning',
          title: 'Security Token Warning',
          message: 'Security token refresh failed. Please refresh the page.',
          autoClose: false
        })
      }
    }
  }, 30 * 60 * 1000) // 30 minutes
}

const checkSessionStatus = () => {
  // Check for session expiry
  if (authStore.isSessionExpired) {
    handleSessionExpiry()
    return
  }

  // Check for session warning
  if (sessionTimeRemaining.value <= props.sessionWarningThreshold && sessionTimeRemaining.value > 0) {
    console.warn(`Session expires in ${sessionTimeRemaining.value} minutes`)
  }
}

const handleSessionExpiry = () => {
  addSecurityAlert({
    type: 'error',
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
    autoClose: false,
    actions: [
      {
        text: 'Login',
        action: () => handleLogout()
      }
    ]
  })
  
  setTimeout(() => {
    authStore.clearAuth()
    window.location.href = '/login?reason=expired'
  }, 3000)
}

const extendSession = async () => {
  try {
    await authStore.refreshTokens()
    addSecurityAlert({
      type: 'success',
      title: 'Session Extended',
      message: 'Your session has been extended successfully.'
    })
  } catch (error) {
    console.error('Failed to extend session:', error)
    addSecurityAlert({
      type: 'error',
      title: 'Session Extension Failed',
      message: 'Could not extend your session. Please log in again.'
    })
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    window.location.href = '/login'
  } catch (error) {
    console.error('Logout error:', error)
    authStore.clearAuth()
    window.location.href = '/login'
  }
}

// Activity monitoring
const setupActivityMonitoring = () => {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  
  const handleActivity = () => {
    if (isAuthenticated.value) {
      authStore.updateActivity()
    }
  }

  events.forEach(event => {
    document.addEventListener(event, handleActivity, { passive: true })
    activityListeners.value.push({ event, handler: handleActivity })
  })
}

const cleanupActivityMonitoring = () => {
  activityListeners.value.forEach(({ event, handler }) => {
    document.removeEventListener(event, handler)
  })
  activityListeners.value = []
}

// Security level monitoring
watch(() => authStore.securityLevel, (newLevel, oldLevel) => {
  if (newLevel !== oldLevel && newLevel === SECURITY_LEVELS.CRITICAL) {
    addSecurityAlert({
      type: 'error',
      title: 'Critical Security Level',
      message: 'Security level has been elevated. All actions are being monitored.',
      autoClose: false
    })
  }
})

// Account lock monitoring
watch(() => authStore.isAccountLocked, (isLocked) => {
  if (isLocked) {
    addSecurityAlert({
      type: 'error',
      title: 'Account Locked',
      message: 'Your account has been temporarily locked due to security reasons.',
      autoClose: false
    })
  }
})

// Initialize security provider
const initializeSecurityProvider = async () => {
  try {
    // Initialize authentication
    await authStore.initializeAuth()
    
    // Setup monitoring
    initializeSessionMonitoring()
    setupActivityMonitoring()
    
    // Setup global error handler override
    setupGlobalErrorHandler()
    
    console.log('Security Provider initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Security Provider:', error)
    addSecurityAlert({
      type: 'error',
      title: 'Security Initialization Failed',
      message: 'Could not initialize security features. Please refresh the page.',
      autoClose: false
    })
  }
}

// Global error handler integration
const setupGlobalErrorHandler = () => {
  // Override console.error for security errors
  const originalConsoleError = console.error
  console.error = (...args) => {
    // Check if this is a security-related error
    const errorMessage = args.join(' ')
    if (errorMessage.includes('Security') || errorMessage.includes('Auth')) {
      addSecurityAlert({
        type: 'error',
        title: 'Security Error',
        message: 'A security error occurred. Please contact support if this persists.'
      })
    }
    
    // Call original console.error
    originalConsoleError.apply(console, args)
  }

  // Global error handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.type && event.reason.type.includes('SECURITY')) {
      addSecurityAlert({
        type: 'error',
        title: 'Unhandled Security Error',
        message: 'An unhandled security error occurred.'
      })
    }
  })
}

// Cleanup
const cleanup = () => {
  if (sessionCheckInterval.value) {
    clearInterval(sessionCheckInterval.value)
  }
  
  if (csrfRefreshInterval.value) {
    clearInterval(csrfRefreshInterval.value)
  }
  
  cleanupActivityMonitoring()
}

// Lifecycle hooks
onMounted(() => {
  initializeSecurityProvider()
})

onUnmounted(() => {
  cleanup()
})

// Expose methods for external use
defineExpose({
  addSecurityAlert,
  dismissAlert,
  clearAllAlerts,
  extendSession,
  handleLogout
})
</script>

<style scoped>
.security-provider {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Security alerts positioning */
.security-alerts {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

/* Session warning positioning */
.session-warning {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
}

/* Account locked modal */
.account-locked-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Security level indicator */
.security-level-indicator {
  position: fixed;
  z-index: 9998;
}

.security-level-indicator.top-left {
  top: 20px;
  left: 20px;
}

.security-level-indicator.top-right {
  top: 20px;
  right: 20px;
}

.security-level-indicator.bottom-left {
  bottom: 20px;
  left: 20px;
}

.security-level-indicator.bottom-right {
  bottom: 20px;
  right: 20px;
}
</style> 