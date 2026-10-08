import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this app from https://<user>.github.io/calculator/,
  // so production builds need every asset URL prefixed with the repo name.
  base: command === 'build' ? '/calculator/' : '/',
  plugins: [react(), tailwindcss()],
}))
