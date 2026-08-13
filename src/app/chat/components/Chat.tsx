'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyRound,
  PanelLeft,
  PanelRight,
  SlidersHorizontal,
  SquarePen,
} from 'lucide-react';
import ChatInput, { ChatInputHandle } from './ChatInput';
import History from './History';
import Messages from './Messages';
import { getAiTitle } from '../utils/getAiTitle';
import {
  getHistoryDB,
  getHistoryTransaction,
  getProjectsDB,
  getProjectTransaction,
  getPromptsDB,
  getPromptTransaction,
} from '../utils/db';
import { HistoryRecord } from '../models/db';
import { Attachment, Citation, Message } from '../models/chat';
import { parseChatFile } from '../utils/chatFile';
import { ResponsesModel } from 'openai/resources/index.mjs';
import PromptSidebar from './PromptSidebar';
import { Project, Prompt } from '../models/db';
import ModelSelect from './ModelSelect';
import MobileDrawer from './MobileDrawer';
import ConfirmDialog from './ConfirmDialog';
import ProjectPicker from './ProjectPicker';
import ProjectSettings from './ProjectSettings';
import InstructionsModal from './InstructionsModal';
import ThinkingSelect from './ThinkingSelect';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useRetainedValue } from '../../../hooks/useRetainedValue';
import { useMeasuredHeight } from '../hooks/useMeasuredHeight';
import {
  DEFAULT_THINKING_LEVEL,
  parseThinkingLevel,
  supportsThinking,
  ThinkingLevel,
} from '../utils/thinking';
import { contextBudgetFor, DEFAULT_MODEL } from '../utils/models';
import ContextDonut from './ContextDonut';

// Tailwind's `sm` starts at 40rem, so this is everything below it.
const MOBILE_QUERY = '(max-width: 39.9375rem)';

function getModelFromLocalStorage(): ResponsesModel {
  if (typeof window === 'undefined') return DEFAULT_MODEL;

  return localStorage.getItem('model') ?? DEFAULT_MODEL;
}

function getThinkingLevelFromLocalStorage(): ThinkingLevel {
  if (typeof window === 'undefined') return DEFAULT_THINKING_LEVEL;

  return (
    parseThinkingLevel(localStorage.getItem('thinking')) ??
    DEFAULT_THINKING_LEVEL
  );
}

function getInstructionsFromLocalStorage(): string {
  if (typeof window === 'undefined') return '';

  return localStorage.getItem('instructions') ?? '';
}

// Where the visitor was when they last closed the tab. Only a note of it: the
// chat may have been removed since, so what is read here is checked against the
// history before it is opened.
function getSavedChatId(): number {
  if (typeof window === 'undefined') return 1;

  const saved = Number(localStorage.getItem('currentChatId'));

  return Number.isInteger(saved) && saved > 0 ? saved : 1;
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
  const measureHeader = useMeasuredHeight('--header-height');
  const measureComposer = useMeasuredHeight('--composer-height');
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number>(getSavedChatId);
  const [isHistoryVisible, setIsHistoryVisible] = useState(() =>
    getSavedPanelState('isHistoryVisible'),
  );
  const [model, setModel] = useState<ResponsesModel>(getModelFromLocalStorage);
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>(
    getThinkingLevelFromLocalStorage,
  );
  const [isPromptSidebarVisible, setIsPromptSidebarVisible] = useState(() =>
    getSavedPanelState('isPromptSidebarVisible'),
  );
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const [chatPendingRemoval, setChatPendingRemoval] =
    useState<HistoryRecord | null>(null);
  const [promptPendingRemoval, setPromptPendingRemoval] =
    useState<Prompt | null>(null);
  const [projectPendingRemoval, setProjectPendingRemoval] =
    useState<Project | null>(null);
  const [chatPendingMove, setChatPendingMove] = useState<HistoryRecord | null>(
    null,
  );
  const [projectBeingEdited, setProjectBeingEdited] = useState<Project | null>(
    null,
  );
  const [isProjectEditorOpen, setIsProjectEditorOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState(
    getInstructionsFromLocalStorage,
  );
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  // As with the project editor, the key that hands the form a clean draft each
  // time it is opened, since it outlives its own closing animation.
  const [instructionsVisit, setInstructionsVisit] = useState(0);
  // Bumped on every open, as the key that gives the editor a clean form. It has
  // to stay mounted after it closes to animate out, so a fresh mount can no
  // longer be had by unmounting it.
  const [projectEditorVisit, setProjectEditorVisit] = useState(0);
  // Where the next chat will be filed. A chat has no record until its first
  // message, so until then the project it was started from lives here.
  const [pendingProjectId, setPendingProjectId] = useState<number | null>(null);

  // A dialog is still on screen for as long as it takes to fade, by which point
  // the state that opened it has been cleared. These keep it saying the name it
  // opened with instead of emptying out mid-animation.
  const chatBeingMoved = useRetainedValue(chatPendingMove);
  const chatBeingRemoved = useRetainedValue(chatPendingRemoval);
  const promptBeingRemoved = useRetainedValue(promptPendingRemoval);
  const projectBeingRemoved = useRetainedValue(projectPendingRemoval);

  const currentHistory = useMemo(
    () => history.find(({ id }) => id === currentChatId),
    [history, currentChatId],
  );

  const messages = useMemo(
    () => currentHistory?.messages || [],
    [currentHistory],
  );

  // A saved chat carries its own project; an empty one is still only a promise
  // of the project it was started from.
  const currentProjectId = currentHistory
    ? (currentHistory.projectId ?? null)
    : pendingProjectId;

  const projectContext = useMemo(
    () =>
      projects.find(({ id }) => id === currentProjectId)?.instructions.trim() ||
      null,
    [projects, currentProjectId],
  );

  // The project speaks last, so a project set up for one kind of work can
  // overrule a standing instruction that does not suit it.
  const instructions = useMemo(
    () =>
      [customInstructions.trim(), projectContext]
        .filter(Boolean)
        .join('\n\n') || null,
    [customInstructions, projectContext],
  );

  useEffect(() => {
    const fetchHistory = async () => {
      const savedHistory = await getHistoryDB();
      // The chat left open last time, unless it has since been removed or was
      // an empty one that never got as far as a record. The newest is the
      // answer then, as it was before any of this was remembered.
      const openLastTime = getSavedChatId();
      const current =
        savedHistory.find(({ id }) => id === openLastTime) ??
        savedHistory.at(0);

      setHistory(savedHistory);
      setCurrentChatId(current?.id ?? 1);

      if (current?.model) {
        setModel(current.model);
      }
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

  useEffect(() => {
    const fetchProjects = async () => {
      const savedProjects = await getProjectsDB();

      setProjects(savedProjects);
    };

    fetchProjects();
  }, []);

  const saveMessages = async (updatedMessages: Message[]) => {
    const tx = await getHistoryTransaction();
    // Read back rather than taken from the render, because the title is written
    // by a request that lands while the reply is still streaming. A snapshot
    // taken before it arrived would put `New chat` back on the next chunk.
    const saved = await tx.store.get(currentChatId);
    // The record is written here for the first time, so this is where a chat
    // started inside a project gets filed under it.
    const projectId = saved?.projectId ?? pendingProjectId;

    await tx.store.put({
      id: currentChatId,
      title: saved?.title ?? 'New chat',
      messages: updatedMessages,
      // Written on every save rather than only the first, so it is the model
      // the chat was last held with and not the one it opened on.
      model,
      // Carried over because the record is rebuilt here rather than amended,
      // and the count belongs to the reply that finished, not to the chunk
      // being saved. Left out it would be wiped on every keystroke of the
      // answer and only come back when the next one ended.
      ...(saved?.usedTokens ? { usedTokens: saved.usedTokens } : {}),
      ...(projectId ? { projectId } : {}),
    });

    await tx.done;

    const newHistory = await getHistoryDB();

    setHistory(newHistory);
  };

  // Writes the title alone, leaving whatever messages are in the record. The
  // reply is usually still streaming into it by the time this runs.
  const renameChat = async (id: number, title: string) => {
    const tx = await getHistoryTransaction();
    const saved = await tx.store.get(id);

    if (saved) {
      await tx.store.put({ ...saved, title });
    }

    await tx.done;

    setHistory(await getHistoryDB());
  };

  // Reported by the api when a reply finishes, so it lands after the last chunk
  // has been saved and amends the record rather than rewriting it.
  const recordUsage = useCallback(
    async (usedTokens: number) => {
      const tx = await getHistoryTransaction();
      const saved = await tx.store.get(currentChatId);

      if (saved) {
        await tx.store.put({ ...saved, usedTokens });
      }

      await tx.done;

      setHistory(await getHistoryDB());
    },
    [currentChatId],
  );

  // Named after the message is saved, not before it. Waiting on the title used
  // to hold up the first message of every chat behind a whole round trip.
  const nameChat = async (id: number, content: string) => {
    try {
      const title = await getAiTitle(content);

      if (title) {
        await renameChat(id, title);
      }
    } catch (error) {
      console.error('Error naming the chat:', error);
    }
  };

  const addNewMessage = async (
    content: string,
    role: 'user' | 'assistant',
    extras?: { citations?: Citation[]; attachments?: Attachment[] },
  ) => {
    const lastMessage = messages.at(-1);
    const newMessage: Message =
      role === 'assistant' && lastMessage?.role === 'assistant'
        ? // Spread rather than rebuilt, so a reply pinned while it streams does
          // not lose the pin to the next chunk.
          { ...lastMessage, content: lastMessage.content + content }
        : { content, role };

    if (extras?.citations?.length) {
      newMessage.citations = extras.citations;
    }

    if (extras?.attachments?.length) {
      newMessage.attachments = extras.attachments;
    }

    const isFirstMessage = messages.length === 0;
    const chatId = currentChatId;

    await saveMessages([...messages, newMessage]);

    // A picture on its own is a whole question, and leaves nothing to name the
    // chat after but what it was called on disk.
    const summary =
      content ||
      newMessage.attachments?.map(({ name }) => name).join(', ') ||
      '';

    if (isFirstMessage && summary) {
      nameChat(chatId, summary);
    }
  };

  // The reply to a question that has changed is no longer a reply to it, and
  // neither is anything said after. Both go, and the edited question is asked
  // again as the last thing in the conversation.
  const editMessage = async (index: number, content: string) => {
    await saveMessages(
      messages
        .slice(0, index + 1)
        .map((message, i) => (i === index ? { ...message, content } : message)),
    );
  };

  const dropMessagesFrom = async (index: number) => {
    await saveMessages(messages.slice(0, index));
  };

  const togglePin = async (index: number) => {
    await saveMessages(
      messages.map((message, i) =>
        i === index ? { ...message, isPinned: !message.isPinned } : message,
      ),
    );
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

  // For the things that take the visitor back to the conversation, and not for
  // opening a dialog: those stack on top and leave the list where it was, so
  // the chat being moved or removed is still on screen behind them.
  function closeDrawers() {
    if (isMobile) {
      setIsHistoryVisible(false);
      setIsPromptSidebarVisible(false);
    }
  }

  const startNewChat = async (projectId: number | null = null) => {
    const allHistory = await getHistoryDB();
    const newChatId = allHistory.length > 0 ? allHistory.at(0)!.id + 1 : 1;

    setCurrentChatId(newChatId);
    setPendingProjectId(projectId);
    closeDrawers();

    if (!isMobile) {
      chatInputRef.current?.focus();
    }
  };

  // Given a new id rather than the one it left with, which by now belongs to
  // something else, and filed loose: the project it was in was a folder in
  // whichever browser it came from.
  const importChat = async (file: File) => {
    try {
      const { title, messages: imported } = parseChatFile(await file.text());
      const allHistory = await getHistoryDB();
      const id = allHistory.length > 0 ? allHistory.at(0)!.id + 1 : 1;
      const tx = await getHistoryTransaction();

      await Promise.all([
        tx.store.put({ id, title, messages: imported }),
        tx.done,
      ]);

      setHistory(await getHistoryDB());
      setCurrentChatId(id);
      setPendingProjectId(null);
      closeDrawers();
    } catch (error) {
      console.error('Error importing the chat:', error);
      alert('that file is not a chat exported from here.');
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
    const chat = history.find((saved) => saved.id === id);

    setCurrentChatId(id);
    // The chat being opened answers for itself where it is filed, and a project
    // left over from an abandoned new chat is not that answer.
    setPendingProjectId(null);

    // Carrying on where it left off, rather than in whatever was last picked
    // elsewhere. A chat saved before this was recorded has nothing to say
    // about it and keeps the current choice.
    if (chat?.model) {
      setModel(chat.model);
    }

    closeDrawers();

    // Focusing here would open the keyboard over the conversation the user just
    // asked to read.
    if (!isMobile) {
      chatInputRef.current?.focus();
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
    chatInputRef.current?.insertPrompt(prompt.content);
    closeDrawers();
  }

  const saveProject = async (project: Project) => {
    const tx = await getProjectTransaction();

    if (project.id) {
      await tx.store.put(project);
    } else {
      // Added without the key so the store assigns one, the way prompts are.
      const newProject = { ...project };

      delete newProject.id;

      await tx.store.add(newProject);
    }

    await tx.done;

    setProjects(await getProjectsDB());
    closeProjectEditor();
  };

  const confirmProjectRemoval = async () => {
    if (!projectPendingRemoval) return;

    const tx = await getProjectTransaction();

    await Promise.all([tx.store.delete(projectPendingRemoval.id!), tx.done]);

    // The chats outlive the folder they were in. They are the conversations
    // themselves, and removing the thing that grouped them is not a reason to
    // take them along.
    const historyTx = await getHistoryTransaction();
    const filed = history.filter(
      ({ projectId }) => projectId === projectPendingRemoval.id,
    );

    await Promise.all(
      filed.map((chat) => {
        const unfiled = { ...chat };

        delete unfiled.projectId;

        return historyTx.store.put(unfiled);
      }),
    );

    await historyTx.done;

    setProjects(await getProjectsDB());
    setHistory(await getHistoryDB());
    setProjectPendingRemoval(null);
    // Asked for from the settings dialog, which is still open underneath and
    // now describes a project that is gone.
    closeProjectEditor();
  };

  const moveChat = async (chatId: number, projectId: number | null) => {
    const tx = await getHistoryTransaction();
    const saved = await tx.store.get(chatId);

    if (saved) {
      const moved: HistoryRecord = { ...saved };

      if (projectId) {
        moved.projectId = projectId;
      } else {
        delete moved.projectId;
      }

      await tx.store.put(moved);
    }

    await tx.done;

    setHistory(await getHistoryDB());
    setChatPendingMove(null);
  };

  function editProject(project: Project | null) {
    setProjectBeingEdited(project);
    setProjectEditorVisit((visit) => visit + 1);
    setIsProjectEditorOpen(true);
  }

  // The project it was opened for is left behind rather than cleared, so the
  // dialog still names it on the way out.
  function closeProjectEditor() {
    setIsProjectEditorOpen(false);
  }

  function openInstructions() {
    setInstructionsVisit((visit) => visit + 1);
    setIsInstructionsOpen(true);
  }

  function saveInstructions(updated: string) {
    setCustomInstructions(updated);
    localStorage.setItem('instructions', updated);
  }

  function handleSelectThinkingLevel(level: ThinkingLevel) {
    setThinkingLevel(level);
    localStorage.setItem('thinking', level);
  }

  // Written from here rather than from each of the four places that open a
  // chat, so none of them can be added later without it.
  useEffect(() => {
    localStorage.setItem('currentChatId', currentChatId.toString());
  }, [currentChatId]);

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
      projects={projects}
      selectChat={selectChat}
      removeChat={setChatPendingRemoval}
      renameChat={renameChat}
      moveChat={setChatPendingMove}
      currentChatId={currentChatId}
      createProject={() => editProject(null)}
      editProject={editProject}
      startProjectChat={startNewChat}
      importChat={importChat}
    />
  );

  const promptList = (
    <PromptSidebar
      prompts={prompts}
      addPrompt={addPrompt}
      updatePrompt={updatePrompt}
      removePrompt={setPromptPendingRemoval}
      choosePrompt={choosePrompt}
    />
  );

  return (
    <>
      <header
        ref={measureHeader}
        // Over the conversation rather than above it, so the messages carry on
        // under it instead of stopping at a line. `main` is fixed, which is the
        // containing block this is placed against.
        // The buttons either side take what they need and the selects have the
        // rest. `minmax(0, 1fr)` rather than `1fr`, whose floor is the width of
        // what is in it, which for a select is its longest option.
        className="absolute inset-x-0 top-0 z-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-white/25 px-2 py-1 backdrop-blur-xs sm:px-4 sm:py-2 dark:bg-black/20"
      >
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

        <div className="flex min-w-0 items-center justify-center gap-1">
          {/* The state setter itself, rather than a wrapper made afresh on
              every render: the select holds on to it and would refetch the
              model list each time a new one arrived. */}
          <ModelSelect model={model} setModel={setModel} />

          {supportsThinking(model) && (
            <ThinkingSelect
              model={model}
              level={thinkingLevel}
              setLevel={handleSelectThinkingLevel}
            />
          )}

          {/* Beside what it depends on: the budget it is measured against
              follows the selected model, so switching models moves the ring. */}
          <ContextDonut
            used={currentHistory?.usedTokens ?? 0}
            budget={contextBudgetFor(model)}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={openInstructions}
            className={`${iconButton} hidden sm:flex`}
            title="Custom instructions"
            aria-label="Custom instructions"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>

          <button
            onClick={openKeyModal}
            className={`${iconButton} hidden sm:flex`}
            title="Manage key"
            aria-label="Manage key"
          >
            <KeyRound className="h-5 w-5" />
          </button>

          <button
            // Wrapped, so the click event is not read as the project to file
            // the new chat under.
            onClick={() => startNewChat()}
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
            className={`${isHistoryVisible ? 'w-56' : 'w-0'} scrollbar-hidden h-full shrink-0 overflow-y-auto pt-(--header-height,3.25rem) text-sm transition-all`}
          >
            {historyList}
          </aside>
        )}

        <div className="relative flex h-full grow flex-col overflow-hidden">
          <Messages
            messages={messages}
            addNewMessage={addNewMessage}
            editMessage={editMessage}
            dropMessagesFrom={dropMessagesFrom}
            recordUsage={recordUsage}
            model={model}
            thinkingLevel={thinkingLevel}
            togglePin={togglePin}
            instructions={instructions}
          />

          <div
            ref={measureComposer}
            className="absolute inset-x-0 bottom-0 z-10 bg-white/25 backdrop-blur-xs dark:bg-black/20"
          >
            <ChatInput ref={chatInputRef} addNewMessage={addNewMessage} />
          </div>
        </div>

        {!isMobile && (
          <aside
            inert={!isPromptSidebarVisible}
            className={`${isPromptSidebarVisible ? 'w-56' : 'w-0'} scrollbar-hidden h-full shrink-0 overflow-y-auto pt-(--header-height,3.25rem) text-sm transition-all`}
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
                  onClick={openInstructions}
                >
                  <SlidersHorizontal className="h-5 w-5 shrink-0" />
                  instructions
                </button>

                <button
                  className="flex min-h-11 items-center gap-3 rounded-md px-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={openKeyModal}
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
        message={`are you sure you want to remove "${chatBeingRemoved?.title}"?`}
        confirmLabel="remove"
        onConfirm={confirmChatRemoval}
        onCancel={() => setChatPendingRemoval(null)}
      />

      <ConfirmDialog
        isOpen={promptPendingRemoval !== null}
        title="remove prompt"
        message={`are you sure you want to remove "${promptBeingRemoved?.title}"?`}
        confirmLabel="remove"
        onConfirm={confirmPromptRemoval}
        onCancel={() => setPromptPendingRemoval(null)}
      />

      <ConfirmDialog
        isOpen={projectPendingRemoval !== null}
        title="remove project"
        message={`are you sure you want to remove "${projectBeingRemoved?.title}"? its chats stay, without a project.`}
        confirmLabel="remove"
        onConfirm={confirmProjectRemoval}
        onCancel={() => setProjectPendingRemoval(null)}
      />

      <InstructionsModal
        key={`instructions-${instructionsVisit}`}
        isOpen={isInstructionsOpen}
        instructions={customInstructions}
        onSave={saveInstructions}
        onClose={() => setIsInstructionsOpen(false)}
      />

      <ProjectSettings
        key={projectEditorVisit}
        isOpen={isProjectEditorOpen}
        project={projectBeingEdited}
        onClose={closeProjectEditor}
        onSave={saveProject}
        onRemove={setProjectPendingRemoval}
      />

      {chatBeingMoved && (
        <ProjectPicker
          isOpen={chatPendingMove !== null}
          chat={chatBeingMoved}
          projects={projects}
          onPick={moveChat}
          onClose={() => setChatPendingMove(null)}
        />
      )}
    </>
  );
}
