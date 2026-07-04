/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 6688,
  },
  test: {
    server: {
      deps: {
        // zslj-ts-lib 的 dist 为无扩展名 ESM 相对导入，Node 原生加载会失败，
        // 交给 vite 转换（浏览器构建本就走 vite resolver，无此问题）
        inline: ['zslj-ts-lib'],
      },
    },
  },
});
