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
| Global client state | **Redux Toolkit** (`@reduxjs/toolkit`), **react-redux** — store and typed hooks in `src/store/`, contact slice in `entities/contact/`                                                                                                                                                      |
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
| [`src/store/store.ts`](src/store/store.ts)                                   | `configureStore` with reducer key **`contact`**. Optional `preloadedState.contact` from `loadContactState()` (localStorage). `store.subscribe` calls `saveContactState` on the `contact` branch after updates. |
| [`src/store/hooks.ts`](src/store/hooks.ts)                                     | Typed **`useAppDispatch`** and **`useAppSelector`**.                                                                                                                                                           |
| [`src/store/redux-hooks.d.ts`](src/store/redux-hooks.d.ts)                     | Type alias **`UseAppSelector`** (`TypedUseSelectorHook<RootState>`). Import from `@/store` or `@/store/redux-hooks`.                                                                                             |
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

## Learned Workspace Facts

- Local Node version is pinned in **`.nvmrc`** at the repo root; use it when switching versions for commands in this project.
- **`index.html`** uses the product title **Arcane private payments** (not generic Stellar wording).
- For privacy-pool prove transaction inputs, `tokenAddress` should come from the asset API field `clientContract` (not from a token symbol/code field).
- Contacts store `stellarAddress` (validated Stellar G-address); transfers resolve recipients via on-chain registry lookup.
- Soroban bindings: pool client in `generated/contract`, registry client in `generated/registry` (`registry-contract` package alias).
- Required contract env vars: `VITE_POOL_CONTRACT`, `VITE_PRIVATE_ADDRESS_REGISTRY_CONTRACT`.
- ZK audit env: `VITE_APPLICATION_ID` and `VITE_STELLAR_AUDIT_PUBLIC_KEY` (128-char lowercase `X`+`Y` hex from audit-backend app create); resolved in `build-transaction-audit-parameters.ts` via `@auditable/privacy-pool-zk-sdk` `resolveTransactionAuditParams`.
- Local `@auditable/privacy-pool-zk-sdk`: `cd soroban-privacy-pools/client-sdk && npm run build && npm link`, then `cd stellar-payment-client-v2 && npm link @auditable/privacy-pool-zk-sdk` (re-run link after `npm install` in the client).
- Never generate ptau or Groth16 zkey in automation; use artifacts from `soroban-privacy-pools` (`client-sdk/assets`, user-maintained).
- Pending claims UI uses `entities/pending-claims` RTK Query against backend `/api/pending-claims`.
- `WalletPrivateAddressProvider` centralizes registry status, wallet `stpl1`/scalar, and `actionsEnabled`; unregistered-recipient transfers use temporary recipient scalar + pool `transact(..., onboarding)` with `senderPrivKeyScalarHex` from `ensureWalletScalar()`.
- Registry/SDK serialization: `get_private_address` simulate may return void/null, `{ tag: "None" }`, `{ tag: "Some", values: [record] }`, or a direct record; SDK `Option<T>` is `T | undefined`, contract UDT void unions use `{ tag: "None" }` without `values`.
