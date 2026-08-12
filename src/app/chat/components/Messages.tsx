import { Fragment, MouseEvent, useCallback, useMemo, useState } from 'react';
import { Marked } from 'marked';
import hljs from 'highlight.js';
import { markedHighlight } from 'marked-highlight';
import 'highlight.js/styles/monokai.css';
import { ArrowDown, Check, Copy, Pin, PinOff } from 'lucide-react';
import useAiStream from '../hooks/useAiStream';
import { Citation, Message } from '../models/chat';
import { useScrollToBottom } from '../hooks/useScrollToBottom';
import { ResponsesModel } from 'openai/resources/index.mjs';
import { ThinkingLevel } from '../utils/thinking';
import PinnedBar from './PinnedBar';
import Sources from './Sources';
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
  model,
  thinkingLevel,
  togglePin,
  projectContext,
}: {
  messages: Message[];
  addNewMessage: (
    content: string,
    role: 'user' | 'assistant',
    citations?: Citation[],
  ) => void;
  model: ResponsesModel;
  thinkingLevel: ThinkingLevel;
  togglePin: (index: number) => void;
  projectContext: string | null;
}) {
  const { containerRef, scrollToBottom, scrollToBottomNow, isAtBottom } =
    useScrollToBottom();
  const measurePinnedBar = useMeasuredHeight('--pinned-bar-height');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

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
      await addNewMessage(content, 'assistant', citations);
      scrollToBottom();
    },
    [addNewMessage, scrollToBottom],
  );

  const isAwaitingReply = messages.at(-1)?.role === 'user';

  const searchStatus = useAiStream(
    isAwaitingReply,
    messages,
    addAssistantContent,
    model,
    thinkingLevel,
    projectContext,
  );

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
                  <div
                    className="markdown w-full text-right wrap-break-word"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(message.content),
                    }}
                  />

                  {messageActions(message, i)}
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
          {(isAwaitingReply || searchStatus) && (
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
        </div>
      </div>

      {!isAtBottom && (
        <button
          className="absolute bottom-[calc(var(--composer-height,5rem)+0.75rem)] left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full shadow-md backdrop-blur-xs transition-colors hover:bg-slate-100/50 dark:border-slate-700 dark:hover:bg-slate-800/50"
          onClick={scrollToBottomNow}
          title="Scroll to latest"
          aria-label="Scroll to latest"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
