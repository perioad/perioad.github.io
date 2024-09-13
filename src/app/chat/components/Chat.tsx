'use client';

import { useEffect, useMemo, useState } from 'react';
import ChatInput from './ChatInput';
import History from './History';
import Messages from './Messages';
import { getAiTitle } from '../utils/getAiTitle';
import {
  getHistoryDB,
  getHistoryTransaction,
  getPromptsDB,
  getPromptTransaction,
} from '../utils/db';
import { HistoryRecord } from '../models/db';
import { Message } from '../models/chat';
import { ChatModel } from 'openai/resources/index.mjs';
import PromptSidebar from './PromptSidebar';
import { Prompt } from '../models/db';
import ModelSelect from './ModelSelect'; // Add this import

const MAX_MOBILE_WIDTH = 640;

function getModelFromLocalStorage(): ChatModel {
  if (typeof window === 'undefined') return 'gpt-4o';

  const savedModel = localStorage.getItem('model');

  if (!savedModel) return 'gpt-4o';

  return savedModel as ChatModel;
}

export default function Chat({ openKeyModal }: { openKeyModal: () => void }) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number>(1);
  const [isHistoryVisible, setIsHistoryVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isHistoryVisible') === 'true';
    }
    return false;
  });
  const [model, setModel] = useState<ChatModel>(getModelFromLocalStorage);
  const [isPromptSidebarVisible, setIsPromptSidebarVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isPromptSidebarVisible') === 'true';
    }
    return false;
  });
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [chosenPrompt, setChosenPrompt] = useState<Prompt | null>(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);

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

  useEffect(() => {
    const fetchPrompts = async () => {
      const savedPrompts = await getPromptsDB();

      setPrompts(savedPrompts);
    };

    fetchPrompts();
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
    setShouldFocusInput(true);
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
    setShouldFocusInput(true);

    if (window.innerWidth < MAX_MOBILE_WIDTH) {
      setIsHistoryVisible(false);
    }
  };

  function toggleHistory() {
    setIsHistoryVisible((prev) => !prev);
  }

  function togglePromptSidebar() {
    setIsPromptSidebarVisible((prev) => !prev);
  }

  const addPrompt = async (title: string, content: string) => {
    const newPrompt: Prompt = { title, content };
    const tx = await getPromptTransaction();

    await Promise.all([tx.store.add(newPrompt), tx.done]);

    const updatedPrompts = await getPromptsDB();

    setPrompts(updatedPrompts);
  };

  const updatePrompt = async (id: number, title: string, content: string) => {
    const tx = await getPromptTransaction();
    const existingPrompt = await tx.store.get(id);

    if (existingPrompt) {
      await Promise.all([
        tx.store.put({ ...existingPrompt, title, content }),
        tx.done,
      ]);

      const updatedPrompts = await getPromptsDB();
      setPrompts(updatedPrompts);
    }
  };

  const removePrompt = async (id: number) => {
    const tx = await getPromptTransaction();

    await Promise.all([tx.store.delete(id), tx.done]);

    const updatedPrompts = await getPromptsDB();
    setPrompts(updatedPrompts);
  };

  function choosePrompt(prompt: Prompt) {
    setChosenPrompt(prompt);
    setShouldFocusInput(true);
  }

  function handleSelectModel(model: ChatModel) {
    setModel(model);
  }

  useEffect(() => {
    localStorage.setItem('isHistoryVisible', isHistoryVisible.toString());
  }, [isHistoryVisible]);

  useEffect(() => {
    localStorage.setItem(
      'isPromptSidebarVisible',
      isPromptSidebarVisible.toString(),
    );
  }, [isPromptSidebarVisible]);

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
        <button
          onClick={toggleHistory}
          className={`${isHistoryVisible ? '-scale-x-100' : ''} flex items-center gap-2 text-2xl transition-all`}
        >
          {'⇨'}

          <span className="text-sm transition-all">history</span>
        </button>

        <p>byok - bring your own key</p>

        <button
          onClick={togglePromptSidebar}
          className={`${isPromptSidebarVisible ? '-scale-x-100' : ''} flex items-center gap-2 text-2xl transition-all`}
        >
          <span className="text-sm transition-all">prompts</span>

          {'⇦'}
        </button>
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
          <div className="z-10 flex justify-center gap-5 py-5 backdrop-blur-sm">
            <button
              className="rounded-md bg-slate-700 px-3 py-1 transition-all hover:bg-slate-800"
              onClick={openKeyModal}
            >
              manage key
            </button>

            <button
              className="rounded-md bg-slate-700 px-3 py-1 transition-all hover:bg-slate-800"
              onClick={startNewChat}
              aria-disabled={!currentHistory}
            >
              new chat
            </button>

            <ModelSelect model={model} setModel={handleSelectModel} />
          </div>
          <Messages
            messages={messages}
            addNewMessage={addNewMessage}
            model={model}
          />
          <ChatInput
            addNewMessage={addNewMessage}
            chosenPrompt={chosenPrompt}
            shouldFocus={shouldFocusInput}
            onFocused={() => setShouldFocusInput(false)}
          />
        </div>

        <PromptSidebar
          isVisible={isPromptSidebarVisible}
          prompts={prompts}
          addPrompt={addPrompt}
          updatePrompt={updatePrompt}
          removePrompt={removePrompt}
          choosePrompt={choosePrompt}
        />
      </section>
    </>
  );
}
