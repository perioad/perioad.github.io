import { FC, PropsWithChildren } from 'react';

type Props = {
  number: number;
  overall: number;
  id: string;
};

export const Section: FC<PropsWithChildren<Props>> = ({
  number,
  overall,
  children,
  id,
}) => {
  return (
    <section
      id={id}
      className="flex h-screen snap-center flex-col bg-zinc-900 p-5"
    >
      <h1 className="text-right text-3xl sm:text-5xl">
        {number}/{overall}
      </h1>

      <div className="flex flex-grow justify-center">{children}</div>
    </section>
  );
};
