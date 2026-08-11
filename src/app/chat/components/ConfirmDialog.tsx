import Modal from '../../components/Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Replaces `confirm()`, which renders as a system alert that looks nothing like
// the page on mobile and blocks the main thread while it is up.
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="mb-5 wrap-break-word">{message}</p>

      <div className="flex gap-3">
        <button
          className="min-h-11 grow rounded-sm bg-slate-700 px-4 text-white transition-colors hover:bg-slate-600"
          onClick={onCancel}
        >
          cancel
        </button>

        <button
          className="min-h-11 grow rounded-sm bg-red-700 px-4 text-white transition-colors hover:bg-red-800"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
