import React, { useEffect, useRef } from 'react';

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

  return (
    <dialog
      ref={dialogRef}
      className="m-0 m-auto w-full max-w-md rounded-md p-5 dark:bg-slate-900 dark:text-slate-100"
      onClose={onClose}
    >
      <header>
        <h1 className="mb-3 text-xl">{title}</h1>
        <button
          className="absolute right-5 top-3 transition-all hover:scale-110"
          onClick={onClose}
        >
          ❌
        </button>
      </header>
      <main>{children}</main>
    </dialog>
  );
}
