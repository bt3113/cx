import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

/**
 * Zat ships as a static bundle to GitHub Pages at https://bt3113.github.io/cx/,
 * so every URL is namespaced under /cx/. `base` and the router basename must
 * stay in agreement — see src/lib/routing/base.ts.
 */
export const BASE = '/cx/';

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'src') },
  },
  build: {
    // Built output lands at the repository root, which is what GitHub Pages
    // serves from. `emptyOutDir` must stay false: the root also holds `app/`
    // and the git metadata.
    outDir: '..',
    emptyOutDir: false,
    target: 'es2022',
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Keep the spatial world and the Studio out of the entry chunk; a
        // visitor landing on a profile should never pay for Studio code.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-router')) return 'router';
          if (id.includes('/motion') || id.includes('framer-motion')) return 'motion';
          if (id.includes('@dnd-kit')) return 'dnd';
          // ~2MB of avatar styles. Its own chunk, so a bundler decision
          // can never fold it back into the entry.
          if (id.includes('@dicebear')) return 'character';
          if (id.includes('react')) return 'react';
          return 'vendor';
        },
      },
    },
  },
});
