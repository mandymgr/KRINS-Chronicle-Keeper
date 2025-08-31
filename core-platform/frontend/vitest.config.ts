/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        'vite.config.ts',
        'tailwind.config.js',
        'postcss.config.js'
      ]
    },
    // Separate test configurations for different test types
    testTimeout: 30000, // 30s timeout for integration tests
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  // Define server config for backend integration testing
  define: {
    __TEST_API_URL__: JSON.stringify('http://localhost:3003'),
    __WEBHOOK_URL__: JSON.stringify('http://localhost:3002'),
  },
});