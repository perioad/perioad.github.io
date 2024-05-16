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
    <section id={id} className="flex h-dvh snap-start flex-col items-center">
      <div className="flex flex-grow flex-col px-5 shadow-glass shadow-white backdrop-blur-sm sm:max-w-screen-md dark:shadow-black">
        <h1 className="w-full text-right text-3xl sm:text-5xl">
          {number}/{overall}
        </h1>

        {children}
      </div>
    </section>
  );
};
