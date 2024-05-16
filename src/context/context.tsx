'use client';

import {
  FC,
  PropsWithChildren,
  createContext,
  useState,
  useContext,
} from 'react';

type ContextProps = {
  isBgAnimationRunning: boolean;
  changeBgAnimationState: () => void;
};

const MyContext = createContext<ContextProps>({
  isBgAnimationRunning: false,
  changeBgAnimationState: () => {},
});

export const useMyContext = () => {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error('useMyContext must be used within a MyContextProvider');
  }

  return context;
};

export const MyContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isBgAnimationRunning, setIsBgAnimationRunning] = useState(false);

  const changeBgAnimationState = () => {
    setIsBgAnimationRunning(!isBgAnimationRunning);
  };

  return (
    <MyContext.Provider
      value={{ isBgAnimationRunning, changeBgAnimationState }}
    >
      {children}
    </MyContext.Provider>
  );
};
