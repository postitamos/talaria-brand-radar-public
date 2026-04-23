import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadPublicRankingsArtifact } from '../lib/rankings';
import type { PublicRankingsArtifact } from '../lib/public-artifacts';

type PublicRankingsState = {
  artifact: PublicRankingsArtifact | null;
  error: string | null;
  loading: boolean;
};

const PublicRankingsContext = createContext<PublicRankingsState | undefined>(undefined);

const RANKINGS_DATA_URL = '/data/public_brand_rankings.latest.json';

export function PublicRankingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PublicRankingsState>({
    artifact: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    void loadPublicRankingsArtifact(RANKINGS_DATA_URL)
      .then((artifact) => {
        if (!active) {
          return;
        }
        setState({ artifact, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        setState({
          artifact: null,
          error: error instanceof Error ? error.message : 'Falha ao carregar o ranking.',
          loading: false,
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => state, [state]);

  return <PublicRankingsContext.Provider value={value}>{children}</PublicRankingsContext.Provider>;
}

export function usePublicRankings() {
  const value = useContext(PublicRankingsContext);
  if (!value) {
    throw new Error('usePublicRankings must be used inside PublicRankingsProvider.');
  }
  return value;
}
