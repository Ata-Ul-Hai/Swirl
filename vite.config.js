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
      "/api/restaurants": {
        target: "https://www.swiggy.com",
        changeOrigin: true,
        rewrite: () =>
          "/dapi/restaurants/list/v5?lat=28.5488579&lng=77.2900505&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING",
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader(
              "User-Agent",
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            );
            proxyReq.setHeader("Origin", "https://www.swiggy.com");
            proxyReq.setHeader("Referer", "https://www.swiggy.com/");
          });
        },
      },
    },
  },
  test: {
    globals: true,         // <-- Mimics Jest's global variables
    environment: 'jsdom',  // <-- Simulates a browser environment
    setupFiles: './__tests__/setup.js', // <-- Links custom matchers
  },
})
