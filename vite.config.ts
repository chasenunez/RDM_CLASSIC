import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Served from https://chasenunez.github.io/RDM_CLASSIC/ on GitHub Pages.
  // `asset()` (src/lib/asset.ts) prefixes runtime asset URLs with this base.
  // The dev server then also serves under /RDM_CLASSIC/ — that's expected.
  base: '/RDM_CLASSIC/',
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
