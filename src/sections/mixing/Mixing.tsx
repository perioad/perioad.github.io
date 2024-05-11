import { Audio } from '../../components/audio/Audio';
import { Emphasize } from '../../components/emphasize/Emphasize';
import { Section } from '../../components/section/Section';

export const Mixing = () => {
  return (
    <Section number={4} overall={4} id="mixing">
      <div className="flex flex-col gap-2 sm:gap-5">
        <p>
          <Emphasize>perioad</Emphasize> loves listening to music and sometimes
          he mixes the most beloved tracks from a period of his life into a
          single mix
        </p>

        <p>
          give a shot to a <Emphasize>selected track</Emphasize>:
        </p>

        <Audio src="audio/windsandsun.mp3" />
      </div>
    </Section>
  );
};
