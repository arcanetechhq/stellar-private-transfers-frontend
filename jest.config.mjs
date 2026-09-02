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
  },
  transformIgnorePatterns: ["/node_modules/(?!(@arcanetech/privacy-sdk-relay)/)"],
};
