import {
  ChangeEvent,
  KeyboardEvent,
  Ref,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
} from 'react';
import { ArrowUp, Mic } from 'lucide-react';
import { Spinner } from '../../../components/spinner/Spinner';
import { useSpeechToText } from '../hooks/useSpeechToText';

export type ChatInputHandle = {
  focus: () => void;
  insertPrompt: (content: string) => void;
};

interface ChatInputProps {
  addNewMessage: (content: string, role: 'user' | 'assistant') => Promise<void>;
  ref?: Ref<ChatInputHandle>;
}

function fitToContent(
  element: HTMLTextAreaElement | HTMLDivElement | null,
  textarea: HTMLTextAreaElement | null,
) {
  if (!element || !textarea) {
    return;
  }

  // A flat 200px is taller than the space left above an open keyboard on a
  // small phone, where it would push the conversation off the top.
  const visibleHeight = window.visualViewport?.height ?? window.innerHeight;
  const maxHeight = Math.min(200, visibleHeight * 0.4);

  element.style.height = 'auto';
  const newHeight = Math.min(textarea.scrollHeight, maxHeight);
  element.style.height = `${newHeight}px`;
}

// Bars that rise and fall with a voice, and sit low and still without one. What
// the button has to say while recording is that the microphone is listening and
// whether it can hear anything, which a stop square says neither of.
function SoundBars({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <span className="flex h-5 items-center gap-0.75" aria-hidden>
      {[0, 1, 2, 3].map((bar) => (
        <span
          key={bar}
          className={`h-4 w-0.75 rounded-full bg-current ${isSpeaking ? 'animate-equalize' : 'scale-y-25'}`}
          // Negative, so each bar starts part way through the cycle and the row
          // reads as a wave rather than four bars moving as one.
          style={{ animationDelay: `-${bar * 0.12}s` }}
        />
      ))}
    </span>
  );
}

export default function ChatInput({ addNewMessage, ref }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const animatedTextRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState('');
  const [promptForAnimation, setPromptForAnimation] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTextareaScroll = () => {
    if (textareaRef.current && animatedTextRef.current) {
      animatedTextRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Choosing a prompt and asking for focus are things that happen to the input,
  // not state it should be kept in step with. As props they needed an effect to
  // notice the change and a second one to reset the signal, and picking the
  // same prompt twice in a row changed nothing to notice.
  useImperativeHandle(
    ref,
    () => ({
      focus() {
        textareaRef.current?.focus();
      },
      insertPrompt(content: string) {
        setPrompt((existing) =>
          existing.length === 0 ? `${content}\n` : `${content}\n${existing}`,
        );

        // After the value has landed in the DOM, so the caret can be put at the
        // end of it.
        setTimeout(() => {
          const textarea = textareaRef.current;

          if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(
              textarea.value.length,
              textarea.value.length,
            );
          }
        }, 0);
      },
    }),
    [],
  );

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

    textareaRef.current?.focus();
  }

  const recording = useSpeechToText(handleTranscript);

  const micLabel = {
    idle: 'Record a prompt',
    recording: 'Stop recording',
    transcribing: 'Transcribing',
  }[recording.status];
  const micStyles =
    recording.status === 'recording'
      ? 'bg-slate-100 text-sky-500 dark:bg-slate-800'
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
  }

  function handleSubmit(prompt: string) {
    if (isEmptyPrompt) {
      return;
    }

    // Taken here rather than kept in step with every change, because what the
    // copy has to show is the text being sent, and the box is cleared below.
    setPromptForAnimation(prompt);
    setIsAnimating(true);
    addNewMessage(prompt, 'user');
    setPrompt('');

    textareaRef.current?.focus();

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
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

  // Keyed on the value rather than done wherever the value is set. The box fills
  // by typing, by choosing a prompt and by dictating, and the last two arrive
  // from outside a keystroke: measuring there reads the value the box is about
  // to lose, and a long transcript lands in a box still one line tall.
  useLayoutEffect(() => {
    fitToContent(textareaRef.current, textareaRef.current);

    // The copy that flies away on send keeps the height it was filled at. It is
    // measured from the box, and the box is empty by the time it takes off.
    if (!isAnimating) {
      fitToContent(animatedTextRef.current, textareaRef.current);
    }
  }, [prompt, isAnimating]);

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
            {recording.status === 'recording' && (
              <SoundBars isSpeaking={recording.isSpeaking} />
            )}
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
