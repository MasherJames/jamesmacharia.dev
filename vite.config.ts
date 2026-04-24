import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

const projectRoot = import.meta.dirname;

const pageRoutes: Record<string, string> = {
  '/about': '/pages/about/index.html',
  '/contact': '/pages/contact/index.html',
  '/services': '/pages/services/index.html',
  '/writing': '/pages/writing/index.html',
  '/writing/web-components-in-2026': '/pages/writing/web-components-in-2026/index.html',
};

/*
 * Vite plugin to rewrite page routes to their corresponding HTML files.
 */
const pageRewritePlugin = (): Plugin => {
  return {
    name: 'page-rewrite',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();
        const path = req.url.split('?')[0].replace(/\/$/, '') || '/';
        if (pageRoutes[path]) {
          req.url = pageRoutes[path];
        }
        next();
      });
    },
  };
};

export default defineConfig({
  root: projectRoot,
  publicDir: resolve(projectRoot, 'assets'),
  plugins: [pageRewritePlugin()],
  resolve: {
    alias: {
      '@components': resolve(projectRoot, 'components'),
      '@assets': resolve(projectRoot, 'assets'),
      '@pages': resolve(projectRoot, 'pages'),
    },
  },
  build: {
    outDir: resolve(projectRoot, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(projectRoot, 'index.html'),
        about: resolve(projectRoot, 'pages/about/index.html'),
        contact: resolve(projectRoot, 'pages/contact/index.html'),
        services: resolve(projectRoot, 'pages/services/index.html'),
        writing: resolve(projectRoot, 'pages/writing/index.html'),
        webComponents2026: resolve(projectRoot, 'pages/writing/web-components-in-2026/index.html'),
      },
    },
  },
});
