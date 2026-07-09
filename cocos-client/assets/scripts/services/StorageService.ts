import type { RuntimePort } from "../adapters/RuntimePort";
import { PrivacyRequiredError } from "../domain/Privacy";
import {
  INITIAL_WORD_COINS,
  MATCH_RECORD_LIMIT,
  STORAGE_KEYS,
  type StorageKeyName,
  type StorageValueMap
} from "../domain/StorageKeys";
import type { BestScore, GameModeKey, WordItem } from "../domain/GameTypes";
import type { MatchRecord } from "../domain/RoomTypes";

export interface LegacyStorageSnapshot {
  wordCoins: number;
  unlockedWordBanks: string[];
  matchRecords: MatchRecord[];
  bestScoresByMode: Partial<Record<GameModeKey, BestScore>>;
  wrongWords: WordItem[];
  soundMuted: boolean;
}

const PRIVACY_SAFE_KEYS = new Set<StorageKeyName>(["privacyAcceptedVersion"]);

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.filter((item): item is string => typeof item === "string" && !!item))];
}

function normalizeWordItems(value: unknown): WordItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is WordItem => {
      if (!item || typeof item !== "object") {
        return false;
      }
      const word = (item as Partial<WordItem>).word;
      const meaning = (item as Partial<WordItem>).meaning;
      return typeof word === "string" && !!word && typeof meaning === "string";
    })
    .map((item) => ({ word: item.word, meaning: item.meaning }));
}

function normalizeMatchRecords(value: unknown): MatchRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is MatchRecord => !!item && typeof item === "object")
    .sort((a, b) => Number(b.finishedAt || 0) - Number(a.finishedAt || 0))
    .slice(0, MATCH_RECORD_LIMIT);
}

function normalizeBestScores(value: unknown): Partial<Record<GameModeKey, BestScore>> {
  if (!value || typeof value !== "object") {
    return {};
  }
  const output: Partial<Record<GameModeKey, BestScore>> = {};
  (["pk", "coopShared", "coopSpell"] as const).forEach((mode) => {
    const score = (value as Partial<Record<GameModeKey, BestScore>>)[mode];
    const legacyNumber = Number(score);
    if (Number.isFinite(legacyNumber)) {
      output[mode] = {
        score: legacyNumber,
        finishedAt: 0
      };
      return;
    }
    if (
      score &&
      typeof score === "object" &&
      Number.isFinite(score.score) &&
      Number.isFinite(score.finishedAt)
    ) {
      output[mode] = {
        score: Number(score.score),
        finishedAt: Number(score.finishedAt)
      };
    }
  });
  return output;
}

function normalizeSoundMuted(value: unknown): boolean {
  if (value == null || value === "") {
    return true;
  }
  return value === true || value === "true" || value === 1 || value === "1";
}

export class StorageService {
  private privacyAccepted = () => false;

  constructor(private readonly runtime: RuntimePort) {}

  configurePrivacyGate(isAccepted: () => boolean): void {
    this.privacyAccepted = isAccepted;
  }

  get<K extends keyof StorageValueMap>(key: K): StorageValueMap[K] | undefined {
    this.assertAccess(key);
    return this.runtime.getStorage<StorageValueMap[K]>(STORAGE_KEYS[key]);
  }

  set<K extends keyof StorageValueMap>(key: K, value: StorageValueMap[K]): void {
    this.assertAccess(key);
    this.runtime.setStorage(STORAGE_KEYS[key], value);
  }

  remove<K extends keyof StorageValueMap>(key: K): void {
    this.assertAccess(key);
    this.runtime.removeStorage(STORAGE_KEYS[key]);
  }

  getPrivacyAcceptedVersion(): string | undefined {
    return this.runtime.getStorage<string>(STORAGE_KEYS.privacyAcceptedVersion);
  }

  setPrivacyAcceptedVersion(version: string): void {
    this.runtime.setStorage(STORAGE_KEYS.privacyAcceptedVersion, version);
  }

  removePrivacyAcceptedVersion(): void {
    this.runtime.removeStorage(STORAGE_KEYS.privacyAcceptedVersion);
  }

  readLegacySnapshot(): LegacyStorageSnapshot {
    this.assertPrivacyAccepted();
    const coins = Number(this.tryRead("wordCoins"));
    return {
      wordCoins: Number.isFinite(coins) && Number(coins) >= 0
        ? Math.floor(Number(coins))
        : INITIAL_WORD_COINS,
      unlockedWordBanks: normalizeStringArray(this.tryRead("unlockedWordBanks")),
      matchRecords: normalizeMatchRecords(this.tryRead("matchRecords")),
      bestScoresByMode: normalizeBestScores(this.tryRead("bestScoresByMode")),
      wrongWords: normalizeWordItems(this.tryRead("wrongWords")),
      soundMuted: normalizeSoundMuted(this.tryRead("soundMuted"))
    };
  }

  private tryRead<K extends keyof StorageValueMap>(key: K): unknown {
    try {
      return this.runtime.getStorage(STORAGE_KEYS[key]);
    } catch {
      return undefined;
    }
  }

  private assertAccess(key: StorageKeyName): void {
    if (!PRIVACY_SAFE_KEYS.has(key)) {
      this.assertPrivacyAccepted();
    }
  }

  private assertPrivacyAccepted(): void {
    if (!this.privacyAccepted()) {
      throw new PrivacyRequiredError("storage");
    }
  }
}
