import { defineConfig, loadEnv, type Plugin } from "vite";
import path from "node:path";
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { vendorZkArtifacts } from "./scripts/vendor-zk-artifacts.mjs";

const projectRoot = path.resolve(__dirname);

function vendorZkArtifactsPlugin(env: Record<string, string>): Plugin {
  return {
    name: "vendor-zk-artifacts",
    async buildStart() {
      await vendorZkArtifacts({ projectRoot, env });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");
  return {
    plugins: [react(), tailwindcss(), vendorZkArtifactsPlugin(env)],
    define: {
      global: "globalThis",
    },
    server: {
      fs: {
        allow: [projectRoot],
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
    assetsInclude: ["**/*.svg", "**/*.csv", "**/*.wasm", "**/*.zkey", "**/*.bin", "**/*.gz"],
    build: {
      assetsInlineLimit: 0,
    },
  };
});
