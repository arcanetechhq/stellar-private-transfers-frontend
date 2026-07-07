import { defineConfig } from "vite";
import path from "node:path";
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const projectRoot = path.resolve(__dirname);
const privacyLayerSdkRoot = path.resolve(projectRoot, "../privacy-layer-sdk");
const sorobanPrivacyPoolsRoot = path.resolve(projectRoot, "../soroban-privacy-pools");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: "globalThis",
  },
  server: {
    fs: {
      allow: [projectRoot, privacyLayerSdkRoot, sorobanPrivacyPoolsRoot],
    },
  },
  resolve: {
    dedupe: ["buffer"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
      fs: path.resolve(__dirname, "./src/shims/node-fs.ts"),
      path: path.resolve(__dirname, "./src/shims/node-path.ts"),
      url: path.resolve(__dirname, "./src/shims/node-url.ts"),
    },
  },
  optimizeDeps: {
    include: ["buffer"],
    esbuildOptions: {
      alias: {
        fs: path.resolve(__dirname, "./src/shims/node-fs.ts"),
        path: path.resolve(__dirname, "./src/shims/node-path.ts"),
        url: path.resolve(__dirname, "./src/shims/node-url.ts"),
      },
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv", "**/*.wasm", "**/*.zkey"],
  build: {
    assetsInlineLimit: 0,
  },
});
