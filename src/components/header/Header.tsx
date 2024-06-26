import { memo } from 'react';
import { Controls } from '../controls/Controls';
import { Socials } from '../socials/Socials';
import { HeaderLoader } from './HeaderLoader';

export const Header = memo(function Header() {
  return (
    <header className="fixed z-50 flex w-full justify-between px-5 py-3 backdrop-blur-sm">
      <Socials />

      <HeaderLoader />

      <Controls />
    </header>
  );
});
