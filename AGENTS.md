# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js app using the App Router. Global styles live in `styles/globals.css` and are imported from `app/layout.js`. The main UI and business logic reside in the client component `app/page.js`, which uses React hooks to orchestrate key generation, localStorage persistence, and balance lookups. Keep helper utilities (e.g., formatting helpers, copy-to-clipboard logic, explorer metadata) co-located near the bottom of `app/page.js` and prefer extracting reusable JSX into colocated components before creating new directories. Chain logos are stored in `public/icons/`; add new assets there and reference them with absolute paths (e.g., `/icons/foo.svg`).

Blockchain SDKs are imported dynamically from npm packages (see `loadLibraries`); avoid mixing CDN builds alongside the bundled modules. Bitcoin support relies on `@bitcoinerlab/secp256k1` as the ECC backend—keep that dependency pinned unless you confirm compatibility. If you introduce new browser-only dependencies, update `next.config.mjs` with any additional polyfills they require.

Contributor communication within this repository should be in Japanese (issues, PRs, reviews), but all user-facing UI copy in the application must remain in English to support the global audience.

## Build, Test, and Development Commands
Install dependencies with `npm install`, run the dev server via `npm run dev`, and open `http://localhost:3000`. Production builds use `npm run build` followed by `npm run start`. To keep linting consistent with Next.js defaults, run `npm run lint` before submitting PRs. When debugging persistence, inspect `localStorage.getItem('multiChainPrivateKeys:v1')` in the browser console; no Node-based mocks are configured.

## Coding Style & Naming Conventions
Use React functional components with hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) and keep side effects confined to hooks. Stick to camelCase for functions and variables, and SCREAMING_SNAKE_CASE for constants like `STORAGE_KEY`. Maintain the two-space indentation established by Prettier; format touched files with `npx prettier --write` (or the editor equivalent). UI strings should be written in clear English; surface new display strings near related components for straightforward updates.

## Testing Guidelines
Automated tests are not yet configured. Focus on manual verification in modern Chromium-based browsers against the dev server. Validate the following flows: loading previously saved keys on refresh, the first-time key generation triggered by the button (with modal confirmation), status/timestamp messaging, copy-to-clipboard buttons for addresses/keys, and explorer links for both mainnet and testnet targets. After changes touching chain logic, document manual test steps and any chain-specific caveats in the PR.

## Commit & Pull Request Guidelines
Commits follow short, imperative subjects (例: "Add Next.js client app shell"). Keep subjects under ~72 characters and add explanatory bodies when context is non-trivial. Pull requests should include 1) a concise summary and motivation, 2) manual test evidence (steps, screenshots, or clips), 3) linked issues or follow-up tasks, and 4) notes on API rate limits or regression risks.

## Security & Configuration Tips
Never commit real private keys, mnemonics, or private RPC credentials. The app loads blockchain libraries from npm packages; pin versions in `package.json` and audit changes before upgrading. Keep the in-app warning that keys are for development/testing only, and ensure new features do not encourage production usage. Review new dependencies for browser compatibility before introducing them.
