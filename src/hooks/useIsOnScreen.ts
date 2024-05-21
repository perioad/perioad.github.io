import { RefObject, useEffect, useState } from 'react';

export const useIsOnScreen = (
  ref: RefObject<Element>,
  rootMargin = '-10px',
) => {
  const [isIntersected, setIntersected] = useState(false);

  useEffect(() => {
    if (isIntersected) {
      return;
    }

    const current = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersected(true);
        }
      },
      {
        rootMargin,
      },
    );
    if (current) {
      observer.observe(current);
    }
    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [isIntersected]);

  return isIntersected;
};
