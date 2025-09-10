import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Optimized Vite config for KRINS Chronicle Keeper
export default defineConfig({
  plugins: [react()],
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    tsconfigRaw: {
      compilerOptions: {
        skipLibCheck: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          auth: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          radix: ['@radix-ui/react-alert-dialog', '@radix-ui/react-checkbox', '@radix-ui/react-dialog'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    global: 'globalThis',
  },
  server: {
    host: true,
    port: 5173,
  },
})