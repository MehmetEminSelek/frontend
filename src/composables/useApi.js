/**
 * =============================================
 * ENHANCED API COMPOSABLE - SECURITY INTEGRATED
 * =============================================
 */

import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/api'

// Basit security levels
const SECURITY_LEVELS = {
    NORMAL: 'NORMAL',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
}

/**
 * Enhanced API Composable with Security Features
 */
export function useApi() {
    const router = useRouter()
    const authStore = useAuthStore()

    // Reactive state
    const loading = ref(false)
    const error = ref(null)
    const data = ref(null)
    const requestId = ref(null)
    const retryCount = ref(0)
    const abortController = ref(null)

    // Computed properties
    const hasError = computed(() => !!error.value)
    const isRetrying = computed(() => retryCount.value > 0)
    const canRetry = computed(() => hasError.value && retryCount.value < 3)

    /**
     * Execute API request with enhanced security
     */
    const execute = async (apiCall, options = {}) => {
        const {
            requireAuth = true,
            requirePermission = null,
            securityLevel = SECURITY_LEVELS.NORMAL,
            onSuccess = null,
            onError = null,
            sanitizeInput = true,
            skipErrorHandling = false
        } = options

        // Generate unique request ID
        requestId.value = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Security checks
        if (requireAuth && !authStore.isAuthenticated) {
            const authError = new Error('Authentication required')
            authError.type = 'UNAUTHORIZED'
            throw authError
        }

        if (requirePermission && !authStore.hasPermission(requirePermission)) {
            const permError = new Error(`Permission required: ${requirePermission}`)
            permError.type = 'PERMISSION_DENIED'
            throw permError
        }

        // Set security level
        authStore.setSecurityLevel(securityLevel)

        // Reset state
        loading.value = true
        error.value = null
        data.value = null

        // Create abort controller for request cancellation
        abortController.value = new AbortController()

        try {
            // Execute the API call
            const response = await apiCall()

            // Success handling
            data.value = response
            retryCount.value = 0

            if (onSuccess) {
                await onSuccess(response)
            }

            return response
        } catch (err) {
            // Basit error handling
            error.value = err

            if (onError) {
                await onError(error.value)
            }

            throw error.value
        } finally {
            loading.value = false
            abortController.value = null
        }
    }

    /**
     * Retry last failed request
     */
    const retry = async () => {
        if (!canRetry.value) return

        retryCount.value++

        try {
            // Re-execute the last request
            // Note: This requires storing the last request parameters
            // For now, this is a placeholder for retry functionality
            console.log('Retrying request...', requestId.value)
        } catch (err) {
            console.error('Retry failed:', err)
        }
    }

    /**
     * Cancel current request
     */
    const cancel = () => {
        if (abortController.value) {
            abortController.value.abort()
            loading.value = false
            error.value = { type: 'CANCELLED', message: 'Request cancelled' }
        }
    }

    /**
     * Clear error state
     */
    const clearError = () => {
        error.value = null
        retryCount.value = 0
    }

    /**
     * Clear all state
     */
    const reset = () => {
        loading.value = false
        error.value = null
        data.value = null
        requestId.value = null
        retryCount.value = 0
    }

    // Cleanup on unmount
    onUnmounted(() => {
        cancel()
    })

    return {
        // State
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        data: computed(() => data.value),
        requestId: computed(() => requestId.value),
        retryCount: computed(() => retryCount.value),

        // Computed
        hasError,
        isRetrying,
        canRetry,

        // Actions
        execute,
        retry,
        cancel,
        clearError,
        reset
    }
}

/**
 * Specialized composables for different API operations
 */

/**
 * Authentication API Composable
 */
export function useAuthApi() {
    const { execute, ...rest } = useApi()

    const login = async (credentials) => {
        return execute(
            () => api.login(credentials),
            {
                requireAuth: false,
                securityLevel: SECURITY_LEVELS.HIGH
            }
        )
    }

    const logout = async () => {
        return execute(
            () => api.logout(),
            {
                securityLevel: SECURITY_LEVELS.NORMAL
            }
        )
    }

    const refreshToken = async (token) => {
        return execute(
            () => api.refreshToken(token),
            {
                requireAuth: false,
                securityLevel: SECURITY_LEVELS.HIGH
            }
        )
    }

    return {
        ...rest,
        login,
        logout,
        refreshToken
    }
}

/**
 * User Management API Composable
 */
export function useUserApi() {
    const { execute, ...rest } = useApi()

    const getUsers = async (params = {}) => {
        return execute(
            () => api.getUsers(params),
            {
                requirePermission: 'VIEW_USERS',
                securityLevel: SECURITY_LEVELS.HIGH
            }
        )
    }

    const createUser = async (userData) => {
        return execute(
            () => api.createUser(userData),
            {
                requirePermission: 'MANAGE_USERS',
                securityLevel: SECURITY_LEVELS.CRITICAL
            }
        )
    }

    const updateUser = async (id, userData) => {
        return execute(
            () => api.updateUser(id, userData),
            {
                requirePermission: 'MANAGE_USERS',
                securityLevel: SECURITY_LEVELS.CRITICAL
            }
        )
    }

    const deleteUser = async (id) => {
        return execute(
            () => api.deleteUser(id),
            {
                requirePermission: 'MANAGE_USERS',
                securityLevel: SECURITY_LEVELS.CRITICAL
            }
        )
    }

    return {
        ...rest,
        getUsers,
        createUser,
        updateUser,
        deleteUser
    }
}

/**
 * Order Management API Composable
 */
export function useOrderApi() {
    const { execute, ...rest } = useApi()

    const getOrders = async (params = {}) => {
        return execute(
            () => api.getOrders(params),
            {
                requirePermission: 'VIEW_ORDERS'
            }
        )
    }

    const createOrder = async (orderData) => {
        return execute(
            () => api.createOrder(orderData),
            {
                requirePermission: 'CREATE_ORDERS',
                securityLevel: SECURITY_LEVELS.HIGH
            }
        )
    }

    const updateOrder = async (id, orderData) => {
        return execute(
            () => api.updateOrder(id, orderData),
            {
                requirePermission: 'UPDATE_ORDERS',
                securityLevel: SECURITY_LEVELS.HIGH
            }
        )
    }

    const deleteOrder = async (id) => {
        return execute(
            () => api.deleteOrder(id),
            {
                requirePermission: 'DELETE_ORDERS',
                securityLevel: SECURITY_LEVELS.CRITICAL
            }
        )
    }

    return {
        ...rest,
        getOrders,
        createOrder,
        updateOrder,
        deleteOrder
    }
}

/**
 * Customer Management API Composable
 */
export function useCustomerApi() {
    const { execute, ...rest } = useApi()

    const getCustomers = async (params = {}) => {
        return execute(
            () => api.getCustomers(params),
            {
                requirePermission: 'VIEW_CUSTOMERS'
            }
        )
    }

    const createCustomer = async (customerData) => {
        return execute(
            () => api.createCustomer(customerData),
            {
                requirePermission: 'MANAGE_CUSTOMERS',
                securityLevel: SECURITY_LEVELS.HIGH
            }
        )
    }

    const updateCustomer = async (id, customerData) => {
        return execute(
            () => api.updateCustomer(id, customerData),
            {
                requirePermission: 'MANAGE_CUSTOMERS',
                securityLevel: SECURITY_LEVELS.HIGH
            }
        )
    }

    return {
        ...rest,
        getCustomers,
        createCustomer,
        updateCustomer
    }
}

/**
 * Product Management API Composable
 */
export function useProductApi() {
    const { execute, ...rest } = useApi()

    const getProducts = async (params = {}) => {
        return execute(
            () => api.getProducts(params),
            {
                requirePermission: 'VIEW_PRODUCTS'
            }
        )
    }

    const createProduct = async (productData) => {
        return execute(
            () => api.createProduct(productData),
            {
                requirePermission: 'MANAGE_PRODUCTS',
                securityLevel: SECURITY_LEVELS.HIGH
            }
        )
    }

    const updateProduct = async (id, productData) => {
        return execute(
            () => api.updateProduct(id, productData),
            {
                requirePermission: 'MANAGE_PRODUCTS',
                securityLevel: SECURITY_LEVELS.HIGH
            }
        )
    }

    return {
        ...rest,
        getProducts,
        createProduct,
        updateProduct
    }
}

/**
 * Reports API Composable
 */
export function useReportsApi() {
    const { execute, ...rest } = useApi()

    const getSalesReport = async (params = {}) => {
        return execute(
            () => api.getSalesReport(params),
            {
                requirePermission: 'VIEW_REPORTS',
                securityLevel: SECURITY_LEVELS.HIGH
            }
        )
    }

    const getCRMReport = async (params = {}) => {
        return execute(
            () => api.getCRMReport(params),
            {
                requirePermission: 'VIEW_REPORTS',
                securityLevel: SECURITY_LEVELS.HIGH
            }
        )
    }

    return {
        ...rest,
        getSalesReport,
        getCRMReport
    }
}

/**
 * File Operations API Composable
 */
export function useFileApi() {
    const { execute, ...rest } = useApi()
    const uploadProgress = ref(0)

    const uploadUserExcel = async (file) => {
        return execute(
            () => api.uploadUserExcel(file, (progress) => {
                uploadProgress.value = progress
            }),
            {
                requirePermission: 'MANAGE_USERS',
                securityLevel: SECURITY_LEVELS.CRITICAL
            }
        )
    }

    const uploadCustomerExcel = async (file) => {
        return execute(
            () => api.uploadCustomerExcel(file, (progress) => {
                uploadProgress.value = progress
            }),
            {
                requirePermission: 'MANAGE_CUSTOMERS',
                securityLevel: SECURITY_LEVELS.HIGH
            }
        )
    }

    const downloadUserTemplate = async () => {
        return execute(
            () => api.downloadUserTemplate(),
            {
                requirePermission: 'MANAGE_USERS'
            }
        )
    }

    const downloadCustomerTemplate = async () => {
        return execute(
            () => api.downloadCustomerTemplate(),
            {
                requirePermission: 'MANAGE_CUSTOMERS'
            }
        )
    }

    return {
        ...rest,
        uploadProgress: computed(() => uploadProgress.value),
        uploadUserExcel,
        uploadCustomerExcel,
        downloadUserTemplate,
        downloadCustomerTemplate
    }
}

/**
 * Utility API Composable
 */
export function useUtilityApi() {
    const { execute, ...rest } = useApi()

    const getDropdownData = async (category = null) => {
        return execute(
            () => api.getDropdownData(category),
            {
                requireAuth: true
            }
        )
    }

    return {
        ...rest,
        getDropdownData
    }
}

/**
 * Audit Logs API Composable (Admin only)
 */
export function useAuditApi() {
    const { execute, ...rest } = useApi()

    const getAuditLogs = async (params = {}) => {
        return execute(
            () => api.getAuditLogs(params),
            {
                requirePermission: 'VIEW_AUDIT_LOGS',
                securityLevel: SECURITY_LEVELS.CRITICAL
            }
        )
    }

    return {
        ...rest,
        getAuditLogs
    }
} 