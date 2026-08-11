import { useEffect, useState } from 'react';

// Read on the first render rather than in an effect so a client-only tree gets
// the right answer before paint, which stops a desktop layout from flashing the
// mobile one. The `typeof window` guard only matters if this is ever used
// somewhere that server renders.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    function updateMatches() {
      setMatches(mediaQuery.matches);
    }

    updateMatches();

    mediaQuery.addEventListener('change', updateMatches);

    return () => {
      mediaQuery.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}
