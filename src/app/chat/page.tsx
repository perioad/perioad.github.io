'use client';

import { useEffect, useState } from 'react';
import AskKeyModal from './components/AskKeyModal';
import Chat from './components/Chat';
import { Spinner } from '../../components/spinner/Spinner';
import { useVisualViewport } from '../../hooks/useVisualViewport';
import { useClientValue } from '../../hooks/useClientValue';
import { monospace } from '../fonts';

const ready = () => true;
const hasApiKey = () => localStorage.getItem('key') !== null;

export default function ChatPage() {
  // Nothing here can be prerendered: the key, the chats and the viewport all
  // live in the browser, so the spinner stands in until it is there.
  const isInitialized = useClientValue(ready, false);
  // Asking for a key is the default rather than something an effect switches
  // on, so the stored key decides and the state only records the visitor
  // overruling it by closing or reopening the dialog.
  const hasKey = useClientValue(hasApiKey, true);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean | null>(null);
  const viewport = useVisualViewport();

  const isKeyModalDisplayed = isKeyModalOpen ?? !hasKey;

  useEffect(() => {
    // The chat fills the screen and scrolls internally, so a scrollable document
    // behind it does nothing except give iOS somewhere to push the page when the
    // keyboard opens.
    const { overflow } = document.body.style;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  function openKeyModal() {
    setIsKeyModalOpen(true);
  }

  function closeModal() {
    setIsKeyModalOpen(false);
  }

  if (!isInitialized) {
    return (
      <main className="flex h-dvh w-dvw items-center justify-center">
        <div className="h-20 w-20">
          <Spinner />
        </div>
      </main>
    );
  }

  // Pinned to the visual viewport rather than laid out in the document. Sizing
  // alone is not enough: iOS scrolls the layout viewport to clear the keyboard,
  // which carries a document-flow app off the top of the screen. `top` does the
  // compensating instead of a transform, which would make this element the
  // containing block for the drawers and dialogs inside it.
  const viewportStyle = viewport
    ? { height: `${viewport.height}px`, top: `${viewport.offsetTop}px` }
    : undefined;

  return (
    <main
      className={`${monospace.className} fixed inset-x-0 top-0 flex h-dvh flex-col text-sm`}
      style={viewportStyle}
    >
      <AskKeyModal closeModal={closeModal} isOpen={isKeyModalDisplayed} />

      <Chat openKeyModal={openKeyModal} />
    </main>
  );
}
