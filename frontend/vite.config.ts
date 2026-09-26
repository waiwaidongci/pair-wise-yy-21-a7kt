import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 20104,
    host: "0.0.0.0",
    proxy: {
      // 前端统一请求 /api，本地开发代理到后端 21104（与 docker 内 backend:3000 区分）
      "/api": {
        target: process.env.VITE_API_TARGET ?? "http://localhost:21104",
        changeOrigin: true
      }
    }
  }
});
