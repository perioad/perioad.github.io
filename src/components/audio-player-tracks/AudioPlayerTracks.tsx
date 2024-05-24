import { FC } from 'react';
import { useAudioEffect } from '../../hooks/useAudioEffect';

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
  const swooshSound = useAudioEffect('audio/swoosh.mp3');

  function handleHover() {
    swooshSound.current?.play();
  }

  return (
    <ul className="max-h-32 overflow-scroll border border-b-0 border-t-0 border-pink-500 sm:max-h-36">
      {tracks.map((track, index) => (
        <li className="group" key={track}>
          <button
            className={`${index === indexActive ? 'bg-pink-500' : ''} group w-full border-b border-pink-500 px-5 py-1 group-first:border-t`}
            onClick={() => selectTrack(index)}
            onMouseEnter={handleHover}
          >
            <span className="inline-block transition-all group-hover:scale-125">
              {track}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
