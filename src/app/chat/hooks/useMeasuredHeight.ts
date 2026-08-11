import { useCallback } from 'react';

// Publishes an element's height as a custom property on its parent, where
// anything inside can read it.
//
// The header and the composer float over the conversation so it can be seen
// through them, which means the conversation has to leave room for exactly as
// much of them as there is. None of those heights is a constant worth writing
// down: the composer grows with the textarea, the pinned bar is not always
// there, and the header's own height follows the touch target size at its
// breakpoint.
export function useMeasuredHeight(property: string) {
  return useCallback(
    (node: HTMLElement | null) => {
      const parent = node?.parentElement;

      if (!node || !parent) {
        return;
      }

      const observer = new ResizeObserver(([entry]) => {
        parent.style.setProperty(
          property,
          `${entry.borderBoxSize[0].blockSize}px`,
        );
      });

      observer.observe(node);

      return () => {
        observer.disconnect();
        parent.style.removeProperty(property);
      };
    },
    [property],
  );
}
