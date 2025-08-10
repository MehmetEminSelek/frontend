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
    const accessToken = ref(localStorage.getItem('accessToken'))
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
    const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

    const userRole = computed(() => user.value?.rol || 'VIEWER')

    const roleLevel = computed(() => user.value?.roleLevel || 0)

    // Role-based permissions mapping
    const rolePermissions = {
        'GENEL_MUDUR': ['READ', 'WRITE', 'DELETE', 'ADMIN', 'REPORTS', 'USER_MANAGEMENT'],
        'SUBE_MUDURU': ['READ', 'WRITE', 'DELETE', 'REPORTS'],
        'URETIM_MUDURU': ['READ', 'WRITE', 'PRODUCTION'],
        'SEVKIYAT_MUDURU': ['READ', 'WRITE', 'SHIPPING'],
        'CEP_DEPO_MUDURU': ['READ', 'WRITE', 'INVENTORY'],
        'SUBE_PERSONELI': ['READ', 'WRITE'],
        'URETIM_PERSONEL': ['READ', 'PRODUCTION'],
        'SEVKIYAT_PERSONELI': ['READ', 'SHIPPING'],
        'SOFOR': ['READ', 'SHIPPING'],
        'PERSONEL': ['READ'],
        'VIEWER': ['READ'] // Sadece görüntüleme yetkisi
    }

    const permissions = computed(() => {
        if (!user.value?.rol) return []
        return rolePermissions[user.value.rol] || ['READ']
    })

    const hasPermission = computed(() => (permission) => {
        if (!user.value) return false

        // 1) Legacy simple permission tags
        if (permissions.value.includes(permission) || user.value.rol === 'GENEL_MUDUR') return true

        // 2) Backend-style permission slugs support
        if (typeof permission === 'string') {
            const p = permission.trim().toUpperCase(); // Accept VIEW_USERS or users:view

            // Normalize possible formats (users:view -> VIEW_USERS)
            const normalized = p.includes(':')
                ? p.replace(/:/g, '_').toUpperCase()
                : p;

            // Minimum roleLevel thresholds aligned with backend RBAC intent
            const SLUG_MIN_LEVEL = {
                // Users
                VIEW_USERS: 80,
                CREATE_USERS: 90,
                UPDATE_USERS: 80,
                DELETE_USERS: 90,

                // Products
                VIEW_PRODUCTS: 40,
                CREATE_PRODUCTS: 60,
                UPDATE_PRODUCTS: 60,
                DELETE_PRODUCTS: 60,

                // Orders
                VIEW_ORDERS: 40,
                CREATE_ORDERS: 50,
                UPDATE_ORDERS: 50,
                DELETE_ORDERS: 50,

                // Customers
                VIEW_CUSTOMERS: 40,
                CREATE_CUSTOMERS: 50,
                UPDATE_CUSTOMERS: 50,
                DELETE_CUSTOMERS: 50,

                // Stock
                VIEW_STOCK: 40,
                UPDATE_STOCK: 60,
                MANAGE_STOCK: 60,

                // Materials
                VIEW_MATERIALS: 40,
                CREATE_MATERIALS: 60,
                UPDATE_MATERIALS: 60,
                DELETE_MATERIALS: 60,

                // Recipes / Financial / Reports
                VIEW_RECIPES: 70,
                VIEW_FINANCIAL: 80,
                UPDATE_PRICES: 80,
                MANAGE_PAYMENTS: 80,
                VIEW_REPORTS: 40,
                GENERATE_REPORTS: 40,
                EXPORT_REPORTS: 40,

                // Excel Ops / Audit
                EXCEL_OPERATIONS: 70,
                VIEW_AUDIT_LOGS: 80
            };

            const minLevel = SLUG_MIN_LEVEL[normalized];
            if (typeof minLevel === 'number') {
                return roleLevel.value >= minLevel;
            }
        }

        return false
    })

    const canAccess = computed(() => (page) => {
        if (!user.value) return false;

        const userRole = user.value.rol;

        // GENEL_MUDUR ve ADMIN her şeye erişebilir (ADMIN'de CRM hariç)
        if (userRole === 'GENEL_MUDUR') return true;
        if (userRole === 'ADMIN' && page !== 'crm-raporlama') return true;

        // Rol bazlı sayfa erişim hakları
        const roleAccess = {
            'VIEWER': [
                'siparis-formu',
                'hazirlanacak'
            ],
            'PERSONEL': [
                'siparis-formu',
                'hazirlanacak',
                'onay-bekleyenler',
                'tum-siparisler'
            ],
            'SUBE_MUDURU': [
                'siparis-formu',
                'hazirlanacak',
                'onay-bekleyenler',
                'tum-siparisler',
                'cari-yonetimi',
                'satis-raporu',
                'kargo-operasyon'
            ],
            'URETIM_MUDURU': [
                'siparis-formu',
                'hazirlanacak',
                'onay-bekleyenler',
                'tum-siparisler',
                'uretim-plani',
                'recete-yonetimi',
                'stok-yonetimi',
                'urun-yonetimi'
            ],
            'SEVKIYAT_MUDURU': [
                'siparis-formu',
                'hazirlanacak',
                'onay-bekleyenler',
                'tum-siparisler',
                'kargo-operasyon',
                'stok-yonetimi'
            ],
            'ADMIN': [
                'siparis-formu',
                'hazirlanacak',
                'onay-bekleyenler',
                'tum-siparisler',
                'cari-yonetimi',
                'urun-yonetimi',
                'stok-yonetimi',
                'satis-raporu',
                'kargo-operasyon',
                'uretim-plani',
                'recete-yonetimi',
                'kullanici-yonetimi',
                'fiyat-yonetimi'
                // CRM raporlama hariç (sadece GENEL_MUDUR)
            ]
        };

        // Admin-only sayfalar (GENEL_MUDUR ve ADMIN)
        const adminOnlyPages = [
            'kullanici-yonetimi',
            'fiyat-yonetimi'
        ];

        // CRM sadece GENEL_MUDUR
        if (page === 'crm-raporlama') {
            return userRole === 'GENEL_MUDUR';
        }

        // Diğer admin sayfalar için ADMIN da erişebilir
        if (adminOnlyPages.includes(page)) {
            return userRole === 'GENEL_MUDUR' || userRole === 'ADMIN';
        }

        // Rol bazlı erişim kontrolü
        const allowedPages = roleAccess[userRole] || [];
        return allowedPages.includes(page);
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
            if (accessToken.value) {
                // Try to validate token, but don't fail if endpoint doesn't exist
                try {
                    await validateToken()
                } catch (validationError) {
                    console.warn('Token validation skipped:', validationError.message)
                    // Token validation endpoint yoksa devam et
                    // Token localStorage'da varsa kullanıcı bilgilerini yükle
                    const storedUser = localStorage.getItem('user')
                    if (storedUser) {
                        user.value = JSON.parse(storedUser)
                    }
                }

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
        if (!accessToken.value) throw new Error('No token available')

        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiUrl}/auth/validate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.value}`,
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
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiUrl}/auth/csrf`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken.value}`
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

            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiUrl}/auth/login`, {
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
        // Store tokens - Backend sends accessToken
        accessToken.value = data.accessToken
        refreshToken.value = data.refreshToken
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        // Store user data
        user.value = data.user
        localStorage.setItem('user', JSON.stringify(data.user))
        sessionExpiry.value = data.sessionExpiry
        csrfToken.value = data.csrfToken

        // Reset security state
        loginAttempts.value = 0
        accountLocked.value = false
        lockExpiry.value = null

        // Set security level based on role
        const roleLevel = data.user.roleLevel || 30
        securityLevel.value = roleLevel >= 80 ? 'HIGH' : 'NORMAL'

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
            if (accessToken.value) {
                const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
                await fetch(`${apiUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken.value}`,
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

            // Update tokens - Backend sends accessToken
            accessToken.value = data.accessToken
            refreshToken.value = data.refreshToken
            localStorage.setItem('accessToken', data.accessToken)
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
        console.warn('Session expired - clearing all auth data')
        clearAuth()

        // Force page reload to clear any cached state
        window.location.href = '/login?reason=session_expired'
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
        accessToken.value = null
        refreshToken.value = null
        csrfToken.value = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        // Backward compatibility - eski token key'ini de temizle
        localStorage.removeItem('token')
    }

    /**
     * Clear user data
     */
    function clearUserData() {
        user.value = null
        sessionExpiry.value = null
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
        localStorage.removeItem('permissions')
        localStorage.removeItem('sessionExpiry')
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

        if (accessToken.value) {
            headers['Authorization'] = `Bearer ${accessToken.value}`
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
        accessToken,
        token: accessToken, // Backward compatibility
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
        canAccess,
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