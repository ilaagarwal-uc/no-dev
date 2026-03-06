import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@data-service': path.resolve(__dirname, './src/data-service'),
      '@page-service': path.resolve(__dirname, './src/page-service'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@validators': path.resolve(__dirname, './src/validators'),
      '@formatters': path.resolve(__dirname, './src/formatters'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@errors': path.resolve(__dirname, './src/errors'),
      '@types': path.resolve(__dirname, './src/types'),
      '@styles': path.resolve(__dirname, './src/styles'),
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://wall-decor-visualizer-backend.onrender.com'
          : 'http://localhost:3000',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production'
        ? 'https://wall-decor-visualizer-backend.onrender.com'
        : 'http://localhost:3000'
    )
  }
})
