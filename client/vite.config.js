import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Local: run `npx wrangler dev` (default 8787) or legacy Express on 3001
      '/api': process.env.VITE_API_PROXY || 'http://localhost:8787',
      '/uploads': process.env.VITE_API_PROXY || 'http://localhost:8787'
    }
  }
});
