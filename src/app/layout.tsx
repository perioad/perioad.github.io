import type { Metadata } from 'next';
import { themeKey, dark, light } from '../constants/local-storage.constants';
import { ContextProvider } from '../context/ContextProvider';
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
        className={`bg-white text-lg text-zinc-900 selection:bg-orange-500 sm:text-2xl dark:bg-black dark:text-zinc-200`}
      >
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  );
}
