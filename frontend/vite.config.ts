import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/php_backend': {
        target: 'http://localhost', // 你可以根据实际 PHP 环境修改
        changeOrigin: true,
      },
      '/static/favicons': {
        target: 'http://localhost',
        changeOrigin: true,
      },
      '/static/images': {
        target: 'http://localhost',
        changeOrigin: true,
      }
    }
  }
})