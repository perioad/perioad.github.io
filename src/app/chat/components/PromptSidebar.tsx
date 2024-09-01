import { useState } from 'react';
import { Prompt } from '../models/db';
import Modal from '../../components/Modal';

interface PromptSidebarProps {
  isVisible: boolean;
  prompts: Prompt[];
  addPrompt: (title: string, content: string) => Promise<void>;
  updatePrompt: (id: number, title: string, content: string) => Promise<void>;
  removePrompt: (id: number) => Promise<void>;
  choosePrompt: (prompt: Prompt) => void;
}

export default function PromptSidebar({
  isVisible,
  prompts,
  addPrompt,
  updatePrompt,
  removePrompt,
  choosePrompt,
}: PromptSidebarProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  const handleAddOrUpdatePrompt = () => {
    if (editingPrompt) {
      updatePrompt(editingPrompt.id!, title.trim(), content.trim());
    } else {
      addPrompt(title.trim(), content.trim());
    }
    setIsModalOpen(false);
    setTitle('');
    setContent('');
    setEditingPrompt(null);
  };

  const handleRemovePrompt = (prompt: Prompt) => {
    if (
      prompt &&
      confirm(`are you sure you want to remove "${prompt.title}" prompt?`)
    ) {
      removePrompt(prompt.id!);
    }
  };

  const openEditModal = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setTitle(prompt.title);
    setContent(prompt.content);
    setIsModalOpen(true);
  };

  return (
    <aside
      className={`${isVisible ? 'w-full sm:w-56' : 'w-0'} h-full flex-shrink-0 overflow-y-auto border-l border-l-slate-800 text-base transition-all sm:text-sm`}
    >
      <ul className="flex flex-col gap-3 p-3">
        <button
          className="h-auto w-full items-stretch overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2 py-3 text-2xl transition-all hover:bg-slate-800 sm:h-9 sm:py-0 dark:bg-slate-700 "
          onClick={() => setIsModalOpen(true)}
        >
          +
        </button>

        {prompts.map((prompt) => (
          <li
            key={prompt.id}
            className={`group relative flex h-auto w-full items-stretch overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2 py-3 transition-all sm:h-9 sm:py-0 dark:bg-slate-800`}
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
            <button
              className="w-9 flex-shrink-0 text-3xl transition-all hover:scale-125 sm:w-0 sm:text-sm sm:opacity-0 sm:focus-visible:w-9 sm:focus-visible:opacity-100 sm:group-hover:w-9 sm:group-hover:opacity-100"
              onClick={() => openEditModal(prompt)}
            >
              ✏️
            </button>
            <button
              className="w-9 flex-shrink-0 text-3xl transition-all hover:scale-125 sm:w-0 sm:text-sm sm:opacity-0 sm:focus-visible:w-9 sm:focus-visible:opacity-100 sm:group-hover:w-9 sm:group-hover:opacity-100"
              onClick={() => handleRemovePrompt(prompt)}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPrompt(null);
          setTitle('');
          setContent('');
        }}
        title={editingPrompt ? 'edit prompt' : 'create prompt'}
      >
        <input
          className="mb-4 w-full rounded bg-slate-700 p-2"
          placeholder="gordon ramsay"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="mb-4 w-full rounded bg-slate-700 p-2"
          placeholder="you're gordon ramsay. teach me how to cook lasagna. pls don't scream"
          value={content}
          rows={4}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          className="w-full rounded bg-green-700 px-4 py-2 text-white transition-all hover:bg-green-800 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
          onClick={handleAddOrUpdatePrompt}
          aria-disabled={!title || !content}
        >
          {editingPrompt ? 'update' : 'create'}
        </button>
      </Modal>
    </aside>
  );
}
