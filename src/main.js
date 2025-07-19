/**
 * =============================================
 * MAIN APPLICATION ENTRY POINT - SECURITY ENHANCED
 * =============================================
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vuetify imports
import 'vuetify/styles'
import './plugins/vuetify.js'
import '@mdi/font/css/materialdesignicons.css'
import vuetify from './plugins/vuetify.js'

// Toast notifications
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Security imports
import { useAuthStore } from './stores/auth'
import { securityErrorHandler } from './utils/security'

// Create Vue app instance
const app = createApp(App)
const pinia = createPinia()

// Install Pinia first (required for stores)
app.use(pinia)

// Security Configuration
const setupSecurity = async () => {
    try {
        // Initialize auth store
        const authStore = useAuthStore()

        // Initialize authentication state
        await authStore.initializeAuth()

        // Setup global error handling
        app.config.errorHandler = (error, instance, info) => {
            console.error('Global error:', error, info)

            // Handle security-related errors
            if (error.message.includes('Permission') ||
                error.message.includes('Unauthorized') ||
                error.message.includes('Security')) {
                securityErrorHandler.handleApiError(error, {
                    component: instance?.$options.name || 'Unknown',
                    info,
                    global: true
                })
            }
        }

        // Setup global warning handler
        app.config.warnHandler = (msg, instance, trace) => {
            if (import.meta.env.DEV) {
                console.warn('Vue warning:', msg, trace)
            }
        }

        console.log('Security initialization completed')

    } catch (error) {
        console.error('Security initialization failed:', error)

        // Show user-friendly error
        if (window) {
            alert('Güvenlik sistemi başlatılamadı. Sayfayı yenileyin.')
        }
    }
}

// Router Security Guard
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Check if route requires authentication
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

    if (requiresAuth && !authStore.isAuthenticated) {
        // Redirect to login with return url
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        })
        return
    }

    // Check permissions if specified
    if (to.meta.permission && !authStore.checkPermission(to.meta.permission)) {
        // Redirect to unauthorized page or dashboard
        next({
            path: '/dashboard',
            query: { error: 'permission_denied' }
        })
        return
    }

    // Update activity on navigation
    if (authStore.isAuthenticated) {
        authStore.updateActivity()
    }

    next()
})

// Enhanced Toast Configuration
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
    rtl: false,
    transition: 'Vue-Toastification__bounce',
    maxToasts: 20,
    newestOnTop: true,
    // Security-specific toast types
    toastDefaults: {
        security: {
            timeout: 10000, // Longer timeout for security messages
            closeButton: false, // Force user to read
            pauseOnHover: true
        },
        error: {
            timeout: 8000,
            closeButton: true
        },
        warning: {
            timeout: 6000,
            closeButton: true
        }
    }
}

// Install plugins
app.use(router)
app.use(vuetify)
app.use(Toast, toastOptions)

// Global properties for security
app.config.globalProperties.$security = {
    checkPermission: (permission) => {
        const authStore = useAuthStore()
        return authStore.checkPermission(permission)
    },
    hasRole: (role) => {
        const authStore = useAuthStore()
        return authStore.userRole === role
    },
    isAuthenticated: () => {
        const authStore = useAuthStore()
        return authStore.isAuthenticated
    }
}

// Development security warnings
if (import.meta.env.DEV) {
    console.warn('🔒 Security Development Mode Active')
    console.warn('📋 Available security features:')
    console.warn('   - CSRF Token Protection')
    console.warn('   - JWT Authentication')
    console.warn('   - Permission-based Access Control')
    console.warn('   - Input Sanitization')
    console.warn('   - Session Management')
    console.warn('   - Audit Logging')

    // Add development security tools
    window.__SECURITY_DEBUG__ = {
        authStore: () => useAuthStore(),
        checkAuth: () => {
            const authStore = useAuthStore()
            return {
                isAuthenticated: authStore.isAuthenticated,
                user: authStore.user,
                role: authStore.userRole,
                permissions: authStore.permissions,
                sessionTimeRemaining: authStore.sessionTimeRemaining
            }
        },
        clearAuth: () => {
            const authStore = useAuthStore()
            authStore.clearAuth()
        }
    }
}

// Production security hardening
if (import.meta.env.PROD) {
    // Disable console in production
    console.log = () => { }
    console.warn = () => { }
    console.info = () => { }

    // Keep error logging for monitoring
    const originalError = console.error
    console.error = (...args) => {
        // Log to monitoring service in production
        originalError.apply(console, args)
    }

    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        return false
    })

    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault()
            return false
        }
    })
}

// Initialize security and mount app
setupSecurity()
    .then(() => {
        // Mount the app after security initialization
        app.mount('#app')
        console.log('🚀 Application mounted with security features')
    })
    .catch((error) => {
        console.error('Failed to initialize application:', error)

        // Emergency fallback mount
        app.mount('#app')
    })

// Performance monitoring
if (import.meta.env.PROD) {
    // Monitor app performance
    new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
                console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart)
            }
        }
    }).observe({ entryTypes: ['navigation'] })
}

export default app
