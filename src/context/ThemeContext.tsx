'use client';

import {
  FC,
  PropsWithChildren,
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { dark, light, themeKey } from '../constants/theme.constants';

type ThemeContextProps = {
  isDarkTheme: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextProps>({
  isDarkTheme: false,
  toggleTheme: () => {},
});

export const useThemeContext = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within a ContextProvider');
  }

  return context;
};

export const ThemeContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

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

  const contextValue = useMemo(
    () => ({
      isDarkTheme,
      toggleTheme,
    }),
    [isDarkTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
