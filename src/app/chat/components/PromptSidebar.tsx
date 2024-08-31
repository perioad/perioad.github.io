import { useState } from 'react';
import { Prompt } from '../models/db';
import Modal from '../../components/Modal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPrompt = () => {
    addPrompt(title.trim(), content.trim());
    setIsModalOpen(false);
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
          onClick={() => setIsModalOpen(true)}
        >
          +
        </button>

        {prompts.map((prompt) => (
          <li
            key={prompt.id}
            className={`group flex h-auto w-full items-stretch overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2 py-3 transition-all hover:scale-105 sm:h-9 sm:py-0 dark:bg-slate-800`}
          >
            <button
              className={`w-full overflow-hidden overflow-ellipsis whitespace-nowrap`}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Prompt"
      >
        <input
          className="mb-4 w-full rounded bg-slate-700 p-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value.trim())}
        />
        <textarea
          className="mb-4 w-full rounded bg-slate-700 p-2"
          placeholder="Prompt"
          value={content}
          rows={4}
          onChange={(e) => setContent(e.target.value.trim())}
        />
        <button
          className="w-full rounded bg-slate-600 px-4 py-2 text-white transition-all hover:bg-slate-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
          onClick={handleAddPrompt}
          aria-disabled={!title.trim() || !content.trim()}
        >
          Add
        </button>
      </Modal>
    </aside>
  );
}
