import { useRef, useState } from 'react';
import Modal from '../../components/Modal';

export default function AskKeyModal({
  isOpen,
  closeModal,
}: {
  isOpen: boolean;
  closeModal: () => void;
}) {
  const keyRef = useRef(localStorage.getItem('key'));
  const [keyValue, setKeyValue] = useState('');

  function updateKey() {
    localStorage.setItem('key', keyValue);
    closeModal();
  }

  function removeKey() {
    localStorage.removeItem('key');
    keyRef.current = null;
    setKeyValue('');
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="insert your openai key">
      <p className="mb-3">
        *it&apos;s stored only in localstorage on your device
      </p>
      {keyRef.current && (
        <>
          <p className="mb-3 break-words">
            your current api key: {keyRef.current}
          </p>
          <button
            className="mb-3 w-full rounded-md bg-red-600 p-2 transition-all hover:bg-red-700 aria-disabled:cursor-not-allowed"
            onClick={removeKey}
          >
            remove
          </button>
        </>
      )}
      <label className="mb-3 block" htmlFor="apikey">
        new api key:
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
      <button
        className="mt-3 w-full rounded-md bg-green-600 p-2 transition-all hover:bg-green-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        aria-disabled={!keyValue}
        onClick={updateKey}
      >
        add
      </button>
    </Modal>
  );
}
