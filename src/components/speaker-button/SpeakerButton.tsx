'use client';

import { useSpeakerContext } from '../../context/SpeakerContext';
import { useAudioEffect } from '../../hooks/useAudioEffect';
import { SpeakerOffIcon } from '../../icons/SpeakerOffIcon';
import { SpeakerOnIcon } from '../../icons/SpeakerOnIcon';

export const SpeakerButton = () => {
  const { isSpeakerAllowed, setIsSpeakerAllowed } = useSpeakerContext();
  const badumSound = useAudioEffect('audio/badum.mp3');

  const shouldShowSpeakerButton = isSpeakerAllowed !== null;
  const speakerIconCommonClasses = `absolute left-1/2 top-1/2 block h-5 w-5 -translate-x-1/2 transition-all hover:scale-110 sm:h-7 sm:w-7`;
  const speakerOnIconTranslateY = isSpeakerAllowed
    ? 'translate-y-[200%]'
    : '-translate-y-1/2';
  const speakerOffIconTranslateY = isSpeakerAllowed
    ? '-translate-y-1/2'
    : '-translate-y-[200%]';
  const title = isSpeakerAllowed
    ? 'Mute audio effects'
    : 'Unmute audio effects';

  function handleToggleSpeaker() {
    if (!isSpeakerAllowed) {
      badumSound.current?.play();
    }

    setIsSpeakerAllowed(!isSpeakerAllowed);
  }

  if (!shouldShowSpeakerButton) {
    return null;
  }

  return (
    <button
      className={`relative h-8 w-8 overflow-hidden bg-pink-500 text-white hover:text-zinc-900 sm:h-10 sm:w-10 dark:text-zinc-900 dark:hover:text-white`}
      title={title}
      aria-label={title}
      onClick={handleToggleSpeaker}
    >
      <span
        className={`${speakerIconCommonClasses} ${speakerOnIconTranslateY}`}
      >
        <SpeakerOnIcon />
      </span>

      <span
        className={`${speakerIconCommonClasses} ${speakerOffIconTranslateY}`}
      >
        <SpeakerOffIcon />
      </span>
    </button>
  );
};
