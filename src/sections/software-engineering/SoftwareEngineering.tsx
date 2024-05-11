import { Emphasize } from '../../components/emphasize/Emphasize';
import { CustomLink } from '../../components/custom-link/CustomLink';
import { Section } from '../../components/section/Section';

export const SoftwareEngineering = () => {
  return (
    <Section number={2} overall={4} id="software-engineering">
      <div className="flex flex-col gap-2 sm:gap-5">
        <p>
          <Emphasize>perioad</Emphasize> has been writing code since 2019 at{' '}
          <CustomLink href="https://www.epam.com">epam systems</CustomLink>
        </p>

        <p>
          since then he worked with:{' '}
          <Emphasize>
            javascript, typescript, angular, react, angularjs (lol i know),
            nodejs, express, git, jasmine, jest, sass, less, tailwind,
            bootstrap, html, css, nextjs, docker, ngrx, rxjs, redux, aws, azure,
            mongodb
          </Emphasize>
        </p>

        <p>
          in a spare time aside other activities he likes to do side/pet
          projects which you can find on his{' '}
          <CustomLink href="https://www.github.com/perioad">
            github acc
          </CustomLink>
        </p>
      </div>
    </Section>
  );
};
