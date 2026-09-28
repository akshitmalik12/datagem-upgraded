import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'stream', 'util', 'assert'],
      globals: {
        Buffer: true,
      },
    }),
  ],
  server: {
    port: 5188,
    strictPort: true,
    host: true,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'react-hot-toast'],
          charts: ['plotly.js', 'react-plotly.js', 'recharts', 'd3-shape'],
          data: ['papaparse', 'apache-arrow', '@duckdb/duckdb-wasm']
        }
      }
    }
  }
})
