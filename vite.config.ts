import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Mobile-first PWA: warn earlier so chunks stay lean for limited-data users.
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Split heavy vendors into separately-cached chunks so the Supabase
          // client (auth + postgrest) doesn't bloat the main app chunk.
          manualChunks(id: string) {
            if (id.includes('/@supabase/')) return 'supabase';
            if (id.includes('/node_modules/react') || id.includes('/react-dom/')) return 'react-vendor';
          },
        },
      },
    },
  };
});
