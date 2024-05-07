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
    <div className="relative">
      {!WavingComponent && (
        <div className="relative h-96 w-96">
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
          className=" absolute bottom-5 left-1/2 block -translate-x-1/2 transform border border-none bg-zinc-900 px-5 py-1 text-2xl text-pink-700 transition-all hover:rotate-2 hover:text-pink-600 active:scale-95"
          onClick={handleInteract}
        >
          Interact
        </button>
      )}
    </div>
  );
};
