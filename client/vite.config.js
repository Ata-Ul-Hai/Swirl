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
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,         // <-- Mimics Jest's global variables
    environment: 'jsdom',  // <-- Simulates a browser environment
    setupFiles: './__tests__/setup.js', // <-- Links custom matchers
  },
})
