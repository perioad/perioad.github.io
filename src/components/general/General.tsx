import { Avatar } from '../avatar/Avatar';
import { Section } from '../section/Section';

export const General = () => {
  return (
    <Section number={1} overall={1} id="general">
      <div className=" flex flex-col items-center gap-5">
        <div className="flex flex-col gap-2 text-xl sm:gap-5 sm:text-2xl">
          <h1 className="text-3xl font-bold sm:text-5xl">
            <span className="text-pink-700">perioad</span> welcomes you
          </h1>

          <p>who is he?</p>

          <p>
            he is a full time{' '}
            <a
              href="#software-engineering"
              className="inline-block border-b-2 border-pink-900 transition-all hover:bg-pink-900"
            >
              software engineer
            </a>
            , a part time{' '}
            <a
              href="#podcasting"
              className="inline-block border-b-2 border-pink-900 transition-all hover:bg-pink-900"
            >
              podcaster
            </a>
            , a part time{' '}
            <a
              href="#music-mixing"
              className="inline-block border-b-2 border-pink-900 transition-all hover:bg-pink-900"
            >
              music mixer
            </a>
            , a part time{' '}
            <a
              href="#volleyballing"
              className="inline-block border-b-2 border-pink-900 transition-all hover:bg-pink-900"
            >
              volleyball player
            </a>
          </p>

          <p>if you want to know more - scroll down and you will find more..</p>
        </div>

        <Avatar />
      </div>
    </Section>
  );
};
