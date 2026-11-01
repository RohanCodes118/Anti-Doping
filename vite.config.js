
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(async ({ command }) => {
  const plugins = [
    react(),
    tailwindcss(),
  ]

  if (command === 'serve') {
    const { viteWebAuthnPlugin } = await import('./src/server/viteWebAuthnPlugin.js')
    const { viteGeminiPlugin } = await import('./src/server/viteGeminiPlugin.js')

    plugins.push(
      viteWebAuthnPlugin(),
      viteGeminiPlugin(),
    )
  }

  return { plugins }
})
