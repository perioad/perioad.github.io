import { useState } from 'react';
import { List, Pin, PinOff } from 'lucide-react';
import Modal from '../../components/Modal';
import { Message } from '../models/chat';

export interface PinnedMessage {
  message: Message;
  index: number;
}

interface PinnedBarProps {
  // In conversation order. The bar walks it backwards, since the pin someone
  // wants next is usually the one they added last.
  pinned: PinnedMessage[];
  onJump: (index: number) => void;
  onUnpin: (index: number) => void;
}

function toPreview(content: string): string {
  return content.replace(/\s+/g, ' ').trim();
}

export default function PinnedBar({ pinned, onJump, onUnpin }: PinnedBarProps) {
  const [isListOpen, setIsListOpen] = useState(false);
  // Only ever counts up. Taking it modulo the length at the point of use keeps
  // it in range for free when a message is pinned or unpinned underneath it.
  const [step, setStep] = useState(0);

  if (pinned.length === 0) return null;

  const position = pinned.length - 1 - (step % pinned.length);
  const active = pinned[position];

  function handleCycle() {
    onJump(active.index);
    setStep(step + 1);
  }

  function handleSelect(index: number) {
    setIsListOpen(false);
    onJump(index);
  }

  return (
    <div className="flex items-center gap-1 border-b border-slate-800 px-3 py-1 sm:px-5">
      <button
        className="flex min-w-0 grow items-center gap-2 rounded-md px-2 py-1 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={handleCycle}
        title="Jump to pinned message"
      >
        <Pin className="h-4 w-4 shrink-0 text-sky-500" />

        {pinned.length > 1 && (
          <span className="shrink-0 text-slate-500 dark:text-slate-400">
            {position + 1}/{pinned.length}
          </span>
        )}

        <span className="truncate">{toPreview(active.message.content)}</span>
      </button>

      {pinned.length > 1 && (
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-inherit dark:text-slate-400 dark:hover:bg-slate-800"
          onClick={() => setIsListOpen(true)}
          title="All pinned messages"
          aria-label="All pinned messages"
        >
          <List className="h-5 w-5" />
        </button>
      )}

      <Modal
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        title="Pinned messages"
      >
        <ul className="flex max-h-[50dvh] flex-col gap-1 overflow-y-auto overscroll-contain">
          {pinned.map(({ message, index }) => (
            // A flex row rather than a plain block, so the button is blockified.
            // Left inline, it sits on the row's text baseline, and the descender
            // space that leaves underneath varies with how many lines the preview
            // runs to.
            <li key={index} className="flex items-center gap-1">
              <button
                className="min-w-0 grow rounded-md p-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => handleSelect(index)}
              >
                <span className="block text-slate-500 dark:text-slate-400">
                  {message.role === 'user' ? 'you' : 'assistant'}
                </span>

                <span className="line-clamp-2">
                  {toPreview(message.content)}
                </span>
              </button>

              <button
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-inherit sm:h-9 sm:w-9 dark:text-slate-400 dark:hover:bg-slate-800"
                onClick={() => onUnpin(index)}
                title="Unpin message"
                aria-label="Unpin message"
              >
                <PinOff className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
