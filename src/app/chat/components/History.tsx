import {
  ChatCompletionUserMessageParam,
  ChatCompletionAssistantMessageParam,
} from 'openai/resources/index.mjs';

type Message =
  | ChatCompletionUserMessageParam
  | ChatCompletionAssistantMessageParam;

type History = {
  id: number;
  title: string;
  messages: Message[];
};

export default function History({
  history,
  selectChat,
  removeChat,
  currentChatId,
  isVisible,
}: {
  history: History[];
  selectChat: (id: number) => void;
  removeChat: (id: number) => void;
  currentChatId: number;
  isVisible: boolean;
}) {
  return (
    <aside
      className={`${isVisible ? 'w-full sm:w-48' : 'w-0'} h-full flex-shrink-0 overflow-y-auto border-r border-r-slate-800 text-base transition-all sm:text-sm`}
    >
      <ul className="flex flex-col gap-3 p-3">
        {history.map((chat: History) => (
          <li
            className={`${chat.id === currentChatId ? 'bg-slate-100 dark:bg-slate-800' : ''} group flex h-auto w-full items-stretch overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md px-2 py-3 sm:h-9 sm:py-0`}
            key={chat.id}
          >
            <button
              className={` w-full overflow-hidden overflow-ellipsis whitespace-nowrap`}
              title={chat.title}
              onClick={() => selectChat(chat.id)}
            >
              {chat.title}
            </button>

            <button
              className="w-9 flex-shrink-0 text-3xl transition-all hover:scale-125 sm:w-0 sm:text-sm sm:opacity-0 sm:focus-visible:w-9 sm:focus-visible:opacity-100 sm:group-hover:w-9 sm:group-hover:opacity-100"
              title={`Remove chat: ${chat.title}`}
              onClick={() => removeChat(chat.id)}
            >
              🚽
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
