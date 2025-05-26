export const API_BASE_URL = '/api'

export const apiCall = async (endpoint, options = {}) => {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Bir hata oluştu' }))
        throw new Error(error.message || 'Bir hata oluştu')
    }

    return response.json()
} 