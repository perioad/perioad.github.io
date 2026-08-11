import { Fragment, MouseEvent, useCallback, useState } from 'react';
import { Marked } from 'marked';
import hljs from 'highlight.js';
import { markedHighlight } from 'marked-highlight';
import 'highlight.js/styles/monokai.css';
import { ArrowDown, Check, Copy } from 'lucide-react';
import useAiStream from '../hooks/useAiStream';
import { Message } from '../models/chat';
import { useScrollToBottom } from '../hooks/useScrollToBottom';
import { ChatModel } from 'openai/resources/index.mjs';

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
);

const SUGGESTIONS = [
  'explain a tricky bit of typescript',
  'review this function for edge cases',
  'write a commit message for these changes',
];

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

function renderMarkdown(content: string): string {
  return withCodeBlockActions(marked.parse(content) as string);
}

export default function Messages({
  messages,
  addNewMessage,
  model,
  onSuggestion,
}: {
  messages: Message[];
  addNewMessage: (content: string, role: 'user' | 'assistant') => void;
  model: ChatModel;
  onSuggestion: (content: string) => void;
}) {
  const { containerRef, scrollToBottom, scrollToBottomNow, isAtBottom } =
    useScrollToBottom();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const addAssistantContent = useCallback(
    async (content: string) => {
      await addNewMessage(content, 'assistant');
      scrollToBottom();
    },
    [addNewMessage, scrollToBottom],
  );

  const isAwaitingReply = messages.at(-1)?.role === 'user';

  useAiStream(isAwaitingReply, messages, addAssistantContent, model);

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

  const copyButton = (content: string, index: number) => (
    <button
      className="mt-1 flex h-9 items-center gap-1 rounded-md px-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-inherit sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 dark:text-slate-400 dark:hover:bg-slate-800"
      onClick={() => copyMessage(content, index)}
      title="Copy message"
      aria-label="Copy message"
    >
      {copiedIndex === index ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <div className="relative flex grow flex-col overflow-hidden">
      <div
        ref={containerRef}
        className="grow overflow-y-auto overscroll-contain px-3 py-5 sm:px-5"
        onClick={handleCopyCode}
      >
        <div className="mx-auto w-full max-w-3xl text-base sm:text-sm">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-6 py-10 text-center">
              <div>
                <p className="mb-1 text-xl">what shall we get into?</p>
                <p className="text-slate-500 dark:text-slate-400">
                  byok - bring your own key
                </p>
              </div>

              <ul className="flex w-full flex-col gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      className="min-h-11 w-full rounded-md border border-slate-300 px-4 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
                      onClick={() => onSuggestion(suggestion)}
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {messages.map((message, i) => (
            <Fragment key={i}>
              {message.role === 'user' && (
                <div className="group mb-5 flex w-full flex-col items-end border-r-2 border-sky-500 pr-3 pl-6 leading-6 last:mb-0 sm:pr-5 sm:pl-20">
                  <div
                    className="markdown w-fit wrap-break-word"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(message.content),
                    }}
                  />

                  {copyButton(message.content, i)}
                </div>
              )}

              {message.role === 'assistant' && (
                <div className="group mb-5 w-full border-l-2 border-green-500 pr-6 pl-3 leading-6 last:mb-0 sm:pr-20 sm:pl-5">
                  <div
                    className="markdown wrap-break-word"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(message.content),
                    }}
                  />

                  {copyButton(message.content, i)}
                </div>
              )}
            </Fragment>
          ))}

          {isAwaitingReply && (
            <div
              className="flex w-full gap-1 border-l-2 border-green-500 pl-3 sm:pl-5"
              role="status"
              aria-label="Waiting for a reply"
            >
              <span className="h-2 w-2 animate-bounce rounded-full bg-green-500" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-green-500 [animation-delay:0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-green-500 [animation-delay:0.3s]" />
            </div>
          )}
        </div>
      </div>

      {!isAtBottom && (
        <button
          className="absolute bottom-3 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-slate-300 bg-white shadow-md transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
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
