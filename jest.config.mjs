import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset({
  tsconfig: {
    esModuleInterop: true,
    target: "ES2022",
    module: "ESNext",
    moduleResolution: "bundler",
    isolatedModules: true,
    strict: true,
  },
}).transform;

export default {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@/(.*)\\.js$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@arcanetech/privacy-sdk-relay$":
      "<rootDir>/node_modules/@arcanetech/privacy-sdk-relay/src/index.ts",
    "^@arcanetech/privacy-sdk-data-layer$":
      "<rootDir>/node_modules/@arcanetech/privacy-sdk-data-layer/src/index.ts",
    "^@arcanetech/privacy-sdk-core$":
      "<rootDir>/node_modules/@arcanetech/privacy-sdk-core/src/index.ts",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@arcanetech/privacy-sdk-relay|@arcanetech/privacy-sdk-data-layer|@arcanetech/privacy-sdk-core)/)",
  ],
};
