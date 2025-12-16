import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        // Code splitting otimizado
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks separados
                    'react-vendor': ['react', 'react-dom'],
                    'inertia': ['@inertiajs/react'],
                    'ui-vendor': ['lucide-react', 'emoji-picker-react'],
                    'chart-vendor': ['recharts'],
                    'flow-vendor': ['@xyflow/react'],
                },
            },
        },
        // Chunks menores para melhor cache
        chunkSizeWarningLimit: 500,
        // Minificação agressiva
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.logs em produção
                drop_debugger: true,
            },
        },
    },
    server: {
        hmr: {
            host: 'localhost',
        },
        cors: {
            origin: '*',
            credentials: true,
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        },
    },
});
