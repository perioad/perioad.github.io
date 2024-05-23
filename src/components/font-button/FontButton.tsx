'use client';

import { useFontContext } from '../../context/FontContext';
import { useAudioEffect } from '../../hooks/useAudio';

export const FontButton = () => {
  const { isDyslexicFont, toggleFont } = useFontContext();
  const brushSound = useAudioEffect('audio/brush.mp3');

  const title = isDyslexicFont
    ? 'Switch to regural font'
    : 'Switch to font for dyslexia';

  function handleToggleFont() {
    brushSound.current?.play();
    toggleFont();
  }

  return (
    <button
      className={`flex h-8 w-8 items-center justify-center bg-pink-500 text-white hover:text-zinc-900 sm:h-10 sm:w-10 dark:text-zinc-900 dark:hover:text-white`}
      title={title}
      aria-label={title}
      onClick={handleToggleFont}
    >
      <span className="block h-5 w-5 leading-5 transition-all hover:scale-110 sm:h-7 sm:w-7 sm:leading-7">
        F
      </span>
    </button>
  );
};
