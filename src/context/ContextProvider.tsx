'use client';

import { FC, PropsWithChildren } from 'react';
import { PlayStateContextProvider } from './PlayStateContext';
import { ThemeContextProvider } from './ThemeContext';
import { FontContextProvider } from './FontContext';
import { SpeakerContextProvider } from './SpeakerContext';
import { AliveContextProvider } from './AliveContext';

export const ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <PlayStateContextProvider>
      <ThemeContextProvider>
        <SpeakerContextProvider>
          <AliveContextProvider>
            <FontContextProvider>{children}</FontContextProvider>
          </AliveContextProvider>
        </SpeakerContextProvider>
      </ThemeContextProvider>
    </PlayStateContextProvider>
  );
};
