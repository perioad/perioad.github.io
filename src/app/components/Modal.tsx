import { ReactNode } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import { monospace } from '../fonts';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// A field has the panel's own glass behind it rather than the page, so it needs
// a fill of its own to read as somewhere to type.
export const modalField =
  'w-full rounded-sm bg-slate-100 p-3 dark:bg-slate-800';

// Radix rather than a native `dialog`, which puts itself in the top layer and
// traps focus on its own terms: two of those cannot be open at once, so every
// dialog here used to shut the drawer it was opened from. Radix keeps a stack,
// which lets this sit over the drawer and leave it where it was.
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Sheer, so the list the dialog was opened from is still there behind
            it and it is obvious what is being renamed, moved or removed. */}
        <Dialog.Overlay className="fixed inset-0 z-60 bg-black/30 data-[state=closed]:animate-scrim-out data-[state=open]:animate-scrim-in" />

        <Dialog.Content
          // The title carries the whole message in every one of these, and
          // Radix warns unless the absence is deliberate.
          aria-describedby={undefined}
          // A sheet at the bottom of a phone, which puts it within reach and
          // next to the keyboard if it takes input, then a centred panel once
          // there is room for one.
          className={`${monospace.className} fixed inset-x-0 bottom-0 z-70 max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-xl bg-white/25 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-sm backdrop-blur-xs data-[state=closed]:animate-scrim-out data-[state=open]:animate-scrim-in sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:pb-5 dark:bg-black/20`}
        >
          <header className="mb-3 flex items-center justify-between gap-3">
            <Dialog.Title className="text-xl">{title}</Dialog.Title>

            <Dialog.Close
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-slate-100 sm:h-9 sm:w-9 dark:hover:bg-slate-800"
              title="Close"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </header>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
