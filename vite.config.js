import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig(({ mode }) => {
  const isHTTPS = mode === "https";
  const httpsOptions = {
    host: isHTTPS,
    https: isHTTPS
  };

  return {
    build: {
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("three")) {
              return "three";
            } else if (id.includes("node_modules")) {
              return "vendor";
            } else if (id.includes("common")) {
              return "common";
            }
          }
        }
      }
    },
    server: {
      ...httpsOptions,
      port: 5173
    },
    preview: {
      ...httpsOptions,
      open: true
    },
    plugins: isHTTPS ? [basicSsl()] : []
  };
});
