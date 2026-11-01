import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteWebAuthnPlugin } from './src/server/viteWebAuthnPlugin.js'
import { viteGeminiPlugin } from './src/server/viteGeminiPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteWebAuthnPlugin(),
    viteGeminiPlugin(),
  ],
})

