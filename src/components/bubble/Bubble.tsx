import { useState } from 'react';
import { useSpeakerContext } from '../../context/SpeakerContext';
import css from './Bubble.module.css';
import { useAudioEffect } from '../../hooks/useAudioEffect';

export const Bubble = () => {
  const { isSpeakerAllowed } = useSpeakerContext();
  const [isPopped, setIsPopped] = useState(false);
  const popSound = useAudioEffect('audio/pop.mp3');

  if (!isSpeakerAllowed || isPopped) {
    return null;
  }

  function handleClick() {
    popSound.current?.play();
    setIsPopped(true);
  }

  return (
    <button
      className={css.bubble}
      onClick={handleClick}
      aria-label="Bubble to pop to activate sound effects"
    >
      <span className={css.bubbleText}>pop me</span>
    </button>
  );
};
