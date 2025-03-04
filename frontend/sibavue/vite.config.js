import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'  // <-- importante

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // <-- define @ como la carpeta src
    },
  },
})
