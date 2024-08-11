'use client';

import {
  FC,
  PropsWithChildren,
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';

type PlayStateContextProps = {
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
};

const PlayStateContext = createContext<PlayStateContextProps>({
  isPlaying: false,
  setIsPlaying: () => {},
});

export const usePlayStateContext = () => {
  const context = useContext(PlayStateContext);

  if (!context) {
    throw new Error(
      'usePlayStateContext must be used within a ContextProvider',
    );
  }

  return context;
};

export const PlayStateContextProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [isPlaying, _setIsPlaying] = useState(false);

  const setIsPlaying = useCallback((value: boolean) => {
    _setIsPlaying(value);
  }, []);

  const contextValue = useMemo(
    () => ({
      isPlaying,
      setIsPlaying,
    }),
    [isPlaying, setIsPlaying],
  );

  return (
    <PlayStateContext.Provider value={contextValue}>
      {children}
    </PlayStateContext.Provider>
  );
};
