'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { formatDuration } from '../../utils/duration.utils';
import { throttle } from 'lodash-es';

import css from './Audio.module.css';
import { isIOS } from '../../utils/device-detection.utils';

type Props = {
  src: string;
};

const isIos = isIOS();

export const Audio: FC<Props> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const durationRangeRef = useRef<HTMLInputElement>(null);
  const volumeRangeRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);

  const playButtonColor = isPlaying ? 'bg-pink-500' : 'bg-green-500';
  const muteButtonColor = isMuted ? 'bg-green-500' : 'bg-red-500';
  const currentTimeFormatted = formatDuration(currentTime);
  const durationFormatted = formatDuration(duration);

  function handlePlayAudio() {
    setIsPlaying(true);
    audioRef.current?.play();
  }

  function handlePauseAudio() {
    setIsPlaying(false);
    audioRef.current?.pause();
  }

  function handleMute() {
    setIsMuted((prev) => !prev);
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

    if (durationRangeRef.current) {
      durationRangeRef.current.value = '0';
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
        className={` px-2 py-1 text-2xl text-zinc-900 transition-all ${playButtonColor} hover:text-white`}
      >
        {isPlaying ? 'stop' : 'play'}
      </button>

      <div className="flex flex-col gap-5">
        <p className=" flex justify-between">
          <span>{currentTimeFormatted}</span>
          <span>{durationFormatted}</span>
        </p>

        <input
          type="range"
          defaultValue="0"
          className={css.rangeInput}
          ref={durationRangeRef}
          max={duration}
          onInput={handleDurationSliderChange}
        />

        <output className=" text-center">volume: {volume}</output>

        {!isIos && (
          <input
            type="range"
            max="100"
            defaultValue="100"
            className={css.rangeInput}
            ref={volumeRangeRef}
            onInput={handleVolumeSliderChange}
          />
        )}

        <button
          className={` px-2 py-1 text-2xl text-zinc-900 transition-all ${muteButtonColor} hover:text-white`}
          onClick={handleMute}
        >
          {isMuted ? 'unmute' : 'mute'}
        </button>
      </div>

      <audio
        ref={audioRef}
        src={src}
        muted={isMuted}
        className=" hidden"
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnd}
      ></audio>
    </>
  );
};
