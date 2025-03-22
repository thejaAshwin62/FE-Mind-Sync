import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/v1": {
        target: "https://emb-service.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});
