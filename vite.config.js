import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['angelsandmummys-2.onrender.com'],
  },
  preview: {
    allowedHosts: ['angelsandmummys-2.onrender.com'],
  },
})
