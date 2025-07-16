    /// <reference types="vitest" />
    /// <reference types="vite/client" />

    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';

    export default defineConfig({
      plugins: [react()],
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'], // Optional: Create this file for global test setup
      },
    });