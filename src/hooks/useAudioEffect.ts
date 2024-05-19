import { useEffect } from 'react';
import { useSoundContext } from '../context/SoundContext';

const audioRegistry = new Map<string, { current: HTMLAudioElement | null }>();

export const useAudioEffect = (src: string, isForceLoad = false) => {
  const { isSoundAllowed } = useSoundContext();

  useEffect(() => {
    const audioRef = audioRegistry.get(src);

    if ((isForceLoad || isSoundAllowed) && !audioRef!.current) {
      audioRef!.current = new Audio(src);
    }
  }, [src, isSoundAllowed, isForceLoad]);

  if (!audioRegistry.has(src)) {
    audioRegistry.set(src, { current: null });
  }

  return audioRegistry.get(src)!;
};
