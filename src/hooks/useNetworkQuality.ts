import { useSyncExternalStore } from 'react';

type NetworkInformation = EventTarget & { effectiveType: string };

function getConnection() {
  // The Network Information API is missing from the DOM types, and from Safari.
  return (navigator as Navigator & { connection?: NetworkInformation })
    .connection;
}

function subscribe(onChange: () => void) {
  const connection = getConnection();

  connection?.addEventListener('change', onChange);

  return () => connection?.removeEventListener('change', onChange);
}

// A browser that will not say is taken at its best, which is what every desktop
// and every iPhone gets.
function getSnapshot() {
  const connection = getConnection();

  return connection ? connection.effectiveType === '4g' : true;
}

// Nothing is known about the connection while rendering on the server, and the
// heavier thing this gates is not worth committing to on a guess.
const getServerSnapshot = () => false;

export function useNetworkQualityGood() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
