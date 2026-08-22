import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path matches the GitHub Pages project-site URL: https://<user>.github.io/anvil/
// Override for other hosts with the VITE_BASE env var (e.g. VITE_BASE=/ for a custom domain).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/anvil/',
})
