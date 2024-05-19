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

type BgAnimationContextProps = {
  isBgAnimationRunning: boolean;
  toggleBgAnimationState: () => void;
};

const BgAnimationContext = createContext<BgAnimationContextProps>({
  isBgAnimationRunning: false,
  toggleBgAnimationState: () => {},
});

export const useBgAnimationContext = () => {
  const context = useContext(BgAnimationContext);

  if (!context) {
    throw new Error(
      'useBgAnimationContext must be used within a ContextProvider',
    );
  }

  return context;
};

export const BgAnimationContextProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [isBgAnimationRunning, setIsBgAnimationRunning] = useState(false);

  const toggleBgAnimationState = useCallback(() => {
    setIsBgAnimationRunning((prev) => !prev);
  }, []);

  const contextValue = useMemo(
    () => ({
      isBgAnimationRunning,
      toggleBgAnimationState,
    }),
    [isBgAnimationRunning, toggleBgAnimationState],
  );

  return (
    <BgAnimationContext.Provider value={contextValue}>
      {children}
    </BgAnimationContext.Provider>
  );
};
