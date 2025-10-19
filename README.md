# Multi-chain Private Key Generator

The Multi-chain Private Key Generator is a browser-based tool for quickly creating disposable development credentials across five blockchains: Ethereum-compatible EVM networks, Solana, Bitcoin, Sui, and TON. Keys are generated locally, never leave your device, and persist only in your browser’s `localStorage` so you can pick up where you left off.

## Live Demo

Visit the hosted version at **https://privatekey-generator.vercel.app** (client-side only; no server stores your keys).

## Quick Start

1. Install dependencies and launch the dev server:

   ```bash
   npm install
   npm run dev
   ```

2. Open `http://localhost:3000` in your browser. Serve the app over HTTP(S) so the client can contact public RPC endpoints without CORS issues.

3. Click **Generate New Keys** to create a fresh bundle whenever you start a new testing session.

## How to Use the App

1. On first load, the app fetches the required blockchain libraries in your browser. A status banner keeps you informed.
2. Press **Generate New Keys** to build a complete set of addresses and private keys for every supported chain. If keys already exist, a confirmation modal prevents accidental overwrites.
3. Use the copy icons to place addresses and private keys on your clipboard instantly. Each chain card also links to mainnet and testnet block explorers so you can inspect balances right away.
4. Revisit the page later to reuse the same keys; they are restored from `localStorage`. Generate again any time to replace them.

## Key Features

- 🔐 **Local-first security** – All cryptographic work runs in your browser. No keys are transmitted or stored remotely.
- 🧰 **Multi-chain coverage** – Generates credentials for EVM (Ethereum), Solana, Bitcoin, Sui, and TON in one click.
- ♻️ **Session persistence** – Previously created keys automatically reload on return visits.
- ✅ **Safety guardrails** – Modal confirmation prevents unwanted overwrites of stored keys.
- 📋 **Copy helpers & explorer links** – Copy buttons and curated explorer shortcuts make testing workflows faster.
- 📊 **Analytics ready** – Includes the Vercel Analytics hook; enable it in your project settings for traffic insights.
- 🔎 **Transparent metadata** – Each chain card lists the derivation curve and entropy source used for key creation.

## Production Build

```bash
npm run build
npm run start
```

The optimized bundle lives in `.next/` and is served with `npm run start`.

## Security & Limitations

- Keys are intended for **development and testing only**. Never fund these wallets with real assets.
- Data lives exclusively in the browser’s `localStorage`. Clear it or generate new keys when rotating credentials.
- Explorer shortcuts point to third-party services (Etherscan, Solana Explorer, Mempool.space, Sui Explorer, TON Explorer). Availability and rate limits depend on those providers.
- Because everything runs client-side, you need a modern browser with clipboard permissions enabled for copy helpers.
