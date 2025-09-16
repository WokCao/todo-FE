import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})