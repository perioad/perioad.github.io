import { FC } from 'react';
import { Spinner } from '../spinner/Spinner';

type Props = {
  type: 'still' | 'waving';
  isVisible: boolean;
  isLoading?: boolean;
};

export const AvatarVideo: FC<Props> = ({ type, isVisible, isLoading }) => {
  console.log('AvatarVideo render');
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
        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 sm:h-32 sm:w-32">
          <Spinner />
        </div>
      )}
    </div>
  );
};
