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
    <section id={id} className="flex min-h-screen flex-grow flex-col pt-16">
      {children}
    </section>
  );
};
