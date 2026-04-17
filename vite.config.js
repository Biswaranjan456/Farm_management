import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy API requests to your backend server
      '/api': 'http://localhost:5002', // Match the new port in server.js
    },
  },
  resolve: {
    // This helps prevent issues with duplicate React instances when using linked packages or certain libraries.
    dedupe: ['react', 'react-dom'],
  },
});