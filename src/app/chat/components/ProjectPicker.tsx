import { Check, Folder, FolderMinus } from 'lucide-react';
import Modal from '../../components/Modal';
import { HistoryRecord, Project } from '../models/db';

interface ProjectPickerProps {
  isOpen: boolean;
  chat: HistoryRecord;
  projects: Project[];
  onPick: (chatId: number, projectId: number | null) => Promise<void>;
  onClose: () => void;
}

const row =
  'flex min-h-11 w-full items-center gap-2 rounded-sm px-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800';

export default function ProjectPicker({
  isOpen,
  chat,
  projects,
  onPick,
  onClose,
}: ProjectPickerProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="move chat">
      <p className="mb-3 text-slate-500 dark:text-slate-400">{chat.title}</p>

      <ul className="flex flex-col gap-1">
        {projects.map((project) => (
          <li key={project.id}>
            <button
              className={row}
              onClick={() => onPick(chat.id, project.id!)}
            >
              <Folder className="h-4 w-4 shrink-0" />

              <span className="grow overflow-hidden text-ellipsis whitespace-nowrap">
                {project.title}
              </span>

              {chat.projectId === project.id && (
                <Check className="h-4 w-4 shrink-0" />
              )}
            </button>
          </li>
        ))}

        <li>
          <button className={row} onClick={() => onPick(chat.id, null)}>
            <FolderMinus className="h-4 w-4 shrink-0" />

            <span className="grow">no project</span>

            {chat.projectId === undefined && (
              <Check className="h-4 w-4 shrink-0" />
            )}
          </button>
        </li>
      </ul>
    </Modal>
  );
}
