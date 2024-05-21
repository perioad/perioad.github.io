import { GithubIcon } from '../../icons/GithubIcon';
import { LinkedinIcon } from '../../icons/LinkedinIcon';
import { TwitterIcon } from '../../icons/TwitterIcon';
import { SocialIconLink } from '../social-icon-link/SocialIconLink';

export const Socials = () => {
  return (
    <div className="flex gap-5 sm:h-10">
      <SocialIconLink
        href="https://www.linkedin.com/in/perioad"
        title="Go to LinkedIn profile"
      >
        <LinkedinIcon />
      </SocialIconLink>

      <SocialIconLink
        href="https://x.com/perioad_"
        title="Go to Twitter/X profile"
      >
        <TwitterIcon />
      </SocialIconLink>

      <SocialIconLink
        href="https://github.com/perioad"
        title="Go to Github profile"
      >
        <GithubIcon />
      </SocialIconLink>
    </div>
  );
};
