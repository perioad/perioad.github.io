'use client';

import { FC, HTMLAttributeAnchorTarget, PropsWithChildren } from 'react';
import { useAudioEffect } from '../../hooks/useAudioEffect';

type Props = {
  href: string;
};

export const CustomLink: FC<PropsWithChildren<Props>> = ({
  href,
  children,
}) => {
  const popSound = useAudioEffect('audio/pop.mp3');
  const isAnchor: boolean = href.startsWith('#');
  const target: HTMLAttributeAnchorTarget = isAnchor ? '_self' : '_blank';

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isAnchor) {
      e.preventDefault();

      const target = document.querySelector(href);

      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function handleHover() {
    popSound.current?.play();
  }

  return (
    <a
      href={href}
      className="inline-block border-b-2 border-pink-500 transition-all hover:scale-105 hover:bg-pink-500 hover:dark:text-zinc-900"
      target={target}
      onClick={handleClick}
      onMouseEnter={handleHover}
    >
      {children}
    </a>
  );
};
