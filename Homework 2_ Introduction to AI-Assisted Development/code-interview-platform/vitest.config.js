import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                '.next/',
                'vitest.config.js',
                'vitest.setup.js',
                'next.config.js'
            ]
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
            '@/components': path.resolve(__dirname, './components'),
            '@/lib': path.resolve(__dirname, './lib'),
            '@/app': path.resolve(__dirname, './app')
        }
    }
});
