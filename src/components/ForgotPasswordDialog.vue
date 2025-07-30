<template>
  <v-dialog v-model="isOpen" max-width="400" persistent>
    <v-card class="pa-4">
      <v-card-title class="text-h6 text-center mb-4">
        <v-icon icon="mdi-lock-reset" color="primary" size="32" class="mr-2" />
        Şifre Sıfırlama
      </v-card-title>

      <v-card-text>
        <div v-if="step === 'email'" class="email-step">
          <p class="text-body-2 text-center mb-4 text-medium-emphasis">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>
          
          <v-form ref="emailForm" v-model="emailFormValid" @submit.prevent="sendResetEmail">
            <v-text-field
              v-model="email"
              label="E-posta Adresi"
              type="email"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              :rules="emailRules"
              :error-messages="emailErrors"
              required
              class="mb-3"
            />
          </v-form>
        </div>

        <div v-else-if="step === 'code'" class="code-step">
          <p class="text-body-2 text-center mb-4 text-medium-emphasis">
            <strong>{{ email }}</strong> adresine gönderilen 6 haneli kodu girin.
          </p>
          
          <v-form ref="codeForm" v-model="codeFormValid" @submit.prevent="verifyCode">
            <v-text-field
              v-model="resetCode"
              label="Sıfırlama Kodu"
              variant="outlined"
              prepend-inner-icon="mdi-key"
              :rules="codeRules"
              :error-messages="codeErrors"
              maxlength="6"
              class="mb-3 text-center"
              style="font-size: 18px; letter-spacing: 2px;"
            />
            
            <div class="text-center">
              <v-btn
                variant="text"
                color="primary"
                size="small"
                @click="resendCode"
                :disabled="resendCooldown > 0"
              >
                <span v-if="resendCooldown > 0">
                  Tekrar gönder ({{ resendCooldown }}s)
                </span>
                <span v-else>
                  Kodu tekrar gönder
                </span>
              </v-btn>
            </div>
          </v-form>
        </div>

        <div v-else-if="step === 'password'" class="password-step">
          <p class="text-body-2 text-center mb-4 text-medium-emphasis">
            Yeni şifrenizi belirleyin.
          </p>
          
          <v-form ref="passwordForm" v-model="passwordFormValid" @submit.prevent="resetPassword">
            <v-text-field
              v-model="newPassword"
              label="Yeni Şifre"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              :rules="passwordRules"
              :error-messages="passwordErrors"
              required
              class="mb-3"
            />
            
            <v-text-field
              v-model="confirmPassword"
              label="Şifre Tekrarı"
              :type="showConfirmPassword ? 'text' : 'password'"
              variant="outlined"
              prepend-inner-icon="mdi-lock-check"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              :rules="confirmPasswordRules"
              :error-messages="confirmPasswordErrors"
              required
              class="mb-3"
            />

            <!-- Password Strength Indicator -->
            <div class="password-strength mb-3">
              <div class="d-flex align-center mb-2">
                <span class="text-body-2 mr-2">Şifre Gücü:</span>
                <v-chip
                  :color="passwordStrength.color"
                  size="small"
                  variant="flat"
                >
                  {{ passwordStrength.text }}
                </v-chip>
              </div>
              <v-progress-linear
                :model-value="passwordStrength.value"
                :color="passwordStrength.color"
                height="4"
                rounded
              />
            </div>
          </v-form>
        </div>

        <div v-else-if="step === 'success'" class="success-step text-center">
          <v-icon icon="mdi-check-circle" color="success" size="64" class="mb-4" />
          <h3 class="text-h6 mb-2">Şifre Başarıyla Sıfırlandı!</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.
          </p>
        </div>

        <!-- Error Messages -->
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-3"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <!-- Success Messages -->
        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mb-3"
          closable
          @click:close="successMessage = ''"
        >
          {{ successMessage }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="pt-0">
        <v-btn
          variant="text"
          @click="closeDialog"
          :disabled="isLoading"
        >
          {{ step === 'success' ? 'Kapat' : 'İptal' }}
        </v-btn>
        
        <v-spacer />
        
        <v-btn
          v-if="step === 'email'"
          color="primary"
          variant="flat"
          @click="sendResetEmail"
          :loading="isLoading"
          :disabled="!emailFormValid"
        >
          Kod Gönder
        </v-btn>
        
        <v-btn
          v-else-if="step === 'code'"
          color="primary"
          variant="flat"
          @click="verifyCode"
          :loading="isLoading"
          :disabled="!codeFormValid"
        >
          Kodu Doğrula
        </v-btn>
        
        <v-btn
          v-else-if="step === 'password'"
          color="primary"
          variant="flat"
          @click="resetPassword"
          :loading="isLoading"
          :disabled="!passwordFormValid"
        >
          Şifreyi Güncelle
        </v-btn>
        
        <v-btn
          v-else-if="step === 'success'"
          color="primary"
          variant="flat"
          @click="goToLogin"
        >
          Giriş Sayfasına Dön
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { apiCall } from '@/utils/api'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success', 'close'])

// Reactive data
const isOpen = ref(props.modelValue)
const step = ref('email') // 'email', 'code', 'password', 'success'
const isLoading = ref(false)

// Form data
const email = ref('')
const resetCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Form validity
const emailFormValid = ref(false)
const codeFormValid = ref(false)
const passwordFormValid = ref(false)

// UI state
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const resendCooldown = ref(0)

// Form refs
const emailForm = ref(null)
const codeForm = ref(null)
const passwordForm = ref(null)

// Form errors
const emailErrors = ref([])
const codeErrors = ref([])
const passwordErrors = ref([])
const confirmPasswordErrors = ref([])

// Validation rules
const emailRules = [
  v => !!v || 'E-posta adresi gerekli',
  v => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta adresi girin'
]

const codeRules = [
  v => !!v || 'Sıfırlama kodu gerekli',
  v => /^\d{6}$/.test(v) || 'Kod 6 haneli olmalı'
]

const passwordRules = [
  v => !!v || 'Şifre gerekli',
  v => v.length >= 8 || 'Şifre en az 8 karakter olmalı',
  v => /(?=.*[a-z])/.test(v) || 'En az bir küçük harf içermeli',
  v => /(?=.*[A-Z])/.test(v) || 'En az bir büyük harf içermeli',
  v => /(?=.*\d)/.test(v) || 'En az bir rakam içermeli'
]

const confirmPasswordRules = [
  v => !!v || 'Şifre tekrarı gerekli',
  v => v === newPassword.value || 'Şifreler eşleşmiyor'
]

// Computed
const passwordStrength = computed(() => {
  const password = newPassword.value
  if (!password) return { value: 0, color: 'grey', text: 'Zayıf' }
  
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z\d]/.test(password)) score++
  
  const strength = {
    0: { value: 20, color: 'error', text: 'Çok Zayıf' },
    1: { value: 40, color: 'warning', text: 'Zayıf' },
    2: { value: 60, color: 'orange', text: 'Orta' },
    3: { value: 80, color: 'success', text: 'Güçlü' },
    4: { value: 100, color: 'success', text: 'Çok Güçlü' },
    5: { value: 100, color: 'success', text: 'Mükemmel' }
  }
  
  return strength[score] || strength[0]
})

// Watchers
watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
})

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal) {
    resetForm()
  }
})

// Methods
function resetForm() {
  step.value = 'email'
  email.value = ''
  resetCode.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  clearErrors()
}

function clearErrors() {
  emailErrors.value = []
  codeErrors.value = []
  passwordErrors.value = []
  confirmPasswordErrors.value = []
}

async function sendResetEmail() {
  if (!emailFormValid.value) return
  
  isLoading.value = true
  clearErrors()
  
  try {
    await apiCall('/auth/forgot-password', {
      method: 'POST',
      data: { email: email.value }
    })
    
    successMessage.value = 'Sıfırlama kodu e-posta adresinize gönderildi.'
    step.value = 'code'
    startResendCooldown()
    
  } catch (error) {
    if (error.response?.status === 404) {
      emailErrors.value = ['Bu e-posta adresi sistemde kayıtlı değil']
    } else {
      errorMessage.value = error.message || 'E-posta gönderilirken hata oluştu'
    }
  } finally {
    isLoading.value = false
  }
}

async function verifyCode() {
  if (!codeFormValid.value) return
  
  isLoading.value = true
  clearErrors()
  
  try {
    await apiCall('/auth/verify-reset-code', {
      method: 'POST',
      data: { 
        email: email.value,
        code: resetCode.value 
      }
    })
    
    successMessage.value = 'Kod doğrulandı. Yeni şifrenizi belirleyin.'
    step.value = 'password'
    
  } catch (error) {
    if (error.response?.status === 400) {
      codeErrors.value = ['Geçersiz veya süresi dolmuş kod']
    } else {
      errorMessage.value = error.message || 'Kod doğrulanırken hata oluştu'
    }
  } finally {
    isLoading.value = false
  }
}

async function resetPassword() {
  if (!passwordFormValid.value) return
  
  isLoading.value = true
  clearErrors()
  
  try {
    await apiCall('/auth/reset-password', {
      method: 'POST',
      data: {
        email: email.value,
        code: resetCode.value,
        newPassword: newPassword.value
      }
    })
    
    step.value = 'success'
    emit('success')
    
  } catch (error) {
    if (error.response?.status === 400) {
      passwordErrors.value = ['Şifre güncelleme başarısız']
    } else {
      errorMessage.value = error.message || 'Şifre güncellenirken hata oluştu'
    }
  } finally {
    isLoading.value = false
  }
}

async function resendCode() {
  if (resendCooldown.value > 0) return
  
  isLoading.value = true
  
  try {
    await apiCall('/auth/forgot-password', {
      method: 'POST',
      data: { email: email.value }
    })
    
    successMessage.value = 'Yeni kod gönderildi'
    startResendCooldown()
    
  } catch (error) {
    errorMessage.value = 'Kod tekrar gönderilirken hata oluştu'
  } finally {
    isLoading.value = false
  }
}

function startResendCooldown() {
  resendCooldown.value = 60
  const interval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(interval)
    }
  }, 1000)
}

function closeDialog() {
  isOpen.value = false
  emit('close')
}

function goToLogin() {
  closeDialog()
  emit('success')
}
</script>

<style scoped>
.password-strength {
  margin-top: 8px;
}

.v-text-field {
  margin-bottom: 16px;
}

.success-step .v-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>