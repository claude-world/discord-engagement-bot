import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: 'ui',
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'dist', // relative to root → ui/dist
    emptyOutDir: true,
  },
  server: {
    // Must match the origin allowed by src/api-server.ts
    port: 5174,
    strictPort: true,
  },
});
