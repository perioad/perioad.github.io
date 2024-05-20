'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { formatDuration } from '../../utils/duration.utils';
import { throttle } from 'lodash-es';

import css from './AudioPlayer.module.css';
import { useIsIos } from '../../hooks/useIsIos';
import { useAudioEffect } from '../../hooks/useAudioEffect';
import { useBgAnimationContext } from '../../context/BgAnimationContext';
import { useSpeakerContext } from '../../context/SpeakerContext';

type Props = {
  src: string;
};

export const AudioPlayer: FC<Props> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const durationRangeRef = useRef<HTMLInputElement>(null);
  const volumeRangeRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isIos] = useIsIos();
  const { toggleBgAnimationState } = useBgAnimationContext();
  const buttonDownSound = useAudioEffect('audio/button-down.mp3');
  const buttonUpSound = useAudioEffect('audio/button-up.mp3');
  const { isSpeakerAllowed, setIsSpeakerAllowed } = useSpeakerContext();

  const pressedButton = 'scale-[0.99] shadow-player-button';
  const playButtonStyles = isPlaying
    ? `${pressedButton} bg-pink-500`
    : 'bg-green-500';
  const muteButtonColor = isSpeakerAllowed
    ? 'bg-red-500'
    : `${pressedButton} bg-green-500`;
  const currentTimeFormatted = formatDuration(currentTime);
  const durationFormatted = formatDuration(duration);

  function handlePlayAudio() {
    buttonDownSound.current?.play();
    audioRef.current?.play();
    setIsPlaying(true);
    toggleBgAnimationState();
  }

  function handlePauseAudio() {
    buttonUpSound.current?.play();
    audioRef.current?.pause();
    setIsPlaying(false);
    toggleBgAnimationState();
  }

  function handleMute() {
    setIsSpeakerAllowed(!isSpeakerAllowed);

    if (isSpeakerAllowed) {
      buttonUpSound.current?.play();
    } else {
      buttonDownSound.current?.play();
    }
  }

  function handleDurationSliderChange() {
    const audioElement = audioRef.current;
    const durationRange = durationRangeRef.current;

    if (durationRange?.value) {
      setCurrentTime(Number(durationRange.value));

      if (audioElement) {
        audioElement.currentTime = Number(durationRange.value);
      }
    }
  }

  function handleVolumeSliderChange() {
    const audioElement = audioRef.current;
    const volumeRange = volumeRangeRef.current;

    if (audioElement && volumeRange) {
      const volumeInPercents = Number(volumeRange.value);
      const volume = volumeInPercents / 100;

      audioElement.volume = volume;
      setVolume(volumeInPercents);
    }
  }

  const handleTimeUpdate = throttle(function () {
    if (typeof audioRef.current?.duration === 'number') {
      setCurrentTime(Math.floor(audioRef.current.currentTime));
    }
  }, 1000);

  function handleAudioEnd() {
    setIsPlaying(false);
    setCurrentTime(0);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement?.readyState && audioElement.readyState > 0) {
      setDuration(Math.floor(audioElement.duration));

      return;
    }

    function handleAudioDuration() {
      if (typeof audioElement?.duration === 'number') {
        setDuration(Math.floor(audioElement.duration));
      }
    }

    audioElement?.addEventListener('loadedmetadata', handleAudioDuration);

    return () => {
      audioElement?.removeEventListener('loadedmetadata', handleAudioDuration);
    };
  }, []);

  return (
    <>
      <button
        onClick={() => (isPlaying ? handlePauseAudio() : handlePlayAudio())}
        className={` px-2 py-1 text-2xl transition-colors dark:text-zinc-900 ${playButtonStyles} hover:text-white`}
        title={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isPlaying ? 'stop' : 'play'}
      </button>

      <div className="flex flex-col gap-7">
        <p className=" flex justify-between">
          <span>{currentTimeFormatted}</span>
          <span>{durationFormatted}</span>
        </p>

        <input
          type="range"
          className={css.rangeInput}
          ref={durationRangeRef}
          max={duration}
          value={currentTime}
          onInput={handleDurationSliderChange}
          title="Change audio duration"
        />

        {!isIos && (
          <>
            <output className=" text-center">volume: {volume}</output>

            <input
              type="range"
              max="100"
              className={css.rangeInput}
              ref={volumeRangeRef}
              value={volume}
              onInput={handleVolumeSliderChange}
              title="Change audio volume"
            />
          </>
        )}

        <button
          className={` px-2 py-1 text-2xl transition-colors dark:text-zinc-900 ${muteButtonColor} hover:text-white`}
          onClick={handleMute}
          title={isSpeakerAllowed ? 'Unmute audio' : 'Mute audio'}
        >
          {isSpeakerAllowed ? 'mute' : 'unmute'}
        </button>
      </div>

      <audio
        ref={audioRef}
        muted={!isSpeakerAllowed}
        className=" hidden"
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnd}
      >
        <source src={`${src}.ogg`} type="audio/ogg" />
        <source src={`${src}.mp3`} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
};
