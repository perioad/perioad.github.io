'use client';

import { FC, PropsWithChildren } from 'react';
import { BgAnimationContextProvider } from './BgAnimationContext';
import { ThemeContextProvider } from './ThemeContext';
import { FontContextProvider } from './FontContext';
import { SoundContextProvider } from './SoundContext';

export const ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <BgAnimationContextProvider>
      <ThemeContextProvider>
        <SoundContextProvider>
          <FontContextProvider>{children}</FontContextProvider>
        </SoundContextProvider>
      </ThemeContextProvider>
    </BgAnimationContextProvider>
  );
};
