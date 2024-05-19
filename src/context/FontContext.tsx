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

type FontContextProps = {
  isDyslexicFont: boolean;
  toggleFont: () => void;
};

const FontContext = createContext<FontContextProps>({
  isDyslexicFont: false,
  toggleFont: () => {},
});

export const useFontContext = () => {
  const context = useContext(FontContext);

  if (!context) {
    throw new Error('useFontContext must be used within a ContextProvider');
  }

  return context;
};

export const FontContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);

  const toggleFont = useCallback(() => {
    setIsDyslexicFont((prev) => !prev);
  }, []);

  const contextValue = useMemo(
    () => ({
      isDyslexicFont,
      toggleFont,
    }),
    [isDyslexicFont, toggleFont],
  );

  return (
    <FontContext.Provider value={contextValue}>{children}</FontContext.Provider>
  );
};
