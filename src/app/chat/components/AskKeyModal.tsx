import { useRef, useState } from 'react';

export default function AskKeyModal({
  closeModal,
}: {
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
  }

  return (
    <>
      <div className="absolute left-0 top-0 z-50 h-full w-full bg-black/50"></div>

      <dialog
        open
        className="absolute left-1/2 top-1/2 z-50 m-0 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-md p-5 sm:w-auto dark:bg-slate-900 dark:text-slate-100"
      >
        <header>
          <h1 className="mb-3 text-xl">insert your openai api key</h1>
          <p>*it&apos;s stored only in localstorage on your device</p>
          <button
            className="absolute right-5 top-3 transition-all hover:scale-110"
            onClick={closeModal}
          >
            ❌
          </button>
        </header>

        <main>
          {keyRef.current && (
            <>
              <p className="mb-3 break-words">
                your current api key: {keyRef.current}
              </p>

              <button
                className="mb-3 w-full rounded-md bg-red-600 p-2 transition-all hover:bg-red-700 aria-disabled:cursor-not-allowed"
                onClick={removeKey}
              >
                Remove
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
        </main>

        <button
          className="w-full rounded-md bg-green-600 p-2 transition-all hover:bg-green-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
          aria-disabled={!keyValue}
          onClick={updateKey}
        >
          Add
        </button>
      </dialog>
    </>
  );
}
