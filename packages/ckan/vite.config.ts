import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
        }),
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'components',
            formats: ['es', 'umd'],
            fileName: (format) => `components.${format}.js`,
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'styled-components',
                '@portaljs/ckan-api-client-js',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM'
                },
            },
        },
    },
});
