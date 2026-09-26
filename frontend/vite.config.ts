import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// 本地开发时前端统一请求 /api，由 Vite 代理到后端 21104（容器内 3000）
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 20104,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: process.env.BACKEND_ORIGIN ?? "http://localhost:21104",
        changeOrigin: true
      }
    }
  }
});
