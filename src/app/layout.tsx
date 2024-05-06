import type { Metadata } from 'next';
import { Racing_Sans_One } from 'next/font/google';
import './globals.css';

const font = Racing_Sans_One({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'perioad',
  description: 'Personal site of perioad',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/npm/handtrackjs@latest/models/webmodel/ssd320fpnlite/int8/model.json"
          as="fetch"
          fetchPriority="low"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/npm/handtrackjs@latest/models/webmodel/ssd320fpnlite/int8/group1-shard1of1.bin"
          as="fetch"
          fetchPriority="low"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${font.className} text-zinc-200`}>{children}</body>
    </html>
  );
}
