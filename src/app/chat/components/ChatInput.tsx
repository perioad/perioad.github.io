import { ChangeEvent, KeyboardEvent, useRef, useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
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
  const animatedTextRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState('');
  const [promptForAnimation, setPromptForAnimation] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const adjustElementHeight = (
    ref: React.RefObject<HTMLTextAreaElement | HTMLDivElement | null>,
  ) => {
    if (ref.current && textareaRef.current) {
      // A flat 200px is taller than the space left above an open keyboard on a
      // small phone, where it would push the conversation off the top.
      const visibleHeight = window.visualViewport?.height ?? window.innerHeight;
      const maxHeight = Math.min(200, visibleHeight * 0.4);

      ref.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, maxHeight);
      ref.current.style.height = `${newHeight}px`;
    }
  };

  const handleTextareaScroll = () => {
    if (textareaRef.current && animatedTextRef.current) {
      animatedTextRef.current.scrollTop = textareaRef.current.scrollTop;
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
        adjustElementHeight(textareaRef);
        adjustElementHeight(animatedTextRef);
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(value.length, value.length);
        }
      }, 0);
    }
  }, [chosenPrompt]);

  useEffect(() => {
    // Focusing on mount throws up the on-screen keyboard before the user has
    // asked to type, covering most of the conversation on a phone.
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    textareaRef.current?.focus();
  }, []);

  const promptTrimmed = prompt.trim();
  const promptTrimmedForAnimation = promptForAnimation.trim();
  const isEmptyPrompt = promptTrimmed.length === 0;

  const minHeight = 52;

  function handleTextAreaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const value: string = event.target.value;

    setPrompt(value);
    setPromptForAnimation(value);
    adjustElementHeight(textareaRef);
    adjustElementHeight(animatedTextRef);
  }

  // Enter sends on a keyboard, where Shift+Enter is the well known way to get a
  // newline. On a touch keyboard the return key is the only way to break a
  // line, so it is left alone and the send button does the work.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return;

    if (window.matchMedia('(pointer: coarse)').matches) return;

    event.preventDefault();
    handleSubmit(prompt.trim());
  }

  function handleSubmit(prompt: string) {
    if (isEmptyPrompt) {
      return;
    }

    setIsAnimating(true);
    addNewMessage(prompt, 'user');
    setPrompt('');

    if (textareaRef.current) {
      textareaRef.current.style.height = `${minHeight}px`;
      textareaRef.current.focus();
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }

  useEffect(() => {
    if (shouldFocus && textareaRef.current) {
      textareaRef.current.focus();
      onFocused();
    }
  }, [shouldFocus, onFocused]);

  useEffect(() => {
    if (textareaRef.current && animatedTextRef.current) {
      const textareaWidth = textareaRef.current.offsetWidth;
      animatedTextRef.current.style.width = `${textareaWidth}px`;
    }
  }, [prompt]);

  return (
    <div className="relative mx-auto flex w-full max-w-4xl px-3 pt-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-5">
      <textarea
        ref={textareaRef}
        className="h-auto w-full resize-none rounded-md bg-slate-100 p-3 text-base leading-6 sm:text-sm dark:bg-slate-800"
        style={{ minHeight }}
        rows={1}
        placeholder="Write your prompt here.."
        value={prompt}
        onChange={handleTextAreaChange}
        onKeyDown={handleKeyDown}
        onScroll={handleTextareaScroll}
      ></textarea>

      <div
        ref={animatedTextRef}
        className={`pointer-events-none absolute bottom-0 left-3 overflow-y-auto p-3 sm:left-5 ${
          isAnimating ? 'visible animate-fly-up' : 'invisible'
        }`}
      >
        <pre className="wrap-break-word whitespace-pre-wrap">
          {promptTrimmedForAnimation}
        </pre>
      </div>

      <button
        className="ml-3 flex h-[52px] w-[52px] shrink-0 items-center justify-center self-end rounded-md bg-slate-100 transition-all aria-disabled:opacity-40 sm:ml-5 dark:bg-slate-800"
        aria-disabled={isEmptyPrompt}
        title="Send"
        aria-label="Send"
        onClick={() => handleSubmit(promptTrimmed)}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
