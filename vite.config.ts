import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import vitePluginSvgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vitePluginSvgr(), react(), tailwindcss()],
  server: {
    proxy: {
      "/api/core": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/core/, ""),
      },
    },
  },
});
