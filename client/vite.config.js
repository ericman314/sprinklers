import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8083,
    proxy: {
      '/api': 'http://localhost:8084',
      '/socket.io': {
        target: 'ws://localhost:8084',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
