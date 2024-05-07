import { FC, PropsWithChildren } from 'react';

type Props = {
  number: number;
  overall: number;
};

export const Section: FC<PropsWithChildren<Props>> = ({
  number,
  overall,
  children,
}) => {
  return (
    <section className="h-screen p-3 bg-zinc-900 snap-center flex-col flex">
      <h1 className="text-5xl text-right">
        {number}/{overall}
      </h1>

      <div className="flex justify-center items-center flex-grow">
        {children}
      </div>
    </section>
  );
};
