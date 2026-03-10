import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Polity, Topic, Duel, DuelFull } from '../types';

const SLIM_URL = 'https://gist.githubusercontent.com/jmoon1506/d14bc54f10786a2da3fe62dc36334ee8/raw/macro_history_battle.json';
const FULL_URL = 'https://gist.githubusercontent.com/jmoon1506/5ff6e87a354a1c1da581e9abe327cd55/raw/macro_history_battle_full.json';

export type Mode = 'qol' | 'darwinian';

interface DataState {
  polities: Polity[];
  topics: Topic[];
  qolDuels: Duel[];
  darwinianDuels: Duel[];
  qolDuelsFull: DuelFull[] | null;
  darwinianDuelsFull: DuelFull[] | null;
  polityMap: Map<number, Polity>;
  topicMap: Map<number, Topic>;
  loading: boolean;
  fullLoading: boolean;
  error: string | null;
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const DataContext = createContext<DataState | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('qol');
  const [state, setState] = useState<Omit<DataState, 'mode' | 'setMode'>>({
    polities: [],
    topics: [],
    qolDuels: [],
    darwinianDuels: [],
    qolDuelsFull: null,
    darwinianDuelsFull: null,
    polityMap: new Map(),
    topicMap: new Map(),
    loading: true,
    fullLoading: true,
    error: null,
  });

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

        setState(prev => ({
          ...prev,
          polities: data.polities,
          topics: data.topics,
          qolDuels: data.qol_duels,
          darwinianDuels: data.darwinian_duels,
          polityMap,
          topicMap,
          loading: false,
        }));
      })
      .catch(err => setState(prev => ({ ...prev, loading: false, error: err.message })));

    fetch(FULL_URL)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        setState(prev => ({
          ...prev,
          qolDuelsFull: data.qol_duels,
          darwinianDuelsFull: data.darwinian_duels,
          fullLoading: false,
        }));
      })
      .catch(() => setState(prev => ({ ...prev, fullLoading: false })));
  }, []);

  return (
    <DataContext.Provider value={{ ...state, mode, setMode }}>
      {children}
    </DataContext.Provider>
  );
}
