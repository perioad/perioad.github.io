import { useEffect, useState } from 'react';

export function useIsIos() {
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIt = !!(
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        /macintel/.test(userAgent))
    );

    setIsIos(isIt);
  }, []);

  return [isIos];
}
