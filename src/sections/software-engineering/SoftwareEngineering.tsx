import { lazy } from 'react';
import { LazySection } from '../../components/section/LazySection';

const SoftwareEngineeringContent = lazy(() =>
  import('./SoftwareEngineeringContent').then((mod) => ({
    default: mod.SoftwareEngineeringContent,
  })),
);

export const SoftwareEngineering = function SoftwareEngineering() {
  return (
    <LazySection id="software-engineering">
      <SoftwareEngineeringContent />
    </LazySection>
  );
};
