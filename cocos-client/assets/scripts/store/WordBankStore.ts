import { DEFAULT_BANK_ID } from "../domain/WordBank";
import { INITIAL_WORD_COINS } from "../domain/StorageKeys";
import type { WordItem } from "../domain/GameTypes";
import type { WordBankDataSource } from "../domain/WordBank";
import {
  getDefaultBankId,
  getStudyWords,
  getWordBankUnlockCost,
  isUnlockableWordBankId,
  isWordBankUnlocked,
  normalizeUnlockedBankIds,
  resolveBankSelection
} from "../domain/WordBankRules";

export type UnlockWordBankResult =
  | { ok: true; bankId: string; cost: number; coins: number }
  | {
      ok: false;
      bankId: string;
      reason: "missing" | "alreadyUnlocked" | "insufficientCoins" | "notUnlockable";
      cost?: number;
      coins: number;
    };

export interface WordBankProgressSnapshot {
  wordCoins: number;
  unlockedBankIds: string[];
}

export class WordBankStore {
  private bankId = DEFAULT_BANK_ID;
  private wordCoins = INITIAL_WORD_COINS;
  private unlockedBankIds: string[] = [];
  private wrongWords: WordItem[] = [];

  getSelectedBankId(): string {
    return this.bankId;
  }

  setSelectedBankId(bankId: string): void {
    this.bankId = bankId;
  }

  hydrateLegacyState(
    options: {
      wordCoins: number;
      unlockedWordBanks: string[];
      wrongWords: WordItem[];
    },
    catalog?: WordBankDataSource
  ): void {
    this.wordCoins = options.wordCoins;
    this.unlockedBankIds = catalog
      ? normalizeUnlockedBankIds(catalog, options.unlockedWordBanks)
      : [...options.unlockedWordBanks];
    this.wrongWords = options.wrongWords.map((item) => ({ ...item }));
    if (catalog && !catalog.WORD_BANKS[this.bankId]) {
      this.bankId = getDefaultBankId(catalog);
    }
  }

  getWordCoins(): number {
    return this.wordCoins;
  }

  getUnlockedBankIds(): string[] {
    return [...this.unlockedBankIds];
  }

  getProgressSnapshot(): WordBankProgressSnapshot {
    return {
      wordCoins: this.wordCoins,
      unlockedBankIds: [...this.unlockedBankIds]
    };
  }

  restoreProgress(catalog: WordBankDataSource, snapshot: WordBankProgressSnapshot): void {
    const coins = Number(snapshot.wordCoins);
    this.wordCoins = Number.isFinite(coins) && coins >= 0
      ? Math.floor(coins)
      : INITIAL_WORD_COINS;
    this.unlockedBankIds = normalizeUnlockedBankIds(catalog, snapshot.unlockedBankIds);
  }

  getWrongWords(): WordItem[] {
    return this.wrongWords.map((item) => ({ ...item }));
  }

  addWrongWord(item: WordItem, limit = 120): boolean {
    const word = String(item.word || "").trim();
    const meaning = String(item.meaning || "").trim();
    if (!word || !meaning || this.wrongWords.some((entry) => entry.word === word)) {
      return false;
    }
    this.wrongWords = [{ word, meaning }, ...this.wrongWords].slice(0, Math.max(1, limit));
    return true;
  }

  isUnlocked(catalog: WordBankDataSource, bankId: string): boolean {
    return isWordBankUnlocked(catalog, this.unlockedBankIds, bankId);
  }

  selectBank(catalog: WordBankDataSource, bankId: string): boolean {
    const result = resolveBankSelection(catalog, this.unlockedBankIds, bankId, this.wrongWords);
    if (!result.ok) {
      return false;
    }
    this.bankId = result.bankId;
    return true;
  }

  unlockBank(catalog: WordBankDataSource, bankId: string): UnlockWordBankResult {
    if (!catalog.WORD_BANKS[bankId]) {
      return { ok: false, bankId, reason: "missing", coins: this.wordCoins };
    }
    if (!isUnlockableWordBankId(catalog, bankId)) {
      return { ok: false, bankId, reason: "notUnlockable", coins: this.wordCoins };
    }
    if (this.isUnlocked(catalog, bankId)) {
      return { ok: false, bankId, reason: "alreadyUnlocked", coins: this.wordCoins };
    }
    const cost = getWordBankUnlockCost(catalog, bankId);
    if (this.wordCoins < cost) {
      return { ok: false, bankId, reason: "insufficientCoins", cost, coins: this.wordCoins };
    }
    this.wordCoins -= cost;
    this.unlockedBankIds = normalizeUnlockedBankIds(catalog, [
      bankId,
      ...this.unlockedBankIds
    ]);
    return { ok: true, bankId, cost, coins: this.wordCoins };
  }

  getSelectedWords(catalog: WordBankDataSource): WordItem[] {
    return getStudyWords(catalog, this.bankId, this.wrongWords);
  }
}
