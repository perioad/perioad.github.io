import { useEffect, useRef, useState } from 'react';
import OpenAI from 'openai';

// Newer than `whisper-1`, cheaper per minute, and better on accents and noise.
const TRANSCRIPTION_MODEL = 'gpt-4o-mini-transcribe';

// Browsers disagree on what they can record: Safari gives mp4, most others
// webm. The extension has to follow the container, because the transcription
// endpoint reads the format off the filename and rejects a mismatch.
const RECORDING_FORMATS = [
  { mimeType: 'audio/webm', extension: 'webm' },
  { mimeType: 'audio/mp4', extension: 'mp4' },
  { mimeType: 'audio/ogg', extension: 'ogg' },
];

export type RecordingStatus = 'idle' | 'recording' | 'transcribing';

// A voice clears a quiet room by a wide margin on this scale, and the hold
// carries the reading through the gaps between words, which are long enough to
// make anything driven by the raw level flicker.
const SPEAKING_THRESHOLD = 0.03;
const SPEAKING_HOLD_MS = 300;

function getSupportedFormat() {
  if (typeof MediaRecorder === 'undefined') return undefined;

  return RECORDING_FORMATS.find(({ mimeType }) =>
    MediaRecorder.isTypeSupported(mimeType),
  );
}

export function useSpeechToText(onTranscript: (text: string) => void) {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);

  const [isSupported] = useState(
    () =>
      Boolean(navigator.mediaDevices?.getUserMedia) && !!getSupportedFormat(),
  );

  // Whether there is a voice in the stream, rather than how loud it is. A level
  // would be a new value on every frame, and the only question anything asks of
  // it is whether the microphone is picking anything up.
  function watchLoudness(stream: MediaStream) {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    audioContextRef.current = audioContext;

    const samples = new Uint8Array(analyser.fftSize);
    let lastLoudAt = 0;

    function measure() {
      analyser.getByteTimeDomainData(samples);

      // How far the waveform strays from the silent midpoint, which is what a
      // voice does to it whatever the pitch.
      let total = 0;

      for (let i = 0; i < samples.length; i++) {
        const deviation = (samples[i] - 128) / 128;

        total += deviation * deviation;
      }

      if (Math.sqrt(total / samples.length) > SPEAKING_THRESHOLD) {
        lastLoudAt = performance.now();
      }

      const speaking = performance.now() - lastLoudAt < SPEAKING_HOLD_MS;

      setIsSpeaking((wasSpeaking) =>
        wasSpeaking === speaking ? wasSpeaking : speaking,
      );

      frameRef.current = requestAnimationFrame(measure);
    }

    measure();
  }

  function stopWatchingLoudness() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    audioContextRef.current?.close();
    audioContextRef.current = null;

    setIsSpeaking(false);
  }

  useEffect(() => {
    // Leaving a track live keeps the browser's recording indicator on long
    // after the component is gone, and the analyser holds an audio context open
    // behind it.
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  async function transcribe(blob: Blob, extension: string) {
    const apiKey = localStorage.getItem('key');

    if (!apiKey) {
      setError('add your openai key first');
      setStatus('idle');

      return;
    }

    setStatus('transcribing');

    try {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      const transcription = await openai.audio.transcriptions.create({
        file: new File([blob], `speech.${extension}`, { type: blob.type }),
        model: TRANSCRIPTION_MODEL,
      });

      const text = transcription.text.trim();

      if (text) {
        onTranscript(text);
      }
    } catch {
      setError('could not transcribe that, try again');
    } finally {
      setStatus('idle');
    }
  }

  async function startRecording() {
    const format = getSupportedFormat();

    if (!format) return;

    setError(null);

    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('microphone access was denied');

      return;
    }

    const recorder = new MediaRecorder(stream, { mimeType: format.mimeType });

    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      stopWatchingLoudness();

      const recording = new Blob(chunksRef.current, { type: format.mimeType });

      chunksRef.current = [];

      transcribe(recording, format.extension);
    };

    recorderRef.current = recorder;
    streamRef.current = stream;

    recorder.start();
    watchLoudness(stream);
    setStatus('recording');
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
  }

  function toggleRecording() {
    if (status === 'recording') {
      stopRecording();
    } else if (status === 'idle') {
      startRecording();
    }
  }

  return { status, error, isSupported, isSpeaking, toggleRecording };
}
