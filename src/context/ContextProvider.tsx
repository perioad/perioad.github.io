'use client';

import { FC, PropsWithChildren } from 'react';
import { BgAnimationContextProvider } from './BgAnimationContext';
import { ThemeContextProvider } from './ThemeContext';
import { FontContextProvider } from './FontContext';
import { SpeakerContextProvider } from './SpeakerContext';

export const ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <BgAnimationContextProvider>
      <ThemeContextProvider>
        <SpeakerContextProvider>
          <FontContextProvider>{children}</FontContextProvider>
        </SpeakerContextProvider>
      </ThemeContextProvider>
    </BgAnimationContextProvider>
  );
};
