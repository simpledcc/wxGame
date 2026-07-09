import type { BestScore, GameModeKey, WordItem } from "./GameTypes";
import type { MatchRecord } from "./RoomTypes";

export const STORAGE_KEYS = {
  privacyAcceptedVersion: "privacyAcceptedVersion",
  wrongWords: "wrongWords",
  matchRecords: "matchRecords",
  bestScoresByMode: "bestScoresByMode",
  wordCoins: "wordCoins",
  unlockedWordBanks: "unlockedWordBanks",
  soundMuted: "soundMuted",
  playerName: "playerName"
} as const;

export type StorageKeyName = keyof typeof STORAGE_KEYS;

export type StorageKey = typeof STORAGE_KEYS[StorageKeyName];

export interface StorageValueMap {
  privacyAcceptedVersion: string;
  wrongWords: WordItem[];
  matchRecords: MatchRecord[];
  bestScoresByMode: Partial<Record<GameModeKey, BestScore>>;
  wordCoins: number;
  unlockedWordBanks: string[];
  soundMuted: boolean;
  playerName: string;
}

export const INITIAL_WORD_COINS = 50;
export const WORD_BANK_UNLOCK_COST = 10;
export const REVIEW_WORD_BANK_UNLOCK_COST = 30;
export const ALL_REVIEW_WORD_BANK_UNLOCK_COST = 150;
export const MATCH_RECORD_LIMIT = 50;
export const PRIVACY_VERSION = "2026.07.07";
export const DEFAULT_PRIVACY_CONTRACT_NAME = "《词斗乐园单词比拼小程序隐私保护指引》";
