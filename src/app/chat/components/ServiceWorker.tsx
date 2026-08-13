'use client';

import { useEffect } from 'react';

// What makes the chat installable and lets it open with no network. Registered
// from the page rather than shipped with it, since a worker is a separate file
// the browser fetches for itself.
export default function ServiceWorker() {
  useEffect(() => {
    // A worker in development would answer with yesterday's build and quietly
    // undo hot reloading, which looks like the code not running.
    if (process.env.NODE_ENV !== 'production') return;

    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Error registering the service worker:', error);
    });
  }, []);

  return null;
}
