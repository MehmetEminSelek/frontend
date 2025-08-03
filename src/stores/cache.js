import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.js'

/**
 * Intelligent Cache Store
 * Handles all dropdown data with smart caching, error recovery, and optimization
 */
export const useCacheStore = defineStore('cache', () => {
    // ===== STATE =====
    const dropdownData = ref({
        cariler: [],
        urunler: [],
        teslimatTurleri: [],
        odemeSekilleri: [],
        aliciTipleri: [],
        subeler: [],
        kategoriler: [],
        personeller: []
    })

    const cacheStatus = ref({
        isLoading: false,
        isInitialized: false,
        lastFetch: null,
        error: null,
        retryCount: 0,
        version: 1
    })

    const cacheConfig = ref({
        ttl: 15 * 60 * 1000, // 15 minutes
        maxRetries: 3,
        retryDelay: 1000,
        enableLocalStorage: true,
        enableOptimisticUpdates: true
    })

    // ===== COMPUTED =====
    const isCacheValid = computed(() => {
        if (!cacheStatus.value.lastFetch) return false
        const now = Date.now()
        const lastFetch = new Date(cacheStatus.value.lastFetch).getTime()
        return (now - lastFetch) < cacheConfig.value.ttl
    })

    const hasData = computed(() => {
        return Object.values(dropdownData.value).some(arr => Array.isArray(arr) && arr.length > 0)
    })

    const cacheHealth = computed(() => {
        const health = {
            status: 'healthy',
            dataQuality: 0,
            issues: []
        }

        // Check data quality
        const dataPoints = Object.entries(dropdownData.value)
        const validDataPoints = dataPoints.filter(([key, data]) => Array.isArray(data) && data.length > 0)
        health.dataQuality = Math.round((validDataPoints.length / dataPoints.length) * 100)

        // Check for issues
        if (!cacheStatus.value.isInitialized) {
            health.issues.push('Cache not initialized')
            health.status = 'warning'
        }

        if (cacheStatus.value.error) {
            health.issues.push('Last fetch failed')
            health.status = 'error'
        }

        if (!isCacheValid.value && hasData.value) {
            health.issues.push('Data is stale')
            health.status = 'stale'
        }

        return health
    })

    // ===== STORAGE UTILITIES =====
    const STORAGE_KEY = 'og_dropdown_cache'
    const STORAGE_META_KEY = 'og_dropdown_cache_meta'

    function saveToLocalStorage() {
        if (!cacheConfig.value.enableLocalStorage) return

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dropdownData.value))
            localStorage.setItem(STORAGE_META_KEY, JSON.stringify({
                lastFetch: cacheStatus.value.lastFetch,
                version: cacheStatus.value.version,
                timestamp: Date.now()
            }))
            console.log('💾 Cache saved to localStorage')
        } catch (error) {
            console.warn('Failed to save cache to localStorage:', error)
        }
    }

    function loadFromLocalStorage() {
        if (!cacheConfig.value.enableLocalStorage) return false

        try {
            const data = localStorage.getItem(STORAGE_KEY)
            const meta = localStorage.getItem(STORAGE_META_KEY)

            if (!data || !meta) return false

            const parsedData = JSON.parse(data)
            const parsedMeta = JSON.parse(meta)

            // Check if stored data is valid
            const age = Date.now() - parsedMeta.timestamp
            if (age > cacheConfig.value.ttl) {
                console.log('📅 Stored cache is expired')
                return false
            }

            // Load data
            dropdownData.value = parsedData
            cacheStatus.value.lastFetch = parsedMeta.lastFetch
            cacheStatus.value.version = parsedMeta.version

            console.log('📂 Cache loaded from localStorage', {
                age: Math.round(age / 1000) + 's',
                dataPoints: Object.keys(parsedData).length
            })

            return true
        } catch (error) {
            console.warn('Failed to load cache from localStorage:', error)
            return false
        }
    }

    function clearLocalStorage() {
        try {
            localStorage.removeItem(STORAGE_KEY)
            localStorage.removeItem(STORAGE_META_KEY)
            console.log('🗑️ Cache cleared from localStorage')
        } catch (error) {
            console.warn('Failed to clear cache from localStorage:', error)
        }
    }

    // ===== API UTILITIES =====
    async function makeApiRequest(endpoint, options = {}) {
        const authStore = useAuthStore()
        const token = authStore.token || localStorage.getItem('token')

        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            credentials: 'include'
        }

        const mergedOptions = { ...defaultOptions, ...options }
        const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}${endpoint}`

        console.log(`🌐 API Request: ${mergedOptions.method} ${endpoint}`)

        const response = await fetch(url, mergedOptions)

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`API Error ${response.status}: ${errorText}`)
        }

        return response.json()
    }

    // ===== MAIN FETCH FUNCTION =====
    async function fetchDropdownData(options = {}) {
        const {
            force = false,
            silent = false,
            useTestEndpoint = false
        } = options

        // Check if we need to fetch
        if (!force && isCacheValid.value && hasData.value) {
            console.log('✅ Using cached dropdown data')
            return dropdownData.value
        }

        if (!silent) {
            cacheStatus.value.isLoading = true
            cacheStatus.value.error = null
        }

        let attempt = 0
        const maxAttempts = cacheConfig.value.maxRetries

        while (attempt < maxAttempts) {
            try {
                console.log(`🔄 Fetching dropdown data (attempt ${attempt + 1}/${maxAttempts})`)

                // Choose endpoint
                const endpoint = useTestEndpoint ? '/dropdown-test' : '/dropdown'

                // Make API call
                const data = await makeApiRequest(endpoint)

                // Validate response
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid response format')
                }

                // Update cache
                dropdownData.value = {
                    cariler: data.cariler || [],
                    urunler: data.urunler || [],
                    teslimatTurleri: data.teslimatTurleri || [],
                    odemeSekilleri: data.odemeSekilleri || [],
                    aliciTipleri: data.aliciTipleri || [],
                    subeler: data.subeler || [],
                    kategoriler: data.kategoriler || [],
                    personeller: data.personeller || []
                }

                // Update cache status
                cacheStatus.value.lastFetch = new Date().toISOString()
                cacheStatus.value.isInitialized = true
                cacheStatus.value.retryCount = 0
                cacheStatus.value.version++

                // Save to localStorage
                saveToLocalStorage()

                console.log('✅ Dropdown data fetched successfully', {
                    cariler: data.cariler?.length || 0,
                    urunler: data.urunler?.length || 0,
                    teslimatTurleri: data.teslimatTurleri?.length || 0,
                    cached: true
                })

                return dropdownData.value

            } catch (error) {
                attempt++
                cacheStatus.value.retryCount = attempt

                console.error(`❌ Dropdown fetch error (attempt ${attempt}):`, error.message)

                if (attempt >= maxAttempts) {
                    cacheStatus.value.error = error.message

                    // Try to load from localStorage as fallback
                    if (hasData.value) {
                        console.log('📂 Using stale cache data as fallback')
                        return dropdownData.value
                    }

                    throw new Error(`Failed to fetch dropdown data after ${maxAttempts} attempts: ${error.message}`)
                }

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, cacheConfig.value.retryDelay * attempt))
            }
        }
    }

    // ===== SPECIFIC DATA GETTERS =====
    const getCariler = computed(() => dropdownData.value.cariler || [])
    const getUrunler = computed(() => dropdownData.value.urunler || [])
    const getTeslimatTurleri = computed(() => dropdownData.value.teslimatTurleri || [])
    const getOdemeSekilleri = computed(() => dropdownData.value.odemeSekilleri || [])
    const getAliciTipleri = computed(() => dropdownData.value.aliciTipleri || [])

    // ===== UTILITY FUNCTIONS =====
    function findItemById(collection, id) {
        const items = dropdownData.value[collection] || []
        return items.find(item => item.id === id)
    }

    function findItemByCode(collection, code) {
        const items = dropdownData.value[collection] || []
        return items.find(item => item.kod === code)
    }

    function searchItems(collection, query, fields = ['ad', 'kod']) {
        const items = dropdownData.value[collection] || []
        const lowercaseQuery = query.toLowerCase()

        return items.filter(item =>
            fields.some(field =>
                item[field]?.toLowerCase().includes(lowercaseQuery)
            )
        )
    }

    // ===== CACHE MANAGEMENT =====
    function invalidateCache() {
        cacheStatus.value.lastFetch = null
        cacheStatus.value.isInitialized = false
        clearLocalStorage()
        console.log('🔄 Cache invalidated')
    }

    function clearCache() {
        dropdownData.value = {
            cariler: [],
            urunler: [],
            teslimatTurleri: [],
            odemeSekilleri: [],
            aliciTipleri: [],
            subeler: [],
            kategoriler: [],
            personeller: []
        }
        invalidateCache()
        console.log('🗑️ Cache cleared')
    }

    async function refreshCache() {
        console.log('🔄 Refreshing cache...')
        await fetchDropdownData({ force: true })
    }

    function warmupCache() {
        console.log('🔥 Warming up cache...')

        // Try to load from localStorage first
        const loaded = loadFromLocalStorage()

        if (loaded && isCacheValid.value) {
            cacheStatus.value.isInitialized = true
            console.log('🔥 Cache warmed up from localStorage')
        } else {
            // Fetch in background
            fetchDropdownData({ silent: true }).catch(error => {
                console.warn('Cache warmup failed:', error.message)
            })
        }
    }

    // ===== INITIALIZATION =====
    function initializeCache() {
        console.log('🚀 Initializing cache store...')

        // Load from localStorage if available
        warmupCache()

        // Set up auto-refresh for stale data
        setInterval(() => {
            if (!isCacheValid.value && hasData.value) {
                console.log('🕐 Auto-refreshing stale cache')
                fetchDropdownData({ silent: true }).catch(() => {
                    // Silent fail for background refresh
                })
            }
        }, 60000) // Check every minute
    }

    // ===== WATCHERS =====
    watch(() => cacheStatus.value.error, (newError) => {
        if (newError) {
            console.error('💥 Cache error detected:', newError)
        }
    })

    // ===== PUBLIC API =====
    return {
        // State
        dropdownData,
        cacheStatus: computed(() => cacheStatus.value),
        cacheConfig,

        // Computed
        isCacheValid,
        hasData,
        cacheHealth,

        // Data getters
        getCariler,
        getUrunler,
        getTeslimatTurleri,
        getOdemeSekilleri,
        getAliciTipleri,

        // Main functions
        fetchDropdownData,

        // Utility functions
        findItemById,
        findItemByCode,
        searchItems,

        // Cache management
        invalidateCache,
        clearCache,
        refreshCache,
        warmupCache,
        initializeCache
    }
})

// Auto-initialize when store is first created
let initialized = false
export function useCacheStoreWithInit() {
    const store = useCacheStore()

    if (!initialized) {
        store.initializeCache()
        initialized = true
    }

    return store
}