import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
    root: 'public',
    base: '/',
    build: {
        outDir: path.resolve(process.cwd(), 'public/dist'),
        emptyOutDir: true,
        manifest: true,
        sourcemap: false,
        cssCodeSplit: true,
        rollupOptions: {
            input: {
                app: path.resolve(process.cwd(), 'public/scripts/app-bundle-entry.js'),
            },
            output: {
                entryFileNames: 'app-[hash].js',
                chunkFileNames: 'chunks/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
                manualChunks: {
                    vendor: ['lodash', 'fuse.js', 'handlebars', 'showdown', 'moment', 'dompurify'],
                },
            },
        },
    },
});
