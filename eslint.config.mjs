import js from "@eslint/js";
import noComments from "./eslint/no-comments.js";
import betterMaxParams from "eslint-plugin-better-max-params";
import { configs as sonarjsConfigs } from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import tailwindcss from "eslint-plugin-tailwindcss";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import path from "node:path";

export default defineConfig([
  sonarjsConfigs.recommended,
  unicorn.configs["recommended"],
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    ignores: [
      "dist/**",
      "generated/**",
      "tailwind.config.ts",
      "postcss.config.mjs",
      "vite.config.ts",
      "src/vite-env.d.ts",
      "eslint.config.ts",
      "eslint/**",
      ".cursor/**",
    ],
    plugins: {
      js,
    },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  ...tailwindcss.configs["flat/recommended"],
  {
    plugins: {
      "no-comments": noComments,
      "better-max-params": betterMaxParams,
    },
    settings: {
      react: { version: "18.3.1" },
    },
    rules: {
      "no-comments/disallowComments": [
        "error",
        { allow: ["TODO", "FIXME", "NOTE"] },
      ],
      "better-max-params/better-max-params": [
        "error",
        {
          constructor: 10,
          func: 2,
        },
      ],
      "unicorn/prefer-node-protocol": "off",
      "max-lines-per-function": ["error", { max: 80, skipBlankLines: true }],
      "max-lines": ["error", { max: 250, skipBlankLines: true }],
      "no-magic-numbers": [
        "error",
        {
          detectObjects: false,
          enforceConst: true,
          ignore: [0, 1, -1, 2],
          ignoreArrayIndexes: true,
        },
      ],
      complexity: ["error", 10],
      "max-depth": ["error", 4],
      "max-statements": ["error", 20],
      "id-length": ["error", { min: 2 }],
      eqeqeq: ["error", "always"],
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    settings: {
      tailwindcss: {
        config: path.join(process.cwd(), "./tailwind.config.ts"),
      },
    },
  },
]);
