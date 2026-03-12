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
  polity_a_id: number;
}

export interface EvalEntry {
  id: number;
  evaluation: string;
}

export interface SlimData {
  polities: Polity[];
  topics: Topic[];
  duels: Duel[];
}
