import { ReactNode } from 'react';
import { Dialog } from 'radix-ui';

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
      ? 'left-0 data-[state=open]:animate-drawer-in-left data-[state=closed]:animate-drawer-out-left'
      : 'right-0 data-[state=open]:animate-drawer-in-right data-[state=closed]:animate-drawer-out-right';

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 data-[state=closed]:animate-scrim-out data-[state=open]:animate-scrim-in" />

        <Dialog.Content
          // The title says everything there is to say about a list of chats,
          // and Radix warns unless the absence is deliberate.
          aria-describedby={undefined}
          className={`fixed inset-y-0 z-50 flex w-[85%] max-w-xs flex-col bg-white/25 text-base backdrop-blur-xs dark:bg-black/20 ${sideStyles}`}
        >
          {/* No bar across the top: no close button, since the scrim, Escape
              and the back gesture all dismiss it, and no visible title, since
              the panel below heads its own sections and would say the word
              twice. The name is still here for a screen reader, which Radix
              requires and which is the only thing the bar was carrying. */}
          <Dialog.Title className="sr-only">{title}</Dialog.Title>

          <div className="grow overflow-y-auto overscroll-contain">
            {children}
          </div>

          {footer && (
            <div className="p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
