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
                manualChunks: undefined
            }
        },
        // Production optimizasyonları
        minify: 'terser',
        sourcemap: false,
        // ogsiparis.com için optimize edilmiş build
        outDir: 'dist',
        assetsDir: 'assets'
    },
    // Environment variables
    define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false
    }
})
