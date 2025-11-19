import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Cho phép truy cập từ network
    port: 5173,
    // HTTPS tạm thời disable vì backend chưa có SSL
    // Để test camera trên mobile, dùng Chrome flags hoặc setup ngrok
  },
})
