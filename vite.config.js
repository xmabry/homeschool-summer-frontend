import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: true
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