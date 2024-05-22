'use client';

import { useEffect, useState } from 'react';
import { AvatarVideo } from '../avatar-video/AvatarVideo';
import { useAudioEffect } from '../../hooks/useAudioEffect';

export const Avatar = () => {
  const [isInteractive, setIsInteractive] = useState(false);
  const [isWavingLoading, setIsWavingLoading] = useState(false);
  const [WavingComponent, setWavingComponent] = useState<any | null>(null);
  const bloopSound = useAudioEffect('audio/bloop.mp3');

  function handleInteract() {
    setIsInteractive(true);
  }

  function handleInteractHover() {
    bloopSound.current?.play();
  }

  useEffect(() => {
    async function getWavingComponent() {
      setIsWavingLoading(true);

      try {
        const { Waving } = await import('../waving/Waving');

        setWavingComponent(() => Waving);
      } finally {
        setIsWavingLoading(false);
      }
    }

    if (isInteractive) {
      getWavingComponent();
    }
  }, [isInteractive]);

  return (
    <>
      <div className="before:animate-spin-border relative h-60 w-60 overflow-hidden before:absolute before:left-1/2 before:top-1/2 before:h-[400px] before:w-[200px] before:origin-top before:-translate-x-1/2 before:bg-gradient-to-l before:from-transparent before:via-pink-500 before:to-transparent sm:h-96 sm:w-96 sm:before:w-[300px]">
        <div className="relative h-full w-full">
          <AvatarVideo
            type="still"
            isVisible={true}
            isLoading={isWavingLoading}
          />
        </div>

        {WavingComponent && <WavingComponent />}

        {!isInteractive && (
          <button
            className=" absolute bottom-5 left-1/2 block -translate-x-1/2 transform border border-none bg-zinc-900 px-5 py-1 text-2xl text-pink-500 transition-all hover:rotate-2 active:scale-95 sm:bottom-10 "
            onClick={handleInteract}
            onMouseEnter={handleInteractHover}
            aria-label="Press, give access to the webcam and wave to me so I could wave back :)"
          >
            interact
          </button>
        )}
      </div>

      {!isInteractive && (
        <p className="text-center text-base leading-5 sm:text-xl">
          * you would need to give access to the webcam so you could interact
          with me
        </p>
      )}
    </>
  );
};
