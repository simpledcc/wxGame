import { _decorator, Button, Component, Label, Node } from "cc";
import { HistoryRecordItem } from "../components/history/HistoryRecordItem";
import { app } from "../core/App";
import type { GameModeKey } from "../domain/GameTypes";
import type { MatchRecord, SpellRoundRecord } from "../domain/RoomTypes";

const { ccclass, property } = _decorator;

const MODE_LABELS: Record<GameModeKey, string> = {
  pk: "双人PK",
  coopShared: "默契捕词赛",
  coopSpell: "同舟拼词记"
};

const ROUND_REASON_LABELS: Record<SpellRoundRecord["reason"], string> = {
  answered: "双方提交",
  manualSkip: "主动跳过",
  timeout: "本词超时",
  gameOver: "本局结束"
};

const DETAIL_PAGE_SIZE = 3;
type HistoryMode = GameModeKey | "all";

@ccclass("HistoryScene")
export class HistoryScene extends Component {
  @property(Label)
  titleLabel: Label | null = null;

  @property(Label)
  bestLabel: Label | null = null;

  @property(Label)
  recentSummaryLabel: Label | null = null;

  @property(Label)
  bestSummaryLabel: Label | null = null;

  @property(Label)
  emptyLabel: Label | null = null;

  @property(Label)
  pageLabel: Label | null = null;

  @property(Button)
  previousButton: Button | null = null;

  @property(Button)
  nextButton: Button | null = null;

  @property([HistoryRecordItem])
  recordItems: HistoryRecordItem[] = [];

  @property(Node)
  listNode: Node | null = null;

  @property(Node)
  detailNode: Node | null = null;

  @property(Label)
  detailTitleLabel: Label | null = null;

  @property(Label)
  detailBodyLabel: Label | null = null;

  @property(Label)
  detailPageLabel: Label | null = null;

  @property(Button)
  detailPreviousButton: Button | null = null;

  @property(Button)
  detailNextButton: Button | null = null;

  private selectedMode: HistoryMode = "all";
  private page = 0;
  private records: MatchRecord[] = [];
  private detailRecord: MatchRecord | null = null;
  private detailPage = 0;

  onLoad(): void {
    app.store.setRoute("history");
  }

  start(): void {
    this.showAll();
  }

  showAll(): void {
    this.showMode("all");
  }

  showPk(): void {
    this.showMode("pk");
  }

  showCoopShared(): void {
    this.showMode("coopShared");
  }

  showCoopSpell(): void {
    this.showMode("coopSpell");
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page -= 1;
      this.renderList();
    }
  }

  nextPage(): void {
    const pageCount = this.getPageCount();
    if (this.page + 1 < pageCount) {
      this.page += 1;
      this.renderList();
    }
  }

  closeDetail(): void {
    if (this.detailNode) this.detailNode.active = false;
    if (this.listNode) this.listNode.active = true;
    this.detailRecord = null;
    this.detailPage = 0;
  }

  previousDetailPage(): void {
    if (this.detailPage > 0) {
      this.detailPage -= 1;
      this.renderDetail();
    }
  }

  nextDetailPage(): void {
    if (!this.detailRecord) return;
    const pageCount = this.getDetailPageCount(this.detailRecord);
    if (this.detailPage + 1 < pageCount) {
      this.detailPage += 1;
      this.renderDetail();
    }
  }

  back(): void {
    if (this.detailNode?.active) {
      this.closeDetail();
      return;
    }
    app.router.navigate("home");
  }

  private showMode(mode: HistoryMode): void {
    this.selectedMode = mode;
    this.page = 0;
    this.records = app.historyStore.getRecords(mode === "all" ? undefined : mode)
      .sort((left, right) => right.finishedAt - left.finishedAt);
    this.closeDetail();
    this.renderList();
  }

  private renderList(): void {
    const pageSize = Math.max(1, this.recordItems.length);
    const start = this.page * pageSize;
    const pageRecords = this.records.slice(start, start + pageSize);
    if (this.titleLabel) this.titleLabel.string = this.selectedMode === "all" ? "全部战绩" : MODE_LABELS[this.selectedMode];
    const bestScores = app.historyStore.getBestScores();
    const best = this.selectedMode === "all"
      ? Object.values(bestScores).filter((item): item is NonNullable<typeof item> => !!item)
        .sort((left, right) => right.score - left.score)[0]
      : bestScores[this.selectedMode];
    if (this.bestLabel) this.bestLabel.string = `历史最佳 ${best ? `${best.score} 分` : "--"}`;
    if (this.recentSummaryLabel) {
      const recent = this.records[0];
      this.recentSummaryLabel.string = recent
        ? `${recent.modeLabel}\n${new Date(recent.finishedAt).toLocaleString()}`
        : "暂无比赛记录";
    }
    if (this.bestSummaryLabel) {
      this.bestSummaryLabel.string = best ? `${best.score} 分` : "--";
    }
    if (this.emptyLabel) this.emptyLabel.string = this.records.length ? "" : "暂无战绩";
    this.recordItems.forEach((item, index) => {
      const record = pageRecords[index];
      if (record) item.bind(record, start + index, (recordIndex) => this.openRecord(recordIndex));
      else item.clear();
    });
    const pageCount = this.getPageCount();
    if (this.pageLabel) this.pageLabel.string = `${Math.min(this.page + 1, pageCount)}/${pageCount}`;
    if (this.previousButton) this.previousButton.interactable = this.page > 0;
    if (this.nextButton) this.nextButton.interactable = this.page + 1 < pageCount;
  }

  private openRecord(index: number): void {
    const record = this.records[index];
    if (!record || record.modeKey !== "coopSpell") return;
    this.detailRecord = record;
    this.detailPage = 0;
    if (this.listNode) this.listNode.active = false;
    if (this.detailNode) this.detailNode.active = true;
    this.renderDetail();
  }

  private renderDetail(): void {
    const record = this.detailRecord;
    if (!record) return;
    if (this.detailTitleLabel) {
      this.detailTitleLabel.string = `${record.modeLabel} · ${record.score} 分`;
    }
    const rounds = record.spellHistory || [];
    const pageCount = this.getDetailPageCount(record);
    this.detailPage = Math.max(0, Math.min(this.detailPage, pageCount - 1));
    const start = this.detailPage * DETAIL_PAGE_SIZE;
    if (this.detailBodyLabel) {
      this.detailBodyLabel.string = rounds.length
        ? rounds.slice(start, start + DETAIL_PAGE_SIZE)
          .map((round, pageIndex) => this.formatRound(round, start + pageIndex))
          .join("\n\n")
        : "本局没有可显示的拼词明细";
    }
    if (this.detailPageLabel) {
      this.detailPageLabel.string = `${this.detailPage + 1}/${pageCount}`;
    }
    if (this.detailPreviousButton) {
      this.detailPreviousButton.interactable = this.detailPage > 0;
    }
    if (this.detailNextButton) {
      this.detailNextButton.interactable = this.detailPage + 1 < pageCount;
    }
  }

  private formatRound(round: SpellRoundRecord, index: number): string {
    const delta = round.delta > 0 ? `+${round.delta}` : String(round.delta);
    const players = round.players.map((player) => {
      const answer = player.submitted ? (player.answer.toUpperCase() || "空") : "未提交";
      const result = player.submitted ? (player.correct ? "正确" : "错误") : "未完成";
      return `${player.nickName}：${answer} · ${result}`;
    });
    return [
      `${index + 1}. ${round.word.toUpperCase()} · ${round.meaning}`,
      `${ROUND_REASON_LABELS[round.reason]} · ${delta} · 团队 ${round.teamScore} 分`,
      ...players
    ].join("\n");
  }

  private getPageCount(): number {
    return Math.max(1, Math.ceil(this.records.length / Math.max(1, this.recordItems.length)));
  }

  private getDetailPageCount(record: MatchRecord): number {
    return Math.max(1, Math.ceil((record.spellHistory?.length || 0) / DETAIL_PAGE_SIZE));
  }
}
