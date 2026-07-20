import { _decorator, Button, Component, Label } from "cc";
import type { MatchRecord } from "../../domain/RoomTypes";

const { ccclass } = _decorator;

@ccclass("HistoryRecordItem")
export class HistoryRecordItem extends Component {
  titleLabel: Label | null = null;

  metaLabel: Label | null = null;

  scoreLabel: Label | null = null;

  detailButton: Button | null = null;

  private recordIndex = -1;
  private openHandler: ((index: number) => void) | null = null;

  bind(record: MatchRecord, index: number, openHandler: (index: number) => void): void {
    this.recordIndex = index;
    this.openHandler = openHandler;
    this.node.active = true;
    if (this.titleLabel) this.titleLabel.string = `${record.modeLabel} · ${record.result}`;
    if (this.metaLabel) {
      const d = new Date(record.finishedAt);
      this.metaLabel.string = `${d.getMonth() + 1}月${d.getDate()}日 · ${record.bankLabel}`;
    }
    if (this.scoreLabel) this.scoreLabel.string = `${record.score} 分`;
    if (this.detailButton) this.detailButton.interactable = record.modeKey === "coopSpell";
  }

  clear(): void {
    this.recordIndex = -1;
    this.openHandler = null;
    this.node.active = false;
  }

  open(): void {
    if (this.recordIndex >= 0) this.openHandler?.(this.recordIndex);
  }
}
