import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure large files (xlsx, images) aren't inlined
  build: {
    assetsInlineLimit: 0,
  },
  // xlsx uses Node built-ins in some paths; alias the browser entry
  resolve: {
    alias: {
      './cjs/workbook': 'xlsx/dist/xlsx.full.min.js',
    },
  },
  optimizeDeps: {
    include: ['xlsx'],
  },
});
