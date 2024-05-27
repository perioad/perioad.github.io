'use client';

import {
  FC,
  PropsWithChildren,
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';

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

export const AliveContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isAppAlive, setIsAppAlive] = useState(false);

  useEffect(() => {
    setIsAppAlive(true);
  }, []);

  const contextValue = {
    isAppAlive,
  };

  return (
    <AliveContext.Provider value={contextValue}>
      {children}
    </AliveContext.Provider>
  );
};
