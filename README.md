# Arcane private payments — frontend

React client for Stellar private payment flows. See [`AGENTS.md`](AGENTS.md) for architecture and conventions.

## Prerequisites

- **Node.js** as pinned in [`.nvmrc`](.nvmrc) (`v24.9.0`):

  ```bash
  nvm install && nvm use
  ```

- The JSR registry is preconfigured in [`.npmrc`](.npmrc) for `@creit-tech/stellar-wallets-kit` — no extra setup needed.

## Installing dependencies

```bash
npm install
```

The `@arcanetech/privacy-sdk-*` packages are published to the public npm registry and are installed automatically — no local build of the SDK is required.

> **Local SDK development (optional).** If you need to work against unpublished changes in the sibling `privacy-layer-confidential-sdk` repo, build it there (`npm install && npm run build`) and point the frontend at the local packages via `overrides` with `file:../privacy-layer-confidential-sdk/packages/<pkg>`. This is only needed for SDK development, not for regular app work.

## Running the code

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint on `src/**/*.{ts,tsx}`
- `npm run test` — Jest
