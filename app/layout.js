import '../styles/globals.css';
import { Analytics } from '@vercel/analytics/react';

const SITE_URL = 'https://privatekey-generator.vercel.app';

export const metadata = {
  title: 'Multi-chain Private Key Generator',
  description:
    'Generate developer-ready private keys and addresses for EVM, Solana, Bitcoin, Sui, and TON directly in your browser.',
  keywords: [
    'private key generator',
    'web3 developer tools',
    'blockchain keys',
    'ethereum',
    'solana',
    'bitcoin',
    'sui',
    'ton',
    'multi-chain',
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Multi-chain Private Key Generator',
    description:
      'Generate developer-ready private keys and addresses for EVM, Solana, Bitcoin, Sui, and TON directly in your browser.',
    url: SITE_URL,
    siteName: 'Multi-chain Private Key Generator',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multi-chain Private Key Generator',
    description:
      'Generate developer-ready private keys and addresses for EVM, Solana, Bitcoin, Sui, and TON directly in your browser.',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="app-footer">
          <span>Built by tenden.</span>
          <nav aria-label="Author links" className="footer-links">
            <a href="https://twitter.com/ytenden" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <a
              href="https://github.com/barubora3/privatekey-generator"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Repository
            </a>
          </nav>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
