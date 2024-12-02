import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        projects: 'projects/index.html',
        team: 'team/index.html',
        inquiry: 'contact/index.html',
      },
    },
  },
})