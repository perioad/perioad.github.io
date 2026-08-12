import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Prompt } from '../models/db';
import Modal from '../../components/Modal';
import {
  sidebarEmptyNote,
  sidebarHeading,
  sidebarHeadingAction,
  sidebarHeadingRow,
  sidebarRow,
  sidebarRowAction,
  sidebarRowActions,
  sidebarRowLabel,
} from '../utils/sidebarStyles';

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

  const handleAddOrUpdatePrompt = () => {
    if (editingPrompt) {
      updatePrompt(editingPrompt.id!, title.trim(), content.trim());
    } else {
      addPrompt(title.trim(), content.trim());
    }

    closeEditor();
  };

  return (
    <>
      <div className={`${sidebarHeadingRow} p-2 pb-0`}>
        <h2 className={sidebarHeading}>prompts</h2>

        <button
          className={sidebarHeadingAction}
          title="New prompt"
          aria-label="New prompt"
          onClick={() => openEditor(null)}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <ul className="flex flex-col gap-1 p-2">
        {prompts.length === 0 && (
          <li className={sidebarEmptyNote}>no prompts yet</li>
        )}

        {prompts.map((prompt) => (
          <li key={prompt.id} className={sidebarRow}>
            <button
              className={sidebarRowLabel}
              title={prompt.title}
              onClick={() => choosePrompt({ ...prompt })}
            >
              {prompt.title}
            </button>

            <div className={sidebarRowActions}>
              <button
                className={sidebarRowAction}
                title={`Edit prompt: ${prompt.title}`}
                aria-label={`Edit prompt: ${prompt.title}`}
                onClick={() => openEditor(prompt)}
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                className={sidebarRowAction}
                title={`Remove prompt: ${prompt.title}`}
                aria-label={`Remove prompt: ${prompt.title}`}
                onClick={() => removePrompt(prompt)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
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
