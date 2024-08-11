'use client';

import { useEffect, useMemo, useState } from 'react';
import ChatInput from './ChatInput';
import History from './History';
import Messages from './Messages';
import { getAiTitle } from '../utils/getAiTitle';
import { getHistoryDB, getHistoryTransaction } from '../utils/db';
import { HistoryRecord } from '../models/db';
import { Message } from '../models/chat';
import { ChatModel } from 'openai/resources/index.mjs';

const MAX_MOBILE_WIDTH = 640;

export default function Chat({ openKeyModal }: { openKeyModal: () => void }) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number>(1);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [model, setModel] = useState<ChatModel>('gpt-4o');

  const currentHistory = useMemo(
    () => history.find(({ id }) => id === currentChatId),
    [history, currentChatId],
  );

  const messages = useMemo(
    () => currentHistory?.messages || [],
    [currentHistory],
  );

  useEffect(() => {
    const fetchHistory = async () => {
      const savedHistory = await getHistoryDB();

      setHistory(savedHistory);
      setCurrentChatId(savedHistory.at(-1)?.id ?? 1);
    };

    fetchHistory();
  }, []);

  const addNewMessage = async (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message =
      role === 'assistant' && messages.at(-1)?.role === 'assistant'
        ? { role, content: messages.at(-1)?.content + content }
        : { content, role };

    const titleByAi = messages.length === 0 ? await getAiTitle(content) : null;
    const updatedMessages = [...messages, newMessage];
    const tx = await getHistoryTransaction();

    await Promise.all([
      tx.store.put({
        id: currentChatId,
        title: titleByAi ?? currentHistory?.title ?? 'New chat',
        messages: updatedMessages,
      }),
      tx.done,
    ]);

    const newHistory = await getHistoryDB();

    setHistory(newHistory);
  };

  const startNewChat = async () => {
    const allHistory = await getHistoryDB();

    setCurrentChatId(allHistory.at(-1)?.id + 1 ?? 1);
  };

  const removeChat = async (id: number) => {
    const tx = await getHistoryTransaction();

    await Promise.all([tx.store.delete(id), tx.done]);

    const updatedHistory = await getHistoryDB();

    setHistory(updatedHistory);
    setCurrentChatId(updatedHistory.at(-1)?.id ?? 1);
  };

  const selectChat = (id: number) => {
    setCurrentChatId(id);

    if (window.innerWidth < MAX_MOBILE_WIDTH) {
      setIsHistoryVisible(false);
    }
  };

  function toggleHistory() {
    setIsHistoryVisible((prev) => !prev);
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
        <button
          onClick={toggleHistory}
          className={`${isHistoryVisible && '-scale-x-100'} text-2xl transition-all`}
        >
          {'⇨'}
        </button>
        <p>byok - bring your own key</p>
        <div className="flex gap-5">
          <button
            className="rounded-md border px-3 py-1 transition-all hover:bg-slate-800 "
            onClick={openKeyModal}
          >
            key
          </button>
          <button
            className="rounded-md border px-3 py-1 transition-all hover:bg-slate-800 aria-disabled:grayscale "
            onClick={startNewChat}
            aria-disabled={!currentHistory}
          >
            new
          </button>
        </div>
      </header>
      <section className="flex flex-grow overflow-y-auto">
        <History
          history={history}
          selectChat={selectChat}
          removeChat={removeChat}
          currentChatId={currentChatId}
          isVisible={isHistoryVisible}
        />
        <div
          className={`${isHistoryVisible ? 'hidden sm:flex' : ''} flex h-full flex-grow flex-col`}
        >
          <div className="mt-5 flex justify-center">
            <select
              className="rounded-md bg-slate-800 px-2 py-1"
              value={model}
              onChange={(e) => setModel(e.target.value as ChatModel)}
            >
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
            </select>
          </div>
          <Messages
            messages={messages}
            addNewMessage={addNewMessage}
            model={model}
          />
          <ChatInput addNewMessage={addNewMessage} />
        </div>
      </section>
    </>
  );
}
