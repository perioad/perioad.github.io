import { ChangeEvent, useRef, useState } from 'react';

export default function ChatInput({ addNewMessage }: { addNewMessage: any }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState('');

  const promptTrimmed = prompt.trim();
  const isEmptyPrompt = promptTrimmed.length === 0;

  const minHeight = 52;

  function handleTextAreaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const value: string = event.target.value;

    setPrompt(value);

    if (textareaRef.current) {
      const maxHeight = 200;
      const oneLineHeight = 24;
      const firstLine = 1;
      const textLinesToAdd = value.split('\n').length - firstLine;
      const newHeight = textLinesToAdd * oneLineHeight + minHeight;

      textareaRef.current.style.height =
        newHeight > maxHeight ? `${maxHeight}px` : `${newHeight}px`;
    }
  }

  function handleSubmit(prompt: string) {
    if (isEmptyPrompt) {
      return;
    }

    addNewMessage(prompt, 'user');
    setPrompt('');

    if (textareaRef.current) {
      textareaRef.current.style.height = `${minHeight}px`;
      textareaRef.current.focus();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl p-5 pt-0">
      <textarea
        ref={textareaRef}
        className="h-auto w-full resize-none rounded-md bg-slate-100 p-3 text-base leading-6 sm:text-sm dark:bg-slate-800"
        style={{ minHeight }}
        rows={1}
        placeholder="Write your prompt here.."
        value={prompt}
        onChange={handleTextAreaChange}
      ></textarea>

      <button
        className={`${isEmptyPrompt ? 'w-0 scale-0' : ''} ml-5 h-[52px] w-[52px] flex-shrink-0 self-end rounded-md bg-slate-100 text-xl transition-all focus-visible:w-[52px] focus-visible:scale-100 aria-disabled:grayscale dark:bg-slate-800`}
        aria-disabled={isEmptyPrompt}
        onClick={() => handleSubmit(promptTrimmed)}
      >
        ✨
      </button>
    </div>
  );
}
