import { memo, use } from 'react';
import { useSoundContext } from '../../context/SoundContext';
import { useAudioEffect } from '../../hooks/useAudioEffect';

export const AllowSound = memo(function AllowSound() {
  const { isSoundAllowed, setIsSoundAllowed } = useSoundContext();
  const tadaSound = useAudioEffect('audio/tada.mp3', true);

  function handleAllowSound() {
    tadaSound.current?.play();
    setIsSoundAllowed(true);
  }

  if (isSoundAllowed !== null) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 z-40 flex h-full w-full justify-center bg-white bg-opacity-85 px-5 backdrop-blur-sm dark:bg-black dark:bg-opacity-90">
      <div className="flex flex-col justify-center gap-5 sm:max-w-screen-md">
        <p>
          Hi there! To make the experience on my site unique I added different
          sound effects to some elements. Are you ok to allow sound effects?
        </p>

        <button
          className="w-full bg-green-500 px-4 py-2 transition-all hover:text-white dark:hover:text-zinc-900"
          onClick={handleAllowSound}
        >
          Allow
        </button>

        <button
          className="w-full bg-red-500 px-4 py-2 transition-all hover:text-white dark:hover:text-zinc-900"
          onClick={() => setIsSoundAllowed(false)}
        >
          Disallow
        </button>
      </div>
    </div>
  );
});
