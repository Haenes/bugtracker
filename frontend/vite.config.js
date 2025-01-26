import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  define: {
    VITE_BACKEND_URL: JSON.stringify(process.env.VITE_BACKEND_URL),
  },
  html: {
    cspNonce: "CSP_NONCE",
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    watch: {
      usePolling: true
    }
  },
})
