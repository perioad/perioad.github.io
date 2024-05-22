import { lazy } from 'react';
import { LazySection } from '../../components/section/LazySection';

const PodcastingContent = lazy(() =>
  import('./PodcastingContent').then((mod) => ({
    default: mod.PodcastingContent,
  })),
);

export const Podcasting = function Podcasting() {
  return (
    <LazySection id="podcasting">
      <PodcastingContent />
    </LazySection>
  );
};
