import { FC } from 'react';

type Props = {
  type: 'still' | 'waving';
  isVisible: boolean;
  isLoading?: boolean;
};

export const AvatarVideo: FC<Props> = ({ type, isVisible, isLoading }) => {
  return (
    <div className="w-full h-full absolute">
      <video
        src={`videos/${type}.mp4`}
        autoPlay
        muted
        loop
        className={`object-cover absolute top-0 left-0 w-full h-full`}
        style={{ display: isVisible ? 'block' : 'none' }}
      />

      {isLoading && (
        <p className="animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-zinc-900 bg-zinc-200 px-2">
          Loading...
        </p>
      )}
    </div>
  );
};
