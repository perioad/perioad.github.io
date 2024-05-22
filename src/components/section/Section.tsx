import { PropsWithChildren, forwardRef } from 'react';

type Props = {
  id?: string;
};

export const Section = forwardRef<HTMLElement, PropsWithChildren<Props>>(
  function Section({ id, children }, ref) {
    return (
      <section
        id={id}
        ref={ref}
        className="flex min-h-screen flex-grow flex-col pt-16"
      >
        {children}
      </section>
    );
  },
);
