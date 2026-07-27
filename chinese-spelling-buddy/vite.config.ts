import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the built app works whether it's served from
  // the domain root or a sub-path (e.g. a GitHub Pages project page).
  base: './',
  plugins: [react()],
})
