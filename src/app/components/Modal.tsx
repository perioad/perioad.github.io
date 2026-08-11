import React, { MouseEvent, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog) {
      if (isOpen) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }
  }, [isOpen]);

  // A `dialog` fills its own backdrop, so a click that lands on the element
  // itself rather than on anything inside it came from outside the panel.
  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      // Pinned to the bottom as a sheet on phones, which puts it within reach
      // and next to the keyboard if the content takes input, then becomes a
      // centred panel once there is room for one.
      className="mt-auto mb-0 w-full max-w-none rounded-t-xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop:bg-black/60 sm:m-auto sm:max-w-md sm:rounded-xl sm:pb-5 dark:bg-slate-900 dark:text-slate-100"
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-xl">{title}</h1>

        <button
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-slate-100 sm:h-9 sm:w-9 dark:hover:bg-slate-800"
          onClick={onClose}
          title="Close"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <main>{children}</main>
    </dialog>
  );
}
