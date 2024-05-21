import { memo } from 'react';
import { AudioPlayer } from '../../components/audio-player/AudioPlayer';
import { Emphasize } from '../../components/emphasize/Emphasize';

export const MixingContent = memo(function MixingContent() {
  return (
    <div className="flex animate-appear flex-col gap-2 sm:gap-5">
      <p>
        <Emphasize>perioad</Emphasize> loves listening to music and sometimes he
        mixes the most beloved tracks from a period of his life into a single
        mix
      </p>

      <p>
        give a shot to a selected track <Emphasize>windsandsun</Emphasize>:
      </p>

      <AudioPlayer src="audio/windsandsun" />
    </div>
  );
});
