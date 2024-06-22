'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { AvatarVideo } from '../avatar-video/AvatarVideo';
import { useAudioEffect } from '../../hooks/useAudioEffect';
import { useAliveContext } from '../../context/AliveContext';
import { useNetworkQualityGood } from '../../hooks/useNetworkQuality';
import { EntertainUntilInteractive } from '../entertain-until-interactive/EntertainUntilInteractive';
import { entertainingMessages } from '../../constants/entertaining-messages.constants';
import { WavingProps } from '../waving/Waving.model';

export const Avatar = () => {
  const [isInteractive, setIsInteractive] = useState(false);
  const [isWavingLoading, setIsWavingLoading] = useState(false);
  const [isWavingReady, setIsWavingReady] = useState(false);
  const [WavingComponent, setWavingComponent] =
    useState<FC<WavingProps> | null>(null);
  const bloopSound = useAudioEffect('audio/bloop.mp3');
  const { isAppAlive } = useAliveContext();
  const isNetworkQualityGood = useNetworkQualityGood();

  const shouldShowInteract =
    !isInteractive && isAppAlive && isNetworkQualityGood;
  const shouldShowEntertainment =
    isWavingLoading || (WavingComponent && !isWavingReady);

  function handleInteract() {
    setIsInteractive(true);
  }

  function handleInteractHover() {
    bloopSound.current?.play();
  }

  const handleWavingReady = useCallback(function handleWavingReady() {
    setIsWavingReady(true);
  }, []);

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
      <div className="relative h-60 w-60 overflow-hidden before:absolute before:left-1/2 before:top-1/2 before:h-[400px] before:w-[200px] before:origin-top before:-translate-x-1/2 before:animate-spin-border before:bg-gradient-to-l before:from-transparent before:via-pink-500 before:to-transparent motion-reduce:before:hidden sm:h-96 sm:w-96 sm:before:w-[300px]">
        <div className="relative h-full w-full">
          <AvatarVideo
            type="still"
            isVisible={true}
            isLoading={isWavingLoading}
          />
        </div>

        {WavingComponent && <WavingComponent onReady={handleWavingReady} />}

        {shouldShowInteract && (
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

      {shouldShowInteract && (
        <p className="text-center text-base leading-5 sm:text-xl">
          * you would need to give access to the webcam so you could interact
          with me
        </p>
      )}

      {shouldShowEntertainment && (
        <EntertainUntilInteractive messages={entertainingMessages} />
      )}
    </>
  );
};
