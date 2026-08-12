import {
  Fragment,
  MouseEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Marked } from 'marked';
import hljs from 'highlight.js';
import { markedHighlight } from 'marked-highlight';
import 'highlight.js/styles/monokai.css';
import {
  ArrowDown,
  Check,
  Copy,
  Pencil,
  Pin,
  PinOff,
  RotateCcw,
  Square,
  TriangleAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import useAiStream from '../hooks/useAiStream';
import { useReadAloud } from '../hooks/useReadAloud';
import { Citation, Message } from '../models/chat';
import { useScrollToBottom } from '../hooks/useScrollToBottom';
import { ResponsesModel } from 'openai/resources/index.mjs';
import { ThinkingLevel } from '../utils/thinking';
import PinnedBar from './PinnedBar';
import Sources from './Sources';
import { AttachmentList } from './Attachments';
import { Spinner } from '../../../components/spinner/Spinner';
import { withCitationMarkers } from '../utils/webSearch';
import { useMeasuredHeight } from '../hooks/useMeasuredHeight';

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
);

const actionButton =
  'flex h-9 items-center rounded-md px-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-inherit dark:text-slate-400 dark:hover:bg-slate-800';

// There is no hover on a touch screen, so below `sm` the actions stay put.
const revealOnHover =
  'sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100';

const highlighted = 'bg-slate-100 dark:bg-slate-800';

const floatingButton =
  'absolute bottom-[calc(var(--composer-height,5rem)+0.75rem)] left-1/2 flex h-11 -translate-x-1/2 items-center justify-center rounded-full shadow-md backdrop-blur-xs transition-colors hover:bg-slate-100/50 dark:border-slate-700 dark:hover:bg-slate-800/50';

// `marked-highlight` owns the `code` renderer, so rather than reimplement its
// escaping the wrapper is added to the finished HTML. Only our own tags can
// match: anything in the source is escaped by the time it gets here.
function withCodeBlockActions(html: string): string {
  return html
    .replaceAll(
      '<pre>',
      '<div class="code-block"><button type="button" class="code-copy" data-copy-code>copy</button><pre>',
    )
    .replaceAll('</pre>', '</pre></div>');
}

function renderMarkdown(content: string, citations?: Citation[]): string {
  return withCodeBlockActions(
    marked.parse(withCitationMarkers(content, citations ?? [])) as string,
  );
}

export default function Messages({
  messages,
  addNewMessage,
  editMessage,
  dropMessagesFrom,
  model,
  thinkingLevel,
  togglePin,
  instructions,
}: {
  messages: Message[];
  addNewMessage: (
    content: string,
    role: 'user' | 'assistant',
    extras?: { citations?: Citation[] },
  ) => void;
  editMessage: (index: number, content: string) => Promise<void>;
  dropMessagesFrom: (index: number) => Promise<void>;
  model: ResponsesModel;
  thinkingLevel: ThinkingLevel;
  togglePin: (index: number) => void;
  instructions: string | null;
}) {
  const { containerRef, scrollToBottom, scrollToBottomNow, isAtBottom } =
    useScrollToBottom();
  const measurePinnedBar = useMeasuredHeight('--pinned-bar-height');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const draftRef = useRef<HTMLTextAreaElement>(null);

  // Derived rather than stored: nothing to reconcile when a message is added or
  // a pin is dropped, and the order follows the conversation for free.
  const pinned = useMemo(
    () =>
      messages
        .map((message, index) => ({ message, index }))
        .filter(({ message }) => message.isPinned),
    [messages],
  );

  const addAssistantContent = useCallback(
    async (content: string, citations: Citation[]) => {
      await addNewMessage(content, 'assistant', { citations });
      scrollToBottom();
    },
    [addNewMessage, scrollToBottom],
  );

  const isAwaitingReply = messages.at(-1)?.role === 'user';

  const { searchStatus, isStreaming, isStopped, error, stop, restart } =
    useAiStream(
      isAwaitingReply,
      messages,
      addAssistantContent,
      model,
      thinkingLevel,
      instructions,
    );

  const readAloud = useReadAloud();

  // One listener for every code block, since the buttons live inside HTML that
  // React only knows as a string.
  function handleCopyCode(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as HTMLElement).closest('[data-copy-code]');

    if (!button) return;

    const code = button
      .closest('.code-block')
      ?.querySelector('code')?.textContent;

    if (code) {
      navigator.clipboard.writeText(code);
      button.textContent = 'copied';
    }
  }

  function copyMessage(content: string, index: number) {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);

    setTimeout(() => setCopiedIndex(null), 1500);
  }

  // Landing in the middle of a long conversation gives no clue which message was
  // the target, so it lights up for a moment after the scroll.
  function jumpToMessage(index: number) {
    containerRef.current
      ?.querySelector(`[data-message="${index}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setHighlightedIndex(index);

    setTimeout(() => setHighlightedIndex(null), 1500);
  }

  function startEditing(index: number, content: string) {
    setEditingIndex(index);
    setDraft(content);

    // After the paint that swaps the words for the box holding them.
    setTimeout(() => draftRef.current?.focus());
  }

  // The reply that follows a question cannot survive it being changed, so it
  // goes along with everything said after it, the way it does in ChatGPT. The
  // edited question is then the last thing in the conversation, and is asked.
  async function saveEdit(index: number) {
    const content = draft.trim();

    if (!content) return;

    setEditingIndex(null);
    await editMessage(index, content);
    restart();
  }

  // Throws the reply away and asks the same question again, rather than adding
  // a second answer under the first.
  async function regenerate(index: number) {
    await dropMessagesFrom(index);
    restart();
  }

  // A failure that arrived before any of the reply did leaves the question
  // last and only needs asking again. One that interrupted a reply leaves half
  // of it behind, which is thrown away first.
  function retry() {
    const last = messages.length - 1;

    if (messages[last]?.role === 'assistant') {
      regenerate(last);

      return;
    }

    restart();
  }

  // A stopped reply that never started is the only one worth mentioning: one
  // stopped halfway is sitting there half written, which says it plainly
  // enough and carries its own button to ask again.
  const notice = error
    ? { message: error, isFault: true, canRetry: true }
    : readAloud.error
      ? { message: readAloud.error, isFault: true, canRetry: false }
      : isStopped && isAwaitingReply
        ? { message: 'stopped.', isFault: false, canRetry: true }
        : null;

  const messageActions = (message: Message, index: number) => (
    <div className="mt-1 flex">
      <button
        className={`${actionButton} ${revealOnHover}`}
        onClick={() => copyMessage(message.content, index)}
        title="Copy message"
        aria-label="Copy message"
      >
        {copiedIndex === index ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>

      <button
        // A pinned message keeps its button on show, because the button is also
        // the only marker in the conversation that it is pinned.
        className={`${actionButton} ${message.isPinned ? 'text-sky-500' : revealOnHover}`}
        onClick={() => togglePin(index)}
        title={message.isPinned ? 'Unpin message' : 'Pin message'}
        aria-label={message.isPinned ? 'Unpin message' : 'Pin message'}
        aria-pressed={Boolean(message.isPinned)}
      >
        {message.isPinned ? (
          <PinOff className="h-4 w-4" />
        ) : (
          <Pin className="h-4 w-4" />
        )}
      </button>

      {message.role === 'user' && (
        <button
          className={`${actionButton} ${revealOnHover}`}
          onClick={() => startEditing(index, message.content)}
          title="Edit message"
          aria-label="Edit message"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      {message.role === 'assistant' && (
        <>
          <button
            className={`${actionButton} ${readAloud.speakingIndex === index ? 'text-sky-500' : revealOnHover}`}
            onClick={() => readAloud.toggle(index, message.content)}
            title={
              readAloud.speakingIndex === index ? 'Stop reading' : 'Read aloud'
            }
            aria-label={
              readAloud.speakingIndex === index ? 'Stop reading' : 'Read aloud'
            }
          >
            {readAloud.loadingIndex === index ? (
              <div className="h-4 w-4">
                <Spinner />
              </div>
            ) : readAloud.speakingIndex === index ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          <button
            className={`${actionButton} ${revealOnHover}`}
            onClick={() => regenerate(index)}
            title="Regenerate reply"
            aria-label="Regenerate reply"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="relative flex grow flex-col overflow-hidden">
      <div
        ref={measurePinnedBar}
        className="absolute inset-x-0 top-(--header-height,3.25rem) z-10"
      >
        <PinnedBar pinned={pinned} onJump={jumpToMessage} onUnpin={togglePin} />
      </div>

      <div
        ref={containerRef}
        // Runs the full height of the column so the conversation is visible
        // through the bars floating over it, and keeps clear of them with
        // padding instead. No padding on the sides, so a turn's coloured edge is
        // the edge of the screen: the gap between that edge and the words is the
        // message's own padding, which the border needs anyway to sit off the
        // text.
        className="scrollbar-hidden grow overflow-y-auto overscroll-contain pt-[calc(var(--header-height,3.25rem)+var(--pinned-bar-height,0px)+1.25rem)] pb-[calc(var(--composer-height,5rem)+1.25rem)]"
        onClick={handleCopyCode}
      >
        <div className="mx-auto w-full max-w-3xl text-base sm:text-sm">
          {messages.length === 0 && (
            <div className="px-3 py-10 text-center sm:px-5">
              <p className="mb-1 text-xl">what shall we get into?</p>
              <p className="text-slate-500 dark:text-slate-400">
                byok - bring your own key
              </p>
            </div>
          )}

          {messages.map((message, i) => (
            <Fragment key={i}>
              {message.role === 'user' && (
                <div
                  data-message={i}
                  className={`${highlightedIndex === i ? highlighted : ''} group mb-5 flex w-full flex-col items-end border-r-2 border-sky-500 px-3 leading-6 transition-colors last:mb-0 sm:px-5`}
                >
                  {message.attachments && (
                    <div className="mb-2">
                      <AttachmentList
                        attachments={message.attachments}
                        align="end"
                      />
                    </div>
                  )}

                  {editingIndex === i ? (
                    <div className="w-full">
                      <textarea
                        ref={draftRef}
                        className="h-32 w-full resize-none rounded-md bg-slate-100 p-2 dark:bg-slate-800"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') setEditingIndex(null);

                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            saveEdit(i);
                          }
                        }}
                      />

                      <div className="flex justify-end">
                        <button
                          className={actionButton}
                          onClick={() => setEditingIndex(null)}
                        >
                          cancel
                        </button>

                        <button
                          className={actionButton}
                          onClick={() => saveEdit(i)}
                        >
                          save and ask again
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="markdown w-full text-right wrap-break-word"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(message.content),
                        }}
                      />

                      {messageActions(message, i)}
                    </>
                  )}
                </div>
              )}

              {message.role === 'assistant' && (
                <div
                  data-message={i}
                  className={`${highlightedIndex === i ? highlighted : ''} group mb-5 w-full border-l-2 border-green-500 px-3 leading-6 transition-colors last:mb-0 sm:px-5`}
                >
                  <div
                    className="markdown wrap-break-word"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(
                        message.content,
                        message.citations,
                      ),
                    }}
                  />

                  <Sources citations={message.citations ?? []} />

                  {messageActions(message, i)}
                </div>
              )}
            </Fragment>
          ))}

          {/* A search can start after the reply has begun, so this outlives
              the wait for the first words of one. The edge is grey rather than
              the green of a turn, because there is no turn here yet: it goes
              green as the first words land and this gives way to the message. */}
          {isStreaming && (isAwaitingReply || searchStatus) && (
            <div
              className="flex w-full items-center gap-2 border-l-2 border-slate-300 pl-3 sm:pl-5 dark:border-slate-700"
              role="status"
              aria-label={searchStatus ?? 'Waiting for a reply'}
            >
              <div className="h-5 w-5 shrink-0">
                <Spinner />
              </div>

              {/* Left unanimated, since the spinner beside it already carries
                  the sense that something is happening. */}
              {searchStatus && (
                <span className="text-slate-500 dark:text-slate-400">
                  {searchStatus}
                </span>
              )}
            </div>
          )}

          {/* Said in the conversation rather than in an alert, so it can be
              read next to the question it belongs to and answered by pressing
              something. A reply that failed halfway leaves what it managed
              above this, which is worth keeping and is thrown away only if the
              question is asked again. */}
          {notice && (
            <div
              className={`flex w-full flex-wrap items-center gap-x-2 border-l-2 px-3 sm:px-5 ${notice.isFault ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'}`}
              role={notice.isFault ? 'alert' : 'status'}
            >
              {notice.isFault && (
                <TriangleAlert className="h-4 w-4 shrink-0 text-red-500" />
              )}

              <span className="text-slate-500 dark:text-slate-400">
                {notice.message}
              </span>

              {notice.canRetry && (
                <button className={actionButton} onClick={retry}>
                  try again
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Both want the same spot, and only one of them is ever the thing to
          press: while a reply is arriving it is being followed down the page
          anyway. */}
      {isStreaming ? (
        <button
          className={`${floatingButton} gap-2 px-4`}
          onClick={stop}
          title="Stop generating"
          aria-label="Stop generating"
        >
          <Square className="h-3 w-3 fill-current" />
          stop
        </button>
      ) : (
        !isAtBottom && (
          <button
            className={`${floatingButton} w-11`}
            onClick={scrollToBottomNow}
            title="Scroll to latest"
            aria-label="Scroll to latest"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        )
      )}
    </div>
  );
}
