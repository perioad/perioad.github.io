'use client';

import { useEffect, useState } from 'react';
import { AvatarVideo } from '../avatar-video/AvatarVideo';

export const Avatar = () => {
  const [isInteractive, setIsInteractive] = useState(false);
  const [isWavingLoading, setIsWavingLoading] = useState(false);
  const [WavingComponent, setWavingComponent] = useState<any | null>(null);

  function handleInteract() {
    setIsInteractive(true);
  }

  useEffect(() => {
    async function getWavingComponent() {
      setIsWavingLoading(true);

      try {
        const { Waving } = await import('../waving/Waving');

        setWavingComponent(() => Waving);
      } catch {
        setIsWavingLoading(false);
      }
    }

    if (isInteractive) {
      getWavingComponent();
    }
  }, [isInteractive]);

  return (
    <div className="relative h-60 w-60 sm:h-96 sm:w-96">
      {!WavingComponent && (
        <div className="relative h-full w-full">
          <AvatarVideo
            type="still"
            isVisible={true}
            isLoading={isWavingLoading}
          />
        </div>
      )}

      {WavingComponent && <WavingComponent />}

      {!isInteractive && (
        <button
          className=" absolute bottom-5 left-1/2 block -translate-x-1/2 transform border border-none bg-zinc-900 px-5 py-1 text-2xl text-pink-500 transition-all hover:rotate-2 hover:text-pink-500 active:scale-95 sm:bottom-10"
          onClick={handleInteract}
        >
          interact
        </button>
      )}

      {!isInteractive && (
        <p className="text-center text-base leading-5 sm:text-xl">
          * you would need to give access to the webcam so you could interact
          with me
        </p>
      )}
    </div>
  );
};
