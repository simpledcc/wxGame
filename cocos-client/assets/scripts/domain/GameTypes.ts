export type GameModeKey = "pk" | "coopShared" | "coopSpell";

export type RoomState = "waiting" | "playing" | "finished";

export type MatchMode = "pk" | "coop";

export type CoopMode = "shared" | "spell";

export type WordMode = "regular" | "mistakes";

export type BotDifficulty = "low" | "medium" | "high";

export type GameDuration = 30 | 60 | 90 | 120;

export interface WordItem {
  word: string;
  meaning: string;
}

export interface BestScore {
  score: number;
  finishedAt: number;
}

