'use client';

import { useState } from 'react';
import { useIsWaving } from '../../hooks/useIsWaving';
import { AvatarVideo } from '../avatar-video/AvatarVideo';

export const Waving = () => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );
  const [isWaving, isAccessGranted, isReady] = useIsWaving(videoElement, 1000);

  const isInteractionReady = isAccessGranted === true && isReady === true;
  const isCameraDenied = isAccessGranted === false;
  const messageClassName =
    ' w-3/4 mx-2 mt-5 text-center absolute left-1/2 transform -translate-x-1/2 bottom-5 dark:bg-zinc-900 bg-white';

  return (
    <>
      <div className="relative h-full w-full">
        <AvatarVideo
          type="still"
          isVisible={!isWaving}
          isLoading={isReady === null && !isCameraDenied}
        />

        <AvatarVideo type="waving" isVisible={isWaving} />

        <video
          ref={(node) => {
            node && setVideoElement(node);
          }}
          className="absolute -z-50 opacity-0"
          autoPlay
          playsInline
        />
      </div>

      {isInteractionReady && (
        <p className={messageClassName}>
          wave to me and i&apos;ll wave back :)
        </p>
      )}

      {isCameraDenied && (
        <p className={messageClassName}>
          either there is no camera on your device or permission wasn&apos;t
          granted :c
        </p>
      )}
    </>
  );
};
