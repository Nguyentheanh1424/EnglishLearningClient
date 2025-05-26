import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Tùy chỉnh output để thêm hash vào tên file
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash][extname]`,
      },
    },
    // Tùy chọn minify để tối ưu hóa file
    minify: 'esbuild',
    // Đảm bảo các file được tạo trong thư mục dist
    outDir: 'dist',
    // Xóa thư mục dist trước khi build
    emptyOutDir: true,
  },
  server: {
    // Cấu hình cho môi trường phát triển
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  },
});