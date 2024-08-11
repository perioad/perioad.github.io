import { throttle } from 'lodash-es';
import { useRef, useCallback, useEffect } from 'react';

export function useScrollToBottom(...dependencies: any[]) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrolledTop = useRef(false);

  const scrollToBottom = useCallback(
    throttle(() => {
      if (isUserScrolledTop.current) return;
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
      });
    }, 150),
    dependencies,
  );

  const scrollListener = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const isAtBottom =
      Math.abs(
        container.scrollHeight - container.scrollTop - container.clientHeight,
      ) < 50;

    isUserScrolledTop.current = !isAtBottom;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', scrollListener);
      return () => {
        container.removeEventListener('scroll', scrollListener);
      };
    }
  }, [scrollListener]);

  return { containerRef, scrollToBottom };
}
