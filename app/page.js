"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'multiChainPrivateKeys:v1';

export default function HomePage() {
  const [libraries, setLibraries] = useState(null);
  const [status, setStatus] = useState('Ready to generate keys.');
  const [keyState, setKeyState] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [copyStatus, setCopyStatus] = useState({});
  const copyTimers = useRef({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const libs = await loadLibraries();
        if (cancelled) {
          return;
        }
        setLibraries(libs);
      } catch (err) {
        console.error('Failed to load browser libraries', err);
        if (cancelled) {
          return;
        }
        setError('Failed to load blockchain libraries. Please refresh the page.');
        setStatus('');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const chainDefinitions = useMemo(() => {
    if (!libraries) {
      return [];
    }
    return createChainDefinitions(libraries);
  }, [libraries]);

  const regenerateKeys = useCallback(
    async (isInitial = false) => {
      if (!chainDefinitions.length) {
        return;
      }

      setError(null);
      setIsBusy(true);
      setStatus('Generating keys...');

      try {
        const entries = await Promise.all(
          chainDefinitions.map(async (chain) => {
            const credentials = await chain.generator();
            return [chain.id, credentials];
          })
        );

        const payload = {
          createdAt: new Date().toISOString(),
          chains: Object.fromEntries(entries),
        };

        saveKeys(payload);
        setKeyState(payload);
        setStatus(
          isInitial
            ? 'Generated a new key set.'
            : `Generated a new key set.\n(${formatTimestamp(payload.createdAt)})`
        );
      } catch (err) {
        console.error('Failed to generate keys', err);
        setStatus('Failed to generate keys. Please reload and try again.');
      } finally {
        setIsBusy(false);
      }
    },
    [chainDefinitions]
  );

  useEffect(() => {
    if (!libraries || !chainDefinitions.length) {
      return;
    }

    const stored = loadStoredKeys();
    if (stored && stored.chains) {
      setKeyState(stored);
      setStatus(`Loaded saved keys.\n(${formatTimestamp(stored.createdAt)})`);
    } else {
      setStatus('Ready to generate keys.');
    }
  }, [libraries, chainDefinitions]);

  useEffect(() => {
    Object.values(copyTimers.current).forEach((timer) => clearTimeout(timer));
    copyTimers.current = {};
    setCopyStatus({});
    return () => {
      Object.values(copyTimers.current).forEach((timer) => clearTimeout(timer));
    };
  }, [keyState]);

  const handleRegenerateClick = useCallback(() => {
    if (isBusy || !chainDefinitions.length) {
      return;
    }
    if (keyState) {
      setModalOpen(true);
    } else {
      void regenerateKeys();
    }
  }, [isBusy, chainDefinitions.length, keyState, regenerateKeys]);

  const handleModalConfirm = useCallback(() => {
    setModalOpen(false);
    void regenerateKeys();
  }, [regenerateKeys]);

  const handleModalCancel = useCallback(() => {
    if (isBusy) {
      return;
    }
    setModalOpen(false);
  }, [isBusy]);

  const handleCopy = useCallback((value, key) => {
    if (!value) {
      return;
    }
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopyStatus((prev) => ({
          ...prev,
          [key]: 'Copied!',
        }));
        if (copyTimers.current[key]) {
          clearTimeout(copyTimers.current[key]);
        }
        copyTimers.current[key] = setTimeout(() => {
          setCopyStatus((prev) => ({
            ...prev,
            [key]: 'Copy',
          }));
          delete copyTimers.current[key];
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy to clipboard', err);
        setCopyStatus((prev) => ({
          ...prev,
          [key]: 'Failed',
        }));
        if (copyTimers.current[key]) {
          clearTimeout(copyTimers.current[key]);
        }
        copyTimers.current[key] = setTimeout(() => {
          setCopyStatus((prev) => ({
            ...prev,
            [key]: 'Copy',
          }));
          delete copyTimers.current[key];
        }, 2000);
      });
  }, []);

  const statusClassName = `status${error ? ' error' : ''}`;
  const statusMessage = error ?? status;

  return (
    <>
      <header className="app-header">
        <h1>Multi-chain Private Key Generator</h1>
        <p className="lead">
          Generate developer-ready private keys and addresses
          <br />
          for EVM, Solana, Bitcoin, Sui, and TON directly in your browser.
        </p>
      </header>

      <main className="container">
        <section className="warning-section">
          <div className="notice" role="note">
            <span className="notice-icon" aria-hidden="true">
              ⚠️
            </span>
            <div className="notice-body">
              <strong>Important.</strong> Keys are generated locally and stored only in your browser. Use them for
              development or testing—never deploy them to production wallets or move real assets with them.
            </div>
          </div>
        </section>

        <section className="actions">
          <button
            type="button"
            className="primary"
            onClick={handleRegenerateClick}
            disabled={isBusy || !chainDefinitions.length || Boolean(error)}
          >
            Generate New Keys
          </button>
          <p className="hint">
            Key data is stored in your browser&apos;s <code>localStorage</code> for reuse on your next visit.
          </p>
          <div className={statusClassName} role="status" aria-live="polite">
            {libraries ? statusMessage : 'Loading blockchain libraries...'}
          </div>
        </section>

        <section className="chains">
          {chainDefinitions.map((chain) => {
            const credentials = keyState?.chains?.[chain.id];
            return (
              <article className="chain-card" key={chain.id}>
                <h2>
                  <img src={chain.icon} alt={`${chain.name} logo`} width={28} height={28} />
                  <span>{chain.name}</span>
                </h2>
                <div className="key-row">
                  <label htmlFor={`${chain.id}-address`}>Address</label>
                  <div className="key-field">
                    <div id={`${chain.id}-address`} className="key-value">
                      {credentials?.address ?? 'Not generated'}
                    </div>
                    <button
                      type="button"
                      className="copy-icon"
                      onClick={() => handleCopy(credentials?.address ?? '', `${chain.id}-address`)}
                      disabled={!credentials}
                      aria-label={`Copy ${chain.name} address`}
                    >
                      <span aria-hidden="true">
                        {copyStatus[`${chain.id}-address`] === 'Copied!'
                          ? '✅'
                          : copyStatus[`${chain.id}-address`] === 'Failed'
                          ? '⚠️'
                          : '📋'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="key-row">
                  <label htmlFor={`${chain.id}-secret`} className="key-label">
                    Private Key
                  </label>
                  <div className="key-field">
                    <div id={`${chain.id}-secret`} className="key-value">
                      {credentials?.privateKey ?? 'Not generated'}
                    </div>
                    <button
                      type="button"
                      className="copy-icon"
                      onClick={() => handleCopy(credentials?.privateKey ?? '', `${chain.id}-private`)}
                      disabled={!credentials}
                      aria-label={`Copy ${chain.name} private key`}
                    >
                      <span aria-hidden="true">
                        {copyStatus[`${chain.id}-private`] === 'Copied!'
                          ? '✅'
                          : copyStatus[`${chain.id}-private`] === 'Failed'
                          ? '⚠️'
                          : '📋'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="balance-row">
                  <label htmlFor={`${chain.id}-balance`}>{chain.symbol} Balance</label>
                  <div id={`${chain.id}-balance`} className="balance-value">
                    {credentials && chain.explorers?.length ? (
                      <div className="explorer-links">
                        {chain.explorers.map((explorer) => (
                          <a
                            key={`${chain.id}-${explorer.label}`}
                            href={explorer.url(credentials.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {explorer.label}
                          </a>
                        ))}
                      </div>
                    ) : (
                      '---'
                    )}
                  </div>
                </div>
                <div className="dev-note" aria-label={`${chain.name} key metadata`}>
                  <span>Key Derivation: {chain.derivation}</span>
                  <span>Entropy Source: {chain.entropy}</span>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      {modalOpen ? (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
          onClick={handleModalCancel}
        >
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h2 id="modalTitle">Overwrite Saved Keys</h2>
            <p>Generating new keys will remove every saved private key. Do you want to continue?</p>
            <div className="modal-actions">
              <button type="button" className="danger" onClick={handleModalConfirm} disabled={isBusy}>
                Generate and Overwrite
              </button>
              <button type="button" className="secondary" onClick={handleModalCancel} disabled={isBusy}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

async function loadLibraries() {
  const [
    ethersModule,
    solanaModule,
    bitcoinModule,
    ecpairModule,
    tinySecpModule,
    bs58Module,
    suiModule,
    tonWebModule,
  ] = await Promise.all([
    import('ethers'),
    import('@solana/web3.js'),
    import('bitcoinjs-lib'),
    import('ecpair'),
    import('@bitcoinerlab/secp256k1'),
    import('bs58'),
    import('@mysten/sui.js/keypairs/ed25519'),
    import('tonweb'),
  ]);

  const ethers = ethersModule.ethers ?? ethersModule.default ?? ethersModule;
  const solanaWeb3 = solanaModule.default ?? solanaModule;
  const bitcoin = bitcoinModule.default ?? bitcoinModule;
  const ECPairFactory = ecpairModule.default ?? ecpairModule;
  const tinysecp = tinySecpModule.default ?? tinySecpModule.secp256k1 ?? tinySecpModule;
  const bs58 = bs58Module.default ?? bs58Module;
  const { Ed25519Keypair } = suiModule;
  const TonWeb = tonWebModule.default ?? tonWebModule;

  if (typeof bitcoin.initEccLib === 'function') {
    bitcoin.initEccLib(tinysecp);
  }

  const ECPair = ECPairFactory(tinysecp);

  return {
    ethers,
    solanaWeb3,
    bitcoin,
    ECPair,
    bs58,
    Ed25519Keypair,
    TonWeb,
    tonweb: new TonWeb(),
  };
}

function createChainDefinitions(libs) {
  const { ethers, solanaWeb3, bitcoin, ECPair, bs58, Ed25519Keypair, TonWeb, tonweb } = libs;

  return [
    {
      id: 'evm',
      name: 'Ethereum (EVM)',
      symbol: 'ETH',
      icon: '/icons/ethereum-eth-logo.svg',
      explorers: [
        {
          label: 'View on Etherscan (Mainnet)',
          url: (address) => `https://etherscan.io/address/${address}`,
        },
        {
          label: 'View on Etherscan (Sepolia)',
          url: (address) => `https://sepolia.etherscan.io/address/${address}`,
        },
      ],
      derivation: 'secp256k1 (EVM)',
      entropy: 'window.crypto.getRandomValues via ethers',
      generator: async () => {
        const wallet = ethers.Wallet.createRandom();
        return {
          privateKey: wallet.privateKey,
          address: wallet.address,
        };
      },
    },
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      icon: '/icons/solana-sol-logo.svg',
      explorers: [
        {
          label: 'View on Solana Explorer (Mainnet)',
          url: (address) => `https://explorer.solana.com/address/${address}?cluster=mainnet`,
        },
        {
          label: 'View on Solana Explorer (Testnet)',
          url: (address) => `https://explorer.solana.com/address/${address}?cluster=testnet`,
        },
      ],
      derivation: 'ed25519',
      entropy: 'window.crypto.getRandomValues via @solana/web3.js',
      generator: async () => {
        const keypair = solanaWeb3.Keypair.generate();
        return {
          privateKey: bs58.encode(keypair.secretKey),
          address: keypair.publicKey.toBase58(),
        };
      },
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: '/icons/bitcoin-btc-logo.svg',
      explorers: [
        {
          label: 'View on Mempool.space (Mainnet)',
          url: (address) => `https://mempool.space/address/${address}`,
        },
        {
          label: 'View on Mempool.space (Testnet)',
          url: (address) => `https://mempool.space/testnet/address/${address}`,
        },
      ],
      derivation: 'secp256k1 (compressed WIF)',
      entropy: 'window.crypto.getRandomValues via bitcoinjs-lib',
      generator: async () => {
        const keyPair = ECPair.makeRandom();
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
        return {
          privateKey: keyPair.toWIF(),
          address,
        };
      },
    },
    {
      id: 'sui',
      name: 'Sui',
      symbol: 'SUI',
      icon: '/icons/sui-sui-logo.svg',
      explorers: [
        {
          label: 'View on Sui Explorer (Mainnet)',
          url: (address) => `https://explorer.sui.io/address/${address}?network=mainnet`,
        },
        {
          label: 'View on Sui Explorer (Testnet)',
          url: (address) => `https://explorer.sui.io/address/${address}?network=testnet`,
        },
      ],
      derivation: 'ed25519 (Sui)',
      entropy: 'window.crypto.getRandomValues via @mysten/sui.js',
      generator: async () => {
        const keypair = Ed25519Keypair.generate();
        const exported = keypair.export();
        return {
          privateKey: exported.privateKey,
          address: keypair.getPublicKey().toSuiAddress(),
        };
      },
    },
    {
      id: 'ton',
      name: 'TON',
      symbol: 'TON',
      icon: '/icons/toncoin-ton-logo.svg',
      explorers: [
        {
          label: 'View on TON Explorer (Mainnet)',
          url: (address) => `https://tonviewer.com/${address}`,
        },
        {
          label: 'View on TON Explorer (Testnet)',
          url: (address) => `https://testnet.tonviewer.com/${address}`,
        },
      ],
      derivation: 'ed25519 (TON wallet v3)',
      entropy: 'window.crypto.getRandomValues via TonWeb',
      generator: async () => {
        const keyPair = TonWeb.utils.nacl.sign.keyPair();
        const WalletClass = tonweb.wallet.all.v3R2;
        const wallet = new WalletClass(tonweb.provider, {
          publicKey: keyPair.publicKey,
          wc: 0,
        });
        const address = await wallet.getAddress();
        return {
          privateKey: TonWeb.utils.bytesToHex(keyPair.secretKey),
          address: address.toString(true, true, true),
        };
      },
    },
  ];
}

function loadStoredKeys() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load stored keys', err);
    return null;
  }
}

function saveKeys(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save keys', err);
  }
}

function formatTimestamp(isoString) {
  try {
    const date = new Date(isoString);
    const formatted = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
    return `${formatted} JST`;
  } catch (err) {
    return '';
  }
}
