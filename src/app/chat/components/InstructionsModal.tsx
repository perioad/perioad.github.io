import { useState } from 'react';
import Modal, { modalField } from '../../components/Modal';

export default function InstructionsModal({
  isOpen,
  instructions,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  instructions: string;
  onSave: (instructions: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(instructions);

  function save() {
    onSave(draft.trim());
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="custom instructions">
      <p className="mb-3 text-slate-500 dark:text-slate-400">
        sent with every chat, before anything you say. a project&apos;s own
        instructions are added after these.
      </p>

      <textarea
        className={`${modalField} h-48 resize-none`}
        placeholder="how would you like replies written? what should be assumed about you?"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />

      <div className="mt-3 flex gap-2">
        <button
          className="flex-1 cursor-pointer rounded-md bg-slate-100 p-2 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          onClick={onClose}
        >
          cancel
        </button>

        <button
          className="flex-1 cursor-pointer rounded-md bg-green-600 p-2 transition-all hover:bg-green-700"
          onClick={save}
        >
          save
        </button>
      </div>
    </Modal>
  );
}
