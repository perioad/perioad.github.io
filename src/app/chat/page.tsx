'use client';

import { useEffect, useState } from 'react';
import AskKeyModal from './components/AskKeyModal';
import Chat from './components/Chat';
import { Source_Code_Pro } from 'next/font/google';

const font = Source_Code_Pro({ weight: '400', subsets: ['latin'] });

export default function ChatPage() {
  const [isKeyModalDisplayed, setIsKeyModalDisplayed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);

    const apiKey = localStorage.getItem('key');

    if (!apiKey) {
      setIsKeyModalDisplayed(true);
    }
  }, []);

  function openKeyModal() {
    setIsKeyModalDisplayed(true);
  }

  function closeModal() {
    setIsKeyModalDisplayed(false);
  }

  if (!isInitialized) {
    return (
      <main className="w-dvh flex h-dvh items-center justify-center">
        <p className=" animate-spin text-4xl">⏳</p>
      </main>
    );
  }

  return (
    <main
      className={`${font.className} w-dvh relative flex h-dvh flex-col text-sm`}
    >
      <AskKeyModal closeModal={closeModal} isOpen={isKeyModalDisplayed} />

      <Chat openKeyModal={openKeyModal} />
    </main>
  );
}
