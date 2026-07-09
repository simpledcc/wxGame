import type { WordItem } from "./GameTypes";

export interface WordBankProvince {
  id: string;
  label: string;
  caption?: string;
}

export interface WordBankTerm {
  id: string;
  provinceId: string;
  label: string;
  caption?: string;
  special?: "wrong" | "review" | string;
}

export interface WordBankMeta {
  provinceId: string;
  provinceLabel?: string;
  termId: string;
  termLabel?: string;
  unitLabel: string;
  unitTitle?: string;
  special?: "wrong" | "review" | string;
  [key: string]: unknown;
}

export interface WordBank {
  id?: string;
  label: string;
  shortLabel?: string;
  words: WordItem[];
  meta?: WordBankMeta;
}

export interface WordBankDataSource {
  DEFAULT_BANK_ID: string;
  WRONG_BANK_ID: string;
  WORD_BANK_PROVINCES: WordBankProvince[];
  WORD_BANK_TERMS: WordBankTerm[];
  WORD_BANKS: Record<string, WordBank>;
}

export const DEFAULT_BANK_ID = "jilin-g1a-b1-welcome";
export const WRONG_BANK_ID = "wrong";
