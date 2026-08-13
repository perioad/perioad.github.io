import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import ServiceWorker from './components/ServiceWorker';

// Advertised here rather than from the root, so that the thing offered for
// installing is the chat and not the whole site. The scope is still the whole
// origin, so a link out of the chat stays inside the installed app instead of
// throwing the visitor back into a browser.
export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    // What ends up written under the icon on an iPhone.
    title: 'chat',
    // Leaves the status bar to the system rather than putting the page behind
    // it, which would need every fixed edge in the app to learn about insets.
    statusBarStyle: 'default',
  },
  icons: { apple: '/apple-touch-icon.png' },
};

// `resizes-content` asks the browser to shrink the viewport when the on-screen
// keyboard opens rather than sliding it over the page, which is what keeps the
// composer reachable while typing. `cover` is what gives the `safe-area-inset`
// values something to report, so the composer can clear the home indicator.
// Neither is honoured by iOS Safari, which `useVisualViewport` covers.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  // What the browser paints around the page: its own chrome on a phone, and
  // the bar above the window when installed. Given twice so that it follows
  // the theme rather than fighting whichever one is not the default.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ServiceWorker />
      {children}
    </>
  );
}
