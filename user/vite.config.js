import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const userRoot = resolve(__dirname)
const sharedStyles = resolve(userRoot, '../shared/styles/variables.scss')

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '@', replacement: resolve(userRoot, 'src') },
      { find: '@shared', replacement: resolve(userRoot, '../shared') },
      { find: 'element-plus', replacement: resolve(userRoot, 'node_modules/element-plus') },
      { find: 'axios', replacement: resolve(userRoot, 'node_modules/axios') },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "${sharedStyles.replace(/\\/g, '/')}";`,
      },
    },
  },
  server: {
    port: 4000,
    proxy: {
      '/user': { target: 'http://localhost:8080', changeOrigin: true },
      '/admin': { target: 'http://localhost:8080', changeOrigin: true },
    },
    fs: { allow: ['..'] },
  },
})
