'use client';

import { FC, useEffect } from 'react';
import { useIsWaving } from '../../hooks/useIsWaving';
import { AvatarVideo } from '../avatar-video/AvatarVideo';
import { Spinner } from '../spinner/Spinner';
import { WavingProps } from './Waving.model';

export const Waving: FC<WavingProps> = ({ onReady }) => {
  const { isWaving, isAccessGranted, isReady, attachVideo } = useIsWaving(500);

  const isInteractionReady = isAccessGranted === true && isReady === true;
  const isCameraDenied = isAccessGranted === false;
  // The camera was granted but the hand tracking itself could not start, which
  // is its own thing to say: blaming the camera would send people to a
  // permission dialog that is already set the way it needs to be.
  const isTrackingUnavailable = isReady === false;
  const messageClassName =
    ' w-3/4 mx-2 mt-5 text-center absolute left-1/2 transform -translate-x-1/2 bottom-5 dark:bg-zinc-900 bg-white animate-appear';

  useEffect(() => {
    if (isInteractionReady || isCameraDenied || isTrackingUnavailable) {
      onReady();
    }
  }, [isInteractionReady, isCameraDenied, isTrackingUnavailable, onReady]);

  return (
    <>
      <div className="absolute top-0 left-0 h-full w-full">
        {isReady === null && !isCameraDenied && (
          <div className="absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 sm:h-32 sm:w-32">
            <Spinner />
          </div>
        )}

        <AvatarVideo type="waving" isVisible={isWaving} />

        <video
          ref={attachVideo}
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

      {isTrackingUnavailable && (
        <p className={messageClassName}>
          your browser can&apos;t run the hand tracking, so this one is on me :c
        </p>
      )}
    </>
  );
};
