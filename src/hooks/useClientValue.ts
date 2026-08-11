import { useSyncExternalStore } from 'react';

// Nothing to subscribe to: these answers are settled by the device and do not
// change for the life of the page.
const neverChanges = () => () => {};

// The server cannot answer questions about the browser, and reading them in an
// effect and calling setState is a render the component did not need. This is
// what React provides instead: the server value is rendered, then the real one
// replaces it as part of hydration.
//
// `read` is called on every render, so it should be cheap or cached, and it must
// return the same value each time until something actually changes.
export function useClientValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(neverChanges, read, () => serverValue);
}
