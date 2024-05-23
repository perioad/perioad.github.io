import { useEffect, useState } from 'react';

export function useIsOggCompatible() {
  const [isCompatible, setIsCompatible] = useState(false);

  useEffect(() => {
    const audioTest = new Audio();

    setIsCompatible(audioTest.canPlayType('audio/ogg') !== '');
  }, []);

  return isCompatible;
}
