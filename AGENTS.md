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
| Global client state | **Redux Toolkit** (`@reduxjs/toolkit`), **react-redux** — store in `app/`, contact slice in `entities/contact/`                                                                                                                                                      |
| Linting             | **ESLint** 9 (flat config: `eslint.config.ts`) — `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-sonarjs`, `eslint-plugin-unicorn`, `eslint-plugin-tailwindcss`, `eslint-plugin-better-max-params`, custom **no-comments** rule (`eslint/no-comments.js`) |
| Path alias          | `@/*` → `src/*`                                                                                                                                                                                                                                                      |

### Commands

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint on `src/**/*.{ts,tsx}`

JSR registry for scoped packages: see `.npmrc` (`@jsr:registry`).

## Code architecture

**Feature-Sliced Design (FSD)** layout. Layers in this repo include `app/`, `pages/`, `widgets/`, `shared/`, **`entities/`**, and **`features/`**. Import direction is top-down (`app` → `pages` → `widgets` → `features` → `entities` → `shared`); no cross-imports between sibling slices on the same layer. Export through a slice’s **`index.ts`** when present (do not deep-import internal segments from outside). `features` siblings should include the action in its name

### Redux store (`app/`)

| Piece                                                                          | Role                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/app/store.ts`](src/app/store.ts)                                         | `configureStore` with reducer key **`contact`**. Optional `preloadedState.contact` from `loadContactState()` (localStorage). `store.subscribe` calls `saveContactState` on the `contact` branch after updates. |
| [`src/app/hooks.ts`](src/app/hooks.ts)                                         | Typed **`useAppDispatch`** and **`useAppSelector`** (`RootState`, `AppDispatch` exported from `store.ts`).                                                                                                     |
| [`src/app/providers/store-provider.tsx`](src/app/providers/store-provider.tsx) | Wraps the tree with **`Provider`** from `react-redux`. Composed in [`src/app/app.tsx`](src/app/app.tsx) (outside `I18nProvider`, inside is fine too if order changes).                                         |

**`RootState.contact`**: `{ items: Contact[] }` — list and `addContact` live in **`src/entities/contact/model/contact.ts`**. Persistence (read/write JSON, key `stellar-payment-contact-v1`) is in **`src/entities/contact/lib/persist-contact.ts`** and is only wired from `store.ts`, not from feature UI.

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
