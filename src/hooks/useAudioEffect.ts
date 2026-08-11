import { useEffect } from 'react';
import { useSpeakerContext } from '../context/SpeakerContext';
import { getAudioSlot } from '../utils/audio-registry';

export const useAudioEffect = (src: string, ignorePermissions = false) => {
  const { isSpeakerAllowed } = useSpeakerContext();

  useEffect(() => {
    // An empty source is how a caller says "not yet", as the speaker prompt
    // does while it is hidden. `new Audio('')` points the element at the page
    // itself, which has no audio to decode, and WebKit rejects any play() on it
    // with NotSupportedError.
    if (!src) {
      return;
    }

    const audioRef = getAudioSlot(src);

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

  return getAudioSlot(src);
};
