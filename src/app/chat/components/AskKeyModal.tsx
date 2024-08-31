import { useState } from 'react';
import Modal from '../../components/Modal';

export default function AskKeyModal({
  isOpen,
  closeModal,
}: {
  isOpen: boolean;
  closeModal: () => void;
}) {
  const [keyValue, setKeyValue] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('key') || '';
    }
    return '';
  });

  function updateKey() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('key', keyValue);
      closeModal();
    }
  }

  function removeKey() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('key');
      setKeyValue('');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Insert your OpenAI key">
      <p className="mb-3">
        *it&apos;s stored only in localstorage on your device
      </p>
      <label className="mb-3 block" htmlFor="apikey">
        api key:
      </label>
      <input
        className="w-full rounded-md border p-2 dark:bg-slate-700"
        type="text"
        minLength={1}
        id="apikey"
        required
        value={keyValue}
        onChange={(e) => setKeyValue(e.target.value.trim())}
      />
      <div className="mt-3 flex gap-2">
        {keyValue && (
          <button
            className="flex-1 rounded-md bg-red-600 p-2 transition-all hover:bg-red-700 aria-disabled:cursor-not-allowed"
            onClick={removeKey}
          >
            remove
          </button>
        )}

        <button
          className="flex-1 rounded-md bg-green-600 p-2 transition-all hover:bg-green-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
          aria-disabled={!keyValue}
          onClick={updateKey}
        >
          add
        </button>
      </div>
    </Modal>
  );
}
