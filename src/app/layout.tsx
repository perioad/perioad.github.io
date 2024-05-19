import type { Metadata } from 'next';
import { themeKey, dark, light } from '../constants/theme.constants';
import { MyContextProvider } from '../context/context';
import './globals.css';

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (
                localStorage.getItem('${themeKey}') === '${dark}' ||
                (!('${themeKey}' in localStorage) &&
                  window.matchMedia('(prefers-color-scheme: dark)').matches)
              ) {
                document.documentElement.classList.add('${dark}');
                localStorage.setItem('${themeKey}', '${dark}');
              } else {
                document.documentElement.classList.remove('${dark}');
                localStorage.setItem('${themeKey}', '${light}');
              }
            `,
          }}
        />
      </head>
      <body
        className={`bg-white text-lg text-zinc-900 sm:text-2xl dark:bg-black dark:text-zinc-200`}
      >
        <MyContextProvider>{children}</MyContextProvider>
      </body>
    </html>
  );
}
