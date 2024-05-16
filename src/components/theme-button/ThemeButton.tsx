'use client';

import { useEffect, useRef, useState } from 'react';
import { BulbIcon } from '../../icons/BulbIcon';
import { dark, light, themeKey } from '../../constants/theme.constants';

export const ThemeButton = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!audioRef.current) {
    audioRef.current = new Audio('audio/switch-sound.mp3');
  }

  const color = isDarkTheme ? 'text-zinc-900' : 'text-yellow-300';
  const hoverColor = isDarkTheme
    ? 'hover:text-yellow-300'
    : 'hover:text-zinc-900';

  function toggleTheme() {
    audioRef.current?.play();

    document.documentElement.classList.toggle(dark);

    setIsDarkTheme((prev) => {
      localStorage.setItem(themeKey, prev ? light : dark);

      return !prev;
    });
  }

  useEffect(() => {
    if (document.documentElement.classList.contains(dark)) {
      setIsDarkTheme(true);
    }
  }, []);

  return (
    <button
      className={`${color} ${hoverColor} absolute left-4 top-1 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 sm:left-3 sm:top-3 sm:h-10 sm:w-10`}
      onClick={toggleTheme}
    >
      <span className="block h-5 w-5 opacity-80 transition-all hover:scale-125 hover:opacity-100 sm:h-7 sm:w-7">
        <BulbIcon />
      </span>
    </button>
  );
};
