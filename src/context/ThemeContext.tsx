'use client';

import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { dark, light, themeKey } from '../constants/local-storage.constants';

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

// The class on `<html>` is the theme: the head script puts it there before
// React runs and the stylesheet reads it. Watching the class rather than
// keeping a copy in state is what stops the two from disagreeing.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, { attributeFilter: ['class'] });

  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains(dark);
}

const getServerSnapshot = () => false;

export const ThemeContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const isDarkTheme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggleTheme = useCallback(() => {
    const isDarkNow = document.documentElement.classList.toggle(dark);

    localStorage.setItem(themeKey, isDarkNow ? dark : light);
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
