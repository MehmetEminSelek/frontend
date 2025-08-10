// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import './plugins/vuetify.js'
import '@mdi/font/css/materialdesignicons.css'

import vuetify from './plugins/vuetify.js'

// Toast notifications
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Create app instance
const app = createApp(App)
const pinia = createPinia()

// Toast configuration
const toastOptions = {
    position: 'top-right',
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false
}

// Install plugins in correct order
app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(Toast, toastOptions)

// Initialize auth store
import { useAuthStore } from '@/stores/auth'

// Wait for router to be ready before mounting
router.isReady().then(async () => {
    app.mount('#app')
    console.log('✅ Router ready and app mounted')

    // Initialize auth after mount
    const authStore = useAuthStore()
    try {
        await authStore.initializeAuth()
        console.log('✅ Auth store initialized')
    } catch (error) {
        console.warn('⚠️ Auth initialization failed:', error)
    }
})
