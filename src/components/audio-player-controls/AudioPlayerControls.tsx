import { FC, useEffect, useRef, useState } from 'react';
import { formatDuration } from '../../utils/duration.utils';
import { playAudio } from '../../utils/audio.utils';
import { throttle } from 'lodash-es';

import css from './AudioPlayerControls.module.css';
import { useIsIos } from '../../hooks/useIsIos';
import { useAudioEffect } from '../../hooks/useAudioEffect';
import { usePlayStateContext } from '../../context/PlayStateContext';
import { useSpeakerContext } from '../../context/SpeakerContext';
import { useIsOggCompatible } from '../../hooks/useIsOggCompatible';
import { Spinner } from '../spinner/Spinner';

type Props = {
  src: string;
};

export const AudioPlayerControls: FC<Props> = ({ src }) => {
  const durationRangeRef = useRef<HTMLInputElement>(null);
  const volumeRangeRef = useRef<HTMLInputElement>(null);
  const { isPlaying, setIsPlaying } = usePlayStateContext();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [volume, setVolume] = useState(100);
  const isIos = useIsIos();
  const isOggCompatible = useIsOggCompatible();
  const buttonDownSound = useAudioEffect('audio/button-down.mp3');
  const buttonUpSound = useAudioEffect('audio/button-up.mp3');
  const { isSpeakerAllowed, setIsSpeakerAllowed } = useSpeakerContext();
  const format = isOggCompatible ? 'ogg' : 'mp3';
  const prevMusicAudio = useRef<HTMLAudioElement | null>(null);
  const musicAudio = useAudioEffect(`${src}.${format}`, true);

  const pressedButton = 'scale-[0.99] shadow-player-button';
  const playButtonStyles = isPlaying
    ? `${pressedButton} bg-red-500`
    : 'bg-green-500';
  const muteButtonColor = isSpeakerAllowed
    ? 'bg-red-500'
    : `${pressedButton} bg-green-500`;
  const animationIfPlayingWhileMuted =
    isPlaying && !isSpeakerAllowed ? 'animate-bounce' : '';
  const currentTimeFormatted = formatDuration(currentTime);
  const durationFormatted = duration === null ? '0' : formatDuration(duration);
  const playButtonTitle = isPlaying ? 'Pause audio' : 'Play audio';
  const muteButtonTitle = isSpeakerAllowed ? 'Mute music' : 'Unmute music';

  // WebKit pauses a media element that is unmuted outside a user gesture, so
  // the track has to be unmuted here in the click handler. Leaving it to the
  // effect that syncs `muted` after the next render means playback starts muted
  // and Safari stops it again as soon as the effect runs.
  function unmuteMusic() {
    if (musicAudio.current) {
      musicAudio.current.muted = false;
    }
  }

  function handlePlayAudio() {
    // Play doubles as unmute: starting a track while muted leaves the transport
    // saying "stop" over silence, with nothing to tell playback apart from a
    // stuck player.
    if (!isSpeakerAllowed) {
      setIsSpeakerAllowed(true);
    }

    unmuteMusic();

    playAudio(buttonDownSound.current);
    playAudio(musicAudio.current);
    setIsPlaying(true);
  }

  function handlePauseAudio() {
    playAudio(buttonUpSound.current);
    musicAudio.current?.pause();
    setIsPlaying(false);
  }

  function handleMute() {
    const isAllowed = !isSpeakerAllowed;

    setIsSpeakerAllowed(isAllowed);

    if (isAllowed) {
      unmuteMusic();
      playAudio(buttonDownSound.current);
    } else {
      playAudio(buttonUpSound.current);
    }
  }

  function handleDurationSliderChange() {
    const audioElement = musicAudio.current;
    const durationRange = durationRangeRef.current;

    if (durationRange?.value) {
      setCurrentTime(Number(durationRange.value));

      if (audioElement) {
        audioElement.currentTime = Number(durationRange.value);
      }
    }
  }

  function handleVolumeSliderChange() {
    const audioElement = musicAudio.current;
    const volumeRange = volumeRangeRef.current;

    if (audioElement && volumeRange) {
      const volumeInPercents = Number(volumeRange.value);
      const volume = volumeInPercents / 100;

      audioElement.volume = volume;
      setVolume(volumeInPercents);
    }
  }

  useEffect(() => {
    const audioElement = musicAudio.current;

    if (!audioElement) {
      return;
    }

    function handleAudioEnd() {
      setIsPlaying(false);
      setCurrentTime(0);

      if (musicAudio.current) {
        musicAudio.current.currentTime = 0;
      }
    }

    const handleTimeUpdate = throttle(function () {
      if (typeof musicAudio.current?.duration === 'number') {
        setCurrentTime(Math.floor(musicAudio.current.currentTime));
      }
    }, 1000);

    audioElement.muted = !isSpeakerAllowed;
    audioElement.ontimeupdate = handleTimeUpdate;
    audioElement.onended = handleAudioEnd;
    audioElement.volume = volume / 100;

    if (isPlaying) {
      playAudio(audioElement);
    }
  }, [musicAudio, isSpeakerAllowed, volume, isPlaying, setIsPlaying]);

  // Duration belongs to the track, so it is read here rather than in the
  // playback effect above: that effect also depends on mute, volume and play
  // state, and re-reading `duration` on those meant a value sampled mid-track
  // replaced the one from `loadedmetadata`. For a long mix the browser reports
  // duration as an estimate that grows with what it has decoded, so muting ten
  // minutes in relabelled the track as ten minutes long.
  useEffect(() => {
    const audioElement = musicAudio.current;

    if (!audioElement) {
      return;
    }

    function readDuration() {
      const seconds = musicAudio.current?.duration;

      setDuration(
        seconds !== undefined && Number.isFinite(seconds)
          ? Math.floor(seconds)
          : null,
      );
    }

    readDuration();

    audioElement.addEventListener('loadedmetadata', readDuration);
    audioElement.addEventListener('durationchange', readDuration);

    return () => {
      audioElement.removeEventListener('loadedmetadata', readDuration);
      audioElement.removeEventListener('durationchange', readDuration);
    };
  }, [musicAudio]);

  useEffect(() => {
    if (prevMusicAudio.current) {
      prevMusicAudio.current.pause();
      prevMusicAudio.current.currentTime = 0;
    }

    prevMusicAudio.current = musicAudio.current;
  }, [musicAudio]);

  const durationElement =
    duration === null ? (
      <div className="h-8 w-8">
        <Spinner />
      </div>
    ) : (
      <span>{durationFormatted}</span>
    );

  return (
    <>
      <button
        onClick={() => (isPlaying ? handlePauseAudio() : handlePlayAudio())}
        className={`px-2 py-1 text-2xl transition-colors dark:text-zinc-900 ${playButtonStyles} hover:text-white`}
        title={playButtonTitle}
        aria-label={playButtonTitle}
      >
        {isPlaying ? 'stop' : 'play'}
      </button>

      <div className="flex flex-col gap-7">
        <div className="flex justify-between">
          <span>{currentTimeFormatted}</span>

          {durationElement}
        </div>

        <input
          type="range"
          className={css.rangeInput}
          ref={durationRangeRef}
          max={duration || 0}
          value={currentTime}
          onInput={handleDurationSliderChange}
          title="Change audio duration"
          aria-label="Change audio duration"
        />

        {!isIos && (
          <>
            <output className="text-center">volume: {volume}</output>

            <input
              type="range"
              max="100"
              className={css.rangeInput}
              ref={volumeRangeRef}
              value={volume}
              onInput={handleVolumeSliderChange}
              title="Change audio volume"
              aria-label="Change audio volume"
            />
          </>
        )}

        <button
          className={`${muteButtonColor} ${animationIfPlayingWhileMuted} px-2 py-1 text-2xl transition-colors hover:text-white dark:text-zinc-900`}
          onClick={handleMute}
          title={muteButtonTitle}
          aria-label={muteButtonTitle}
        >
          {isSpeakerAllowed ? 'mute' : 'unmute'}
        </button>
      </div>
    </>
  );
};
