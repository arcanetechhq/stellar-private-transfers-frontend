import { defineConfig } from "vite";
import path from "node:path";
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: "globalThis",
  },
  resolve: {
    dedupe: ["buffer"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
      contract: path.resolve(__dirname, "./generated/contract/src/index.ts"),
      "registry-contract": path.resolve(__dirname, "./generated/registry/src/index.ts"),
      fs: path.resolve(__dirname, "./src/shims/node-fs.ts"),
      path: path.resolve(__dirname, "./src/shims/node-path.ts"),
      url: path.resolve(__dirname, "./src/shims/node-url.ts"),
    },
  },
  optimizeDeps: {
    include: ["buffer", "@auditable/stellar-audit", "contract", "registry-contract"],
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
