/**
 * =============================================
 * ENHANCED AUTHENTICATION STORE - SECURITY INTEGRATED
 * =============================================
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    // ===== STATE =====
    const user = ref(null)
    const token = ref(localStorage.getItem('token'))
    const refreshToken = ref(localStorage.getItem('refreshToken'))
    const csrfToken = ref(null)
    const sessionExpiry = ref(null)
    const loginAttempts = ref(0)
    const accountLocked = ref(false)
    const lockExpiry = ref(null)
    const loading = ref(false)
    const lastActivity = ref(Date.now())
    const securityLevel = ref('NORMAL') // NORMAL, HIGH, CRITICAL

    // ===== COMPUTED =====
    const isAuthenticated = computed(() => !!token.value && !!user.value)

    const userRole = computed(() => user.value?.rol || 'VIEWER')

    const roleLevel = computed(() => user.value?.roleLevel || 0)

    const permissions = computed(() => user.value?.permissions || [])

    const hasPermission = computed(() => (permission) => {
        if (!user.value) return false
        return permissions.value.includes(permission) || user.value.rol === 'ADMIN'
    })

    const isSessionExpired = computed(() => {
        if (!sessionExpiry.value) return false
        return Date.now() > new Date(sessionExpiry.value).getTime()
    })

    const isAccountLocked = computed(() => {
        if (!accountLocked.value || !lockExpiry.value) return false
        return Date.now() < new Date(lockExpiry.value).getTime()
    })

    const sessionTimeRemaining = computed(() => {
        if (!sessionExpiry.value) return 0
        const remaining = new Date(sessionExpiry.value).getTime() - Date.now()
        return Math.max(0, Math.floor(remaining / 1000 / 60)) // minutes
    })

    const canAccessFinancialData = computed(() => roleLevel.value >= 70)

    const canAccessAuditLogs = computed(() => roleLevel.value >= 80)

    const canManageUsers = computed(() => roleLevel.value >= 80)

    // ===== ACTIONS =====

    /**
     * Initialize authentication from stored tokens
     */
    async function initializeAuth() {
        try {
            if (token.value) {
                // Validate existing token
                await validateToken()

                // Fetch CSRF token
                await fetchCSRFToken()

                // Update last activity
                updateActivity()
            }
        } catch (error) {
            console.error('Auth initialization failed:', error)
            clearAuth()
        }
    }

    /**
     * Validate current token with backend
     */
    async function validateToken() {
        if (!token.value) throw new Error('No token available')

        try {
            const response = await fetch('/api/auth/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token.value}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Token validation failed')
            }

            const data = await response.json()

            // Update user data
            user.value = data.user
            sessionExpiry.value = data.sessionExpiry

            return true
        } catch (error) {
            console.error('Token validation error:', error)
            throw error
        }
    }

    /**
     * Fetch CSRF token from backend
     */
    async function fetchCSRFToken() {
        try {
            const response = await fetch('/api/auth/csrf', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.value}`
                }
            })

            if (!response.ok) {
                throw new Error('CSRF token fetch failed')
            }

            const data = await response.json()
            csrfToken.value = data.csrfToken

            return csrfToken.value
        } catch (error) {
            console.error('CSRF token fetch error:', error)
            throw error
        }
    }

    /**
     * Login with enhanced security
     */
    async function login(credentials) {
        loading.value = true

        try {
            // Check account lock status
            if (isAccountLocked.value) {
                const remainingTime = Math.ceil((new Date(lockExpiry.value).getTime() - Date.now()) / 1000 / 60)
                throw new Error(`Account locked. Try again in ${remainingTime} minutes.`)
            }

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...credentials,
                    deviceInfo: getDeviceInfo(),
                    timestamp: Date.now()
                })
            })

            const data = await response.json()

            if (!response.ok) {
                // Handle login failure
                handleLoginFailure(data)
                throw new Error(data.error || 'Login failed')
            }

            // Successful login
            handleLoginSuccess(data)

            return data
        } catch (error) {
            console.error('Login error:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Handle successful login
     */
    function handleLoginSuccess(data) {
        // Store tokens - Backend sends accessToken not token
        token.value = data.accessToken
        refreshToken.value = data.refreshToken
        localStorage.setItem('token', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        // Store user data
        user.value = data.user
        sessionExpiry.value = data.sessionExpiry
        csrfToken.value = data.csrfToken

        // Reset security state
        loginAttempts.value = 0
        accountLocked.value = false
        lockExpiry.value = null

        // Set security level based on role
        securityLevel.value = data.user.roleLevel >= 80 ? 'HIGH' : 'NORMAL'

        // Update activity
        updateActivity()
    }

    /**
     * Handle login failure
     */
    function handleLoginFailure(data) {
        loginAttempts.value++

        if (data.accountLocked) {
            accountLocked.value = true
            lockExpiry.value = data.lockExpiry
        }

        // Clear any existing auth data
        clearTokens()
    }

    /**
     * Logout with security cleanup
     */
    async function logout() {
        try {
            // Notify backend of logout
            if (token.value) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token.value}`,
                        'X-CSRF-Token': csrfToken.value
                    }
                })
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            clearAuth()
        }
    }

    /**
     * Refresh authentication token
     */
    async function refreshTokens() {
        if (!refreshToken.value) {
            throw new Error('No refresh token available')
        }

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: refreshToken.value
                })
            })

            if (!response.ok) {
                throw new Error('Token refresh failed')
            }

            const data = await response.json()

            // Update tokens - Backend sends accessToken not token
            token.value = data.accessToken
            refreshToken.value = data.refreshToken
            localStorage.setItem('token', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)

            // Update session expiry
            sessionExpiry.value = data.sessionExpiry

            return data
        } catch (error) {
            console.error('Token refresh error:', error)
            clearAuth()
            throw error
        }
    }

    /**
     * Update user activity timestamp
     */
    function updateActivity() {
        lastActivity.value = Date.now()
    }

    /**
     * Check for session timeout
     */
    function checkSessionTimeout() {
        if (isSessionExpired.value) {
            handleSessionExpiry()
        }
    }

    /**
     * Handle session expiry
     */
    function handleSessionExpiry() {
        console.warn('Session expired')
        clearAuth()

        // Redirect to login or show modal
        window.location.href = '/login'
    }

    /**
     * Clear all authentication data
     */
    function clearAuth() {
        clearTokens()
        clearUserData()
        clearSecurityState()
    }

    /**
     * Clear stored tokens
     */
    function clearTokens() {
        token.value = null
        refreshToken.value = null
        csrfToken.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
    }

    /**
     * Clear user data
     */
    function clearUserData() {
        user.value = null
        sessionExpiry.value = null
    }

    /**
     * Clear security state
     */
    function clearSecurityState() {
        loginAttempts.value = 0
        accountLocked.value = false
        lockExpiry.value = null
        securityLevel.value = 'NORMAL'
        lastActivity.value = Date.now()
    }

    /**
     * Get device information for security logging
     */
    function getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: Date.now()
        }
    }

    /**
     * Check if user has specific permission
     */
    function checkPermission(permission) {
        return hasPermission.value(permission)
    }

    /**
     * Get security headers for API requests
     */
    function getSecurityHeaders() {
        const headers = {}

        if (token.value) {
            headers['Authorization'] = `Bearer ${token.value}`
        }

        if (csrfToken.value) {
            headers['X-CSRF-Token'] = csrfToken.value
        }

        // Add device fingerprint
        headers['X-Device-Fingerprint'] = btoa(JSON.stringify(getDeviceInfo()))

        return headers
    }

    /**
     * Set security level based on operation sensitivity
     */
    function setSecurityLevel(level) {
        if (['NORMAL', 'HIGH', 'CRITICAL'].includes(level)) {
            securityLevel.value = level
        }
    }

    // ===== AUTO SESSION MANAGEMENT =====

    // Setup automatic session checks
    let sessionCheckInterval = null
    let activityCheckInterval = null

    function startSessionMonitoring() {
        // Check session expiry every minute
        sessionCheckInterval = setInterval(() => {
            if (isAuthenticated.value) {
                checkSessionTimeout()
            }
        }, 60000)

        // Check for inactivity every 30 seconds
        activityCheckInterval = setInterval(() => {
            if (isAuthenticated.value) {
                const inactiveTime = Date.now() - lastActivity.value
                const maxInactiveTime = 30 * 60 * 1000 // 30 minutes

                if (inactiveTime > maxInactiveTime) {
                    console.warn('Session inactive for too long')
                    handleSessionExpiry()
                }
            }
        }, 30000)
    }

    function stopSessionMonitoring() {
        if (sessionCheckInterval) {
            clearInterval(sessionCheckInterval)
            sessionCheckInterval = null
        }

        if (activityCheckInterval) {
            clearInterval(activityCheckInterval)
            activityCheckInterval = null
        }
    }

    // Start monitoring when store is created
    startSessionMonitoring()

    // ===== RETURN PUBLIC API =====
    return {
        // State
        user,
        token,
        csrfToken,
        loading,
        loginAttempts,
        accountLocked,
        securityLevel,

        // Computed
        isAuthenticated,
        userRole,
        roleLevel,
        permissions,
        hasPermission,
        isSessionExpired,
        isAccountLocked,
        sessionTimeRemaining,
        canAccessFinancialData,
        canAccessAuditLogs,
        canManageUsers,

        // Actions
        initializeAuth,
        login,
        logout,
        refreshTokens,
        updateActivity,
        checkPermission,
        getSecurityHeaders,
        setSecurityLevel,
        fetchCSRFToken,
        clearAuth,

        // Session Management
        startSessionMonitoring,
        stopSessionMonitoring
    }
}) 