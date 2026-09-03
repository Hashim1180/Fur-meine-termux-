import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node20',
    ssr: true,
    rollupOptions: {
      external: [
        /^node:.*/,
        'mysql2',
        'sql-escaper',
        'buffer',
        'crypto',
        'stream',
        'util',
        'events',
        'net',
        'tls',
        'fs',
        'path',
        'express',
      ],
    },
  },
});
