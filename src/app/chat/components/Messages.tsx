import { Fragment, useCallback } from 'react';
import { Marked } from 'marked';
import hljs from 'highlight.js';
import { markedHighlight } from 'marked-highlight';
import 'highlight.js/styles/monokai.css';
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

export default function Messages({
  messages,
  addNewMessage,
  model,
}: {
  messages: Message[];
  addNewMessage: (content: string, role: 'user' | 'assistant') => void;
  model: ChatModel;
}) {
  const { containerRef, scrollToBottom } = useScrollToBottom(messages);

  const addAssistantContent = useCallback(
    async (content: string) => {
      await addNewMessage(content, 'assistant');
      scrollToBottom();
    },
    [addNewMessage, scrollToBottom],
  );

  useAiStream(
    messages.at(-1)?.role === 'user',
    messages,
    addAssistantContent,
    model,
  );

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full flex-grow overflow-y-auto px-1 py-5 sm:px-5"
    >
      <div className="mx-auto w-full max-w-3xl text-base sm:text-sm">
        {messages.map((message, i) => (
          <Fragment key={i}>
            {message.role === 'user' && (
              <div className="mb-5 ml-auto flex w-full justify-end border-r-2 border-sky-500 pl-20 pr-5 leading-6 last:mb-0">
                <p className="w-fit break-words">{message.content}</p>
              </div>
            )}
            {message.role === 'assistant' && (
              <div
                className="markdown mb-5 w-full border-l-2 border-green-500 pl-5 pr-20 leading-6 last:mb-0"
                dangerouslySetInnerHTML={{
                  __html: marked.parse(message.content),
                }}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
