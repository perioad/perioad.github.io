import OpenAI from 'openai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getSavedVoice, getSavedVoicePrompt } from '../utils/voices';

const SPEECH_MODEL = 'gpt-4o-mini-tts';

// Four zero samples of 16-bit mono PCM: the shortest valid WAV that `play`
// will accept. Played inside the click so the element earns Safari's
// permission to play; what it plays is nothing.
const SILENCE =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAA';

// A long reply has to be sent as several requests and played back to back:
// gpt-4o-mini-tts caps input at 2000 tokens (the endpoint's own cap is 4096
// characters). Characters per token depends on the script — roughly 4 for
// English but near 1 for CJK — so 1500 characters keeps a chunk under the
// token cap whatever the reply is written in.
const MAX_INPUT_LENGTH = 1500;

// The wait before the first sound is the generation time of the first chunk,
// and generation runs at roughly six times playback speed. A full 1500-char
// chunk is ~2 minutes of speech and ~20 seconds of generating; 300 characters
// open in a few seconds, and the ~25 seconds they take to say cover the
// generation of the full-sized chunk behind them.
const FIRST_CHUNK_LENGTH = 300;

// Generated speech is kept by what was asked for, so playing a reply again —
// or resuming after a stop — costs no request and starts at once. A full
// chunk is ~2MB of mp3, so 20 entries cap the hold at ~40MB.
const CACHE_LIMIT = 20;
const speechCache = new Map<string, Blob>();

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
  const limit = () =>
    chunks.length === 0 ? FIRST_CHUNK_LENGTH : MAX_INPUT_LENGTH;

  for (const sentence of sentences) {
    if (current.length + sentence.length <= limit()) {
      current += sentence;
      continue;
    }

    if (current) chunks.push(current);

    // A single sentence past the limit has no good seam, so it gets a hard
    // one. The cut is taken before the push moves `limit` to the next tier,
    // so both slices agree on where it lands.
    let rest = sentence;
    while (rest.length > limit()) {
      const cut = limit();

      chunks.push(rest.slice(0, cut));
      rest = rest.slice(cut);
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
  // Where the last pause landed: which chunk and how far into it. Held with
  // the content it was measured against, so a regenerated reply under the
  // same index starts over instead of resuming into different words.
  const pausedRef = useRef<{
    index: number;
    content: string;
    chunk: number;
    time: number;
  } | null>(null);
  // Which chunk the loop is currently playing, readable from the click that
  // pauses it.
  const chunkRef = useRef(0);

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
        // Only sound that was actually playing leaves a place to come back
        // to; pausing during the load keeps whatever position the load was
        // aimed at.
        if (speakingIndex === index && audioRef.current) {
          pausedRef.current = {
            index,
            content,
            chunk: chunkRef.current,
            time: audioRef.current.currentTime,
          };
        }

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

      // Safari only allows `play` on an element the user's gesture touched,
      // and the real audio arrives long after this click has ended. One
      // element is unlocked here by playing silence while the gesture is
      // live, then reused for every chunk: a fresh `new Audio` per chunk
      // would be refused with NotAllowedError. The silent play's own promise
      // is discarded — setting the first chunk's src interrupts it.
      const audio = new Audio(SILENCE);
      audio.play().catch(() => {});
      audioRef.current = audio;

      const session = sessionRef.current;
      const isCurrent = () => sessionRef.current === session;

      // Read at the moment of asking rather than held anywhere, so a voice
      // or prompt changed mid-conversation is what the next press uses.
      const voice = getSavedVoice();
      const prompt = getSavedVoicePrompt();

      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      const fetchAudioUrl = async (input: string) => {
        const key = `${voice}|${prompt}|${input}`;
        const held = speechCache.get(key);

        if (held) return URL.createObjectURL(held);

        const speech = await openai.audio.speech.create({
          model: SPEECH_MODEL,
          voice,
          input,
          instructions: prompt || undefined,
        });

        const blob = await speech.blob();

        speechCache.set(key, blob);

        // Insertion order is eviction order, which drops the reply listened
        // to longest ago.
        if (speechCache.size > CACHE_LIMIT) {
          speechCache.delete(speechCache.keys().next().value!);
        }

        return URL.createObjectURL(blob);
      };

      const paused = pausedRef.current;
      const resume =
        paused && paused.index === index && paused.content === content
          ? paused
          : null;

      try {
        const chunks = toChunks(toSpoken(content));
        const startChunk =
          resume && resume.chunk < chunks.length ? resume.chunk : 0;
        let nextUrl = await fetchAudioUrl(chunks[startChunk]);

        for (let i = startChunk; i < chunks.length; i++) {
          if (!isCurrent()) {
            URL.revokeObjectURL(nextUrl);

            return;
          }

          // The next chunk is requested while this one plays, so the pause at
          // each seam is only as long as whatever fetching time the playback
          // did not cover.
          const pending =
            i + 1 < chunks.length ? fetchAudioUrl(chunks[i + 1]) : null;

          // The prefetch is not awaited until the current chunk has finished
          // playing, so a rejection would sit unhandled for minutes and the
          // dev overlay reports it as a crash. Marked handled here; the await
          // below still surfaces the failure.
          pending?.catch(() => {});

          chunkRef.current = i;
          audio.src = nextUrl;
          urlRef.current = nextUrl;

          // A seek before the metadata is in is dropped by Safari, so the
          // resumed position waits for it. The blob is local; this is
          // milliseconds.
          if (resume && i === startChunk && resume.time > 0) {
            await new Promise<void>((ready) => {
              audio.onloadedmetadata = () => ready();
            });

            audio.currentTime = resume.time;
          }

          const finished = untilFinished(audio);

          await audio.play();
          setLoadingIndex(null);
          setSpeakingIndex(index);
          await finished;

          // Already revoked if `stop` got here first; revoking twice is a
          // harmless no-op, and skipping this leaks megabytes of audio per
          // chunk for the life of the page.
          URL.revokeObjectURL(nextUrl);

          if (pending) nextUrl = await pending;
        }

        if (isCurrent()) {
          // Heard to the end: the next press should start over, not resume
          // at wherever the last pause happened to be.
          if (pausedRef.current?.index === index) pausedRef.current = null;

          stop();
        }
      } catch (thrown) {
        if (isCurrent()) {
          console.error('read aloud failed:', thrown);

          setError(
            thrown instanceof Error && thrown.message
              ? `could not read that out: ${thrown.message}`
              : 'could not read that out.',
          );
          setLoadingIndex(null);
          stop();
        }
      }
    },
    [speakingIndex, loadingIndex, stop],
  );

  return { speakingIndex, loadingIndex, error, toggle };
}
