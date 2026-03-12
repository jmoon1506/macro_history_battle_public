import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Polity, Topic, Duel, EvalEntry } from '../types';

const SLIM_URL = 'https://gist.githubusercontent.com/jmoon1506/d14bc54f10786a2da3fe62dc36334ee8/raw/macro_history_battle.json';

const EVAL_GIST_IDS: Record<number, string> = {
  1: "c9ce3f7854e9e6980acf31eb0ae8e248",
  2: "dda21406983b279269430d973c255e4c",
  3: "81ec23efba98e5c5e5903ab9af17a0c6",
  4: "b867a364195ab7ba82e14f65fd980588",
  5: "6a98b34772b83f9e80c71b0ca5b844af",
  6: "6cc110598f056d536bc0c0850e56498b",
  7: "2f4c8b656f024e9310df4c18b9611976",
  8: "775f60407bf59aa4a974974f429fa95e",
  9: "341cfffdf062650bd54e441c919b7501",
  10: "0faff692d586c458f2918c638edea691",
  11: "fc31747601f9181a381be5318a0238bd",
  12: "c400b600321cc2e67a72386e1e5716b4",
  13: "8de9c04fa7a6065d9fbbc68ef935ecbb",
  14: "b780085eb48ec8af13ba20eeede62756",
  15: "5f3456d4cfd13d83d8e86088c048dd0a",
  16: "0485d0fc3fe159d344f16f2794370bc3",
  17: "88d82a38f3b07c785c23c4f18ef70c84",
  18: "bcc436d2b8b77e02d71db1734c76886d",
  19: "bec2077e5d558ace045ad5e3733c2d93",
  20: "ee0f9fc7a99cbf90b053f33dfd75cd05",
  21: "6ca666daee238da44542d5a761ca2e72",
  22: "eb08afa37e8500faed1029bbc1c9ba66",
  23: "10579220084c13de033af0f2d5779c91",
  24: "49c0d09268af65dcf169c5918a0c895f",
  25: "0cfe6d262f3a67bdd093d3eec3d655d8",
  26: "ecbe1f90e79052355e07450b51dd9d56",
  27: "83f4f7f236211e5d9941c6ff4bd888f6",
  28: "10025f1f9ed58b1ab4059d560edf1c3c",
  29: "73e064f3474c1ad0e84b83b842e0b32c",
  30: "1a74fac29f062002a08b126d3b7c7766",
  31: "3d3422fdfe8e598c524ca0a860b0e1f6",
  32: "a6466e866d87b60df39822ce481f7a5c",
  33: "471c78eb966f4084e7e712e8a6ac1643",
  34: "d7eadf24567978c9a0d7655954d38e0d",
  35: "cf0c68a3737a914e2bd26440af9dac37",
  36: "7e7556b09288472a8a0a0df37412f272",
  37: "1b62d731bf22af060dab7c7aa28bfbfb",
  38: "3d747936993a1800db09bb0c67db061d",
  39: "a304710f0d97f8a8b9ad342b2b21026b",
  40: "8e951ae97bfc3a03954f9caedea62d0a",
};

function evalGistUrl(polityId: number): string | null {
  const gistId = EVAL_GIST_IDS[polityId];
  if (!gistId) return null;
  return `https://gist.githubusercontent.com/jmoon1506/${gistId}/raw/evaluations_polity_${polityId}.json`;
}

export type Mode = 'qol' | 'darwinian';

interface DataState {
  polities: Polity[];
  topics: Topic[];
  duels: Duel[];
  polityMap: Map<number, Polity>;
  topicMap: Map<number, Topic>;
  loading: boolean;
  error: string | null;
  mode: Mode;
  setMode: (mode: Mode) => void;
  getEvaluation: (duel: Duel) => string | null;
  fetchEvaluations: (polityAId: number) => void;
  evalLoading: (polityAId: number) => boolean;
}

const DataContext = createContext<DataState | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

const MODE_TO_CATEGORY: Record<Mode, string> = {
  qol: 'quality-of-life',
  darwinian: 'cultural-darwinism',
};

export function categoryForMode(mode: Mode): string {
  return MODE_TO_CATEGORY[mode];
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('qol');
  const [state, setState] = useState<{
    polities: Polity[];
    topics: Topic[];
    duels: Duel[];
    polityMap: Map<number, Polity>;
    topicMap: Map<number, Topic>;
    loading: boolean;
    error: string | null;
  }>({
    polities: [],
    topics: [],
    duels: [],
    polityMap: new Map(),
    topicMap: new Map(),
    loading: true,
    error: null,
  });

  // Cache: polity_a_id -> Map<duel_id, evaluation>
  const evalCacheRef = useRef<Map<number, Map<number, string>>>(new Map());
  // Track which polity_a_ids are currently loading or loaded
  const evalStatusRef = useRef<Map<number, 'loading' | 'loaded' | 'error'>>(new Map());
  const [evalVersion, setEvalVersion] = useState(0);

  useEffect(() => {
    fetch(SLIM_URL)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        const polityMap = new Map<number, Polity>();
        for (const p of data.polities) polityMap.set(p.id, p);
        const topicMap = new Map<number, Topic>();
        for (const t of data.topics) topicMap.set(t.id, t);

        setState({
          polities: data.polities,
          topics: data.topics,
          duels: data.duels,
          polityMap,
          topicMap,
          loading: false,
          error: null,
        });
      })
      .catch(err => setState(prev => ({ ...prev, loading: false, error: err.message })));
  }, []);

  const fetchEvaluations = useCallback((polityAId: number) => {
    const status = evalStatusRef.current.get(polityAId);
    if (status === 'loading' || status === 'loaded') return;

    const url = evalGistUrl(polityAId);
    if (!url) return;

    evalStatusRef.current.set(polityAId, 'loading');
    setEvalVersion(v => v + 1);

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((entries: EvalEntry[]) => {
        const map = new Map<number, string>();
        for (const e of entries) map.set(e.id, e.evaluation);
        evalCacheRef.current.set(polityAId, map);
        evalStatusRef.current.set(polityAId, 'loaded');
        setEvalVersion(v => v + 1);
      })
      .catch(() => {
        evalStatusRef.current.set(polityAId, 'error');
        setEvalVersion(v => v + 1);
      });
  }, []);

  const getEvaluation = useCallback((duel: Duel): string | null => {
    const bucket = evalCacheRef.current.get(duel.polity_a_id);
    if (!bucket) return null;
    return bucket.get(duel.id) ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evalVersion]);

  const evalLoadingFn = useCallback((polityAId: number): boolean => {
    return evalStatusRef.current.get(polityAId) === 'loading';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evalVersion]);

  return (
    <DataContext.Provider value={{
      ...state,
      mode,
      setMode,
      getEvaluation,
      fetchEvaluations,
      evalLoading: evalLoadingFn,
    }}>
      {children}
    </DataContext.Provider>
  );
}
