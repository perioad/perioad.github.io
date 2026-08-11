'use client';

import { useEffect, useMemo, useState } from 'react';
import { KeyRound, PanelLeft, PanelRight, SquarePen } from 'lucide-react';
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
import ModelSelect from './ModelSelect';
import MobileDrawer from './MobileDrawer';
import ConfirmDialog from './ConfirmDialog';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

// Tailwind's `sm` starts at 40rem, so this is everything below it.
const MOBILE_QUERY = '(max-width: 39.9375rem)';

function getModelFromLocalStorage(): ChatModel {
  if (typeof window === 'undefined') return 'gpt-4o';

  const savedModel = localStorage.getItem('model');

  if (!savedModel) return 'gpt-4o';

  return savedModel as ChatModel;
}

// A rail left open in a desktop session would come back as a drawer sitting on
// top of the conversation, so the saved state is only restored on wide screens.
function getSavedPanelState(key: string): boolean {
  if (typeof window === 'undefined') return false;

  if (window.matchMedia(MOBILE_QUERY).matches) return false;

  return localStorage.getItem(key) === 'true';
}

export default function Chat({ openKeyModal }: { openKeyModal: () => void }) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number>(1);
  const [isHistoryVisible, setIsHistoryVisible] = useState(() =>
    getSavedPanelState('isHistoryVisible'),
  );
  const [model, setModel] = useState<ChatModel>(getModelFromLocalStorage);
  const [isPromptSidebarVisible, setIsPromptSidebarVisible] = useState(() =>
    getSavedPanelState('isPromptSidebarVisible'),
  );
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [chosenPrompt, setChosenPrompt] = useState<Prompt | null>(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [chatPendingRemoval, setChatPendingRemoval] =
    useState<HistoryRecord | null>(null);
  const [promptPendingRemoval, setPromptPendingRemoval] =
    useState<Prompt | null>(null);

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
      setCurrentChatId(savedHistory.at(0)?.id ?? 1);
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

  // Both panels take the whole screen as drawers, so only one can be open.
  function showHistory(isVisible: boolean) {
    setIsHistoryVisible(isVisible);

    if (isVisible && isMobile) {
      setIsPromptSidebarVisible(false);
    }
  }

  function showPromptSidebar(isVisible: boolean) {
    setIsPromptSidebarVisible(isVisible);

    if (isVisible && isMobile) {
      setIsHistoryVisible(false);
    }
  }

  function closeDrawers() {
    if (isMobile) {
      setIsHistoryVisible(false);
      setIsPromptSidebarVisible(false);
    }
  }

  const startNewChat = async () => {
    const allHistory = await getHistoryDB();
    const newChatId = allHistory.length > 0 ? allHistory.at(0)!.id + 1 : 1;

    setCurrentChatId(newChatId);
    closeDrawers();

    if (!isMobile) {
      setShouldFocusInput(true);
    }
  };

  const confirmChatRemoval = async () => {
    if (!chatPendingRemoval) return;

    const tx = await getHistoryTransaction();

    await Promise.all([tx.store.delete(chatPendingRemoval.id), tx.done]);

    const updatedHistory = await getHistoryDB();

    setHistory(updatedHistory);
    setCurrentChatId(updatedHistory.at(0)?.id ?? 1);
    setChatPendingRemoval(null);
  };

  const selectChat = (id: number) => {
    setCurrentChatId(id);
    closeDrawers();

    // Focusing here would open the keyboard over the conversation the user just
    // asked to read.
    if (!isMobile) {
      setShouldFocusInput(true);
    }
  };

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

  const confirmPromptRemoval = async () => {
    if (!promptPendingRemoval) return;

    const tx = await getPromptTransaction();

    await Promise.all([tx.store.delete(promptPendingRemoval.id!), tx.done]);

    const updatedPrompts = await getPromptsDB();

    setPrompts(updatedPrompts);
    setPromptPendingRemoval(null);
  };

  function choosePrompt(prompt: Prompt) {
    setChosenPrompt(prompt);
    setShouldFocusInput(true);
    closeDrawers();
  }

  function handleSelectModel(model: ChatModel) {
    setModel(model);
  }

  function handleOpenKeyModal() {
    closeDrawers();
    openKeyModal();
  }

  // A drawer holds a focus trap, so anything that opens a dialog has to close it
  // first or the two fight over the focused element.
  function requestChatRemoval(chat: HistoryRecord) {
    closeDrawers();
    setChatPendingRemoval(chat);
  }

  function requestPromptRemoval(prompt: Prompt) {
    closeDrawers();
    setPromptPendingRemoval(prompt);
  }

  useEffect(() => {
    if (isMobile) return;

    localStorage.setItem('isHistoryVisible', isHistoryVisible.toString());
  }, [isHistoryVisible, isMobile]);

  useEffect(() => {
    if (isMobile) return;

    localStorage.setItem(
      'isPromptSidebarVisible',
      isPromptSidebarVisible.toString(),
    );
  }, [isPromptSidebarVisible, isMobile]);

  const iconButton =
    'flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-slate-100 sm:h-9 sm:w-9 dark:hover:bg-slate-800';

  const historyList = (
    <History
      history={history}
      selectChat={selectChat}
      removeChat={requestChatRemoval}
      currentChatId={currentChatId}
    />
  );

  const promptList = (
    <PromptSidebar
      prompts={prompts}
      addPrompt={addPrompt}
      updatePrompt={updatePrompt}
      removePrompt={requestPromptRemoval}
      choosePrompt={choosePrompt}
      onEditorOpen={closeDrawers}
    />
  );

  return (
    <>
      <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-slate-800 px-2 py-1 sm:px-4 sm:py-2">
        <div className="flex justify-start">
          <button
            onClick={() => showHistory(!isHistoryVisible)}
            className={iconButton}
            title="Toggle history"
            aria-label="Toggle history"
            aria-expanded={isHistoryVisible}
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>

        <ModelSelect model={model} setModel={handleSelectModel} />

        <div className="flex justify-end">
          <button
            onClick={handleOpenKeyModal}
            className={`${iconButton} hidden sm:flex`}
            title="Manage key"
            aria-label="Manage key"
          >
            <KeyRound className="h-5 w-5" />
          </button>

          <button
            onClick={startNewChat}
            className={iconButton}
            title="New chat"
            aria-label="New chat"
            aria-disabled={!currentHistory}
          >
            <SquarePen className="h-5 w-5" />
          </button>

          <button
            onClick={() => showPromptSidebar(!isPromptSidebarVisible)}
            className={`${iconButton} hidden sm:flex`}
            title="Toggle prompts"
            aria-label="Toggle prompts"
            aria-expanded={isPromptSidebarVisible}
          >
            <PanelRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      <section className="flex grow overflow-hidden">
        {!isMobile && (
          <aside
            inert={!isHistoryVisible}
            className={`${isHistoryVisible ? 'w-56' : 'w-0'} h-full shrink-0 overflow-y-auto border-r border-r-slate-800 text-sm transition-all`}
          >
            {historyList}
          </aside>
        )}

        <div className="flex h-full grow flex-col overflow-hidden">
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

        {!isMobile && (
          <aside
            inert={!isPromptSidebarVisible}
            className={`${isPromptSidebarVisible ? 'w-56' : 'w-0'} h-full shrink-0 overflow-y-auto border-l border-l-slate-800 text-sm transition-all`}
          >
            {promptList}
          </aside>
        )}
      </section>

      {isMobile && (
        <>
          <MobileDrawer
            isOpen={isHistoryVisible}
            onOpenChange={showHistory}
            side="left"
            title="history"
            footer={
              <div className="flex flex-col gap-1">
                <button
                  className="flex min-h-11 items-center gap-3 rounded-md px-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => showPromptSidebar(true)}
                >
                  <PanelRight className="h-5 w-5 shrink-0" />
                  prompts
                </button>

                <button
                  className="flex min-h-11 items-center gap-3 rounded-md px-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={handleOpenKeyModal}
                >
                  <KeyRound className="h-5 w-5 shrink-0" />
                  manage key
                </button>
              </div>
            }
          >
            {historyList}
          </MobileDrawer>

          <MobileDrawer
            isOpen={isPromptSidebarVisible}
            onOpenChange={showPromptSidebar}
            side="right"
            title="prompts"
          >
            {promptList}
          </MobileDrawer>
        </>
      )}

      <ConfirmDialog
        isOpen={chatPendingRemoval !== null}
        title="remove chat"
        message={`are you sure you want to remove "${chatPendingRemoval?.title}"?`}
        confirmLabel="remove"
        onConfirm={confirmChatRemoval}
        onCancel={() => setChatPendingRemoval(null)}
      />

      <ConfirmDialog
        isOpen={promptPendingRemoval !== null}
        title="remove prompt"
        message={`are you sure you want to remove "${promptPendingRemoval?.title}"?`}
        confirmLabel="remove"
        onConfirm={confirmPromptRemoval}
        onCancel={() => setPromptPendingRemoval(null)}
      />
    </>
  );
}
