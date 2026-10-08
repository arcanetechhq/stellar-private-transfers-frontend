import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const projectRoot = path.resolve(__dirname);
const zkSdkPackage = "@arcanetech/stellar-privacy-pool-zk-sdk";

function resolveZkSdkAlias(): Record<string, string> {
  const topLevel = path.resolve(projectRoot, "node_modules", zkSdkPackage);
  if (fs.existsSync(topLevel)) {
    return {};
  }
  const fallbacks = [
    path.resolve(
      projectRoot,
      "node_modules/@arcanetech/privacy-sdk-stellar/node_modules",
      zkSdkPackage,
    ),
    path.resolve(
      projectRoot,
      "../privacy-layer-sdk/node_modules",
      zkSdkPackage,
    ),
  ];
  const fallback = fallbacks.find((candidate) => fs.existsSync(candidate));
  if (!fallback) {
    return {};
  }
  return { [zkSdkPackage]: fs.realpathSync(fallback) };
}

const zkSdkAlias = resolveZkSdkAlias();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: "globalThis",
  },
  server: {
    fs: {
      allow: [projectRoot, ...Object.values(zkSdkAlias)],
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
      ...zkSdkAlias,
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
  assetsInclude: [
    "**/*.svg",
    "**/*.csv",
    "**/*.wasm",
    "**/*.zkey",
    "**/*.bin",
    "**/*.gz",
  ],
  build: {
    assetsInlineLimit: 0,
  },
});
