export interface Polity {
  id: number;
  name: string;
  year: number;
  description: string;
  qol_elo: number;
  darwinian_elo: number;
}

export interface Topic {
  id: number;
  topic: string;
  summary: string;
}

export interface Duel {
  id: number;
  topic_id: number;
  winner_id: number;
  loser_id: number;
}

export interface DuelFull extends Duel {
  evaluation: string;
}

export interface SlimData {
  polities: Polity[];
  topics: Topic[];
  qol_duels: Duel[];
  darwinian_duels: Duel[];
}

export interface FullData {
  polities: Polity[];
  topics: Topic[];
  qol_duels: DuelFull[];
  darwinian_duels: DuelFull[];
}
