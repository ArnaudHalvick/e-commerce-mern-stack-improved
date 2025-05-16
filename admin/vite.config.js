import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, ".");

  // Normalize the base path - when using subdomain, base path should be '/'
  let basePath = env.VITE_BASE_PATH || "/";
  if (!basePath.endsWith("/") && basePath !== "/") {
    basePath += "/";
  }

  // Get current directory using import.meta.url (ESM-compatible alternative to __dirname)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Proxy target for development
  const proxyTarget = env.VITE_API_URL || "http://localhost:4001";

  // Create config based on mode
  const config = {
    plugins: [react()],
    // Set base path for all assets and import.meta.env.BASE_URL
    base: basePath,
    build: {
      outDir: "dist",
      assetsDir: "assets",
      // Ensure assets get proper URLs
      assetsInlineLimit: 4096,
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
  };

  // Only add development server config in development mode
  if (mode === "development") {
    config.server = {
      port: parseInt(env.VITE_DEV_SERVER_PORT || "5173", 10),
      host: "0.0.0.0",
      // Proxy API requests in development
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        "/images": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    };
  }

  return config;
});
