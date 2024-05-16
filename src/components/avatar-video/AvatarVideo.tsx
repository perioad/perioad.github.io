import { FC } from 'react';

type Props = {
  type: 'still' | 'waving';
  isVisible: boolean;
  isLoading?: boolean;
};

export const AvatarVideo: FC<Props> = ({ type, isVisible, isLoading }) => {
  return (
    <div className="absolute h-full w-full">
      <video
        src={`video/${type}.mp4`}
        autoPlay
        muted
        loop
        playsInline
        className={`absolute left-0 top-0 h-full w-full object-cover`}
        style={{ display: isVisible ? 'block' : 'none' }}
      />

      {isLoading && (
        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse bg-zinc-200 px-2 text-3xl dark:text-zinc-900">
          Loading...
        </p>
      )}
    </div>
  );
};
