import { useClientValue } from './useClientValue';

// Read once and kept, because the answer cannot change and this is called on
// every render.
let isIos: boolean | null = null;

function getIsIos() {
  if (isIos === null) {
    const userAgent = window.navigator.userAgent.toLowerCase();

    isIos =
      /iphone|ipad|ipod/.test(userAgent) ||
      // An iPad reports itself as a mac, and touch points are what tell the two
      // apart.
      (navigator.maxTouchPoints > 2 && /macintel/.test(userAgent));
  }

  return isIos;
}

export function useIsIos() {
  return useClientValue(getIsIos, false);
}
