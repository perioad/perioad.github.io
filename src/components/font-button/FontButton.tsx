'use client';

import { useMyContext } from '../../context/context';
import { useAudioEffect } from '../../hooks/useAudioEffect';
import { AtIcon } from '../../icons/AtIcon';

export const FontButton = () => {
  const { isDyslexicFont, toggleFont } = useMyContext();
  const sparkleSound = useAudioEffect('audio/sparkle.mp3');

  function handleToggleFont() {
    sparkleSound.current?.play();
    toggleFont();
  }

  return (
    <button
      className={`flex h-8 w-8 items-center justify-center bg-pink-500 text-white hover:text-zinc-900 sm:h-10 sm:w-10 dark:text-zinc-900 dark:hover:text-white`}
      title={
        isDyslexicFont
          ? 'Switch to regural font'
          : 'Switch to font for dyslexia'
      }
      onClick={handleToggleFont}
    >
      <span className="block h-5 w-5 transition-all hover:scale-110 sm:h-7 sm:w-7">
        <AtIcon />
      </span>
    </button>
  );
};
