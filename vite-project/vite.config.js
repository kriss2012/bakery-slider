import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // GitHub Pages: set VITE_BASE_URL=/bakery-slider/ in .env.production
    // Leave empty (or '/') for Netlify/Vercel/custom domain
    base: env.VITE_BASE_URL || '/',
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      port: 5173,
      proxy: {
        // In development all /api/* calls are forwarded to the Spring Boot backend
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        // WebSocket proxy for DB Monitor
        '/ws': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})


