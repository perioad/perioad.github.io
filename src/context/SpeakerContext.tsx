'use client';

import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
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

// The stored preference is the answer, so it is read straight out of storage
// rather than copied into state on mount. `null` means the visitor has not been
// asked yet, which is what the speaker prompt looks for.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);

  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot() {
  const speaker = localStorage.getItem(speakerKey);

  return speaker ? speaker === allowed : null;
}

// Sound is off in the prerendered HTML, and a visitor who has already allowed
// it is not the one this frame is shown to.
const getServerSnapshot = () => false;

function writeSpeaker(value: boolean | null) {
  if (value === null) {
    localStorage.removeItem(speakerKey);
  } else {
    localStorage.setItem(speakerKey, value ? allowed : disallowed);
  }

  listeners.forEach((listener) => listener());
}

export const SpeakerContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const isSpeakerAllowed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const contextValue = useMemo(() => {
    return {
      isSpeakerAllowed,
      setIsSpeakerAllowed: writeSpeaker,
    };
  }, [isSpeakerAllowed]);

  return (
    <SpeakerContext.Provider value={contextValue}>
      {children}
    </SpeakerContext.Provider>
  );
};
