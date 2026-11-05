import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`       -> production app for Netlify: /js, /css, /images folders
// `npm run build:demo`  -> one self-contained HTML file: the seeded, no-backend demo
const NOTICE = '/*! OKUNAMI - Copyright (c) Finesse Media LLC. All rights reserved. Proprietary and confidential. Copying, reverse engineering, scraping or use for AI training is prohibited. */';

/** Stamps the copyright notice on every script and stylesheet after minifying (the minifier would strip it otherwise). */
const notice = (): Plugin => ({
  name: 'okunami-notice',
  apply: 'build',
  enforce: 'post',
  generateBundle(_o, bundle) {
    for (const f of Object.values(bundle)) {
      if (f.type === 'chunk') f.code = `${NOTICE}\n${f.code}`;
      else if (f.fileName.endsWith('.css') && typeof f.source === 'string') f.source = `${NOTICE}\n${f.source}`;
    }
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'demo' ? [viteSingleFile()] : [notice()])],
  // Production hardening: no debug logging or debugger statements, no third-party comment blocks, no source maps.
  esbuild: mode === 'production' ? { drop: ['debugger'], pure: ['console.log', 'console.debug', 'console.info'], legalComments: 'none' } : undefined,
  build: mode === 'demo'
    ? { outDir: 'dist-demo', assetsInlineLimit: 100_000_000, cssCodeSplit: false }
    : {
        outDir: 'dist',
        sourcemap: false, // never publish the readable source
        assetsInlineLimit: 0, // never inline images as base64
        rollupOptions: {
          output: {
            entryFileNames: 'js/[name]-[hash].js',
            chunkFileNames: 'js/[name]-[hash].js',
            assetFileNames: (a) => {
              const n = a.names?.[0] ?? a.name ?? '';
              if (/\.css$/i.test(n)) return 'css/[name]-[hash][extname]';
              if (/\.(woff2?|ttf|otf)$/i.test(n)) return 'fonts/[name]-[hash][extname]';
              return 'images/[name]-[hash][extname]';
            },
          },
        },
      },
}));
