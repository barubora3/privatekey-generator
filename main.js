import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';
import * as solanaWeb3 from 'https://cdn.jsdelivr.net/npm/@solana/web3.js@1.87.6/+esm';
import * as bitcoin from 'https://cdn.jsdelivr.net/npm/bitcoinjs-lib@6.1.0/+esm';
import ECPairFactory from 'https://cdn.jsdelivr.net/npm/ecpair@2.0.1/+esm';
import * as tinysecp from 'https://cdn.jsdelivr.net/npm/tiny-secp256k1@2.2.1/+esm';
import bs58 from 'https://cdn.jsdelivr.net/npm/bs58@5.0.0/+esm';
import { Ed25519Keypair } from 'https://cdn.jsdelivr.net/npm/@mysten/sui.js@0.53.0/+esm';
import TonWeb from 'https://cdn.jsdelivr.net/npm/tonweb@0.0.60/+esm';

const STORAGE_KEY = 'multiChainPrivateKeys:v1';
const ECPair = ECPairFactory(tinysecp);
const tonweb = new TonWeb();

const state = {
  keys: null,
};

const statusEl = document.getElementById('status');
const chainContainer = document.getElementById('chains');
const regenerateButton = document.getElementById('regenerateButton');
const clearStorageButton = document.getElementById('clearStorageButton');
const modal = document.getElementById('modal');
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel = document.getElementById('modalCancel');

const CHAINS = [
  {
    id: 'evm',
    name: 'Ethereum (EVM)',
    symbol: 'ETH',
    generator: async () => {
      const wallet = ethers.Wallet.createRandom();
      return {
        privateKey: wallet.privateKey,
        address: wallet.address,
      };
    },
    balanceFetcher: async (address) => {
      const provider = new ethers.providers.JsonRpcProvider('https://cloudflare-eth.com');
      const balance = await provider.getBalance(address);
      return `${ethers.utils.formatEther(balance)} ETH`;
    },
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    generator: async () => {
      const keypair = solanaWeb3.Keypair.generate();
      return {
        privateKey: bs58.encode(keypair.secretKey),
        address: keypair.publicKey.toBase58(),
      };
    },
    balanceFetcher: async (address) => {
      const connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com');
      const lamports = await connection.getBalance(new solanaWeb3.PublicKey(address));
      return `${formatDecimalFromBigInt(BigInt(lamports), 9)} SOL`;
    },
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    generator: async () => {
      const keyPair = ECPair.makeRandom();
      const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
      return {
        privateKey: keyPair.toWIF(),
        address,
      };
    },
    balanceFetcher: async (address) => {
      const response = await fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const balance = Number(data.balance ?? 0);
      return `${(balance / 1e8).toFixed(8)} BTC`;
    },
  },
  {
    id: 'sui',
    name: 'Sui',
    symbol: 'SUI',
    generator: async () => {
      const keypair = Ed25519Keypair.generate();
      const exported = keypair.export();
      return {
        privateKey: exported.privateKey,
        address: keypair.getPublicKey().toSuiAddress(),
      };
    },
    balanceFetcher: async (address) => {
      const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getBalance',
        params: [address],
      };
      const response = await fetch('https://fullnode.mainnet.sui.io/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'Sui RPC error');
      }
      const total = BigInt(data.result?.totalBalance ?? 0n);
      return `${formatDecimalFromBigInt(total, 9)} SUI`;
    },
  },
  {
    id: 'ton',
    name: 'TON',
    symbol: 'TON',
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
    balanceFetcher: async (address) => {
      const response = await fetch(`https://tonapi.io/v2/accounts/${address}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const balance = BigInt(data.balance ?? 0n);
      return `${formatDecimalFromBigInt(balance, 9)} TON`;
    },
  },
];

function loadStoredKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (error) {
    console.error('Failed to load stored keys', error);
    return null;
  }
}

function saveKeys(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function setStatus(message) {
  statusEl.textContent = message;
}

function formatTimestamp(isoString) {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch (error) {
    return '';
  }
}

function formatDecimalFromBigInt(value, decimals) {
  const big = BigInt(value);
  const base = 10n ** BigInt(decimals);
  const whole = big / base;
  const fraction = big % base;
  if (fraction === 0n) {
    return whole.toString();
  }
  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole.toString()}.${fractionStr}`;
}

async function generateAllChains() {
  const entries = await Promise.all(
    CHAINS.map(async (chain) => {
      const credentials = await chain.generator();
      return [chain.id, credentials];
    })
  );
  return Object.fromEntries(entries);
}

function renderChains(chainsData) {
  chainContainer.innerHTML = '';
  CHAINS.forEach((chain) => {
    const credentials = chainsData?.[chain.id];
    const card = document.createElement('article');
    card.className = 'chain-card';

    const header = document.createElement('h2');
    header.textContent = chain.name;
    card.appendChild(header);

    const addressRow = document.createElement('div');
    addressRow.className = 'key-row';
    const addressLabel = document.createElement('label');
    addressLabel.textContent = 'アドレス';
    const addressValue = document.createElement('div');
    addressValue.className = 'key-value';
    addressValue.textContent = credentials?.address ?? '未生成';
    addressRow.append(addressLabel, addressValue);
    card.appendChild(addressRow);

    const privateRow = document.createElement('div');
    privateRow.className = 'key-row';
    const privateLabel = document.createElement('label');
    privateLabel.textContent = '秘密鍵';
    const privateValue = document.createElement('div');
    privateValue.className = 'key-value';
    privateValue.textContent = credentials?.privateKey ?? '未生成';
    privateRow.append(privateLabel, privateValue);
    card.appendChild(privateRow);

    const balanceRow = document.createElement('div');
    balanceRow.className = 'balance-row';
    const balanceLabel = document.createElement('label');
    balanceLabel.textContent = `${chain.symbol} 残高`;
    const balanceValue = document.createElement('div');
    balanceValue.className = 'balance-value';
    balanceValue.textContent = credentials ? '未取得' : '---';
    balanceRow.append(balanceLabel, balanceValue);

    if (credentials) {
      const actions = document.createElement('div');
      actions.className = 'chain-actions';
      const balanceButton = document.createElement('button');
      balanceButton.className = 'secondary';
      balanceButton.textContent = '残高を取得';
      balanceButton.addEventListener('click', async () => {
        await handleBalanceFetch(chain, credentials.address, balanceValue, balanceButton);
      });
      actions.appendChild(balanceButton);
      balanceRow.appendChild(actions);
    }

    card.appendChild(balanceRow);
    chainContainer.appendChild(card);
  });
}

async function handleBalanceFetch(chain, address, targetEl, button) {
  if (!chain.balanceFetcher) {
    targetEl.textContent = '残高取得は未対応です';
    return;
  }

  button.disabled = true;
  const previousText = targetEl.textContent;
  targetEl.textContent = '取得中...';
  try {
    const balance = await chain.balanceFetcher(address);
    targetEl.textContent = balance;
  } catch (error) {
    console.error(`Failed to fetch ${chain.id} balance`, error);
    targetEl.textContent = '取得に失敗しました';
  } finally {
    button.disabled = false;
    if (targetEl.textContent === '取得中...') {
      targetEl.textContent = previousText;
    }
  }
}

async function regenerateKeys(isInitial = false) {
  try {
    setStatus('鍵を生成しています...');
    toggleButtons(true);
    const chains = await generateAllChains();
    const payload = {
      createdAt: new Date().toISOString(),
      chains,
    };
    saveKeys(payload);
    state.keys = payload;
    renderChains(payload.chains);
    setStatus(isInitial ? '新しい鍵を生成しました。' : `新しい鍵を生成しました。（${formatTimestamp(payload.createdAt)}）`);
  } catch (error) {
    console.error('Failed to generate keys', error);
    setStatus('鍵の生成に失敗しました。リロードして再試行してください。');
  } finally {
    toggleButtons(false);
  }
}

function toggleButtons(disabled) {
  regenerateButton.disabled = disabled;
  clearStorageButton.disabled = disabled;
  modalConfirm.disabled = disabled;
}

function clearStoredKeys() {
  localStorage.removeItem(STORAGE_KEY);
  state.keys = null;
  renderChains(null);
  setStatus('保存された鍵情報を削除しました。');
}

function openModal() {
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

function setupEventListeners() {
  regenerateButton.addEventListener('click', () => {
    if (state.keys) {
      openModal();
    } else {
      regenerateKeys();
    }
  });

  clearStorageButton.addEventListener('click', () => {
    if (!state.keys) {
      setStatus('保存された鍵はありません。');
      return;
    }
    const confirmed = window.confirm('保存されているすべての鍵を削除します。続行しますか？');
    if (confirmed) {
      clearStoredKeys();
    }
  });

  modalCancel.addEventListener('click', () => {
    closeModal();
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  modalConfirm.addEventListener('click', async () => {
    closeModal();
    await regenerateKeys();
  });
}

async function init() {
  setupEventListeners();
  const stored = loadStoredKeys();
  if (stored && stored.chains) {
    state.keys = stored;
    renderChains(stored.chains);
    setStatus(`保存済みの鍵を読み込みました。（${formatTimestamp(stored.createdAt)}）`);
  } else {
    await regenerateKeys(true);
  }
}

init();
