'use client';

import { useState } from 'react';
import { useIsWaving } from '../../hooks/useIsWaving';
import { AvatarVideo } from '../avatar-video/AvatarVideo';

export const Waving = () => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );
  const [isWaving, isAccessGranted, isReady] = useIsWaving(videoElement, 1000);

  const isInteractionReady = isAccessGranted === true && isReady === true;
  const isCameraDenied = isAccessGranted === false;

  return (
    <>
      <div className="w-96 h-96 relative">
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
          className="opacity-0 absolute -z-50"
          autoPlay
          playsInline
        />
      </div>

      {isInteractionReady && <p>Wave to me and I&apos;ll wave back :)</p>}

      {isCameraDenied && (
        <p>
          Either there is no camera on your device or permission wasn&apos;t
          granted :c
        </p>
      )}
    </>
  );
};
