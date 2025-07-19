<template>
  <div id="app">
    <Suspense>
      <template #default>
        <router-view />
      </template>
      <template #fallback>
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { onErrorCaptured, ref } from 'vue'

const error = ref(null)

// Global error handler
onErrorCaptured((err, instance, info) => {
  console.error('🚨 Vue Error Captured:', err)
  console.error('📍 Component Info:', info)
  console.error('🔍 Instance:', instance)
  
  // Vnode null hatası için özel handling
  if (err.message && err.message.includes('vnode') && err.message.includes('null')) {
    console.warn('🔧 Vnode null hatası yakalandı, navigasyon temizleniyor...')
    
    // Router'ı reset et
    setTimeout(() => {
      window.location.reload()
    }, 100)
    
    return false // Hatayı durdur
  }
  
  error.value = err
  return false
})

// Global error handler
window.addEventListener('error', (event) => {
  console.error('🌍 Global Error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚫 Unhandled Rejection:', event.reason)
})
</script>

<style>
#app {
  height: 100vh;
  width: 100vw;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #F8F4E6 0%, #E5C297 50%, #D4A574 100%);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #D4A574;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>