import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',  // Binds to all network interfaces
    port: 3000,        // You can change the port if necessary
    strictPort: true,  // Ensures the server fails if the port is already in use
    allowedHosts: ['token-mrv4.onrender.com'], // Add your allowed host
  },
});
