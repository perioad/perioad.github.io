'use client';

import { useRef, useState } from 'react';
import { useIsWaving } from '../../hooks/useIsWaving';

const Avatar = () => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement>();
  const [isWaving, isAllowed] = useIsWaving(videoElement);

  const src = `videos/${isWaving ? 'happy' : 'serious'}.mp4`;

  return (
    <div>
      <video
        src={src}
        autoPlay
        muted
        loop
        className="object-cover rounded-full w-96 h-96"
      />

      <video
        ref={(node) => {
          node && setVideoElement(node);
        }}
        autoPlay
        playsInline
      />

      <button className="px-2 text-pink-700 border py1">Interact</button>
    </div>
  );
};

export default Avatar;
