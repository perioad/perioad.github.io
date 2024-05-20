import { FontButton } from '../font-button/FontButton';
import { SpeakerButton } from '../speaker-button/SpeakerButton';
import { ThemeButton } from '../theme-button/ThemeButton';

export const Controls = () => {
  return (
    <div className="flex gap-5">
      <SpeakerButton />

      <FontButton />

      <ThemeButton />
    </div>
  );
};
