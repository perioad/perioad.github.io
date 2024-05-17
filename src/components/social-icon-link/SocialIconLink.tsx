'use client';

import { FC, PropsWithChildren } from 'react';
import { useAudioEffect } from '../../hooks/useAudioEffect';

type Props = {
  href: string;
};

export const SocialIconLink: FC<PropsWithChildren<Props>> = ({
  href,
  children,
}) => {
  const audioRef = useAudioEffect('audio/bloop.mp3');

  function handleHover() {
    audioRef.current?.play();
  }

  return (
    <a
      className=" h-8 w-8 cursor-pointer bg-pink-500 p-2 text-white transition-all hover:scale-110 hover:text-zinc-900 sm:h-10 sm:w-10 dark:text-zinc-900 dark:hover:text-white"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={handleHover}
    >
      {children}
    </a>
  );
};
