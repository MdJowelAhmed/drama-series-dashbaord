import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Split heavy/third-party code into separate cacheable chunks so the
    // initial JS payload stays small and vendor code is cached across deploys.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'chart-vendor': ['recharts'],
          'editor-vendor': ['react-quill'],
          'export-vendor': ['jspdf', 'xlsx'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // host: "72.62.164.122",
    host: "10.10.26.183",
    // port: 3000,
  },
});
