import { Socials } from '../socials/Socials';
import { ThemeButton } from '../theme-button/ThemeButton';

export const Header = () => {
  return (
    <header className="fixed z-50 flex w-full justify-between px-5 py-3 backdrop-blur-sm">
      <Socials />

      <ThemeButton />
    </header>
  );
};
