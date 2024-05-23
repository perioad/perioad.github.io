import { useState } from 'react';
import { AudioPlayerControls } from '../audio-player-controls/AudioPlayerControls';
import { AudioPlayerTracks } from '../audio-player-tracks/AudioPlayerTracks';

const tracks = [
  `hard times`,
  `windsandsun`,
  `2020 wasn't that bad`,
  `2020 is almost over`,
  `carousel part II`,
  `carousel part I`,
  `music is different`,
  `let's leave it here`,
];

export const AudioPlayer = () => {
  const [indexActive, setIndexActive] = useState(0);

  const track = tracks[indexActive];
  const src = `music/${track}`;

  function handleSelectTrack(index: number) {
    setIndexActive(index);
  }

  return (
    <>
      <AudioPlayerTracks
        tracks={tracks}
        indexActive={indexActive}
        selectTrack={handleSelectTrack}
      />

      <AudioPlayerControls src={src} />
    </>
  );
};
