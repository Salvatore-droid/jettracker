import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'https://jettracker.onrender.com', changeOrigin: true },
      '/ws': { target: 'ws://jettracker.onrender.com', ws: true, changeOrigin: true },
    }
  }
})
