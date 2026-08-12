import OpenAI from 'openai';
import { useCallback, useEffect, useRef, useState } from 'react';

const SPEECH_MODEL = 'gpt-4o-mini-tts';
const VOICE = 'alloy';

// Markdown is written to be looked at. Read out as it is, a bulleted list of
// emphasised terms becomes a recital of asterisks and backticks, so the marks
// come off and the words they were around stay.
function toSpoken(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, ' code block. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(\*|_)([^*_]+)\1/g, '$2')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

export type ReadAloud = {
  speakingIndex: number | null;
  loadingIndex: number | null;
  error: string | null;
  toggle: (index: number, content: string) => void;
};

// One reply at a time, identified by where it sits in the conversation: asking
// for a second stops the first rather than talking over it.
export function useReadAloud(): ReadAloud {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;

    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    setSpeakingIndex(null);
  }, []);

  // A reply left talking after the chat has been closed has no way to be
  // stopped, since the button that would do it has gone with it.
  useEffect(() => stop, [stop]);

  const toggle = useCallback(
    async (index: number, content: string) => {
      if (speakingIndex === index || loadingIndex === index) {
        stop();
        setLoadingIndex(null);

        return;
      }

      stop();

      const apiKey = localStorage.getItem('key');

      if (!apiKey) {
        setError('there is no openai key yet. add one under manage key.');

        return;
      }

      setError(null);
      setLoadingIndex(index);

      try {
        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        const speech = await openai.audio.speech.create({
          model: SPEECH_MODEL,
          voice: VOICE,
          input: toSpoken(content),
        });

        const url = URL.createObjectURL(await speech.blob());
        const audio = new Audio(url);

        audio.onended = stop;

        urlRef.current = url;
        audioRef.current = audio;

        await audio.play();
        setSpeakingIndex(index);
      } catch {
        setError('could not read that out.');
        stop();
      } finally {
        setLoadingIndex(null);
      }
    },
    [speakingIndex, loadingIndex, stop],
  );

  return { speakingIndex, loadingIndex, error, toggle };
}
