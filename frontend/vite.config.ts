import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    base: '/',
    plugins: [
        nodePolyfills({
            globals: {
                Buffer: true,
                global: true,
                process: true
            },
            overrides: {
                crypto: 'crypto-browserify'
            }
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            global: 'global',
            undici: resolve(__dirname, 'node_modules/opnet/src/fetch/fetch-browser.js')
        },
        mainFields: ['module', 'main', 'browser'],
        dedupe: ['@noble/curves', '@noble/hashes', '@scure/base', 'buffer', 'react', 'react-dom']
    },
    optimizeDeps: {
        exclude: ['crypto-browserify'],
    },
    build: {
        commonjsOptions: {
            strictRequires: true,
            transformMixedEsModules: true
        },
        rollupOptions: {
            external: [/^node:/],
            output: {
                manualChunks: {
                    'opnet-sdk': ['opnet', '@btc-vision/bitcoin', '@btc-vision/transaction'],
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                },
            },
        },
    },
});
