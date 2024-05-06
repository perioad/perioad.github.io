'use client';

import { use, useEffect, useRef, useState } from 'react';
import { AvatarVideo } from '../avatar-video/AvatarVideo';
// import { useIsWaving } from '../../hooks/useIsWaving';

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

      const { Waving } = await import('../waving/Waving');

      setIsWavingLoading(false);

      setWavingComponent(() => Waving);
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
          className="px-2 text-pink-700 border py1"
          onClick={handleInteract}
        >
          Interact
        </button>
      )}
    </div>
  );
};
