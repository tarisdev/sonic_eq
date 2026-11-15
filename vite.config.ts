import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// One Vite build produces the whole extension:
//  - popup/options/offscreen HTML entries (ESM module scripts)
//  - background service worker as an ESM module entry ("type": "module" in MV3)
// No declarative content script: whole-tab capture (tabCapture) needs no host
// access. The only injection is the fullscreen watcher, programmatic via
// activeTab (see service worker), so the manifest stays free of host permissions.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: resolve(import.meta.dirname, 'popup.html'),
        options: resolve(import.meta.dirname, 'options.html'),
        offscreen: resolve(import.meta.dirname, 'offscreen.html'),
        'background/service-worker': resolve(import.meta.dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'background/service-worker'
            ? 'background/service-worker.js'
            : 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
