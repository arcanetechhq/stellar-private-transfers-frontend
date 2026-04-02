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
    },
  },
  optimizeDeps: {
    include: ["buffer", "@auditable/stellar-audit", "contract"],
  },
  assetsInclude: ["**/*.svg", "**/*.csv", "**/*.wasm", "**/*.zkey"],
  build: {
    assetsInlineLimit: 0,
  },
});
