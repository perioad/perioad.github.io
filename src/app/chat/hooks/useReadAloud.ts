import OpenAI from 'openai';
import { useCallback, useEffect, useRef, useState } from 'react';

const SPEECH_MODEL = 'gpt-4o-mini-tts';
const VOICE = 'alloy';

// The speech endpoint rejects any input over 4096 characters, so a long reply
// has to be sent as several requests and played back to back.
const MAX_INPUT_LENGTH = 4096;

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

// Cut at sentence ends so a chunk boundary lands between thoughts rather than
// mid-word, where the seam between two audio files would be audible.
function toChunks(text: string): string[] {
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) ?? [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (current.length + sentence.length <= MAX_INPUT_LENGTH) {
      current += sentence;
      continue;
    }

    if (current) chunks.push(current);

    // A single sentence past the limit has no good seam, so it gets a hard one.
    let rest = sentence;
    while (rest.length > MAX_INPUT_LENGTH) {
      chunks.push(rest.slice(0, MAX_INPUT_LENGTH));
      rest = rest.slice(MAX_INPUT_LENGTH);
    }

    current = rest;
  }

  if (current) chunks.push(current);

  return chunks.filter((chunk) => chunk.trim());
}

// Resolves when this piece of audio is done with, for any reason: played to
// the end, failed, or paused by `stop`. Pausing has to count, otherwise a
// playback loop awaiting this would hang forever after the user hits stop.
function untilFinished(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve) => {
    audio.onended = () => resolve();
    audio.onpause = () => resolve();
    audio.onerror = () => resolve();
  });
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
  // Playback spans many awaits, and `stop` can land inside any of them. Each
  // toggle takes the next number, and stale async work checks it before
  // touching state, so a stopped reading cannot resurrect itself.
  const sessionRef = useRef(0);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    sessionRef.current += 1;
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

      const session = sessionRef.current;
      const isCurrent = () => sessionRef.current === session;

      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      const fetchAudioUrl = async (input: string) => {
        const speech = await openai.audio.speech.create({
          model: SPEECH_MODEL,
          voice: VOICE,
          input,
        });

        return URL.createObjectURL(await speech.blob());
      };

      try {
        const chunks = toChunks(toSpoken(content));
        let nextUrl = await fetchAudioUrl(chunks[0]);

        for (let i = 0; i < chunks.length; i++) {
          if (!isCurrent()) {
            URL.revokeObjectURL(nextUrl);

            return;
          }

          // The next chunk is requested while this one plays, so the pause at
          // each seam is only as long as whatever fetching time the playback
          // did not cover.
          const pending =
            i + 1 < chunks.length ? fetchAudioUrl(chunks[i + 1]) : null;

          const audio = new Audio(nextUrl);

          urlRef.current = nextUrl;
          audioRef.current = audio;

          const finished = untilFinished(audio);

          await audio.play();
          setLoadingIndex(null);
          setSpeakingIndex(index);
          await finished;

          if (pending) nextUrl = await pending;
        }

        if (isCurrent()) stop();
      } catch {
        if (isCurrent()) {
          setError('could not read that out.');
          setLoadingIndex(null);
          stop();
        }
      }
    },
    [speakingIndex, loadingIndex, stop],
  );

  return { speakingIndex, loadingIndex, error, toggle };
}
