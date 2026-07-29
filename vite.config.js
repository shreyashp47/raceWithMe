import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: '/raceWithMe/',
  build: {
    outDir: 'dist',
  },
})
