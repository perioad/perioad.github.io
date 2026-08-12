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

// Lower than the 0.8 an analyser defaults to. That is smooth enough to lag
// behind the voice it is drawing, and the point of drawing it is that it keeps
// up.
const LEVEL_SMOOTHING = 0.6;

function getSupportedFormat() {
  if (typeof MediaRecorder === 'undefined') return undefined;

  return RECORDING_FORMATS.find(({ mimeType }) =>
    MediaRecorder.isTypeSupported(mimeType),
  );
}

export function useSpeechToText(onTranscript: (text: string) => void) {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const [isSupported] = useState(
    () =>
      Boolean(navigator.mediaDevices?.getUserMedia) && !!getSupportedFormat(),
  );

  // Opened here because this is where the stream is, and handed out rather than
  // read here: what the level is wanted for is drawing, and a reading taken on
  // every frame would otherwise be a render on every frame.
  function openAnalyser(stream: MediaStream) {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = LEVEL_SMOOTHING;
    audioContext.createMediaStreamSource(stream).connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
  }

  function closeAnalyser() {
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
  }

  useEffect(() => {
    // Leaving a track live keeps the browser's recording indicator on long
    // after the component is gone, and the analyser holds an audio context open
    // behind it.
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
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
      closeAnalyser();

      const recording = new Blob(chunksRef.current, { type: format.mimeType });

      chunksRef.current = [];

      transcribe(recording, format.extension);
    };

    recorderRef.current = recorder;
    streamRef.current = stream;

    recorder.start();
    openAnalyser(stream);
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

  return { status, error, isSupported, analyserRef, toggleRecording };
}
