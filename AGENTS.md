# AGENTS.md — context for AI agents

Short overview of **stellar-payment-client-v2**: a React client for Stellar payment flows (wallets, transfers, history, settings).

## Stack and tooling

| Area                | Tools                                                                                                                                                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime             | Node.js **≥ 20.10**                                                                                                                                                                                                                                                  |
| Build               | **Vite** 6, `@vitejs/plugin-react`, `@tailwindcss/vite`                                                                                                                                                                                                              |
| Language            | **TypeScript** (strict, `moduleResolution: "bundler"`, ES2022)                                                                                                                                                                                                       |
| UI                  | **React** 18, **React Router** 7                                                                                                                                                                                                                                     |
| Styling             | **Tailwind CSS** 4, **shadcn/ui**-style primitives (**Radix UI**), **MUI** + **Emotion**, `class-variance-authority`, `tailwind-merge`                                                                                                                               |
| i18n                | **i18next**, **react-i18next** (`shared/config/locales/`)                                                                                                                                                                                                            |
| Blockchain / wallet | `@creit-tech/stellar-wallets-kit` (JSR)                                                                                                                                                                                                                              |
| Global client state | **Redux Toolkit** (`@reduxjs/toolkit`), **react-redux** — store and typed hooks in `src/store/`, contact slice in `entities/contact/`                                                                                                                                |
| Linting             | **ESLint** 9 (flat config: `eslint.config.ts`) — `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-sonarjs`, `eslint-plugin-unicorn`, `eslint-plugin-tailwindcss`, `eslint-plugin-better-max-params`, custom **no-comments** rule (`eslint/no-comments.js`) |
| Path alias          | `@/*` → `src/*`                                                                                                                                                                                                                                                      |

### Commands

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint on `src/**/*.{ts,tsx}`

JSR registry for scoped packages: see `.npmrc` (`@jsr:registry`).

## Code architecture

**Feature-Sliced Design (FSD)** layout. Layers in this repo include `app/`, `pages/`, `widgets/`, `shared/`, **`entities/`**, and **`features/`**. Import direction is top-down (`app` → `pages` → `widgets` → `features` → `entities` → `shared`); no cross-imports between sibling slices on the same layer. Export through a slice’s **`index.ts`** when present (do not deep-import internal segments from outside). `features` siblings should include the action in its name

### Redux store (`src/store/`)

| Piece                                                                          | Role                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/store/store.ts`](src/store/store.ts)                                     | `configureStore` with reducer key **`contact`**. Optional `preloadedState.contact` from `loadContactState()` (localStorage). `store.subscribe` calls `saveContactState` on the `contact` branch after updates. |
| [`src/store/hooks.ts`](src/store/hooks.ts)                                     | Typed **`useAppDispatch`** and **`useAppSelector`**.                                                                                                                                                           |
| [`src/store/redux-hooks.d.ts`](src/store/redux-hooks.d.ts)                     | Type alias **`UseAppSelector`** (`TypedUseSelectorHook<RootState>`). Import from `@/store` or `@/store/redux-hooks`.                                                                                           |
| [`src/app/providers/store-provider.tsx`](src/app/providers/store-provider.tsx) | Wraps the tree with **`Provider`** from `react-redux`. Composed in [`src/app/app.tsx`](src/app/app.tsx) (outside `I18nProvider`, inside is fine too if order changes).                                         |

**`RootState.contact`**: `{ items: Contact[] }` — list and `addContact` live in **`src/entities/contact/model/contact.ts`**. Persistence (read/write JSON, key `stellar-payment-contact-v1`) is in **`src/entities/contact/lib/persist-contact.ts`** and is only wired from `src/store/store.ts`, not from feature UI.

### Contact-related FSD slices (example)

| Layer / path                      | Contents                                                                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/entities/contact/`           | Domain type `Contact`, RTK slice + selectors (`selectContacts`, …), seed `INITIAL_CONTACTS`, persist helpers; public API via `index.ts`. |
| `src/features/add-contact/`       | Modal to add a contact (`AddContactModal`); dispatches `addContact`.                                                                     |
| `src/features/view-contact-list/` | Contact list, empty state, copy-address feedback.                                                                                        |
| `src/features/pick-contact/`      | Recipient picker modal for transfer / withdrawal; reads contacts from the store.                                                         |

Adding new global slices: register reducers in `store.ts`, extend `RootState`, and keep typed hooks in `hooks.ts` aligned with the new shape.

## Project skills (read the relevant one for the task)

Skills live under **`.agents/skills/<name>/SKILL.md`**. Before working in a given area, open the matching `SKILL.md` and follow it.

| Skill                                                                        | When to use                                                                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [**feature-sliced-design**](.agents/skills/feature-sliced-design/SKILL.md)   | FSD layers, import boundaries, `@x`, where to place features/API/state, structural migrations                                  |
| [**tailwind-v4-shadcn**](.agents/skills/tailwind-v4-shadcn/SKILL.md)         | Tailwind v4, theme/CSS variables, shadcn, dark mode, Vite integration, common v4 pitfalls                                      |
| [**i18n-localization**](.agents/skills/i18n-localization/SKILL.md)           | UI copy, translation keys, locales, RTL                                                                                        |
| [**react-state-management**](.agents/skills/react-state-management/SKILL.md) | Global/server state choices and patterns (Redux Toolkit, Zustand, Jotai, React Query) — reference when adding new state layers |

Extra material (`references/`, `templates/`) sits inside each skill folder.

## Agent guidelines

- Respect project **ESLint** rules (including function/file size limits, `better-max-params`, and the custom comment rule with TODO/FIXME/NOTE allowed). Use the ESLint MPC to perform the linting
- Keep diffs focused: change only what the task needs; match style of surrounding code.
- Do not add markdown documentation unless explicitly requested; this file is the exception as the agent convention.
- Strictly forbid `Reflect` usage (`Reflect.get`, `Reflect.has`, and related APIs); use direct property access and `Object.hasOwn` checks instead.

## Learned User Preferences

- When asked to fix lint or build issues without changing tooling, prefer edits in application code over changes to `eslint.config.ts` or other ESLint config.
- For new or expanded UI strings, add English entries under `src/shared/config/locales/`; add other languages only when the user explicitly asks.
- When implementing an attached Cursor plan, do not edit the plan file; follow existing todos without recreating them.
- In user-facing UI, show Stellar `G...` public addresses instead of private/`stpl1` addresses; private addresses stay internal for registry registration and ZK flows only.
- In client code, use private-address naming; do not retain `stealth` terminology or compatibility aliases.
- Global wallet registry/private-address state belongs in `WalletPrivateAddressProvider` (`app.tsx`); fetch registry status on connect/page load, not on wallet dropdown open.
- Home Send/Deposit/Withdraw stay disabled until registry status is `active`; show Register account CTA while `checking` or `unregistered`.
- Transaction flows must reuse wallet private address and scalar from the provider (`ensureWalletPrivateAddress` / `ensureWalletScalar`), not regenerate or re-sign unnecessarily.
- Do not use `VITE_NOTE_AUDIT_PUBLIC_KEY_X` / `VITE_NOTE_AUDIT_PUBLIC_KEY_Y`; use single `VITE_STELLAR_AUDIT_PUBLIC_KEY` for ZK audit public key.
- Do not read `state.privacySdkState` or whole SDK state branches directly in features/entities; use `@arcanetech/privacy-sdk-stellar` read API methods or `shared/lib/privacy-sdk` point reads only.
- Do not call `privacySdkState.bridge`, `bridge.init`, `stellarStateDefinitions`, or bridge-writer helpers in app code; SDK state writes go through public `StellarPrivacyClient` methods (for example `saveWalletPrivateAddressRecord`, `saveWalletPrivateAddressScalar`) via `getPrivacySdkClientOrThrow()`.
- When integrating SDK work into `new-design`, preserve new-design UI/layout and multi-step flows; wire transactions and state through `@arcanetech/privacy-sdk-stellar` without restoring pre-redesign pages or legacy `shared/lib/privacy-pool` modules.

## Learned Workspace Facts

- Local Node version is pinned in **`.nvmrc`** at the repo root (use it when switching versions); **`index.html`** uses the product title **Arcane private payments** (not generic Stellar wording).
- For privacy-pool prove transaction inputs, `tokenAddress` should come from the asset API field `clientContract` (not from a token symbol/code field).
- Contacts store `stellarAddress` (validated Stellar G-address); transfers resolve recipients via on-chain registry lookup.
- `@arcanetech/privacy-sdk-stellar` owns generated pool/registry bindings and Soroban RPC; payment client passes only network, wallet, state, assets, policy, and `transactEnvironment.signTransaction` — no local `generated/contract`, `registry-contract`, `@stellar/stellar-sdk/rpc`, or contract client factories.
- Required contract and audit env vars: `VITE_POOL_CONTRACT`, `VITE_PRIVATE_ADDRESS_REGISTRY_CONTRACT`, `VITE_APPLICATION_ID`, `VITE_STELLAR_AUDIT_PUBLIC_KEY` (128-char lowercase `X`+`Y` hex from audit-backend app create); audit parameters are resolved inside `@arcanetech/privacy-sdk-stellar`, not in app-local helpers. `VITE_ZK_CONFIG_NONCE` selects the pool's registered ZK config (`zkConfigNonce` on `StellarTransactEnvironment`). Vite vendors graph/r1cs/proving-key into `public/zk-artifacts` (gitignored) from the zk-sdk GitHub release, with a sibling `circuits/output` fallback; the app always passes `zkArtifactBaseUrl` defaulting to `/zk-artifacts`. Set `VITE_ZK_ARTIFACT_BASE_URL` only to override that origin. Production binding circuit is nonce `3` (2×2, 35 public signals) or nonce `7` (6×6, 79 public signals); nonce `0` is the retired 93-signal layout and nonce `2` is the retired in-circuit-MiMC 95-signal layout.
- Local linked packages: `@arcanetech/stellar-privacy-pool-zk-sdk` from `soroban-privacy-pools/client-sdk`; `@arcanetech/privacy-sdk-{core,state-redux,state-memory,stellar}` from `privacy-layer-sdk` (build each package, `npm link`, then link into the payment client; re-run after `npm install`). When linking, `core` and `state-redux` must be globally linked before `stellar`, otherwise `npm link` for the stellar package tries to fetch the private `@arcanetech/privacy-sdk-core` from the public registry and fails. After scope or workspace package renames, run `npm install` to refresh `node_modules/@arcanetech/*` symlinks.
- Never generate or modify ptau. Consume Groth16 zkey/VK from `soroban-privacy-pools` (`client-sdk/assets`); zkey may be regenerated there from the existing ptau, not in this app.
- `new-design` has no dedicated pending-claims route; `entities/pending-claims` remains for SDK error i18n and future UI. App bootstraps via `PrivacySdkProvider` (replaces legacy `MerkleTreeSyncProvider`); Redux `privacySdkState` uses sync/persist middleware with no separate `privateAddress` reducer—private-address selectors read the SDK state branch.
- `WalletPrivateAddressProvider` centralizes registry status, wallet `stpl1`/scalar, and `actionsEnabled`; unregistered-recipient transfers use temporary recipient scalar + pool `transact(..., onboarding)` with `senderPrivKeyScalarHex` from `ensureWalletScalar()`.
- Registry/SDK serialization: `get_private_address` simulate may return void/null, `{ tag: "None" }`, `{ tag: "Some", values: [record] }`, or a direct record; SDK `Option<T>` is `T | undefined`, contract UDT void unions use `{ tag: "None" }` without `values`.
- KYT inspect rejections surface in Sonner toasts via `KytInspectError` and localized strings in `shared/config/locales/kyt.json` from `requestKytPassageForPoolInteraction`.
- SDK operation wrappers must read the tx hash from `receipt.operationId` after `execute()`, not the whole receipt object (deposit/claim/transfer already do this); passing the raw receipt into `state.txId`/success-screen navigation breaks `.trim()`-style string handling downstream.
- After SDK transfer/withdraw execute, post every deliverable `outputRecords` entry (target and change notes with `privateAddress`, `coinNote`, `commitmentHex`, and `depositScalarHex`) via `postOutputRecordDeliveries`; deposits post the deposited note through `postDepositDelivery`.
