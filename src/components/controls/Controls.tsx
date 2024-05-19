import { FontButton } from '../font-button/FontButton';
import { ThemeButton } from '../theme-button/ThemeButton';

export const Controls = () => {
  return (
    <div className="flex gap-5">
      <FontButton />

      <ThemeButton />
    </div>
  );
};
