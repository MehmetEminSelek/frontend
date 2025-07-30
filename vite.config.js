import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    base: '/',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': {
                target: process.env.NODE_ENV === 'production'
                    ? 'https://ogsiparis.com'
                    : 'http://localhost:3000',
                changeOrigin: true,
                secure: process.env.NODE_ENV === 'production'
            }
        }
    },
    build: {
        rollupOptions: {
            output: {
                // Optimize chunk splitting for better caching
                manualChunks: {
                    'vue-vendor': ['vue', 'vue-router', 'pinia'],
                    'vuetify-vendor': ['vuetify'],
                    'ui-vendor': ['vue-toastification'],
                    'utils-vendor': ['axios', '@vueuse/core']
                },
                // Better file naming for production
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            }
        },
        // Production optimizasyonları
        minify: 'terser',
        sourcemap: false,
        // Bundle size uyarılarını ayarla
        chunkSizeWarningLimit: 1000,
        // ogsiparis.com için optimize edilmiş build
        outDir: 'dist',
        assetsDir: 'assets',
        // Asset inlining threshold
        assetsInlineLimit: 4096
    },
    // Environment variables
    define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    },
    // CSS optimization
    css: {
        devSourcemap: false
    }
})
