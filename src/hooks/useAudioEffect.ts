import { useEffect } from 'react';
import { useSpeakerContext } from '../context/SpeakerContext';

const audioRegistry = new Map<string, { current: HTMLAudioElement | null }>();

export const useAudioEffect = (src: string, isForceLoad = false) => {
  const { isSpeakerAllowed } = useSpeakerContext();

  useEffect(() => {
    const audioRef = audioRegistry.get(src);

    if ((isForceLoad || isSpeakerAllowed) && !audioRef!.current) {
      audioRef!.current = new Audio(src);
    } else if (!isSpeakerAllowed && audioRef!.current) {
      audioRef!.current.pause();
      audioRef!.current.muted = true;
    } else if (isSpeakerAllowed && audioRef!.current?.muted) {
      audioRef!.current.muted = false;
    }
  }, [src, isSpeakerAllowed, isForceLoad]);

  if (!audioRegistry.has(src)) {
    audioRegistry.set(src, { current: null });
  }

  return audioRegistry.get(src)!;
};
