import { KeyboardEvent, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { HistoryRecord } from '../models/db';

interface HistoryProps {
  history: HistoryRecord[];
  selectChat: (id: number) => void;
  removeChat: (chat: HistoryRecord) => void;
  renameChat: (id: number, title: string) => Promise<void>;
  currentChatId: number;
}

// Renders the list only. The container is the caller's business, because it is
// an inline rail on desktop and a drawer on mobile.
export default function History({
  history,
  selectChat,
  removeChat,
  renameChat,
  currentChatId,
}: HistoryProps) {
  // Renaming happens in the row rather than in a dialog. A dialog would have to
  // close the drawer it was opened from, because the two would otherwise fight
  // over the focus the drawer traps, and losing the list to rename one line in
  // it is a poor trade.
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');

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

  if (history.length === 0) {
    return (
      <p className="p-4 text-slate-500 dark:text-slate-400">no chats yet</p>
    );
  }

  return (
    <ul className="flex flex-col gap-1 p-2">
      {history.map((chat) => (
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
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-slate-200 sm:h-9 sm:w-0 sm:opacity-0 sm:group-hover:w-9 sm:group-hover:opacity-100 sm:focus-visible:w-9 sm:focus-visible:opacity-100 dark:hover:bg-slate-700"
                title={`Rename chat: ${chat.title}`}
                aria-label={`Rename chat: ${chat.title}`}
                onClick={() => startRename(chat)}
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-slate-200 sm:h-9 sm:w-0 sm:opacity-0 sm:group-hover:w-9 sm:group-hover:opacity-100 sm:focus-visible:w-9 sm:focus-visible:opacity-100 dark:hover:bg-slate-700"
                title={`Remove chat: ${chat.title}`}
                aria-label={`Remove chat: ${chat.title}`}
                onClick={() => removeChat(chat)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
