'use client';

import { memo } from 'react';
import css from './BgPattern.module.css';
import { usePlayStateContext } from '../../context/PlayStateContext';

export const BgPattern = memo(function BgPattern() {
  const { isPlaying } = usePlayStateContext();
  const animationClass = isPlaying ? '' : '[animation-play-state:paused]';

  return (
    <div
      className={`${css.pattern} ${animationClass} fixed top-0 left-0 -z-40 h-dvh w-dvw animate-bg-pattern motion-reduce:animate-none`}
    ></div>
  );
});
