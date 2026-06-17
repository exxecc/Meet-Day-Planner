import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: process.cwd(),
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
  },
})
