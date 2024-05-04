import { FC } from 'react';

type Props = {
  number: number;
  overall: number;
};

export const Section: FC<Props> = ({ number, overall }) => {
  return (
    <section className="h-screen p-3 bg-slate-300 snap-center">
      <h1 className="text-5xl text-right">
        {number}/{overall}
      </h1>
    </section>
  );
};
