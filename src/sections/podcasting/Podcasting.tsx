import { memo } from 'react';
import { Emphasize } from '../../components/emphasize/Emphasize';
import { Section } from '../../components/section/Section';

export const Podcasting = memo(function Podcasting() {
  return (
    <Section number={3} overall={4} id="podcasting">
      <div className="flex flex-col gap-2 sm:gap-5">
        <p>
          in 2023 <Emphasize>perioad</Emphasize> with his friend{' '}
          <Emphasize>claudia</Emphasize> created a podcast{' '}
          <Emphasize>perigo</Emphasize>
        </p>

        <p>
          episodes contain:{' '}
          <Emphasize>
            friendly conversations about various topics, quizes, takes,
            marshmallows (silly or serious questions), interviews and more
          </Emphasize>
        </p>

        <iframe
          src="https://open.spotify.com/embed/episode/6RphzA4dA28uVSnLD0DNsB?utm_source=generator&theme=0"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ backgroundColor: 'rgb(40,40,40)' }}
          title="perigo episode '15. Road to USA - $15000, Jail Time and Much More' on Spotify"
        ></iframe>

        <iframe
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          height="187"
          loading="lazy"
          style={{ backgroundColor: '#f8f8fa' }}
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src="https://embed.podcasts.apple.com/gb/podcast/18-no-bullshit-only-takes-and-marshmallows/id1700967588?i=1000650802289"
          title="perigo episode '18. No Bullshit, Only Takes and Marshmallows' on Apple Podcasts"
        ></iframe>
      </div>
    </Section>
  );
});
