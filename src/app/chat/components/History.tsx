import { KeyboardEvent, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FolderInput,
  FolderPlus,
  Pencil,
  Plus,
  Settings2,
  Trash2,
} from 'lucide-react';
import { HistoryRecord, Project } from '../models/db';

interface HistoryProps {
  history: HistoryRecord[];
  projects: Project[];
  selectChat: (id: number) => void;
  removeChat: (chat: HistoryRecord) => void;
  renameChat: (id: number, title: string) => Promise<void>;
  moveChat: (chat: HistoryRecord) => void;
  currentChatId: number;
  createProject: () => void;
  editProject: (project: Project) => void;
  startProjectChat: (projectId: number) => void;
}

const rowAction =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-slate-200 sm:h-9 sm:w-0 sm:opacity-0 sm:group-hover:w-9 sm:group-hover:opacity-100 sm:focus-visible:w-9 sm:focus-visible:opacity-100 dark:hover:bg-slate-700';

const emptyNote = 'px-3 py-2 text-slate-500 dark:text-slate-400';

// Renders the list only. The container is the caller's business, because it is
// an inline rail on desktop and a drawer on mobile.
export default function History({
  history,
  projects,
  selectChat,
  removeChat,
  renameChat,
  moveChat,
  currentChatId,
  createProject,
  editProject,
  startProjectChat,
}: HistoryProps) {
  // Renaming happens in the row rather than in a dialog. A dialog would have to
  // close the drawer it was opened from, because the two would otherwise fight
  // over the focus the drawer traps, and losing the list to rename one line in
  // it is a poor trade.
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  function startRename(chat: HistoryRecord) {
    setRenamingId(chat.id);
    setTitle(chat.title);
  }

  function cancelRename() {
    setRenamingId(null);
    setTitle('');
  }

  function commitRename(chat: HistoryRecord) {
    const newTitle = title.trim();

    if (newTitle && newTitle !== chat.title) {
      renameChat(chat.id, newTitle);
    }

    cancelRename();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    chat: HistoryRecord,
  ) {
    if (event.key === 'Enter') {
      commitRename(chat);
    }

    if (event.key === 'Escape') {
      // The drawer closes on Escape too, and abandoning a rename should not
      // take the whole panel with it.
      event.stopPropagation();
      cancelRename();
    }
  }

  function toggleProject(id: number) {
    setExpandedIds((ids) =>
      ids.includes(id) ? ids.filter((open) => open !== id) : [...ids, id],
    );
  }

  // A chat filed under a project that no longer exists is shown loose rather
  // than hidden, so nothing can be lost by deleting a folder.
  const projectIds = new Set(projects.map(({ id }) => id));

  const chatsInProject = (projectId?: number) =>
    history.filter((chat) => chat.projectId === projectId);

  const looseChats = history.filter(
    ({ projectId }) => projectId === undefined || !projectIds.has(projectId),
  );

  const chatRow = (chat: HistoryRecord) => (
    <li
      className={`${chat.id === currentChatId ? 'bg-slate-100 dark:bg-slate-800' : ''} group flex items-center rounded-md`}
      key={chat.id}
    >
      {renamingId === chat.id ? (
        <input
          autoFocus
          className="min-h-11 w-full min-w-0 rounded-md bg-white px-3 sm:min-h-9 dark:bg-slate-900"
          value={title}
          aria-label={`Rename chat: ${chat.title}`}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => handleKeyDown(event, chat)}
          // Tapping away is how a rename is finished on a phone, where there
          // is nowhere to put a confirm button that the keyboard will not
          // cover.
          onBlur={() => commitRename(chat)}
        />
      ) : (
        <>
          <button
            className="min-h-11 grow overflow-hidden px-3 text-left text-ellipsis whitespace-nowrap sm:min-h-9"
            title={chat.title}
            onClick={() => selectChat(chat.id)}
          >
            {chat.title}
          </button>

          <button
            className={rowAction}
            title={`Rename chat: ${chat.title}`}
            aria-label={`Rename chat: ${chat.title}`}
            onClick={() => startRename(chat)}
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* Nowhere to move a chat to until there is a project, and the row is
              tight enough without a button that opens an empty list. */}
          {projects.length > 0 && (
            <button
              className={rowAction}
              title={`Move chat: ${chat.title}`}
              aria-label={`Move chat: ${chat.title}`}
              onClick={() => moveChat(chat)}
            >
              <FolderInput className="h-4 w-4" />
            </button>
          )}

          <button
            className={rowAction}
            title={`Remove chat: ${chat.title}`}
            aria-label={`Remove chat: ${chat.title}`}
            onClick={() => removeChat(chat)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
      )}
    </li>
  );

  return (
    <div className="flex flex-col gap-1 p-2">
      <button
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md transition-colors hover:bg-slate-100 sm:min-h-9 dark:bg-slate-700 dark:hover:bg-slate-600"
        onClick={createProject}
      >
        <FolderPlus className="h-4 w-4" />
        new project
      </button>

      {projects.length > 0 && (
        <ul className="flex flex-col gap-1">
          {projects.map((project) => {
            const chats = chatsInProject(project.id);
            // The project holding the current chat stays open on its own, so
            // selecting a chat inside one never hides what is being read.
            const isExpanded =
              expandedIds.includes(project.id!) ||
              chats.some(({ id }) => id === currentChatId);

            return (
              <li key={project.id}>
                <div className="group flex items-center rounded-md">
                  <button
                    className="flex min-h-11 grow items-center gap-2 overflow-hidden px-2 text-left sm:min-h-9"
                    onClick={() => toggleProject(project.id!)}
                    aria-expanded={isExpanded}
                    title={project.title}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}

                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {project.title}
                    </span>
                  </button>

                  <button
                    className={rowAction}
                    title={`New chat in ${project.title}`}
                    aria-label={`New chat in ${project.title}`}
                    onClick={() => startProjectChat(project.id!)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>

                  <button
                    className={rowAction}
                    title={`Project settings: ${project.title}`}
                    aria-label={`Project settings: ${project.title}`}
                    onClick={() => editProject(project)}
                  >
                    <Settings2 className="h-4 w-4" />
                  </button>
                </div>

                {isExpanded && (
                  <ul className="ml-4 flex flex-col gap-1 border-l border-slate-300 pl-1 dark:border-slate-700">
                    {chats.length === 0 ? (
                      <li className={emptyNote}>no chats yet</li>
                    ) : (
                      chats.map(chatRow)
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {looseChats.length === 0 ? (
        <p className={emptyNote}>no chats yet</p>
      ) : (
        <ul className="flex flex-col gap-1">{looseChats.map(chatRow)}</ul>
      )}
    </div>
  );
}
