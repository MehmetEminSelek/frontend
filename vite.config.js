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
        proxy: {
            '/api': {
                target: 'https://ogsiparis.com',
                changeOrigin: true,
                secure: false
            }
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    }
})
