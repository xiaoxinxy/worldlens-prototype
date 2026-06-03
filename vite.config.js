import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 650,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'three-vendor',
              test: /node_modules[\\/]three[\\/]/,
              priority: 2
            },
            {
              name: 'vue-vendor',
              test: /node_modules[\\/](vue|@vue|vue-router|pinia)[\\/]/,
              priority: 1
            }
          ]
        }
      }
    }
  },
  server: {
    open: true
  }
})
