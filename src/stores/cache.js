import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useCacheStore = defineStore('cache', () => {
    // Cache data
    const dropdownData = ref({
        cariler: [],
        urunler: [],
        kategoriler: [],
        teslimatTurleri: [],
        aliciTipleri: [],
        odemeYontemleri: [],
        subeler: [],
        tepsiTavalar: [],
        kutular: []
    })

    // Cache metadata
    const cacheTimestamps = ref({})
    const cacheStatus = ref({
        isLoading: false,
        lastUpdate: null,
        error: null
    })

    // Cache settings
    const CACHE_TTL = 5 * 60 * 1000 // 5 dakika (ms)
    const STORAGE_KEY = 'og_dropdown_cache'
    const STORAGE_TIMESTAMP_KEY = 'og_dropdown_cache_ts'

    // Cache validation
    const isCacheValid = computed(() => {
        const timestamp = cacheTimestamps.value.dropdown
        if (!timestamp) return false
        return (Date.now() - timestamp) < CACHE_TTL
    })

    const hasCachedData = computed(() => {
        return dropdownData.value.cariler?.length > 0
    })

    // Load from localStorage
    function loadFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            const storedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY)

            if (stored && storedTimestamp) {
                const parsedData = JSON.parse(stored)
                const timestamp = parseInt(storedTimestamp)

                // Check if still valid
                if ((Date.now() - timestamp) < CACHE_TTL) {
                    dropdownData.value = parsedData
                    cacheTimestamps.value.dropdown = timestamp
                    console.log('✅ Cache loaded from localStorage:', {
                        cariler: parsedData.cariler?.length || 0,
                        age: Math.round((Date.now() - timestamp) / 1000) + 's'
                    })
                    return true
                } else {
                    console.log('⏰ Cache expired, will fetch fresh data')
                    clearStorage()
                }
            }
        } catch (error) {
            console.error('❌ Error loading cache from storage:', error)
            clearStorage()
        }
        return false
    }

    // Save to localStorage
    function saveToStorage() {
        try {
            const timestamp = Date.now()
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dropdownData.value))
            localStorage.setItem(STORAGE_TIMESTAMP_KEY, timestamp.toString())
            cacheTimestamps.value.dropdown = timestamp
        } catch (error) {
            console.error('❌ Error saving cache to storage:', error)
        }
    }

    // Clear storage
    function clearStorage() {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(STORAGE_TIMESTAMP_KEY)
        delete cacheTimestamps.value.dropdown
    }

    // Fetch dropdown data
    async function fetchDropdownData(force = false) {
        // Check cache first
        if (!force && isCacheValid.value && hasCachedData.value) {
            console.log('🎯 Using cached dropdown data')
            return dropdownData.value
        }

        // Try localStorage if cache is empty
        if (!force && !hasCachedData.value && loadFromStorage()) {
            return dropdownData.value
        }

        console.log('🔄 Fetching fresh dropdown data...')
        cacheStatus.value.isLoading = true
        cacheStatus.value.error = null

        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dropdown`)

            if (data && typeof data === 'object') {
                dropdownData.value = {
                    cariler: data.cariler || [],
                    urunler: data.urunler || [],
                    kategoriler: data.kategoriler || [],
                    teslimatTurleri: data.teslimatTurleri || [],
                    aliciTipleri: data.aliciTipleri || [],
                    odemeYontemleri: data.odemeYontemleri || [],
                    subeler: data.subeler || [],
                    tepsiTavalar: data.tepsiTavalar || [],
                    kutular: data.kutular || []
                }

                cacheStatus.value.lastUpdate = new Date()
                saveToStorage()

                console.log('✅ Dropdown data cached:', {
                    cariler: data.cariler?.length || 0,
                    urunler: data.urunler?.length || 0,
                    categories: Object.keys(data).length
                })
            }

            return dropdownData.value
        } catch (error) {
            console.error('❌ Dropdown fetch error:', error)
            cacheStatus.value.error = error.message

            // Return cached data if available, even if expired
            if (hasCachedData.value) {
                console.log('⚠️ Using stale cache due to error')
                return dropdownData.value
            }
            throw error
        } finally {
            cacheStatus.value.isLoading = false
        }
    }

    // Add new cari to cache
    function addCariToCache(newCari) {
        if (!dropdownData.value.cariler) dropdownData.value.cariler = []

        // Add display name for consistency
        const cariWithDisplay = {
            ...newCari,
            displayName: `${newCari.ad} ${newCari.soyad || ''}`.trim()
        }

        dropdownData.value.cariler.push(cariWithDisplay)
        saveToStorage()

        console.log('✅ New cari added to cache:', cariWithDisplay.displayName)
    }

    // Update cari in cache
    function updateCariInCache(updatedCari) {
        const index = dropdownData.value.cariler.findIndex(c => c.id === updatedCari.id)
        if (index !== -1) {
            const cariWithDisplay = {
                ...updatedCari,
                displayName: `${updatedCari.ad} ${updatedCari.soyad || ''}`.trim()
            }
            dropdownData.value.cariler[index] = cariWithDisplay
            saveToStorage()
            console.log('✅ Cari updated in cache:', cariWithDisplay.displayName)
        }
    }

    // Invalidate specific cache
    function invalidateCache(type = 'all') {
        if (type === 'all') {
            clearStorage()
            console.log('🗑️ All cache invalidated')
        }
        // Future: specific cache invalidation
    }

    // Force refresh
    async function refreshCache() {
        console.log('🔄 Force refreshing cache...')
        return await fetchDropdownData(true)
    }

    // Cleanup expired cache on startup
    function cleanup() {
        loadFromStorage()
    }

    return {
        // State
        dropdownData,
        cacheStatus,

        // Getters
        isCacheValid,
        hasCachedData,

        // Actions
        fetchDropdownData,
        addCariToCache,
        updateCariInCache,
        invalidateCache,
        refreshCache,
        cleanup
    }
}) 