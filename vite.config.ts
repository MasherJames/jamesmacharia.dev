import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const projectRoot = import.meta.dirname;

export default defineConfig({
  root: resolve(projectRoot, 'pages/home'),
  publicDir: resolve(projectRoot, 'assets'),
  resolve: {
    alias: {
      '@components': resolve(projectRoot, 'components'),
    },
  },
  build: {
    outDir: resolve(projectRoot, 'dist'),
    emptyOutDir: true,
  },
});
