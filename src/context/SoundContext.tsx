'use client';

import {
  FC,
  PropsWithChildren,
  createContext,
  useState,
  useContext,
  useMemo,
  Dispatch,
  SetStateAction,
} from 'react';

type SoundContextProps = {
  isSoundAllowed: boolean | null;
  setIsSoundAllowed: Dispatch<SetStateAction<boolean | null>>;
};

const SoundContext = createContext<SoundContextProps>({
  isSoundAllowed: null,
  setIsSoundAllowed: () => {},
});

export const useSoundContext = () => {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error('useSoundContext must be used within a ContextProvider');
  }

  return context;
};

export const SoundContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isSoundAllowed, setIsSoundAllowed] = useState<boolean | null>(null);

  const contextValue = useMemo(() => {
    return {
      isSoundAllowed,
      setIsSoundAllowed,
    };
  }, [isSoundAllowed]);

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
};
