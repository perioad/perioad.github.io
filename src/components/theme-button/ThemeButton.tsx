'use client';

import { useEffect, useRef } from 'react';
import { BulbIcon } from '../../icons/BulbIcon';
import { useMyContext } from '../../context/context';

export const ThemeButton = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isDarkTheme, toggleTheme } = useMyContext();

  const color = isDarkTheme ? 'text-zinc-900' : 'text-yellow-300';
  const hoverColor = isDarkTheme
    ? 'hover:text-yellow-300'
    : 'hover:text-zinc-900';

  function handleToggleTheme() {
    audioRef.current?.play();
    toggleTheme();
  }

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('audio/switch-sound.mp3');
    }
  }, []);

  return (
    <button
      className={`${color} ${hoverColor} absolute left-4 top-5 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 sm:h-10 sm:w-10`}
      title={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={handleToggleTheme}
    >
      <span className="block h-5 w-5 opacity-80 transition-all hover:scale-125 hover:opacity-100 sm:h-7 sm:w-7">
        <BulbIcon />
      </span>
    </button>
  );
};
