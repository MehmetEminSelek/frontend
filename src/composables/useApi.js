import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Base API URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/**
 * Modern API Composable - Vue 3 + TypeScript Best Practices
 * Tüm API çağrıları için merkezi yönetim
 */
export function useApi() {
    const router = useRouter()
    const loading = ref(false)
    const error = ref(null)

    // HTTP Client with interceptors
    const apiClient = {
        async request(endpoint, options = {}) {
            loading.value = true
            error.value = null

            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    ...options
                }

                const response = await fetch(`${API_BASE}${endpoint}`, config)

                if (!response.ok) {
                    if (response.status === 401) {
                        // Unauthorized - redirect to login
                        router.push('/login')
                        throw new Error('Oturum süresi doldu')
                    }

                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(errorData.message || `HTTP ${response.status}`)
                }

                const data = await response.json()
                return data
            } catch (err) {
                error.value = err.message
                throw err
            } finally {
                loading.value = false
            }
        },

        get(endpoint, params = {}) {
            const query = new URLSearchParams(params).toString()
            const url = query ? `${endpoint}?${query}` : endpoint
            return this.request(url)
        },

        post(endpoint, data) {
            return this.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            })
        },

        put(endpoint, data) {
            return this.request(endpoint, {
                method: 'PUT',
                body: JSON.stringify(data)
            })
        },

        delete(endpoint) {
            return this.request(endpoint, {
                method: 'DELETE'
            })
        }
    }

    return {
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        clearError: () => { error.value = null },
        ...apiClient
    }
}

/**
 * Resource-specific API composables
 */

// Materials API
export function useMaterialsApi() {
    const api = useApi()

    return {
        ...api,

        async getMaterials(filters = {}) {
            return api.get('/materials', filters)
        },

        async getMaterial(id) {
            return api.get(`/materials/${id}`)
        },

        async createMaterial(data) {
            return api.post('/materials', data)
        },

        async updateMaterial(id, data) {
            return api.put(`/materials/${id}`, data)
        },

        async deleteMaterial(id) {
            return api.delete(`/materials/${id}`)
        }
    }
}

// Products API
export function useProductsApi() {
    const api = useApi()

    return {
        ...api,

        async getProducts(filters = {}) {
            return api.get('/urunler', filters)
        },

        async getProduct(id) {
            return api.get(`/urunler/${id}`)
        },

        async createProduct(data) {
            return api.post('/urunler', data)
        },

        async updateProduct(id, data) {
            return api.put(`/urunler/${id}`, data)
        },

        async deleteProduct(id) {
            return api.delete(`/urunler/${id}`)
        },

        async getProductRecipes(id) {
            return api.get(`/urunler/${id}/receteler`)
        }
    }
}

// Recipes API
export function useRecipesApi() {
    const api = useApi()

    return {
        ...api,

        async getRecipes(filters = {}) {
            return api.get('/receteler', filters)
        },

        async getRecipe(id) {
            return api.get(`/receteler/${id}`)
        },

        async createRecipe(data) {
            return api.post('/receteler', data)
        },

        async updateRecipe(id, data) {
            return api.put(`/receteler/${id}`, data)
        },

        async deleteRecipe(id) {
            return api.delete(`/receteler/${id}`)
        },

        async calculateRecipeCost(id) {
            return api.post(`/receteler/${id}/maliyet`)
        }
    }
}

// Orders API
export function useOrdersApi() {
    const api = useApi()

    return {
        ...api,

        async getOrders(filters = {}) {
            return api.get('/siparis', filters)
        },

        async getOrder(id) {
            return api.get(`/siparis/${id}`)
        },

        async createOrder(data) {
            return api.post('/siparis', data)
        },

        async updateOrder(id, data) {
            return api.put(`/siparis/${id}`, data)
        },

        async deleteOrder(id) {
            return api.delete(`/siparis/${id}`)
        },

        async updateOrderStatus(id, status) {
            return api.put(`/siparis/${id}/durum`, { durum: status })
        }
    }
}

// Customers API
export function useCustomersApi() {
    const api = useApi()

    return {
        ...api,

        async getCustomers(filters = {}) {
            return api.get('/cari', filters)
        },

        async getCustomer(id) {
            return api.get(`/cari/${id}`)
        },

        async createCustomer(data) {
            return api.post('/cari', data)
        },

        async updateCustomer(id, data) {
            return api.put(`/cari/${id}`, data)
        },

        async deleteCustomer(id) {
            return api.delete(`/cari/${id}`)
        },

        async getCustomerTransactions(id) {
            return api.get(`/cari/${id}/hareketler`)
        }
    }
} 