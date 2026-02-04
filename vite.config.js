import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Enable history API fallback for client-side routing
    historyApiFallback: true
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    // Ensure proper handling of assets for SPA
    assetsDir: 'static'
  },
  // Configure preview server for production testing
  preview: {
    port: 3000,
    open: true,
    // Enable history API fallback for production preview
    historyApiFallback: true
  },
  define: {
    // Replace process.env with import.meta.env for Vite
    global: 'globalThis',
  },
  // Handle environment variables
  envPrefix: ['VITE_', 'REACT_APP_'],
  // Ensure .jsx files are handled properly
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  }
})