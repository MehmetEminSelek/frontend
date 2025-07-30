<template>
  <v-dialog
    v-model="show"
    :persistent="true"
    max-width="500"
    @update:model-value="handleDialogChange"
  >
    <v-card class="session-warning-card">
      <!-- Header -->
      <v-card-title class="text-center pa-6">
        <v-icon
          icon="mdi-clock-alert"
          color="warning"
          size="48"
          class="mb-3"
        />
        <h3 class="text-h5 text-warning">
          Oturum Süresi Dolmak Üzere
        </h3>
      </v-card-title>
      
      <!-- Content -->
      <v-card-text class="text-center px-6 pb-2">
        <p class="text-body-1 mb-4">
          Güvenlik nedeniyle oturumunuz dolmak üzere.
        </p>
        
        <!-- Countdown Display -->
        <div class="countdown-display">
          <v-sheet
            color="warning"
            class="countdown-timer"
            rounded
          >
            <span class="countdown-text">
              {{ formatTime(timeRemaining) }}
            </span>
          </v-sheet>
          <p class="text-caption mt-2 text-medium-emphasis">
            Kalan süre
          </p>
        </div>
        
        <!-- Progress Bar -->
        <v-progress-linear
          :model-value="progressPercentage"
          color="warning"
          height="8"
          rounded
          class="mt-4"
        />
        
        <p class="text-body-2 mt-4 text-medium-emphasis">
          Oturumunuzu uzatmak için "Oturumu Uzat" butonuna tıklayın
          veya çalışmanızı kaydetmek için "Çıkış Yap" seçeneğini kullanın.
        </p>
      </v-card-text>
      
      <!-- Actions -->
      <v-card-actions class="px-6 pb-6">
        <v-col class="pa-0">
          <v-row no-gutters>
            <v-col cols="6" class="pr-2">
              <v-btn
                color="error"
                variant="outlined"
                block
                @click="handleLogout"
                :disabled="extending"
              >
                <v-icon left>mdi-logout</v-icon>
                Çıkış Yap
              </v-btn>
            </v-col>
            <v-col cols="6" class="pl-2">
              <v-btn
                color="warning"
                variant="flat"
                block
                @click="handleExtend"
                :loading="extending"
              >
                <v-icon left>mdi-clock-plus</v-icon>
                Oturumu Uzat
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-card-actions>
      
      <!-- Auto-logout warning -->
      <v-divider />
      <v-card-text class="text-center py-3">
        <v-chip
          color="error"
          variant="outlined"
          size="small"
          prepend-icon="mdi-information"
        >
          {{ formatTime(timeRemaining) }} sonra otomatik çıkış
        </v-chip>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  timeRemaining: {
    type: Number,
    required: true // in minutes
  },
  warningThreshold: {
    type: Number,
    default: 5 // Show warning when 5 minutes left
  },
  autoLogoutThreshold: {
    type: Number,
    default: 1 // Auto logout when 1 minute left
  }
})

// Emits
const emit = defineEmits(['extend', 'logout'])

// Reactive state
const show = ref(true)
const extending = ref(false)
const countdownInterval = ref(null)
const seconds = ref(0)

// Computed
const totalWarningTime = computed(() => props.warningThreshold * 60) // Convert to seconds
const timeRemainingSeconds = computed(() => props.timeRemaining * 60 + seconds.value)

const progressPercentage = computed(() => {
  const elapsed = totalWarningTime.value - timeRemainingSeconds.value
  return Math.max(0, Math.min(100, (elapsed / totalWarningTime.value) * 100))
})

// Methods
const formatTime = (minutes) => {
  const totalSeconds = Math.max(0, minutes * 60 + seconds.value)
  const mins = Math.floor(totalSeconds / 60)
  const secs = Math.floor(totalSeconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleExtend = async () => {
  extending.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    emit('extend')
    show.value = false
  } catch (error) {
    console.error('Failed to extend session:', error)
  } finally {
    extending.value = false
  }
}

const handleLogout = () => {
  emit('logout')
}

const handleDialogChange = (value) => {
  // Prevent closing dialog manually
  if (!value) {
    show.value = true
  }
}

const startCountdown = () => {
  seconds.value = 0
  countdownInterval.value = setInterval(() => {
    seconds.value -= 1
    
    // Auto-logout when time reaches threshold
    if (timeRemainingSeconds.value <= props.autoLogoutThreshold * 60) {
      clearInterval(countdownInterval.value)
      handleLogout()
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
}

// Watch for prop changes
watch(() => props.timeRemaining, (newTime) => {
  if (newTime <= 0) {
    handleLogout()
  }
})

// Lifecycle
onMounted(() => {
  startCountdown()
})

onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
.session-warning-card {
  background: linear-gradient(135deg, #fff9c4 0%, #fff 100%);
  border: 2px solid #ff9800;
}

.countdown-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.countdown-timer {
  padding: 12px 24px;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-text {
  font-size: 24px;
  font-weight: bold;
  color: white;
  font-family: 'Roboto Mono', monospace;
}

/* Pulse animation for urgency */
.countdown-timer {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 152, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .countdown-text {
    font-size: 20px;
  }
  
  .countdown-timer {
    padding: 10px 20px;
    min-width: 100px;
  }
}
</style> 