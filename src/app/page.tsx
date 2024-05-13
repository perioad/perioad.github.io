import { BgPattern } from '../components/bg-pattern/BgPattern';
import { MyContextProvider } from '../context/context';
import { General } from '../sections/general/General';
import { Mixing } from '../sections/mixing/Mixing';
import { Podcasting } from '../sections/podcasting/Podcasting';
import { SoftwareEngineering } from '../sections/software-engineering/SoftwareEngineering';

export default function Home() {
  return (
    <MyContextProvider>
      <BgPattern />

      <main className=" h-dvh snap-y snap-mandatory overflow-y-scroll">
        <General />

        <SoftwareEngineering />

        <Podcasting />

        <Mixing />
      </main>
    </MyContextProvider>
  );
}
