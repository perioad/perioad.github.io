import { memo } from 'react';
import { useSpeakerContext } from '../../context/SpeakerContext';
import { useAudioEffect } from '../../hooks/useAudioEffect';
import { playAudio } from '../../utils/audio.utils';

export const SpeakerPrompt = memo(function SpeakerPrompt() {
  const { isSpeakerAllowed, setIsSpeakerAllowed } = useSpeakerContext();
  const tadaSound = useAudioEffect(
    isSpeakerAllowed === null ? 'audio/tada.mp3' : '',
    true,
  );

  function handleAllowSpeaker() {
    playAudio(tadaSound.current);
    setIsSpeakerAllowed(true);
  }

  function handleDisallowSpeaker() {
    setIsSpeakerAllowed(false);
  }

  if (isSpeakerAllowed !== null) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 z-40 flex h-full w-full animate-appear justify-center bg-white/85 px-5 backdrop-blur-xs dark:bg-black/90">
      <div className="flex flex-col justify-center gap-5 sm:max-w-(--breakpoint-md)">
        <p>
          hi there! to make the experience on my site unique I added different
          sound effects. are you ok to allow sound effects?
        </p>

        <button
          className="w-full bg-green-500 px-4 py-2 transition-all hover:text-white dark:hover:text-zinc-900"
          onClick={handleAllowSpeaker}
        >
          Allow
        </button>

        <button
          className="w-full bg-red-500 px-4 py-2 transition-all hover:text-white dark:hover:text-zinc-900"
          onClick={handleDisallowSpeaker}
        >
          Disallow
        </button>
      </div>
    </div>
  );
});
