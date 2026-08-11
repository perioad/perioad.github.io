import type { Viewport } from 'next';
import { ReactNode } from 'react';

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
};

export default function ChatLayout({ children }: { children: ReactNode }) {
  return children;
}
