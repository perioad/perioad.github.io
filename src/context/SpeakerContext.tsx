'use client';

import {
  FC,
  PropsWithChildren,
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import {
  allowed,
  disallowed,
  speakerKey,
} from '../constants/local-storage.constants';

type SpeakerContextProps = {
  isSpeakerAllowed: boolean | null;
  setIsSpeakerAllowed: (value: boolean | null) => void;
};

const SpeakerContext = createContext<SpeakerContextProps>({
  isSpeakerAllowed: null,
  setIsSpeakerAllowed: () => {},
});

export const useSpeakerContext = () => {
  const context = useContext(SpeakerContext);

  if (!context) {
    throw new Error('useSpeakerContext must be used within a ContextProvider');
  }

  return context;
};

export const SpeakerContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isSpeakerAllowed, _setIsSpeakerAllowed] = useState<boolean | null>(
    false,
  );

  const setIsSpeakerAllowed = useCallback((value: boolean | null) => {
    if (value !== null) {
      localStorage.setItem(speakerKey, value ? allowed : disallowed);
    }

    _setIsSpeakerAllowed(value);
  }, []);

  const contextValue = useMemo(() => {
    return {
      isSpeakerAllowed,
      setIsSpeakerAllowed,
    };
  }, [isSpeakerAllowed, setIsSpeakerAllowed]);

  useEffect(() => {
    const speaker = localStorage.getItem(speakerKey);

    if (!speaker) {
      setIsSpeakerAllowed(null);

      return;
    }

    setIsSpeakerAllowed(speaker === allowed);
  }, [setIsSpeakerAllowed]);

  return (
    <SpeakerContext.Provider value={contextValue}>
      {children}
    </SpeakerContext.Provider>
  );
};
