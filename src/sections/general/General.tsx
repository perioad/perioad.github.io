import { memo } from 'react';
import { Avatar } from '../../components/avatar/Avatar';
import { CustomLink } from '../../components/custom-link/CustomLink';
import { Emphasize } from '../../components/emphasize/Emphasize';
import { Section } from '../../components/section/Section';
import { Bubble } from '../../components/bubble/Bubble';

export const General = memo(function General() {
  return (
    <Section>
      <Bubble />

      <div className=" flex flex-col items-center gap-5">
        <div className="flex flex-col gap-2 sm:gap-5">
          <h1 className="text-3xl font-bold sm:text-5xl">
            <Emphasize>perioad</Emphasize> welcomes you
          </h1>

          <p>who is he?</p>

          <p>
            he is a full time{' '}
            <CustomLink href="#software-engineering">
              software engineer
            </CustomLink>
            , a part time <CustomLink href="#podcasting">podcaster</CustomLink>,
            a part time <CustomLink href="#mixing">music mixer</CustomLink>
          </p>
        </div>

        <Avatar />
      </div>
    </Section>
  );
});
