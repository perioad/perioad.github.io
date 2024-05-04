import { useEffect, useRef, useState } from 'react';
import * as handTrack from 'handtrackjs';

export const useIsWaving = (videoRef: HTMLVideoElement | undefined) => {
  const [isWaving, setIsWaving] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const modelRef = useRef<handTrack.ObjectDetection | null>(null);

  useEffect(() => {
    console.log('videoRef: ', videoRef);

    if (!videoRef) {
      return;
    }

    async function trackHand() {
      const params = {
        flipHorizontal: true,
        maxNumBoxes: 2,
        scoreThreshold: 0.6,
      };

      try {
        console.log(1);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        console.log(2);
        videoRef!.srcObject = stream;
      } catch {
        setIsAllowed(false);
      }
      console.log(3);
      modelRef.current = await handTrack.load(params);
      intervalRef.current = setInterval(async () => {
        console.log('videoRef2222: ', videoRef);
        const predictions = await modelRef.current?.detect(videoRef!);
        console.log('predictions: ', predictions);
        const hand = predictions?.find((prediction) => prediction.class === 1);
        console.log('hand: ', hand);

        setIsWaving(!!hand);
      }, 1000);
    }

    trackHand();

    return () => {
      modelRef.current?.dispose();
      clearInterval(intervalRef.current);
    };
  }, [videoRef]);

  return [isWaving, isAllowed];
};
