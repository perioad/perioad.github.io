'use client';

import { FC, useEffect, useState } from 'react';
import { useIsWaving } from '../../hooks/useIsWaving';
import { AvatarVideo } from '../avatar-video/AvatarVideo';
import { Spinner } from '../spinner/Spinner';
import { WavingProps } from './Waving.model';

export const Waving: FC<WavingProps> = ({ onReady }) => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );
  const [isWaving, isAccessGranted, isReady] = useIsWaving(videoElement, 500);

  const isInteractionReady = isAccessGranted === true && isReady === true;
  const isCameraDenied = isAccessGranted === false;
  const messageClassName =
    ' w-3/4 mx-2 mt-5 text-center absolute left-1/2 transform -translate-x-1/2 bottom-5 dark:bg-zinc-900 bg-white animate-appear';

  useEffect(() => {
    if (isInteractionReady || isCameraDenied) {
      onReady();
    }
  }, [isInteractionReady, isCameraDenied, onReady]);

  return (
    <>
      <div className=" absolute left-0 top-0 h-full w-full">
        {isReady === null && !isCameraDenied && (
          <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 sm:h-32 sm:w-32">
            <Spinner />
          </div>
        )}

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
