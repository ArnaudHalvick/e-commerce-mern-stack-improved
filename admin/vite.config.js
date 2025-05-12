import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on mode
  const env = loadEnv(mode, ".");

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
    base: env.VITE_BASE_PATH || "/admin/",
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  };
});
