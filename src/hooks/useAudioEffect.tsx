import { useRef, useEffect } from 'react';

export const useAudioEffect = (src: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
    }

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [src]);

  return audioRef;
};
