import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal, { modalField } from '../../components/Modal';
import { Project } from '../models/db';

interface ProjectSettingsProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (project: Project) => Promise<void>;
  onRemove: (project: Project) => void;
}

// Remounted on every visit by the key the caller gives it, so each one starts
// from the saved project rather than from whatever was typed and abandoned the
// last time. It cannot simply be unmounted on close instead: it has to stay
// long enough to animate out.
export default function ProjectSettings({
  isOpen,
  project,
  onClose,
  onSave,
  onRemove,
}: ProjectSettingsProps) {
  const [title, setTitle] = useState(project?.title ?? '');
  const [instructions, setInstructions] = useState(project?.instructions ?? '');

  function handleSave() {
    if (!title.trim()) {
      return;
    }

    onSave({
      id: project?.id,
      title: title.trim(),
      instructions: instructions.trim(),
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project?.id ? 'project settings' : 'new project'}
    >
      <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
        name
      </label>
      <input
        className={`${modalField} mb-4`}
        placeholder="job hunt"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
        instructions
      </label>
      <textarea
        className={`${modalField} mb-4`}
        placeholder="you're my career coach. be blunt, keep it to bullet points, ask before rewriting anything"
        value={instructions}
        rows={4}
        onChange={(event) => setInstructions(event.target.value)}
      />

      <div className="flex gap-3">
        {project?.id && (
          <button
            className="flex min-h-11 shrink-0 items-center justify-center rounded-sm bg-red-700 px-4 text-white transition-colors hover:bg-red-800"
            onClick={() => onRemove(project)}
            title={`Remove project: ${project.title}`}
            aria-label={`Remove project: ${project.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        <button
          className="min-h-11 grow rounded-sm bg-green-700 px-4 text-white transition-all hover:bg-green-800 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
          onClick={handleSave}
          aria-disabled={!title.trim()}
        >
          {project?.id ? 'save' : 'create'}
        </button>
      </div>
    </Modal>
  );
}
