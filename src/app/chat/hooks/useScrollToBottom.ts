import { useCallback, useEffect, useRef, useState } from 'react';

export function useScrollToBottom() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrolledTop = useRef(false);
  const isScrollQueued = useRef(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Streaming calls this once per chunk, so the calls are coalesced into one
  // scroll per frame. A frame is also late enough for the newly rendered text
  // to be measured, which a plain call would race.
  const scrollToBottom = useCallback(() => {
    if (isUserScrolledTop.current || isScrollQueued.current) return;

    isScrollQueued.current = true;

    requestAnimationFrame(() => {
      isScrollQueued.current = false;

      const container = containerRef.current;

      container?.scrollTo({ top: container.scrollHeight });
    });
  }, []);

  // Ignores the "user scrolled up" latch, because pressing the jump button is
  // the user asking to follow along again.
  const scrollToBottomNow = useCallback(() => {
    isUserScrolledTop.current = false;

    const container = containerRef.current;

    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    function handleScroll() {
      if (!container) return;

      const atBottom =
        Math.abs(
          container.scrollHeight - container.scrollTop - container.clientHeight,
        ) < 50;

      isUserScrolledTop.current = !atBottom;
      setIsAtBottom(atBottom);
    }

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { containerRef, scrollToBottom, scrollToBottomNow, isAtBottom };
}
