<template>
  <div class="security-status-indicator">
    <v-card 
      class="pa-3 mb-4" 
      :color="statusColor" 
      variant="tonal"
      border
    >
      <div class="d-flex align-center">
        <v-icon 
          :icon="statusIcon" 
          :color="statusColor" 
          size="24" 
          class="mr-3"
        />
        <div class="flex-grow-1">
          <v-card-title class="pa-0 text-subtitle-1 font-weight-bold">
            {{ statusTitle }}
          </v-card-title>
          <v-card-text class="pa-0 text-body-2 text-medium-emphasis">
            {{ statusMessage }}
          </v-card-text>
        </div>
        <v-btn
          v-if="showRefresh"
          icon="mdi-refresh"
          variant="text"
          size="small"
          @click="checkSecurity"
          :loading="checking"
        />
      </div>
      
      <!-- Security Details -->
      <v-expand-transition>
        <div v-show="showDetails" class="mt-3">
          <v-divider class="mb-3" />
          <div class="security-details">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2">Session Status:</span>
              <v-chip 
                :color="sessionStatus.color" 
                size="small" 
                variant="flat"
              >
                {{ sessionStatus.text }}
              </v-chip>
            </div>
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2">Connection:</span>
              <v-chip 
                :color="connectionStatus.color" 
                size="small" 
                variant="flat"
              >
                {{ connectionStatus.text }}
              </v-chip>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-2">Last Check:</span>
              <span class="text-body-2 text-medium-emphasis">
                {{ lastCheckTime }}
              </span>
            </div>
          </div>
        </div>
      </v-expand-transition>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Props
const props = defineProps({
  showDetails: {
    type: Boolean,
    default: false
  },
  showRefresh: {
    type: Boolean,
    default: true
  },
  autoCheck: {
    type: Boolean,
    default: true
  },
  checkInterval: {
    type: Number,
    default: 30000 // 30 seconds
  }
})

// Emits
const emit = defineEmits(['status-change'])

// Reactive data
const checking = ref(false)
const securityLevel = ref('normal') // 'normal', 'warning', 'error'
const lastCheck = ref(new Date())
const connectionStatus = ref({ color: 'success', text: 'Secure' })
const sessionStatus = ref({ color: 'success', text: 'Active' })

// Stores
const authStore = useAuthStore()

// Computed
const statusColor = computed(() => {
  switch (securityLevel.value) {
    case 'error': return 'error'
    case 'warning': return 'warning'
    default: return 'success'
  }
})

const statusIcon = computed(() => {
  switch (securityLevel.value) {
    case 'error': return 'mdi-shield-alert'
    case 'warning': return 'mdi-shield-check'
    default: return 'mdi-shield-check'
  }
})

const statusTitle = computed(() => {
  switch (securityLevel.value) {
    case 'error': return 'Security Alert'
    case 'warning': return 'Security Warning'
    default: return 'Secure Connection'
  }
})

const statusMessage = computed(() => {
  switch (securityLevel.value) {
    case 'error': return 'Security issues detected. Please check your connection.'
    case 'warning': return 'Some security checks failed. Monitor recommended.'
    default: return 'All security checks passed. Connection is secure.'
  }
})

const lastCheckTime = computed(() => {
  return lastCheck.value.toLocaleTimeString()
})

// Auto check interval
let checkInterval = null

// Methods
async function checkSecurity() {
  if (checking.value) return
  
  checking.value = true
  
  try {
    // Check session status
    if (authStore.isAuthenticated) {
      sessionStatus.value = { color: 'success', text: 'Active' }
    } else {
      sessionStatus.value = { color: 'warning', text: 'Expired' }
    }
    
    // Check connection security
    if (window.location.protocol === 'https:') {
      connectionStatus.value = { color: 'success', text: 'HTTPS' }
    } else {
      connectionStatus.value = { color: 'warning', text: 'HTTP' }
    }
    
    // Determine overall security level
    if (!authStore.isAuthenticated) {
      securityLevel.value = 'warning'
    } else if (window.location.protocol !== 'https:') {
      securityLevel.value = 'warning'
    } else {
      securityLevel.value = 'normal'
    }
    
    lastCheck.value = new Date()
    
    // Emit status change
    emit('status-change', {
      level: securityLevel.value,
      session: sessionStatus.value,
      connection: connectionStatus.value,
      timestamp: lastCheck.value
    })
    
  } catch (error) {
    console.error('Security check failed:', error)
    securityLevel.value = 'error'
    sessionStatus.value = { color: 'error', text: 'Error' }
    connectionStatus.value = { color: 'error', text: 'Error' }
  } finally {
    checking.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Initial security check
  checkSecurity()
  
  // Setup auto check
  if (props.autoCheck) {
    checkInterval = setInterval(checkSecurity, props.checkInterval)
  }
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})

// Expose for template ref access
defineExpose({
  checkSecurity,
  securityLevel: computed(() => securityLevel.value),
  isSecure: computed(() => securityLevel.value === 'normal')
})
</script>

<style scoped>
.security-status-indicator {
  max-width: 100%;
}

.security-details {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 8px;
  padding: 12px;
}

.v-card {
  border-left: 4px solid;
  border-left-color: rgb(var(--v-theme-primary));
}

.v-card.bg-warning {
  border-left-color: rgb(var(--v-theme-warning));
}

.v-card.bg-error {
  border-left-color: rgb(var(--v-theme-error));
}

.v-card.bg-success {
  border-left-color: rgb(var(--v-theme-success));
}
</style>