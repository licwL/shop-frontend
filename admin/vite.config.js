import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const adminRoot = resolve(__dirname)
const sharedStyles = resolve(adminRoot, '../shared/styles/variables.scss')

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '@', replacement: resolve(adminRoot, 'src') },
      { find: '@shared', replacement: resolve(adminRoot, '../shared') },
      { find: 'element-plus', replacement: resolve(adminRoot, 'node_modules/element-plus') },
      { find: 'axios', replacement: resolve(adminRoot, 'node_modules/axios') },
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
    port: 3000,
    proxy: {
      '/admin': 'http://localhost:8080',
      '/user': 'http://localhost:8080',
      '/health': 'http://localhost:8080',
    },
    fs: {
      allow: ['..'],
    },
  },
})
