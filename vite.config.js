import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  build: {
    target: 'esnext' //browsers can handle the latest ES features
  },
  plugins: [react()],
})
