import { useAliveContext } from '../../context/AliveContext';
import { FontButton } from '../font-button/FontButton';
import { SpeakerButton } from '../speaker-button/SpeakerButton';
import { ThemeButton } from '../theme-button/ThemeButton';

export const Controls = () => {
  const { isAppAlive } = useAliveContext();

  if (!isAppAlive) {
    return null;
  }

  return (
    <div className="flex gap-5">
      <SpeakerButton />

      <FontButton />

      <ThemeButton />
    </div>
  );
};
