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
          <nav aria-label="Author links" className="footer-links">
            <a
              className="footer-icon"
              href="https://twitter.com/ytenden"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">Twitter</span>
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.55 6.53c.01.17.01.34.01.51 0 5.2-3.96 11.19-11.19 11.19-2.22 0-4.28-.65-6.01-1.77.31.04.62.06.94.06 1.85 0 3.55-.63 4.9-1.69-1.72-.03-3.18-1.17-3.68-2.72.24.05.49.07.75.07.36 0 .71-.05 1.04-.14-1.81-.36-3.18-1.96-3.18-3.88v-.05c.53.29 1.14.46 1.79.48a3.89 3.89 0 0 1-1.73-3.25c0-.71.19-1.36.53-1.93a11.05 11.05 0 0 0 8.03 4.08 3.89 3.89 0 0 1 6.62-3.55 7.7 7.7 0 0 0 2.47-.94 3.9 3.9 0 0 1-1.71 2.15 7.77 7.77 0 0 0 2.23-.61 8.36 8.36 0 0 1-1.95 2.02z" />
              </svg>
            </a>
            <a
              className="footer-icon"
              href="https://github.com/barubora3/privatekey-generator"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">GitHub</span>
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.41 7.86 10.94.58.11.79-.25.79-.56 0-.28-.01-1.03-.02-2.02-3.2.7-3.87-1.54-3.87-1.54-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.3 1.19-3.11-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.19a11.1 11.1 0 0 1 5.8 0c2.2-1.5 3.17-1.19 3.17-1.19.63 1.58.23 2.75.11 3.04.74.81 1.18 1.85 1.18 3.11 0 4.43-2.69 5.41-5.26 5.7.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </nav>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
