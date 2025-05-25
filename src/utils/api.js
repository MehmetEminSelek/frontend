// utils/api.js
// Merkezi API Konfigürasyonu

// Environment'a göre API base URL'ini belirle
const getApiBaseUrl = () => {
    // Production build'de environment variable'ı kullan
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    // Development ortamında localhost kullan
    if (import.meta.env.DEV) {
        return 'http://localhost:3000/api';
    }

    // Fallback: relative path (production'da nginx proxy ile çalışır)
    return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// API helper fonksiyonları
export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
};

// Axios instance (mevcut axios kullanımları için)
import axios from 'axios';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - token ekleme
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default {
    API_BASE_URL,
    apiCall,
    apiClient
}; 