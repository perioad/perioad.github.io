import { lazy } from 'react';
import { LazySection } from '../../components/section/LazySection';

const MixingContent = lazy(() =>
  import('./MixingContent').then((mod) => ({
    default: mod.MixingContent,
  })),
);

export const Mixing = function Mixing() {
  return (
    <LazySection>
      <MixingContent />
    </LazySection>
  );
};
