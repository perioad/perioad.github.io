'use client';

import { BulbIcon } from '../../icons/BulbIcon';
import { useMyContext } from '../../context/context';
import { useAudioEffect } from '../../hooks/useAudioEffect';

export const ThemeButton = () => {
  const audioRef = useAudioEffect('audio/switch.mp3');
  const { isDarkTheme, toggleTheme } = useMyContext();

  function handleToggleTheme() {
    audioRef.current?.play();
    toggleTheme();
  }

  return (
    <button
      className={`flex h-8 w-8 items-center justify-center bg-pink-500 text-yellow-300 hover:text-zinc-900 sm:h-10 sm:w-10 dark:text-zinc-900 dark:hover:text-yellow-300`}
      title={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={handleToggleTheme}
    >
      <span className="block h-5 w-5 transition-all hover:scale-110 sm:h-7 sm:w-7">
        <BulbIcon />
      </span>
    </button>
  );
};
