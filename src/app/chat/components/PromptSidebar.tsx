import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Prompt } from '../models/db';
import Modal from '../../components/Modal';

interface PromptSidebarProps {
  prompts: Prompt[];
  addPrompt: (title: string, content: string) => Promise<void>;
  updatePrompt: (id: number, title: string, content: string) => Promise<void>;
  removePrompt: (prompt: Prompt) => void;
  choosePrompt: (prompt: Prompt) => void;
  onEditorOpen?: () => void;
}

// Renders the list only, like `History`: the caller decides between rail and
// drawer. `onEditorOpen` lets the mobile drawer get out of the way, since the
// editor needs the whole screen there.
export default function PromptSidebar({
  prompts,
  addPrompt,
  updatePrompt,
  removePrompt,
  choosePrompt,
  onEditorOpen,
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

    closeEditor();
  };

  function openEditor(prompt: Prompt | null) {
    setEditingPrompt(prompt);
    setTitle(prompt?.title ?? '');
    setContent(prompt?.content ?? '');
    setIsModalOpen(true);
    onEditorOpen?.();
  }

  function closeEditor() {
    setIsModalOpen(false);
    setEditingPrompt(null);
    setTitle('');
    setContent('');
  }

  return (
    <>
      <ul className="flex flex-col gap-1 p-2">
        <li>
          <button
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md transition-colors hover:bg-slate-100 sm:min-h-9 dark:bg-slate-700 dark:hover:bg-slate-600"
            onClick={() => openEditor(null)}
          >
            <Plus className="h-4 w-4" />
            new prompt
          </button>
        </li>

        {prompts.map((prompt) => (
          <li
            key={prompt.id}
            className="group flex items-center rounded-md dark:bg-slate-800"
          >
            <button
              className="min-h-11 grow overflow-hidden px-3 text-left text-ellipsis whitespace-nowrap sm:min-h-9"
              title={prompt.title}
              onClick={() => choosePrompt({ ...prompt })}
            >
              {prompt.title}
            </button>

            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-slate-200 sm:h-9 sm:w-0 sm:opacity-0 sm:group-hover:w-9 sm:group-hover:opacity-100 sm:focus-visible:w-9 sm:focus-visible:opacity-100 dark:hover:bg-slate-700"
              title={`Edit prompt: ${prompt.title}`}
              aria-label={`Edit prompt: ${prompt.title}`}
              onClick={() => openEditor(prompt)}
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-slate-200 sm:h-9 sm:w-0 sm:opacity-0 sm:group-hover:w-9 sm:group-hover:opacity-100 sm:focus-visible:w-9 sm:focus-visible:opacity-100 dark:hover:bg-slate-700"
              title={`Remove prompt: ${prompt.title}`}
              aria-label={`Remove prompt: ${prompt.title}`}
              onClick={() => removePrompt(prompt)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={isModalOpen}
        onClose={closeEditor}
        title={editingPrompt ? 'edit prompt' : 'create prompt'}
      >
        <input
          className="mb-4 w-full rounded-sm bg-slate-700 p-3"
          placeholder="gordon ramsay"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="mb-4 w-full rounded-sm bg-slate-700 p-3"
          placeholder="you're gordon ramsay. teach me how to cook lasagna. pls don't scream"
          value={content}
          rows={4}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          className="min-h-11 w-full rounded-sm bg-green-700 px-4 text-white transition-all hover:bg-green-800 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
          onClick={handleAddOrUpdatePrompt}
          aria-disabled={!title || !content}
        >
          {editingPrompt ? 'update' : 'create'}
        </button>
      </Modal>
    </>
  );
}
