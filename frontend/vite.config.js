import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // ensure this is set to 'dist'
  },
  server: {
    proxy: {
      "/api/v1": {
        target: "https://upskillme-e2tz.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
