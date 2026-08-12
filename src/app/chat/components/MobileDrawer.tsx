import { ReactNode } from 'react';
import { Dialog } from 'radix-ui';
import { monospace } from '../../fonts';
import { useMeasuredHeight } from '../hooks/useMeasuredHeight';

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
  const measureFooter = useMeasuredHeight('--drawer-footer-height');
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
          className={`${monospace.className} fixed inset-y-0 z-50 flex w-[85%] max-w-xs flex-col text-base ${sideStyles}`}
        >
          {/* The drawer's own glass, as a layer behind its contents rather than
              on the drawer itself. An element carrying a backdrop filter is
              where the sampling stops for everything inside it, so with this on
              the parent the footer's own glass had nothing left to blur. */}
          <div className="absolute inset-0 -z-10 bg-white/25 backdrop-blur-xs dark:bg-black/20" />

          {/* No bar across the top: no close button, since the scrim, Escape
              and the back gesture all dismiss it, and no visible title, since
              the panel below heads its own sections and would say the word
              twice. The name is still here for a screen reader, which Radix
              requires and which is the only thing the bar was carrying. */}
          <Dialog.Title className="sr-only">{title}</Dialog.Title>

          {/* Room left at the end for as much of the footer as there is, so the
              last chat can still be scrolled clear of it. */}
          <div
            className={`scrollbar-hidden grow overflow-y-auto overscroll-contain ${
              footer ? 'pb-(--drawer-footer-height,4rem)' : ''
            }`}
          >
            {children}
          </div>

          {footer && (
            <div
              ref={measureFooter}
              // Over the list rather than under it, the way the header and the
              // composer sit over the conversation: the chats carry on beneath
              // and show through instead of stopping at a line.
              //
              // Blurred harder than those two, and tinted barely more. They
              // cover a conversation, which is mostly the space between the
              // messages; this covers a column of titles, and it is the blur
              // that has to keep those from being read through it.
              className="absolute inset-x-0 bottom-0 bg-white/35 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-lg dark:bg-black/30"
            >
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
