# Multi-chain Private Key Generator

A Next.js application for generating developer sandbox keys and addresses for five networks: EVM (Ethereum), Solana, Bitcoin, Sui, and TON. All generated credentials remain on the client and are persisted in the browser’s `localStorage`.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to use the app. Run through an HTTP(S) server so the browser can reach the public RPC endpoints.

## Features

- Loads previously saved keys on revisit; click "Generate New Keys" to create a fresh multi-chain bundle.
- "Generate New Keys" regenerates every key only after modal confirmation.
- Private keys and addresses are displayed immediately with one-click copy helpers.
- Quick links to each chain’s block explorer (mainnet & testnet) so you can inspect balances and activity instantly.
- Built-in Vercel Analytics hook—enable analytics in your Vercel project to capture traffic without extra setup.
- Each chain card surfaces its key-derivation curve and entropy source for added transparency.
- All cryptographic work and storage happen client-side; no data leaves the browser.

## Production Build

```bash
npm run build
npm run start
```

The production bundle is emitted to `.next/` and served via `npm run start`.

## Important Notes

- Keys are generated entirely in the browser and saved to `localStorage`. Treat them as disposable and never use them with production funds.
- Private keys are shown in the UI for development convenience—never paste them into production tooling or wallets.
- Explorer links lead to third-party services (Etherscan, Solana Explorer, Mempool.space, Sui Explorer, TON Explorer). Rate limits or downtime may affect availability.
- This tool is intended for development and testing only. Do not manage real assets with the generated keys.
