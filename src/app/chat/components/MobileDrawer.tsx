import { ReactNode } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  side: 'left' | 'right';
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

// Radix handles what a hand-rolled panel would not: focus is trapped and
// restored, Escape and a tap on the scrim close it, the page behind is made
// inert and stops scrolling, and the whole thing is announced as a dialog.
export default function MobileDrawer({
  isOpen,
  onOpenChange,
  side,
  title,
  children,
  footer,
}: MobileDrawerProps) {
  const sideStyles =
    side === 'left'
      ? 'left-0 border-r data-[state=open]:animate-drawer-in-left data-[state=closed]:animate-drawer-out-left'
      : 'right-0 border-l data-[state=open]:animate-drawer-in-right data-[state=closed]:animate-drawer-out-right';

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 data-[state=closed]:animate-scrim-out data-[state=open]:animate-scrim-in" />

        <Dialog.Content
          // The title says everything there is to say about a list of chats,
          // and Radix warns unless the absence is deliberate.
          aria-describedby={undefined}
          className={`fixed inset-y-0 z-50 flex w-[85%] max-w-xs flex-col border-slate-800 bg-white text-base dark:bg-black ${sideStyles}`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 py-2 pr-2 pl-4">
            <Dialog.Title className="text-sm">{title}</Dialog.Title>

            <Dialog.Close
              className="flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={`Close ${title}`}
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="grow overflow-y-auto overscroll-contain">
            {children}
          </div>

          {footer && (
            <div className="border-t border-slate-800 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
