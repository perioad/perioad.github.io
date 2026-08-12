import { useState } from 'react';

// A dialog outlives the thing it was about: closing it sets the chat or the
// project back to null, and the panel then spends the length of its animation
// on screen with nothing to say. Holding the last one means it reads the same
// on the way out as it did on the way in.
//
// The update during render is the pattern React documents for deriving state
// from props. It re-renders before anything is committed, so nothing outside
// this component ever sees the stale value.
export function useRetainedValue<T>(value: T | null): T | null {
  const [retained, setRetained] = useState(value);

  if (value !== null && value !== retained) {
    setRetained(value);
  }

  return value ?? retained;
}
