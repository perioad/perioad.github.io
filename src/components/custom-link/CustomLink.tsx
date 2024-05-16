'use client';

import { FC, HTMLAttributeAnchorTarget, PropsWithChildren } from 'react';

type Props = {
  href: string;
};

export const CustomLink: FC<PropsWithChildren<Props>> = ({
  href,
  children,
}) => {
  const isAnchor: boolean = href.startsWith('#');
  const target: HTMLAttributeAnchorTarget = isAnchor ? '_self' : '_blank';

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isAnchor) {
      e.preventDefault();

      const target = document.querySelector(href);

      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  return (
    <a
      href={href}
      className="border-b-2 border-pink-500 transition-all hover:bg-pink-500 hover:dark:text-zinc-900"
      target={target}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};
