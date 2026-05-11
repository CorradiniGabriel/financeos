import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',  // funciona tanto local quanto GitHub Pages
  server: { port: 3000 }
})
