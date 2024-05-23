import { FC } from 'react';

type Props = {
  tracks: string[];
  indexActive: number;
  selectTrack: (index: number) => void;
};

export const AudioPlayerTracks: FC<Props> = ({
  tracks,
  indexActive,
  selectTrack,
}) => {
  return (
    <ul className="max-h-32 overflow-scroll border border-b-0 border-t-0 border-pink-500">
      {tracks.map((track, index) => (
        <li key={track}>
          <button
            className={`${index === indexActive ? 'bg-pink-500' : ''} w-full border-b border-pink-500 px-5 py-1`}
            onClick={() => selectTrack(index)}
          >
            {track}
          </button>
        </li>
      ))}
    </ul>
  );
};
