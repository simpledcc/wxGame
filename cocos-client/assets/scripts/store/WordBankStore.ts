import { DEFAULT_BANK_ID } from "../domain/WordBank";
import { INITIAL_WORD_COINS } from "../domain/StorageKeys";
import type { WordItem } from "../domain/GameTypes";

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

  hydrateLegacyState(options: {
    wordCoins: number;
    unlockedWordBanks: string[];
    wrongWords: WordItem[];
  }): void {
    this.wordCoins = options.wordCoins;
    this.unlockedBankIds = [...options.unlockedWordBanks];
    this.wrongWords = options.wrongWords.map((item) => ({ ...item }));
  }

  getWordCoins(): number {
    return this.wordCoins;
  }

  getUnlockedBankIds(): string[] {
    return [...this.unlockedBankIds];
  }

  getWrongWords(): WordItem[] {
    return this.wrongWords.map((item) => ({ ...item }));
  }
}
