import whyIsNodeRunning from 'why-is-node-running'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    {
      name: 'diagnose-hanging-build',
      apply: 'build',
      closeBundle() {
        whyIsNodeRunning()
      },
    },
    react(),
  ],
})