import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Update this to match your GitHub repo name
export default defineConfig({
  base: '/Kevin-s-React-App-Tracker/',
  plugins: [react()],
});