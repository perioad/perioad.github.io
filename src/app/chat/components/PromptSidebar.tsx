import { useState, useRef } from 'react';
import { Prompt } from '../models/db';

interface PromptSidebarProps {
  isVisible: boolean;
  prompts: Prompt[];
  addPrompt: (title: string, content: string) => Promise<void>;
  choosePrompt: (prompt: Prompt) => void;
}

export default function PromptSidebar({
  isVisible,
  prompts,
  addPrompt,
  choosePrompt,
}: PromptSidebarProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleAddPrompt = () => {
    addPrompt(title, content);
    dialogRef.current?.close();
    setTitle('');
    setContent('');
  };

  return (
    <aside
      className={`${isVisible ? 'w-full sm:w-56' : 'w-0'} h-full flex-shrink-0 overflow-y-auto border-l border-l-slate-800 text-base transition-all sm:text-sm`}
    >
      <ul className="flex flex-col gap-3 p-3">
        <button
          className="h-auto w-full items-stretch overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2 py-3 text-2xl transition-all hover:scale-105 sm:h-9 sm:py-0 dark:bg-slate-600 "
          onClick={() => dialogRef.current?.showModal()}
        >
          +
        </button>

        {prompts.map((prompt) => (
          <li
            key={prompt.id}
            className={`group flex h-auto w-full items-stretch overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2 py-3 transition-all hover:scale-105 sm:h-9 sm:py-0 dark:bg-slate-800`}
          >
            <button
              className={` w-full overflow-hidden overflow-ellipsis whitespace-nowrap`}
              title={prompt.title}
              onClick={() => {
                choosePrompt({ ...prompt });
              }}
            >
              {prompt.title}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className="w-96 rounded-lg bg-slate-800 p-6 backdrop:bg-black backdrop:bg-opacity-50"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Prompt</h2>
          <button onClick={() => dialogRef.current?.close()}>✕</button>
        </div>
        <input
          className="mb-4 w-full rounded bg-slate-700 p-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="mb-4 w-full rounded bg-slate-700 p-2"
          placeholder="Prompt"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        <button
          className="w-full rounded bg-slate-600 px-4 py-2 text-white"
          onClick={handleAddPrompt}
        >
          Add
        </button>
      </dialog>
    </aside>
  );
}
