import { ChangeEvent, KeyboardEvent, useRef, useState, useEffect } from 'react';
import { ArrowUp, Mic, Square } from 'lucide-react';
import { Prompt } from '../models/db';
import { Spinner } from '../../../components/spinner/Spinner';
import { useSpeechToText } from '../hooks/useSpeechToText';

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

  function handleTranscript(text: string) {
    // Appended to whatever is in the box, read from the previous value rather
    // than the captured one so that typing during the recording survives.
    setPrompt((existing) =>
      existing.trim().length === 0 ? text : `${existing.trim()} ${text}`,
    );

    setTimeout(() => {
      adjustElementHeight(textareaRef);
      adjustElementHeight(animatedTextRef);
      textareaRef.current?.focus();
    }, 0);
  }

  const recording = useSpeechToText(handleTranscript);

  const micLabel = {
    idle: 'Record a prompt',
    recording: 'Stop recording',
    transcribing: 'Transcribing',
  }[recording.status];
  const micStyles =
    recording.status === 'recording'
      ? 'animate-pulse bg-red-500 text-white'
      : 'bg-slate-100 aria-disabled:opacity-40 dark:bg-slate-800';

  const promptTrimmed = prompt.trim();
  const promptTrimmedForAnimation = promptForAnimation.trim();
  const isEmptyPrompt = promptTrimmed.length === 0;

  // Matches the square buttons beside it, in the same unit so that the row stays
  // aligned when the root font size is turned up.
  const minHeight = '3.25rem';

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
      textareaRef.current.style.height = minHeight;
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
    <div className="mx-auto w-full max-w-4xl px-3 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-5">
      {recording.error && (
        <p role="alert" className="mb-2 text-red-500">
          {recording.error}
        </p>
      )}

      <div className="relative flex">
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
          className={`pointer-events-none absolute bottom-0 left-0 overflow-y-auto p-3 ${
            isAnimating ? 'visible animate-fly-up' : 'invisible'
          }`}
        >
          <pre className="wrap-break-word whitespace-pre-wrap">
            {promptTrimmedForAnimation}
          </pre>
        </div>

        {recording.isSupported && (
          <button
            className={`${micStyles} ml-2 flex h-13 w-13 shrink-0 items-center justify-center self-end rounded-md transition-colors sm:ml-3`}
            aria-disabled={recording.status === 'transcribing'}
            title={micLabel}
            aria-label={micLabel}
            onClick={recording.toggleRecording}
          >
            {recording.status === 'transcribing' && (
              <div className="h-5 w-5">
                <Spinner />
              </div>
            )}
            {recording.status === 'recording' && <Square className="h-5 w-5" />}
            {recording.status === 'idle' && <Mic className="h-5 w-5" />}
          </button>
        )}

        <button
          className="ml-2 flex h-13 w-13 shrink-0 items-center justify-center self-end rounded-md bg-slate-100 transition-all aria-disabled:opacity-40 sm:ml-3 dark:bg-slate-800"
          aria-disabled={isEmptyPrompt}
          title="Send"
          aria-label="Send"
          onClick={() => handleSubmit(promptTrimmed)}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
