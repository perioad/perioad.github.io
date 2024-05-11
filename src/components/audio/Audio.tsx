'use client';

import { FC, useRef, useState } from 'react';

type Props = {
  src: string;
};

export const Audio: FC<Props> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const buttonColor = isPlaying ? 'bg-pink-500' : 'bg-green-500';

  function playAudio() {
    setIsPlaying(true);
    audioRef.current?.play();
  }

  function pauseAudio() {
    setIsPlaying(false);
    audioRef.current?.pause();
  }

  return (
    <>
      <button
        onClick={() => (isPlaying ? pauseAudio() : playAudio())}
        className={` px-2 py-1 text-2xl text-zinc-900 transition-all ${buttonColor} hover:text-white`}
      >
        {isPlaying ? 'stop' : 'play'}
      </button>

      <audio ref={audioRef} src={src} className=" hidden"></audio>
    </>
  );
};
