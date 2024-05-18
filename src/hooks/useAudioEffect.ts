import { useEffect } from 'react';

const audioRegistry = new Map<string, { current: HTMLAudioElement | null }>();

export const useAudioEffect = (src: string) => {
  useEffect(() => {
    const audioRef = audioRegistry.get(src);

    if (!audioRef!.current) {
      audioRef!.current = new Audio(src);
    }
  }, [src]);

  if (!audioRegistry.has(src)) {
    audioRegistry.set(src, { current: null });
  }

  return audioRegistry.get(src)!;
};
