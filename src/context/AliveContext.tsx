'use client';

import { FC, PropsWithChildren, createContext, useContext } from 'react';
import { useClientValue } from '../hooks/useClientValue';

type AliveContextProps = {
  isAppAlive: boolean;
};

const AliveContext = createContext<AliveContextProps>({
  isAppAlive: false,
});

export const useAliveContext = () => {
  const context = useContext(AliveContext);

  if (!context) {
    throw new Error('useAliveContext must be used within a ContextProvider');
  }

  return context;
};

// "Alive" only ever means that the browser has taken over from the prerendered
// HTML, so the answer is a constant on each side of hydration.
const alive = () => true;

export const AliveContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const isAppAlive = useClientValue(alive, false);

  const contextValue = {
    isAppAlive,
  };

  return (
    <AliveContext.Provider value={contextValue}>
      {children}
    </AliveContext.Provider>
  );
};
