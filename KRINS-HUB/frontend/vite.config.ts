import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: true
    })
  ],
  
  // Enhanced path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/contexts': path.resolve(__dirname, './src/contexts')
    }
  },

  // Development server optimization
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: false // Better UX during development
    },
    // Proxy for FastAPI backend
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // FastAPI backend port
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          // Rewrite /api/* to /api/v1/*
          return path.replace(/^\/api/, '/api/v1')
        }
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Build optimization
  build: {
    outDir: 'dist',
    sourcemap: true,
    
    // Optimize chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@tanstack/react-query'],
          utils: ['clsx', 'tailwind-merge']
        }
      }
    },
    
    // Target modern browsers
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000
  },

  // TypeScript optimization
  esbuild: {
    target: 'esnext',
    logOverride: {
      'this-is-undefined-in-esm': 'silent'
    },
    // Ignore source map warnings for third-party packages
    ignoreAnnotations: true
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react/jsx-runtime',
      'lucide-react',
      '@tanstack/react-query'
    ]
  }
})