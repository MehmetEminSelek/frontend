<template>
  <div class="login-container">
    <!-- Background Pattern -->
    <div class="background-pattern"></div>
    
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
          <p class="brand-subtitle">Baklavacı Yönetim Paneli</p>
        </div>

        <!-- Login Card -->
        <v-card class="login-card glass-effect" elevation="0" rounded="xl">
          <v-card-text class="pa-8">
            <div class="text-center mb-6">
              <h2 class="login-title">Hoş Geldiniz</h2>
              <p class="login-subtitle">Hesabınıza giriş yapın</p>
            </div>

            <v-form @submit.prevent="login" class="login-form">
              <!-- Email Field -->
              <div class="input-group mb-6">
                <label class="input-label">Kullanıcı Adı / Email</label>
                <v-text-field
                  v-model="email"
                  placeholder="kullanici@example.com"
                  prepend-inner-icon="mdi-account-outline"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="modern-input"
                  color="primary"
                />
              </div>

              <!-- Password Field -->
              <div class="input-group mb-6">
                <label class="input-label">Şifre</label>
                <v-text-field
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  prepend-inner-icon="mdi-lock-outline"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="modern-input"
                  color="primary"
                />
              </div>

              <!-- Error Alert -->
              <v-slide-y-transition>
                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  class="mb-6 modern-alert"
                  rounded="lg"
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
                :loading="loading"
                block
                size="large"
                class="login-btn text-none"
                rounded="lg"
                elevation="2"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-login-variant</v-icon>
                </template>
                Giriş Yap
              </v-btn>
            </v-form>

            <!-- Additional Info -->
            <div class="text-center mt-8">
              <p class="help-text">
                <v-icon size="16" class="mr-1">mdi-shield-check-outline</v-icon>
                Güvenli giriş sistemi
              </p>
            </div>
          </v-card-text>
        </v-card>

        <!-- Footer -->
        <div class="text-center mt-6">
          <p class="footer-text">
            © 2025 Ömer Güllü Sistemi - Tüm hakları saklıdır
          </p>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();

async function login() {
  loading.value = true;
  error.value = '';
  
  try {
    const res = await axios.post('/api/auth/login', { 
      email: email.value, 
      password: password.value 
    });
    
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    
    // Smooth transition to main app
    router.push({ name: 'SiparisFormu' });
  } catch (err) {
    error.value = err.response?.data?.message || 'Giriş başarısız.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Background & Layout */
.login-container {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #f8f4e6 0%, #d4a574 50%, #8b4513 100%);
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px),
    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
}

.login-content {
  position: relative;
  z-index: 1;
}

.login-wrapper {
  width: 100%;
  max-width: 440px;
}

/* Branding */
.brand-logo {
  background: linear-gradient(135deg, #d4a574, #b8956a);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.brand-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #5d4037;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.brand-subtitle {
  color: #8d6e63;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Glass Effect Card */
.glass-effect {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 16px rgba(0, 0, 0, 0.05) !important;
}

.login-card {
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

/* Typography */
.login-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #5d4037;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #8d6e63;
  font-size: 1rem;
}

/* Form Styling */
.input-group {
  position: relative;
}

.input-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #5d4037;
  margin-bottom: 0.5rem;
}

.modern-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.modern-input :deep(.v-field--focused) {
  background: rgba(255, 255, 255, 0.95);
}

/* Button Styling */
.login-btn {
  background: linear-gradient(135deg, #d4a574 0%, #b8956a 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px;
  height: 50px !important;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: linear-gradient(135deg, #c19660 0%, #a68356 100%) !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4) !important;
}

/* Alert Styling */
.modern-alert {
  border-left: 4px solid rgb(var(--v-theme-error));
}

/* Additional Elements */
.help-text {
  color: #8d6e63;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-text {
  color: #8d6e63;
  font-size: 0.85rem;
  opacity: 0.8;
}

/* Responsive Design */
@media (max-width: 600px) {
  .login-wrapper {
    max-width: 90vw;
    padding: 0 1rem;
  }
  
  .brand-title {
    font-size: 1.8rem;
  }
  
  .login-card {
    margin: 0 1rem;
  }
}

/* Loading Animation */
.v-btn--loading {
  pointer-events: none;
}

/* Smooth Transitions */
* {
  transition: all 0.2s ease;
}
</style>