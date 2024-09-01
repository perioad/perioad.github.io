import { ChangeEvent, useRef, useState, useEffect } from 'react';
import { Prompt } from '../models/db';

interface ChatInputProps {
  addNewMessage: (content: string, role: 'user' | 'assistant') => Promise<void>;
  chosenPrompt: Prompt | null;
  shouldFocus: boolean;
  onFocused: () => void;
}

export default function ChatInput({
  addNewMessage,
  chosenPrompt,
  shouldFocus,
  onFocused,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState('');

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      const maxHeight = 200;
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    if (chosenPrompt) {
      const value =
        prompt.length === 0
          ? `${chosenPrompt.content}\n`
          : `${chosenPrompt.content}\n${prompt}`;

      setPrompt(value);

      setTimeout(() => {
        adjustTextareaHeight();
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(value.length, value.length);
        }
      }, 0);
    }
  }, [chosenPrompt]);

  const promptTrimmed = prompt.trim();
  const isEmptyPrompt = promptTrimmed.length === 0;

  const minHeight = 52;

  function handleTextAreaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const value: string = event.target.value;

    setPrompt(value);
    adjustTextareaHeight();
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

  useEffect(() => {
    if (shouldFocus && textareaRef.current) {
      textareaRef.current.focus();
      onFocused();
    }
  }, [shouldFocus, onFocused]);

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
