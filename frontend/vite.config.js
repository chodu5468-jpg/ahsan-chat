import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, the Vite server (5173) proxies API and socket calls to the
// Express server (5000) so you can run `npm run dev` in both folders.
// In production, Express serves the built files directly (same origin),
// so no proxy is needed there.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  }
});
