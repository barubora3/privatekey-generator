import '../styles/globals.css';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Multi-chain Private Key Generator',
  description: 'Generate developer keys for EVM, Solana, Bitcoin, Sui, and TON directly in your browser.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
