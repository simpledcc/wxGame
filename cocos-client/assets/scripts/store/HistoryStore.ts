import type { MatchRecord } from "../domain/RoomTypes";
import type { BestScore, GameModeKey } from "../domain/GameTypes";
import { MATCH_RECORD_LIMIT } from "../domain/StorageKeys";

export class HistoryStore {
  private records: MatchRecord[] = [];
  private bestScores: Partial<Record<GameModeKey, BestScore>> = {};

  getRecords(): MatchRecord[] {
    return [...this.records];
  }

  replaceRecords(records: MatchRecord[]): void {
    this.records = records.slice(-MATCH_RECORD_LIMIT);
  }

  getBestScores(): Partial<Record<GameModeKey, BestScore>> {
    return { ...this.bestScores };
  }

  replaceBestScores(scores: Partial<Record<GameModeKey, BestScore>>): void {
    this.bestScores = { ...scores };
  }
}
