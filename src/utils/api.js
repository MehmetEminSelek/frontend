import axios from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Axios instance oluştur
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 saniye timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Token ekle
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Cache kontrolü için header ekle
        if (config.method === 'get') {
            config.headers['Cache-Control'] = 'max-age=300'; // 5 dakika cache
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Token expired kontrolü
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
            return Promise.reject(new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.'));
        }

        // Rate limit kontrolü
        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'] || 60;
            return Promise.reject(new Error(`Çok fazla istek gönderildi. ${retryAfter} saniye sonra tekrar deneyin.`));
        }

        // Network hatası
        if (!error.response) {
            return Promise.reject(new Error('Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.'));
        }

        return Promise.reject(error);
    }
);

// Cache sistemi
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

// Cache'den veri al
function getFromCache(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

// Cache'e veri kaydet
function setCache(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

// Cache temizle
function clearCache() {
    cache.clear();
}

// Belirli bir key'i cache'den sil
function removeFromCache(key) {
    cache.delete(key);
}

// API çağrı fonksiyonu (cache ile)
export async function apiCall(endpoint, options = {}) {
    const {
        method = 'GET',
        data = null,
        useCache = false,
        cacheKey = null,
        clearCacheOnSuccess = false
    } = options;

    // Cache key oluştur
    const key = cacheKey || `${method}-${endpoint}-${JSON.stringify(data)}`;

    // GET istekleri için cache kontrolü
    if (method === 'GET' && useCache) {
        const cachedData = getFromCache(key);
        if (cachedData) {
            return cachedData;
        }
    }

    try {
        const response = await api({
            method,
            url: endpoint,
            data,
            ...options
        });

        // Başarılı response'u cache'e kaydet
        if (method === 'GET' && useCache) {
            setCache(key, response.data);
        }

        // Cache temizleme
        if (clearCacheOnSuccess) {
            clearCache();
        }

        return response.data;
    } catch (error) {
        // Hata durumunda cache'den veri döndür (fallback)
        if (method === 'GET' && useCache) {
            const cachedData = getFromCache(key);
            if (cachedData) {
                console.warn('API hatası, cache\'den veri döndürülüyor:', error.message);
                return cachedData;
            }
        }
        throw error;
    }
}

// Lazy loading için pagination helper
export function createPaginationHelper(endpoint, pageSize = 20) {
    let currentPage = 1;
    let hasMore = true;
    let isLoading = false;
    let allData = [];

    return {
        async loadNextPage() {
            if (isLoading || !hasMore) return [];

            isLoading = true;
            try {
                const response = await apiCall(`${endpoint}?page=${currentPage}&limit=${pageSize}`, {
                    useCache: true,
                    cacheKey: `${endpoint}-page-${currentPage}`
                });

                const newData = response.data || response;
                allData = [...allData, ...newData];

                hasMore = newData.length === pageSize;
                currentPage++;

                return newData;
            } catch (error) {
                console.error('Pagination hatası:', error);
                return [];
            } finally {
                isLoading = false;
            }
        },

        reset() {
            currentPage = 1;
            hasMore = true;
            allData = [];
        },

        get allData() {
            return allData;
        },

        get hasMore() {
            return hasMore;
        },

        get isLoading() {
            return isLoading;
        }
    };
}

// Debounce fonksiyonu
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle fonksiyonu
export function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Retry mekanizması
export async function retryApiCall(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;

            // Sadece belirli hatalar için retry yap
            if (error.response?.status >= 500 || !error.response) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                continue;
            }
            throw error;
        }
    }
}

// Export cache functions
export { getFromCache, setCache, clearCache, removeFromCache };

// Export axios instance
export { api };

export default apiCall; 