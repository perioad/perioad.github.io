import { KeyboardEvent, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Download,
  FolderInput,
  FolderPlus,
  HardDriveDownload,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Upload,
} from 'lucide-react';
import { HistoryRecord, Project } from '../models/db';
import { downloadChat } from '../utils/chatFile';
import {
  sidebarEmptyNote,
  sidebarHeading,
  sidebarHeadingAction,
  sidebarHeadingRow,
  sidebarRow,
  sidebarRowAction,
  sidebarRowActions,
  sidebarRowInline,
  sidebarRowLabel,
  sidebarRowSelected,
  sidebarRowTrack,
} from '../utils/sidebarStyles';

interface HistoryProps {
  history: HistoryRecord[];
  projects: Project[];
  selectChat: (id: string) => void;
  removeChat: (chat: HistoryRecord) => void;
  renameChat: (id: string, title: string) => Promise<void>;
  moveChat: (chat: HistoryRecord) => void;
  currentChatId: string;
  createProject: () => void;
  editProject: (project: Project) => void;
  startProjectChat: (projectId: string) => void;
  importFile: (file: File) => void;
  exportEverything: () => void;
}

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
  importFile,
  exportEverything,
}: HistoryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Renaming happens in the row rather than in a dialog. A dialog would have to
  // close the drawer it was opened from, because the two would otherwise fight
  // over the focus the drawer traps, and losing the list to rename one line in
  // it is a poor trade.
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  // What the visitor has said about a project, against a default the project
  // works out for itself. Recording only the answers given leaves the default
  // free to change with the conversation, and still lets a click overrule it.
  const [expansionOverrides, setExpansionOverrides] = useState<
    Record<string, boolean>
  >({});

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

  function toggleProject(id: string, isExpanded: boolean) {
    setExpansionOverrides((overrides) => ({ ...overrides, [id]: !isExpanded }));
  }

  // A chat filed under a project that no longer exists is shown loose rather
  // than hidden, so nothing can be lost by deleting a folder.
  const projectIds = new Set(projects.map(({ id }) => id));

  const chatsInProject = (projectId?: string) =>
    history.filter((chat) => chat.projectId === projectId);

  const looseChats = history.filter(
    ({ projectId }) => projectId === undefined || !projectIds.has(projectId),
  );

  const chatRow = (chat: HistoryRecord) => (
    <li
      className={`${sidebarRow} ${chat.id === currentChatId ? sidebarRowSelected : sidebarRowTrack}`}
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
            className={sidebarRowLabel}
            title={chat.title}
            onClick={() => selectChat(chat.id)}
          >
            {chat.title}
          </button>

          <div className={sidebarRowActions}>
            <button
              className={sidebarRowAction}
              title={`Rename chat: ${chat.title}`}
              aria-label={`Rename chat: ${chat.title}`}
              onClick={() => startRename(chat)}
            >
              <Pencil className="h-4 w-4" />
            </button>

            {/* Nowhere to move a chat to until there is a project, and the row
                is tight enough without a button that opens an empty list. */}
            {projects.length > 0 && (
              <button
                className={sidebarRowAction}
                title={`Move chat: ${chat.title}`}
                aria-label={`Move chat: ${chat.title}`}
                onClick={() => moveChat(chat)}
              >
                <FolderInput className="h-4 w-4" />
              </button>
            )}

            <button
              className={sidebarRowAction}
              title={`Export chat: ${chat.title}`}
              aria-label={`Export chat: ${chat.title}`}
              onClick={() => downloadChat(chat)}
            >
              <Download className="h-4 w-4" />
            </button>

            <button
              className={sidebarRowAction}
              title={`Remove chat: ${chat.title}`}
              aria-label={`Remove chat: ${chat.title}`}
              onClick={() => removeChat(chat)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </li>
  );

  return (
    <div className="flex flex-col gap-1 p-2">
      {/* Shown even with no projects under it, because the button beside it is
          the only way to make the first one. */}
      <div className={sidebarHeadingRow}>
        <h2 className={sidebarHeading}>projects</h2>

        <button
          className={sidebarHeadingAction}
          title="New project"
          aria-label="New project"
          onClick={createProject}
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>

      {projects.length > 0 && (
        <ul className="flex flex-col gap-1">
          {projects.map((project) => {
            const chats = chatsInProject(project.id);
            // The project holding the current chat opens on its own, so
            // selecting a chat inside one never hides what is being read.
            const isExpanded =
              expansionOverrides[project.id] ??
              chats.some(({ id }) => id === currentChatId);

            return (
              <li key={project.id}>
                <div className={sidebarRowInline}>
                  <button
                    className="flex min-h-11 grow items-center gap-2 overflow-hidden px-2 text-left sm:min-h-9"
                    onClick={() => toggleProject(project.id, isExpanded)}
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
                    className={sidebarRowAction}
                    title={`New chat in ${project.title}`}
                    aria-label={`New chat in ${project.title}`}
                    onClick={() => startProjectChat(project.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>

                  <button
                    className={sidebarRowAction}
                    title={`Project settings: ${project.title}`}
                    aria-label={`Project settings: ${project.title}`}
                    onClick={() => editProject(project)}
                  >
                    <Settings2 className="h-4 w-4" />
                  </button>
                </div>

                {isExpanded && (
                  <ul className="mt-1 ml-5 flex flex-col gap-1">
                    {chats.length === 0 ? (
                      <li className={sidebarEmptyNote}>no chats yet</li>
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

      {/* Shown even with nothing loose under it, for the same reason the
          projects heading is: the button beside it is the only way in. */}
      <div className={`${sidebarHeadingRow} mt-1`}>
        <h2 className={sidebarHeading}>chats</h2>

        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            const [file] = Array.from(event.target.files ?? []);

            if (file) importFile(file);

            // Cleared so the same file can be picked again, which is otherwise
            // not a change and fires nothing.
            event.target.value = '';
          }}
        />

        <button
          className={sidebarHeadingAction}
          title="Export everything"
          aria-label="Export everything"
          onClick={exportEverything}
        >
          <HardDriveDownload className="h-4 w-4" />
        </button>

        <button
          className={sidebarHeadingAction}
          title="Import a chat or a backup"
          aria-label="Import a chat or a backup"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
        </button>
      </div>

      {/* Nothing to say about an empty run of loose chats while the projects
          above are full of them. The note is for a visitor with no chats at all,
          who would otherwise be looking at a blank panel. */}
      {history.length === 0 && <p className={sidebarEmptyNote}>no chats yet</p>}

      {looseChats.length > 0 && (
        <ul className="flex flex-col gap-1">{looseChats.map(chatRow)}</ul>
      )}
    </div>
  );
}
