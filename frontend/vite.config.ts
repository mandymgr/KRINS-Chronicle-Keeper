import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Simplified Vite config for Vercel deployment
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
        manualChunks: undefined,
      },
    },
  },
  define: {
    global: 'globalThis',
  },
})