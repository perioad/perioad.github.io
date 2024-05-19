import { Controls } from '../controls/Controls';
import { Socials } from '../socials/Socials';

export const Header = () => {
  return (
    <header className="fixed z-50 flex w-full justify-between px-5 py-3 backdrop-blur-sm">
      <Socials />

      <Controls />
    </header>
  );
};
