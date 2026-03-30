import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: '0.0.0.0', // 允许局域网访问
    port: 5173,
    allowedHosts: ['smart-onboarding-frontend.loca.lt'] // 允许 localtunnel 穿透访问
  }
})
