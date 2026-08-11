import { RefObject, useEffect, useState } from 'react';

export const useIsOnScreen = (
  ref: RefObject<Element | null>,
  rootMargin = '-10px',
) => {
  const [isIntersected, setIntersected] = useState(false);

  useEffect(() => {
    const current = ref.current;

    if (!current) {
      return;
    }

    // Disconnected on the first hit rather than re-run on the state it sets,
    // which is what kept this one-shot before.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersected(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(current);

    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isIntersected;
};
