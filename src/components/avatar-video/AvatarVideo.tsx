import { FC } from 'react';
import { Spinner } from '../spinner/Spinner';

type Props = {
  type: 'still' | 'waving';
  isVisible: boolean;
  isLoading?: boolean;
};

export const AvatarVideo: FC<Props> = ({ type, isVisible, isLoading }) => {
  return (
    <div className="absolute flex h-full w-full items-center justify-center">
      <video
        src={`video/${type}.mp4`}
        autoPlay
        muted
        loop
        playsInline
        className={`relative h-[98%] w-[98%] bg-white object-cover dark:bg-black`}
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
