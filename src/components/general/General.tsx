import { Avatar } from '../avatar/Avatar';
import { Section } from '../section/Section';

export const General = () => {
  return (
    <Section number={1} overall={2}>
      <div className=" flex gap-5 justify-between">
        <Avatar />

        <div className="flex gap-5 flex-col justify-center">
          <h1 className="text-5xl font-bold">
            <span className="text-pink-700">perioad</span> welcomes you
          </h1>

          <p className="text-2xl">
            who is <span className="text-pink-700">perioad</span>? he is a full
            time software engineer, a part time podcaster, a part time music
            mixer, a part time volleyball player
          </p>

          <p className="text-2xl">
            if you want to know more - scroll down and you will find more..
          </p>
        </div>
      </div>
    </Section>
  );
};
