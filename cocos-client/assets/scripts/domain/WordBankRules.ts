import type { WordItem } from "./GameTypes";
import {
  ALL_REVIEW_WORD_BANK_UNLOCK_COST,
  REVIEW_WORD_BANK_UNLOCK_COST,
  WORD_BANK_UNLOCK_COST
} from "./StorageKeys";
import {
  DEFAULT_BANK_ID,
  WRONG_BANK_ID,
  type WordBank,
  type WordBankDataSource,
  type WordBankProvince
} from "./WordBank";

export interface WordBankOption {
  id: string;
  bank: WordBank;
  unlocked: boolean;
  selected: boolean;
  wordCount: number;
  unlockCost: number;
}

export interface BankSelectionResult {
  ok: boolean;
  bankId: string;
  mode: "regular" | "mistakes";
  reason?: "missing" | "locked" | "emptyWrongWords";
}

export function getDefaultBankId(catalog: WordBankDataSource): string {
  return catalog.DEFAULT_BANK_ID || DEFAULT_BANK_ID;
}

export function getWrongBankId(catalog: WordBankDataSource): string {
  return catalog.WRONG_BANK_ID || WRONG_BANK_ID;
}

export function getWordBank(catalog: WordBankDataSource, bankId: string): WordBank | null {
  return catalog.WORD_BANKS[bankId] ?? null;
}

export function isWrongBankId(catalog: WordBankDataSource, bankId: string): boolean {
  const bank = getWordBank(catalog, bankId);
  return bankId === getWrongBankId(catalog) || bank?.meta?.special === "wrong";
}

export function isUnlockableWordBankId(catalog: WordBankDataSource, bankId: string): boolean {
  const bank = getWordBank(catalog, bankId);
  return !!bank?.meta && !isWrongBankId(catalog, bankId);
}

export function getWordBankUnlockCost(catalog: WordBankDataSource, bankId: string): number {
  const bank = getWordBank(catalog, bankId);
  if (bank?.meta?.special === "review") {
    return bankId === "jilin-g3r-all-review"
      ? ALL_REVIEW_WORD_BANK_UNLOCK_COST
      : REVIEW_WORD_BANK_UNLOCK_COST;
  }
  return WORD_BANK_UNLOCK_COST;
}

export function normalizeUnlockedBankIds(
  catalog: WordBankDataSource,
  bankIds: string[]
): string[] {
  const seen = new Set<string>();
  const result = bankIds.filter((bankId) => {
    if (!isUnlockableWordBankId(catalog, bankId) || seen.has(bankId)) {
      return false;
    }
    seen.add(bankId);
    return true;
  });
  const defaultBankId = getDefaultBankId(catalog);
  if (isUnlockableWordBankId(catalog, defaultBankId) && !seen.has(defaultBankId)) {
    result.unshift(defaultBankId);
  }
  return result;
}

export function isWordBankUnlocked(
  catalog: WordBankDataSource,
  unlockedBankIds: string[],
  bankId: string
): boolean {
  if (!isUnlockableWordBankId(catalog, bankId)) {
    return true;
  }
  return unlockedBankIds.includes(bankId);
}

export function getWordBankLabel(bank: WordBank | null, compact = false): string {
  if (!bank) {
    return "默认词库";
  }
  const meta = bank.meta;
  if (!meta) {
    return bank.shortLabel || bank.label;
  }
  if (meta.special === "wrong") {
    return meta.unitLabel || bank.shortLabel || bank.label;
  }
  if (compact) {
    return meta.unitLabel || bank.shortLabel || bank.label;
  }
  return `${meta.provinceLabel || "词库"}-${meta.unitLabel || bank.label}`;
}

export function getBanksForProvince(
  catalog: WordBankDataSource,
  provinceId: string,
  unlockedBankIds: string[],
  selectedBankId: string,
  wrongWords: WordItem[]
): WordBankOption[] {
  return Object.entries(catalog.WORD_BANKS)
    .filter(([, bank]) => bank.meta?.provinceId === provinceId)
    .map(([id, bank]) => ({
      id,
      bank,
      unlocked: isWordBankUnlocked(catalog, unlockedBankIds, id),
      selected: id === selectedBankId,
      wordCount: isWrongBankId(catalog, id) ? wrongWords.length : bank.words.length,
      unlockCost: getWordBankUnlockCost(catalog, id)
    }));
}

export function getFirstProvince(catalog: WordBankDataSource): WordBankProvince {
  return catalog.WORD_BANK_PROVINCES[0] ?? {
    id: "default",
    label: "词库"
  };
}

export function getFirstBankIdForProvince(
  catalog: WordBankDataSource,
  provinceId: string
): string {
  return Object.entries(catalog.WORD_BANKS)
    .find(([, bank]) => bank.meta?.provinceId === provinceId)?.[0] ?? "";
}

export function getStudyWords(
  catalog: WordBankDataSource,
  bankId: string,
  wrongWords: WordItem[]
): WordItem[] {
  if (isWrongBankId(catalog, bankId)) {
    return wrongWords.map((item) => ({ ...item }));
  }
  const bank = getWordBank(catalog, bankId) ?? getWordBank(catalog, getDefaultBankId(catalog));
  return (bank?.words ?? []).map((item) => ({ ...item }));
}

export function resolveBankSelection(
  catalog: WordBankDataSource,
  unlockedBankIds: string[],
  bankId: string,
  wrongWords: WordItem[]
): BankSelectionResult {
  const bank = getWordBank(catalog, bankId);
  if (!bank) {
    return { ok: false, bankId, mode: "regular", reason: "missing" };
  }
  if (!isWordBankUnlocked(catalog, unlockedBankIds, bankId)) {
    return { ok: false, bankId, mode: "regular", reason: "locked" };
  }
  if (isWrongBankId(catalog, bankId) && !wrongWords.length) {
    return { ok: false, bankId, mode: "mistakes", reason: "emptyWrongWords" };
  }
  return {
    ok: true,
    bankId,
    mode: isWrongBankId(catalog, bankId) ? "mistakes" : "regular"
  };
}
