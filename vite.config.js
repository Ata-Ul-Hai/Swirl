import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
  ],
  test: {
    globals: true,         // <-- Mimics Jest's global variables
    environment: 'jsdom',  // <-- Simulates a browser environment
    setupFiles: './__tests__/setup.js', // <-- Links custom matchers
  },
})
