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
    <div>
      {!WavingComponent && (
        <div className="w-96 h-96 relative">
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
          className=" px-5 text-pink-700 border py-1 text-2xl mt-5 mx-auto block"
          onClick={handleInteract}
        >
          Interact
        </button>
      )}
    </div>
  );
};
