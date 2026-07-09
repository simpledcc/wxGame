import type { MatchRecord } from "../domain/RoomTypes";

export class HistoryStore {
  private records: MatchRecord[] = [];

  getRecords(): MatchRecord[] {
    return [...this.records];
  }

  replaceRecords(records: MatchRecord[]): void {
    this.records = [...records];
  }
}

