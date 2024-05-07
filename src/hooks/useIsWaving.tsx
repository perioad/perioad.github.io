import { useEffect, useRef, useState } from 'react';
import * as handTrack from 'handtrackjs';

export const useIsWaving = (
  videoRef: HTMLVideoElement | null,
  frequency: number,
  width = 450,
  height = 380
): [boolean, boolean | null, boolean | null] => {
  const [isWaving, setIsWaving] = useState(false);
  const [isAccessGranted, setIsAccessGranted] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const modelRef = useRef<handTrack.ObjectDetection | null>(null);

  useEffect(() => {
    if (!videoRef || modelRef.current) {
      return;
    }

    async function trackHand() {
      const params = {
        maxNumBoxes: 2,
        scoreThreshold: 0.6,
      };

      try {
        if (!videoRef?.srcObject) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });

          videoRef!.width = width;
          videoRef!.height = height;
          videoRef!.srcObject = stream;

          setIsAccessGranted(true);
        }
      } catch {
        setIsAccessGranted(false);

        return;
      }

      modelRef.current = await handTrack.load(params);
      setIsReady(true);

      intervalRef.current = setInterval(async () => {
        const predictions = await modelRef.current?.detect(videoRef!);
        const hand = predictions?.find((prediction) => prediction.class === 1);

        setIsWaving(!!hand);
      }, frequency);
    }

    trackHand();

    return () => {
      modelRef.current?.dispose();
      clearInterval(intervalRef.current);
    };
  }, [videoRef, frequency, width, height]);

  return [isWaving, isAccessGranted, isReady];
};
