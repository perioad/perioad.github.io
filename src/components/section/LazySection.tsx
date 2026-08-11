import { FC, PropsWithChildren, Suspense, useRef } from 'react';
import { useIsOnScreen } from '../../hooks/useIsOnScreen';
import { Section } from './Section';
import { Spinner } from '../spinner/Spinner';

type Props = {
  id: string;
};

const Loader = () => (
  <div className="mx-auto h-20 w-20">
    <Spinner />
  </div>
);

export const LazySection: FC<PropsWithChildren<Props>> = ({ id, children }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isIntersected = useIsOnScreen(sectionRef);

  return (
    <Section ref={sectionRef} id={id}>
      {!isIntersected && <Loader />}

      {isIntersected && <Suspense fallback={<Loader />}>{children}</Suspense>}
    </Section>
  );
};
