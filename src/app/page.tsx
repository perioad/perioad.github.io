import { BgPattern } from '../components/bg-pattern/BgPattern';
import { ThemeButton } from '../components/theme-button/ThemeButton';
import { MyContextProvider } from '../context/context';
import { General } from '../sections/general/General';
import { Mixing } from '../sections/mixing/Mixing';
import { Podcasting } from '../sections/podcasting/Podcasting';
import { SoftwareEngineering } from '../sections/software-engineering/SoftwareEngineering';

export default function Home() {
  return (
    <MyContextProvider>
      <BgPattern />

      <header className="fixed z-50 flex w-full justify-end px-5 py-3 backdrop-blur-sm">
        <ThemeButton />
      </header>

      <main>
        <div className="mx-auto px-5 shadow-glass shadow-white backdrop-blur-sm sm:max-w-screen-md dark:shadow-black">
          <General />

          <SoftwareEngineering />

          <Podcasting />

          <Mixing />
        </div>
      </main>
    </MyContextProvider>
  );
}
