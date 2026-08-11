import { useCallback, useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

type Waving = {
  isWaving: boolean;
  isAccessGranted: boolean | null;
  isReady: boolean | null;
  attachVideo: (node: HTMLVideoElement | null) => void;
};

// Pinned to the installed version of @mediapipe/tasks-vision, and has to be
// bumped with it: the WASM and the JavaScript that loads it are one unit, and
// an unversioned CDN path would eventually serve a mismatched pair.
const WASM_PATH =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';

const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

// What the model calls a hand held open at the camera, which is the same thing
// the old handtrackjs class 1 ("open") stood for.
const WAVE_GESTURE = 'Open_Palm';

async function createRecognizer(delegate: 'GPU' | 'CPU') {
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

  return GestureRecognizer.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_PATH, delegate },
    runningMode: 'VIDEO',
    numHands: 1,
  });
}

// The camera stream and the element's dimensions are written onto the video
// element, so the hook hands out the way to attach one rather than taking an
// element it would then reach into: what a component passes down is that
// component's, and writing to it behind its back is how the two get out of step.
export const useIsWaving = (frequency: number): Waving => {
  const [isWaving, setIsWaving] = useState(false);
  const [isAccessGranted, setIsAccessGranted] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // A ref alone would not start anything: tracking cannot begin until the node
  // exists, and putting it in a ref is not something React re-renders for.
  const [attachedVideos, setAttachedVideos] = useState(0);

  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;

    if (node) {
      setAttachedVideos((count) => count + 1);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    // The count, not the ref, is what says a node arrived. React fills refs in
    // before it runs effects, so this pass can already see the element on the
    // render that attached it, and starting here as well as on the render the
    // count triggers would ask for the camera twice at once.
    if (attachedVideos === 0 || !video || recognizerRef.current) {
      return;
    }

    let isCancelled = false;

    async function trackHand(video: HTMLVideoElement) {
      try {
        if (!video.srcObject) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });

          video.srcObject = stream;

          setIsAccessGranted(true);
        }
      } catch {
        setIsAccessGranted(false);

        return;
      }

      let recognizer: GestureRecognizer;

      try {
        // Falling back to the CPU delegate costs frames but keeps the feature
        // alive on a device whose WebGL will not do what MediaPipe asks of it.
        recognizer = await createRecognizer('GPU').catch(() =>
          createRecognizer('CPU'),
        );
      } catch {
        setIsReady(false);

        return;
      }

      if (isCancelled) {
        recognizer.close();

        return;
      }

      recognizerRef.current = recognizer;
      setIsReady(true);

      intervalRef.current = setInterval(() => {
        // A frame the camera has not produced yet has no dimensions, and asking
        // about one throws.
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          return;
        }

        const { gestures } = recognizer.recognizeForVideo(
          video,
          performance.now(),
        );

        setIsWaving(
          gestures.some(([best]) => best?.categoryName === WAVE_GESTURE),
        );
      }, frequency);
    }

    trackHand(video);

    return () => {
      isCancelled = true;

      recognizerRef.current?.close();
      recognizerRef.current = null;
      clearInterval(intervalRef.current);

      // Without this the camera light stays on after the component is gone.
      if (video.srcObject instanceof MediaStream) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
    };
  }, [attachedVideos, frequency]);

  return { isWaving, isAccessGranted, isReady, attachVideo };
};
