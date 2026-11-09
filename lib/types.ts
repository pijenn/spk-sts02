export type CharacterId =
  | "ironclad"
  | "silent"
  | "defect"
  | "necrobinder"
  | "regent";

export interface CharacterMeta {
  id: CharacterId;
  name: string;
  title: string;
  defaultMaxHp: number;
  accentClass: string;
  borderClass: string;
  badgeClass: string;
  glowClass: string;
  starterCardCodexIds: { codexId: string; count: number }[];
  starterRelicCodexId: string;
  portraitUrl: string;
  handPointUrl: string;
  playstyle: string;
}

export interface Card {
  card_id: string;
  codex_id: string;
  id_lower: string;
  name: string;
  color: string;
  type: string;
  rarity: string;
  cost: number | null;
  damage: number | null;
  block: number | null;
  c1_cost: number;
  c2_offensive: number;
  c3_defensive: number;
  c4_rarity: number;
  c5_synergy: number;
  cards_draw: number | null;
  energy_gain: number | null;
  keywords: string[];
  is_rewardable: boolean;
  description: string;
  image_url: string;
}

export interface Relic {
  relic_id: string;
  codex_id: string;
  name: string;
  description: string;
  description_raw: string | null;
  description_clean: string;
  flavor: string | null;
  rarity: string;
  rarity_key: string;
  pool: string;
  merchant_price: number | null;
  image_url: string;
  image_variants: Record<string, unknown> | unknown[] | null;
  name_variants: Record<string, unknown> | unknown[] | null;
  notes: string | null;
  compendium_order: number | null;
  is_energy_relic: boolean;
}

export interface GameStateRequest {
  character: CharacterId;
  current_hp: number;
  max_hp: number;
  act_level: 1 | 2 | 3;
  active_relics: string[];
  current_deck_cards: string[];
  reward_card_ids: string[];
}

export interface AdaptiveWeights {
  w1_cost: number;
  w2_offensive: number;
  w3_defensive: number;
  w4_rarity: number;
  w5_synergy: number;
  active_rules: string[];
}

export interface CandidateScore {
  card_id: string;
  codex_id: string;
  card_name?: string;
  name: string;
  rank: number;
  vector_s: number;
  vector_v: number;
  preference_percentage: number;
  synergy_ratio?: number;
  effective_c5_synergy: number;
  matched_deck_keywords?: string[];
  matched_keywords: string[];
  normalized_weights?: Record<string, number>;
}

export interface RecommendationResponse {
  status?: string;
  inference_engine?: string;
  rankings: CandidateScore[];
  evaluations?: CandidateScore[];
  recommended_card_id: string | null;
  recommended_card: string;
  recommended_card_name?: string;
  is_skip_recommended: boolean;
  skip_threshold: number;
  max_vector_s: number;
  hp_ratio: number;
  is_critical_hp: boolean;
  has_energy_relic: boolean;
  adaptive_weights_normalized?: Record<string, number>;
  weights: AdaptiveWeights;
  tactical_reason: string;
  game_state_summary?: Record<string, unknown>;
}

export interface RunHistoryVectorScores {
  rankings: CandidateScore[];
  weights: AdaptiveWeights;
  is_skip_recommended: boolean;
  skip_threshold: number;
  max_vector_s: number;
}

export interface RunHistoryCreateRequest {
  user_id: string;
  character: CharacterId;
  act_level: 1 | 2 | 3;
  hp_ratio: number;
  active_relics: string[];
  selected_cards: string[];
  offered_cards: string[];
  recommended_card: string;
  vector_scores: RunHistoryVectorScores;
  tactical_reason: string;
}

export interface RunHistoryRecord extends RunHistoryCreateRequest {
  run_id: string;
  run_code: string;
  created_at: string;
  username?: string;
}

export interface AuthUser {
  user_id: string;
  username: string;
  token: string;
}
