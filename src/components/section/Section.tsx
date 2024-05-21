import { PropsWithChildren, forwardRef } from 'react';

export const Section = forwardRef<HTMLElement, PropsWithChildren>(
  function Section({ children }, ref) {
    return (
      <section ref={ref} className="flex min-h-screen flex-grow flex-col pt-16">
        {children}
      </section>
    );
  },
);
