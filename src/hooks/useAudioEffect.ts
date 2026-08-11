import { useEffect } from 'react';
import { useSpeakerContext } from '../context/SpeakerContext';

const audioRegistry = new Map<string, { current: HTMLAudioElement | null }>();

export const useAudioEffect = (src: string, ignorePermissions = false) => {
  const { isSpeakerAllowed } = useSpeakerContext();

  useEffect(() => {
    const audioRef = audioRegistry.get(src)!;

    if (!audioRef.current) {
      if (ignorePermissions || isSpeakerAllowed) {
        audioRef.current = new Audio(src);
      }

      return;
    }

    audioRef.current.muted = !isSpeakerAllowed;

    // A caller that ignores permissions drives its own transport, so muting has
    // to leave that alone. Pausing here landed in the same commit as the
    // `play()` the music player issues for a track that is still marked as
    // playing, and WebKit aborts a `play()` that a `pause()` cuts across,
    // leaving the track stopped back at the start.
    if (!isSpeakerAllowed && !ignorePermissions) {
      audioRef.current.pause();
    }
  }, [src, isSpeakerAllowed, ignorePermissions]);

  if (!audioRegistry.has(src)) {
    audioRegistry.set(src, { current: null });
  }

  return audioRegistry.get(src)!;
};
