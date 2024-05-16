'use client';

import {
  FC,
  PropsWithChildren,
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import { dark, light, themeKey } from '../constants/theme.constants';

type ContextProps = {
  isBgAnimationRunning: boolean;
  toggleBgAnimationState: () => void;
  isDarkTheme: boolean;
  toggleTheme: () => void;
};

const MyContext = createContext<ContextProps>({
  isBgAnimationRunning: false,
  toggleBgAnimationState: () => {},
  isDarkTheme: false,
  toggleTheme: () => {},
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
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleBgAnimationState = useCallback(() => {
    setIsBgAnimationRunning((prev) => !prev);
  }, []);

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.toggle(dark);

    setIsDarkTheme((prev) => {
      localStorage.setItem(themeKey, prev ? light : dark);

      return !prev;
    });
  }, []);

  useEffect(() => {
    if (document.documentElement.classList.contains(dark)) {
      setIsDarkTheme(true);
    }
  }, []);

  return (
    <MyContext.Provider
      value={{
        isBgAnimationRunning,
        toggleBgAnimationState,
        isDarkTheme,
        toggleTheme,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};
