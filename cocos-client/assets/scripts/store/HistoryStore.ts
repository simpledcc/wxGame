import type { MatchRecord } from "../domain/RoomTypes";
import type { BestScore, GameModeKey } from "../domain/GameTypes";
import { mergeBestScores, mergeMatchRecords } from "../domain/MatchRecordRules";

export class HistoryStore {
  private records: MatchRecord[] = [];
  private bestScores: Partial<Record<GameModeKey, BestScore>> = {};

  getRecords(mode?: GameModeKey): MatchRecord[] {
    const records = mode ? this.records.filter((record) => record.modeKey === mode) : this.records;
    return records.map((record) => ({
      ...record,
      players: record.players.map((player) => ({ ...player })),
      spellHistory: record.spellHistory?.map((round) => ({
        ...round,
        players: round.players.map((player) => ({ ...player, slotIndexes: [...player.slotIndexes] }))
      }))
    }));
  }

  replaceRecords(records: MatchRecord[]): void {
    this.records = mergeMatchRecords(records);
    this.bestScores = mergeBestScores(this.bestScores, this.records);
  }

  addRecord(record: MatchRecord): void {
    this.records = mergeMatchRecords([record, ...this.records]);
    this.bestScores = mergeBestScores(this.bestScores, [record]);
  }

  getBestScores(): Partial<Record<GameModeKey, BestScore>> {
    return { ...this.bestScores };
  }

  replaceBestScores(scores: Partial<Record<GameModeKey, BestScore>>): void {
    this.bestScores = mergeBestScores(scores, this.records);
  }
}
