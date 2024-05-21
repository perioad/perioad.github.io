import { FC, PropsWithChildren, Suspense, useRef } from 'react';
import { useIsOnScreen } from '../../hooks/useIsOnScreen';
import { Section } from './Section';
import { Spinner } from '../spinner/Spinner';

export const LazySection: FC<PropsWithChildren> = ({ children }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isIntersected = useIsOnScreen(sectionRef);

  const Loader = () => (
    <div className=" mx-auto h-20 w-20">
      <Spinner />
    </div>
  );

  return (
    <Section ref={sectionRef}>
      {isIntersected && <Suspense fallback={<Loader />}>{children}</Suspense>}
    </Section>
  );
};
