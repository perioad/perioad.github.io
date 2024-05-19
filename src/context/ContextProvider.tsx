'use client';

import { FC, PropsWithChildren } from 'react';
import { BgAnimationContextProvider } from './BgAnimationContext';
import { ThemeContextProvider } from './ThemeContext';
import { FontContextProvider } from './FontContext';

export const ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <BgAnimationContextProvider>
      <ThemeContextProvider>
        <FontContextProvider>{children}</FontContextProvider>
      </ThemeContextProvider>
    </BgAnimationContextProvider>
  );
};
