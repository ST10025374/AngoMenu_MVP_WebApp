import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://localhost:7210', // since you're running backend on 7210
                changeOrigin: true,
                secure: false, // dev cert
            },
        },
    },
})