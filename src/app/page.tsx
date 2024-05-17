import { BgPattern } from '../components/bg-pattern/BgPattern';
import { Header } from '../components/header/Header';
import { MyContextProvider } from '../context/context';
import { General } from '../sections/general/General';
import { Mixing } from '../sections/mixing/Mixing';
import { Podcasting } from '../sections/podcasting/Podcasting';
import { SoftwareEngineering } from '../sections/software-engineering/SoftwareEngineering';

export default function Home() {
  return (
    <MyContextProvider>
      <BgPattern />

      <Header />

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
