'use client';

import { Bruno_Ace_SC, Lexend } from 'next/font/google';
import { BgPattern } from '../components/bg-pattern/BgPattern';
import { Header } from '../components/header/Header';
import { General } from '../sections/general/General';
import { Mixing } from '../sections/mixing/Mixing';
import { Podcasting } from '../sections/podcasting/Podcasting';
import { SoftwareEngineering } from '../sections/software-engineering/SoftwareEngineering';
import { useFontContext } from '../context/FontContext';
import { SpeakerPrompt } from '../components/speaker-prompt/SpeakerPrompt';

const regularFont = Bruno_Ace_SC({ weight: '400', subsets: ['latin'] });
const dyslexicFont = Lexend({ weight: '400', subsets: ['latin'] });

export default function Home() {
  const { isDyslexicFont } = useFontContext();

  const font = isDyslexicFont ? dyslexicFont : regularFont;

  return (
    <div className={`${font.className}`}>
      <SpeakerPrompt />

      <BgPattern />

      <Header />

      <main>
        <div
          className={`mx-auto px-5 pb-5 shadow-glass shadow-white backdrop-blur-sm sm:max-w-screen-md dark:shadow-black`}
        >
          <General />

          <SoftwareEngineering />

          <Podcasting />

          <Mixing />
        </div>
      </main>
    </div>
  );
}
