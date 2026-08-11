import { useClientValue } from './useClientValue';

// Read once and kept: this is called on every render, and building an `Audio`
// each time to ask the same question would be wasteful.
let isOggCompatible: boolean | null = null;

function getIsOggCompatible() {
  if (isOggCompatible === null) {
    isOggCompatible = new Audio().canPlayType('audio/ogg') !== '';
  }

  return isOggCompatible;
}

export function useIsOggCompatible() {
  return useClientValue(getIsOggCompatible, false);
}
