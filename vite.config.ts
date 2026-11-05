import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// GitHub Pages: хуудас https://<user>.github.io/<repo>/ дор ажиллана.
// Hash чиглүүлэлт ашигладаг тул харьцангуй base ('./') ямар ч repo нэр дээр ажиллана.
// Хэрэв тогтмол зам хэрэгтэй бол BASE_PATH=/translation-prototype/ гэж өгнө.
export default defineConfig({
  base: process.env.BASE_PATH ?? './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
