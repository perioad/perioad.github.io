import { memo } from 'react';
import { useSpeakerContext } from '../../context/SpeakerContext';
import { useAudioEffect } from '../../hooks/useAudio';

export const SpeakerPrompt = memo(function SpeakerPrompt() {
  const { isSpeakerAllowed, setIsSpeakerAllowed } = useSpeakerContext();
  const tadaSound = useAudioEffect(
    isSpeakerAllowed === null ? 'audio/tada.mp3' : '',
    true,
  );

  function handleAllowSpeaker() {
    tadaSound.current?.play();
    setIsSpeakerAllowed(true);
  }

  function handleDisallowSpeaker() {
    setIsSpeakerAllowed(false);
  }

  if (isSpeakerAllowed !== null) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 z-40 flex h-full w-full animate-appear justify-center bg-white bg-opacity-85 px-5 backdrop-blur-sm dark:bg-black dark:bg-opacity-90">
      <div className="flex flex-col justify-center gap-5 sm:max-w-screen-md">
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
