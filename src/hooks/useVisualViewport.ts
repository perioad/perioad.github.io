import { useEffect, useState } from 'react';

interface VisualViewportRect {
  height: number;
  offsetTop: number;
}

// iOS Safari ignores the `interactiveWidget` viewport hint. The keyboard is laid
// over the page, `dvh` goes on reporting the full height, and the layout
// viewport is scrolled up so the focused field clears the keyboard. Height alone
// is not enough to survive that scroll, so `offsetTop` comes along: together
// they describe the rectangle the user can actually see. Null where the API is
// missing, so callers can fall back to a `dvh` class.
export function useVisualViewport(): VisualViewportRect | null {
  const [rect, setRect] = useState<VisualViewportRect | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) {
      return;
    }

    function updateRect() {
      const viewport = window.visualViewport;

      if (!viewport) return;

      setRect({ height: viewport.height, offsetTop: viewport.offsetTop });
    }

    updateRect();

    viewport.addEventListener('resize', updateRect);
    viewport.addEventListener('scroll', updateRect);

    return () => {
      viewport.removeEventListener('resize', updateRect);
      viewport.removeEventListener('scroll', updateRect);
    };
  }, []);

  return rect;
}
