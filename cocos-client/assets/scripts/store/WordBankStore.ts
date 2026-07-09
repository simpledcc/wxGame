import { DEFAULT_BANK_ID } from "../domain/WordBank";

export class WordBankStore {
  private bankId = DEFAULT_BANK_ID;

  getSelectedBankId(): string {
    return this.bankId;
  }

  setSelectedBankId(bankId: string): void {
    this.bankId = bankId;
  }
}

