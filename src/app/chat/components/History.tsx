import { Trash2 } from 'lucide-react';
import { HistoryRecord } from '../models/db';

interface HistoryProps {
  history: HistoryRecord[];
  selectChat: (id: number) => void;
  removeChat: (chat: HistoryRecord) => void;
  currentChatId: number;
}

// Renders the list only. The container is the caller's business, because it is
// an inline rail on desktop and a drawer on mobile.
export default function History({
  history,
  selectChat,
  removeChat,
  currentChatId,
}: HistoryProps) {
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
          <button
            className="min-h-11 grow overflow-hidden px-3 text-left text-ellipsis whitespace-nowrap sm:min-h-9"
            title={chat.title}
            onClick={() => selectChat(chat.id)}
          >
            {chat.title}
          </button>

          <button
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-slate-200 sm:h-9 sm:w-0 sm:opacity-0 sm:group-hover:w-9 sm:group-hover:opacity-100 sm:focus-visible:w-9 sm:focus-visible:opacity-100 dark:hover:bg-slate-700"
            title={`Remove chat: ${chat.title}`}
            aria-label={`Remove chat: ${chat.title}`}
            onClick={() => removeChat(chat)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
