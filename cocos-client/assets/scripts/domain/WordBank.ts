import type { WordItem } from "./GameTypes";

export interface WordBankMeta {
  id: string;
  label: string;
  special?: "review";
}

export interface WordBank {
  id: string;
  label: string;
  words: WordItem[];
  meta?: WordBankMeta;
}

export const DEFAULT_BANK_ID = "jilin-g1a-b1-welcome";
export const WRONG_BANK_ID = "wrong-words";

