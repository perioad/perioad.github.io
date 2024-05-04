import type { Metadata } from 'next';
import { Racing_Sans_One } from 'next/font/google';
import './globals.css';

const font = Racing_Sans_One({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'erioad',
  description: 'Personal site of perioad',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
