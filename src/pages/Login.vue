<template>
  <div class="login-container">
    <!-- Background Pattern -->
    <div class="background-pattern"></div>
    
    <!-- Security Status Indicator -->
    <SecurityStatusIndicator 
      :securityLevel="securityLevel"
      :showDetails="false"
    />

    <!-- Main Content -->
    <v-container class="login-content fill-height d-flex align-center justify-center">
      <div class="login-wrapper">
        <!-- Logo & Branding -->
        <div class="brand-section text-center mb-8">
          <div class="logo-container mb-4">
            <v-avatar size="80" class="brand-logo">
              <v-icon size="40" color="primary">mdi-layers-triple-outline</v-icon>
            </v-avatar>
          </div>
          <h1 class="brand-title">Ömer Güllü Sistemi</h1>
          <p class="brand-subtitle">Güvenli Baklavacı Yönetim Paneli</p>
        </div>

        <!-- Login Card -->
        <v-card class="login-card glass-effect" elevation="0" rounded="xl">
          <v-card-text class="pa-8">
            <!-- Header -->
            <div class="text-center mb-6">
              <h2 class="login-title">Hoş Geldiniz</h2>
              <p class="login-subtitle">Güvenli hesap girişi</p>
            </div>

            <!-- Account Locked Warning -->
            <v-alert
              v-if="isAccountLocked"
              type="error"
              variant="tonal"
              class="mb-6"
              rounded="lg"
            >
              <template v-slot:prepend>
                <v-icon>mdi-lock-alert</v-icon>
              </template>
              <div>
                <strong>Hesap Kilitlendi</strong>
                <p class="mb-0 mt-1">
                  Güvenlik nedeniyle hesabınız geçici olarak kilitlenmiştir.
                  <br>
                  <small>{{ lockTimeRemaining }} sonra tekrar deneyebilirsiniz.</small>
                </p>
              </div>
            </v-alert>

            <!-- Login Form -->
            <v-form 
              ref="loginForm"
              @submit.prevent="handleLogin" 
              class="login-form"
              :disabled="isAccountLocked"
            >
              <!-- Username/Email Field -->
              <div class="input-group mb-6">
                <label class="input-label">
                  Kullanıcı Adı / Email
                  <span class="text-error">*</span>
                </label>
                <v-text-field
                  v-model="credentials.username"
                  :placeholder="isDemo ? 'bari8 (demo kullanıcı)' : 'Kullanıcı adınız veya email'"
                  prepend-inner-icon="mdi-account-outline"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="validationErrors.username"
                  :disabled="loading || isAccountLocked"
                  class="modern-input"
                  color="primary"
                  autocomplete="username"
                  @input="clearFieldError('username')"
                  @focus="trackActivity"
                />
              </div>

              <!-- Password Field -->
              <div class="input-group mb-6">
                <label class="input-label">
                  Şifre
                  <span class="text-error">*</span>
                </label>
                <v-text-field
                  v-model="credentials.password"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="isDemo ? 'temp123 (demo şifre)' : 'Şifreniz'"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="validationErrors.password"
                  :disabled="loading || isAccountLocked"
                  class="modern-input"
                  color="primary"
                  autocomplete="current-password"
                  @click:append-inner="showPassword = !showPassword"
                  @input="clearFieldError('password')"
                  @focus="trackActivity"
                />
              </div>

              <!-- Security Options -->
              <div class="security-options mb-6">
                <v-row no-gutters>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="credentials.rememberMe"
                      label="Beni hatırla"
                      density="compact"
                      color="primary"
                      :disabled="loading || isAccountLocked"
                      @change="trackActivity"
                    />
                  </v-col>
                  <v-col cols="12" md="6" class="text-right">
                    <v-btn
                      variant="text"
                      color="primary"
                      size="small"
                      :disabled="loading || isAccountLocked"
                      @click="showForgotPassword = true"
                    >
                      Şifremi Unuttum
                    </v-btn>
                  </v-col>
                </v-row>
              </div>

              <!-- Login Attempts Warning -->
              <v-alert
                v-if="loginAttempts > 0 && loginAttempts < maxLoginAttempts"
                type="warning"
                variant="tonal"
                class="mb-6"
                rounded="lg"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-alert</v-icon>
                </template>
                <div>
                  <strong>Dikkat!</strong>
                  {{ loginAttempts }} başarısız giriş denemesi yapıldı.
                  {{ maxLoginAttempts - loginAttempts }} deneme hakkınız kaldı.
                </div>
              </v-alert>

              <!-- CAPTCHA (shown after failed attempts) -->
              <div v-if="showCaptcha" class="captcha-section mb-6">
                <label class="input-label">Güvenlik Doğrulaması</label>
                <div class="captcha-container">
                  <v-text-field
                    v-model="credentials.captcha"
                    :placeholder="`${captchaQuestion} = ?`"
                    prepend-inner-icon="mdi-shield-check"
                    variant="outlined"
                    density="comfortable"
                    :error-messages="validationErrors.captcha"
                    :disabled="loading || isAccountLocked"
                    class="modern-input"
                    color="primary"
                    @input="clearFieldError('captcha')"
                  />
                  <v-btn
                    icon="mdi-refresh"
                    variant="text"
                    @click="generateCaptcha"
                    :disabled="loading"
                  />
                </div>
              </div>

              <!-- Error Alert -->
              <v-slide-y-transition>
                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  class="mb-6 modern-alert"
                  rounded="lg"
                  closable
                  @click:close="error = null"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-alert-circle-outline</v-icon>
                  </template>
                  {{ error }}
                </v-alert>
              </v-slide-y-transition>

              <!-- Login Button -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                class="login-button modern-button"
                rounded="lg"
                :loading="loading"
                :disabled="!isFormValid || isAccountLocked"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-login</v-icon>
                </template>
                Güvenli Giriş
              </v-btn>

              <!-- Demo Info -->
              <div v-if="isDemo" class="demo-info mt-6">
                <v-divider class="mb-4" />
                <v-alert type="info" variant="tonal" rounded="lg">
                  <template v-slot:prepend>
                    <v-icon>mdi-information</v-icon>
                  </template>
                  <div>
                    <strong>Demo Hesapları:</strong>
                    <ul class="mt-2 mb-0">
                      <li><code>bari8</code> / <code>temp123</code> - Yönetici</li>
                      <li><code>demo</code> / <code>demo123</code> - Operatör</li>
                    </ul>
                  </div>
                </v-alert>
              </div>
            </v-form>
          </v-card-text>
          
          <!-- Security Footer -->
          <v-divider />
          <v-card-text class="pa-4 text-center">
            <div class="security-info">
              <v-chip
                size="small"
                variant="outlined"
                color="success"
                prepend-icon="mdi-shield-check"
              >
                SSL Korumalı
              </v-chip>
              <v-chip
                size="small"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-eye-off"
                class="ml-2"
              >
                Gizlilik Korumalı
              </v-chip>
            </div>
            <p class="text-caption mt-2 text-medium-emphasis">
              Tüm verileriniz güvenli şekilde şifrelenmektedir.
            </p>
          </v-card-text>
        </v-card>

        <!-- Footer -->
        <div class="login-footer text-center mt-8">
          <p class="text-caption text-medium-emphasis">
            © 2024 Ömer Güllü Baklava Sistemi - Güvenli Erişim
          </p>
        </div>
      </div>
    </v-container>

    <!-- Forgot Password Dialog -->
    <ForgotPasswordDialog
      v-model="showForgotPassword"
      @reset-requested="handlePasswordReset"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuthApi } from '@/composables/useApi'
import { InputSanitizer, SecurityValidator } from '@/utils/security'
import SecurityStatusIndicator from '@/components/SecurityStatusIndicator.vue'
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog.vue'

// Router and stores
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const authApi = useAuthApi()

// Reactive state
const loginForm = ref(null)
const showPassword = ref(false)
const showForgotPassword = ref(false)
const showCaptcha = ref(false)
const error = ref(null)
const loading = ref(false)

// Form data
const credentials = ref({
  username: '',
  password: '',
  rememberMe: false,
  captcha: ''
})

// Validation
const validationErrors = ref({
  username: [],
  password: [],
  captcha: []
})

// Security state
const loginAttempts = ref(0)
const maxLoginAttempts = ref(5)
const securityLevel = ref('NORMAL')
const accountLockTime = ref(null)
const captchaQuestion = ref('')
const captchaAnswer = ref(0)
const lastActivity = ref(Date.now())

// Environment
const isDemo = computed(() => import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true')

// Form validation
const isFormValid = computed(() => {
  return credentials.value.username.trim() !== '' &&
         credentials.value.password.trim() !== '' &&
         (!showCaptcha.value || credentials.value.captcha.trim() !== '') &&
         validationErrors.value.username.length === 0 &&
         validationErrors.value.password.length === 0 &&
         validationErrors.value.captcha.length === 0
})

// Account lock status
const isAccountLocked = computed(() => {
  return authStore.isAccountLocked || 
         (accountLockTime.value && Date.now() < accountLockTime.value)
})

const lockTimeRemaining = computed(() => {
  if (!accountLockTime.value) return ''
  
  const remaining = Math.max(0, accountLockTime.value - Date.now())
  const minutes = Math.floor(remaining / (1000 * 60))
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Methods
const validateForm = () => {
  validationErrors.value = {
    username: [],
    password: [],
    captcha: []
  }

  // Username validation
  if (!credentials.value.username.trim()) {
    validationErrors.value.username.push('Kullanıcı adı gereklidir')
  } else if (credentials.value.username.length < 3) {
    validationErrors.value.username.push('Kullanıcı adı en az 3 karakter olmalıdır')
  }

  // Password validation
  if (!credentials.value.password.trim()) {
    validationErrors.value.password.push('Şifre gereklidir')
  } else if (credentials.value.password.length < 6) {
    validationErrors.value.password.push('Şifre en az 6 karakter olmalıdır')
  }

  // CAPTCHA validation
  if (showCaptcha.value) {
    const captchaValue = parseInt(credentials.value.captcha)
    if (isNaN(captchaValue) || captchaValue !== captchaAnswer.value) {
      validationErrors.value.captcha.push('Güvenlik doğrulaması yanlış')
    }
  }

  return Object.values(validationErrors.value).every(errors => errors.length === 0)
}

const clearFieldError = (fieldName) => {
  validationErrors.value[fieldName] = []
}

const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  captchaQuestion.value = `${num1} + ${num2}`
  captchaAnswer.value = num1 + num2
  credentials.value.captcha = ''
}

const trackActivity = () => {
  lastActivity.value = Date.now()
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  error.value = null
  trackActivity()

  try {
    // Sanitize inputs
    const sanitizedCredentials = {
      username: InputSanitizer.sanitizeString(credentials.value.username.trim()),
      password: credentials.value.password, // Don't sanitize passwords
      rememberMe: credentials.value.rememberMe,
      deviceInfo: getDeviceInfo()
    }

        // Attempt login using auth store
    const response = await authStore.login(sanitizedCredentials)

    // Success
    resetLoginAttempts()
    
    // Redirect to intended page or dashboard  
    const redirectTo = route.query.redirect || '/dashboard'
    await router.push(redirectTo)
    
  } catch (err) {
    handleLoginError(err)
  } finally {
    loading.value = false
  }
}

const handleLoginError = (err) => {
  loginAttempts.value++
  
  if (err.type === 'ACCOUNT_LOCKED') {
    accountLockTime.value = Date.now() + (30 * 60 * 1000) // 30 minutes
    error.value = 'Hesabınız güvenlik nedeniyle kilitlenmiştir.'
  } else if (err.type === 'UNAUTHORIZED') {
    error.value = 'Kullanıcı adı veya şifre hatalı.'
    
    // Show CAPTCHA after 3 failed attempts
    if (loginAttempts.value >= 3) {
      showCaptcha.value = true
      generateCaptcha()
    }
    
    // Increase security level
    if (loginAttempts.value >= 3) {
      securityLevel.value = 'HIGH'
    }
  } else if (err.type === 'RATE_LIMITED') {
    error.value = 'Çok fazla deneme yapıldı. Lütfen bekleyip tekrar deneyin.'
  } else {
    error.value = err.message || 'Giriş yapılırken bir hata oluştu.'
  }
}

const resetLoginAttempts = () => {
  loginAttempts.value = 0
  showCaptcha.value = false
  securityLevel.value = 'NORMAL'
  accountLockTime.value = null
}

const handlePasswordReset = async (email) => {
  try {
    // Implement password reset logic
    console.log('Password reset requested for:', email)
    
    error.value = null
    // Show success message
  } catch (err) {
    error.value = 'Şifre sıfırlama isteği gönderilemedi.'
  }
}

const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: Date.now()
  }
}

const checkLoginReason = () => {
  const reason = route.query.reason
  
  if (reason === 'expired') {
    error.value = 'Oturumunuz süresi dolmuş. Lütfen tekrar giriş yapın.'
  } else if (reason === 'locked') {
    error.value = 'Hesabınız güvenlik nedeniyle kilitlenmiştir.'
  } else if (reason === 'unauthorized') {
    error.value = 'Bu sayfaya erişim yetkiniz bulunmamaktadır.'
  }
}

// Auto-fill demo credentials in development
const autofillDemo = () => {
  if (isDemo.value && !credentials.value.username) {
    credentials.value.username = 'bari8'
    credentials.value.password = 'temp123'
  }
}

// Activity monitoring
const setupActivityMonitoring = () => {
  const events = ['mousedown', 'keypress', 'touchstart']
  
  events.forEach(event => {
    document.addEventListener(event, trackActivity, { passive: true })
  })
}

const cleanupActivityMonitoring = () => {
  const events = ['mousedown', 'keypress', 'touchstart']
  
  events.forEach(event => {
    document.removeEventListener(event, trackActivity)
  })
}

// Lifecycle hooks
onMounted(() => {
  checkLoginReason()
  setupActivityMonitoring()
  generateCaptcha()
  
  // Auto-fill in demo mode
  setTimeout(autofillDemo, 1000)
})

onUnmounted(() => {
  cleanupActivityMonitoring()
})

// Watch for account lock changes
watch(() => authStore.isAccountLocked, (isLocked) => {
  if (isLocked) {
    accountLockTime.value = Date.now() + (30 * 60 * 1000)
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(1deg); }
}

.login-content {
  position: relative;
  z-index: 1;
}

.login-wrapper {
  width: 100%;
  max-width: 450px;
}

.brand-section {
  margin-bottom: 2rem;
}

.brand-logo {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.brand-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.glass-effect {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
}

.login-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 1rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.modern-input :deep(.v-field__outline) {
  border-radius: 12px;
}

.modern-input :deep(.v-field--focused .v-field__outline) {
  border-width: 2px;
}

.captcha-container {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.security-options {
  margin: 1rem 0;
}

.login-button {
  height: 48px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
}

.modern-button {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.modern-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.modern-alert {
  border-radius: 12px;
}

.demo-info {
  margin-top: 1.5rem;
}

.demo-info ul {
  list-style: none;
  padding-left: 0;
}

.demo-info li {
  margin: 0.5rem 0;
}

.demo-info code {
  background: rgba(102, 126, 234, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
}

.security-info {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.login-footer {
  margin-top: 2rem;
}

/* Responsive Design */
@media (max-width: 600px) {
  .login-wrapper {
    padding: 0 1rem;
  }
  
  .brand-title {
    font-size: 1.6rem;
  }
  
  .login-card {
    margin: 0;
  }
  
  .login-card .pa-8 {
    padding: 1.5rem !important;
  }
}

@media (max-width: 400px) {
  .brand-title {
    font-size: 1.4rem;
  }
  
  .security-info {
    flex-direction: column;
    align-items: center;
  }
}
</style>