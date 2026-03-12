export interface Polity {
  id: number;
  culture_group: string;
  name: string;
  start_year: number;
  description: string;
  qol_rating: number;
  qol_rd: number;
  darwinian_rating: number;
  darwinian_rd: number;
}

export interface Topic {
  id: number;
  topic: string;
  category: string;
  summary: string;
}

export interface Duel {
  id: number;
  topic_id: number;
  category: string;
  winner_id: number;
  loser_id: number;
}

export interface DuelFull extends Duel {
  evaluation: string;
}

export interface SlimData {
  polities: Polity[];
  topics: Topic[];
  duels: Duel[];
}

export interface FullData {
  polities: Polity[];
  topics: Topic[];
  duels: DuelFull[];
}
