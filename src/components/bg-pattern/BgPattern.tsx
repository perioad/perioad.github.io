'use client';

import { useMyContext } from '../../context/context';
import css from './BgPattern.module.css';

export const BgPattern = () => {
  const { isBgAnimationRunning } = useMyContext();
  const animationClass = isBgAnimationRunning ? css.runAnimation : '';

  return (
    <div
      className={`${css.pattern} ${animationClass} fixed left-0 top-0 -z-40 h-dvh w-dvw`}
    ></div>
  );
};
