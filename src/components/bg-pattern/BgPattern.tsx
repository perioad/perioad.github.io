'use client';

import { memo } from 'react';
import css from './BgPattern.module.css';
import { useBgAnimationContext } from '../../context/BgAnimationContext';

export const BgPattern = memo(function BgPattern() {
  const { isBgAnimationRunning } = useBgAnimationContext();
  const animationClass = isBgAnimationRunning ? css.runAnimation : '';

  return (
    <div
      className={`${css.pattern} ${animationClass} fixed left-0 top-0 -z-40 h-dvh w-dvw`}
    ></div>
  );
});
