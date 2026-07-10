import { _decorator, Button, Component, Label } from "cc";
import { SpellLetterKey } from "../components/spell/SpellLetterKey";
import { app } from "../core/App";
import {
  buildSpellCells,
  getSpellSegment,
  getSpellSubmission,
  isSpellSubmissionReady,
  LETTER_KEY_ROWS
} from "../domain/CoopSpellRules";
import type { CoopSpellState } from "../store/CoopSpellStore";

const { ccclass, property } = _decorator;

@ccclass("CoopSpellScene")
export class CoopSpellScene extends Component {
  @property(Label)
  meaningLabel: Label | null = null;

  @property(Label)
  wordLabel: Label | null = null;

  @property(Label)
  teamScoreLabel: Label | null = null;

  @property(Label)
  totalTimerLabel: Label | null = null;

  @property(Label)
  questionTimerLabel: Label | null = null;

  @property(Label)
  localTitleLabel: Label | null = null;

  @property(Label)
  localInputLabel: Label | null = null;

  @property(Label)
  localProgressLabel: Label | null = null;

  @property(Label)
  teammateLabel: Label | null = null;

  @property(Label)
  statusLabel: Label | null = null;

  @property(Button)
  submitButton: Button | null = null;

  @property(Button)
  backspaceButton: Button | null = null;

  @property(Button)
  clearButton: Button | null = null;

  @property(Button)
  skipButton: Button | null = null;

  @property([SpellLetterKey])
  letterKeys: SpellLetterKey[] = [];

  private unsubscribeRoom: (() => void) | null = null;
  private unsubscribeSpell: (() => void) | null = null;

  onLoad(): void {
    app.store.setRoute("coopSpell");
    this.unsubscribeRoom = app.roomStore.subscribe(() => this.render());
    this.unsubscribeSpell = app.coopSpellStore.subscribe(() => this.render());
  }

  start(): void {
    const letters = LETTER_KEY_ROWS.join("").split("");
    this.letterKeys.forEach((key, index) => {
      const letter = letters[index];
      if (letter) key.bind(letter, (value) => app.coopSpell.addLetter(value));
      else key.clear();
    });
    app.coopSpell.updateClocks();
    this.render();
  }

  update(): void {
    app.coopSpell.updateClocks();
  }

  onDestroy(): void {
    this.unsubscribeRoom?.();
    this.unsubscribeSpell?.();
    this.unsubscribeRoom = null;
    this.unsubscribeSpell = null;
  }

  backspace(): void {
    app.coopSpell.backspace();
  }

  clearDraft(): void {
    app.coopSpell.clearDraft();
  }

  async submit(): Promise<void> {
    try {
      await app.coopSpell.submit();
    } catch (error) {
      app.runtime.showToast(error instanceof Error ? error.message : "提交失败");
    }
  }

  async skip(): Promise<void> {
    try {
      await app.coopSpell.skip(true);
    } catch (error) {
      app.runtime.showToast(error instanceof Error ? error.message : "跳过失败");
    }
  }

  backHome(): void {
    app.roomSession.leave();
    app.coopSpell.reset();
    app.router.navigate("home");
  }

  private render(): void {
    const room = app.roomStore.getRoom();
    const state = app.coopSpellStore.getState();
    const question = room?.spellQuestion || null;
    if (!room || !question) {
      this.renderWaiting(state);
      return;
    }
    const localOpenId = app.playerStore.getLocalPlayer().openid;
    const localSegment = getSpellSegment(question, room.players, localOpenId);
    const teammate = room.players.find((player) => player.openid !== localOpenId) || null;
    const teammateSegment = teammate
      ? getSpellSegment(question, room.players, teammate.openid)
      : null;
    const localSubmission = getSpellSubmission(room.spellSubmissions, question.id, localOpenId)
      || state.optimisticSubmission;
    const teammateSubmission = teammate
      ? getSpellSubmission(room.spellSubmissions, question.id, teammate.openid)
      : null;
    const cells = buildSpellCells(question, localSegment, state.draft, localSubmission);
    if (this.meaningLabel) this.meaningLabel.string = question.meaning || "请根据中文提示拼写";
    if (this.wordLabel) {
      this.wordLabel.string = cells.map((cell) => {
        if (!cell.blank) return cell.letter;
        if (cell.local) return cell.letter ? `[${cell.letter}]` : "[ ]";
        return "_";
      }).join(" ");
    }
    if (this.teamScoreLabel) this.teamScoreLabel.string = `团队 ${Number(room.teamScore || 0)} 分`;
    if (this.totalTimerLabel) this.totalTimerLabel.string = `本局 ${state.totalTimeLeft}s`;
    if (this.questionTimerLabel) this.questionTimerLabel.string = `本词 ${state.questionTimeLeft}s`;
    if (this.localTitleLabel) {
      this.localTitleLabel.string = localSegment
        ? `请填空位 ${localSegment.start}-${localSegment.end}`
        : "正在分配你的空位";
    }
    const localAnswer = state.draft.length
      ? state.draft
      : String(localSubmission?.answer || "").split("");
    const localLength = Number(localSegment?.length || 0);
    if (this.localInputLabel) {
      this.localInputLabel.string = Array.from({ length: localLength }, (_, index) => {
        const letter = localAnswer[index];
        return letter ? letter.toUpperCase() : "_";
      }).join("   ");
    }
    if (this.localProgressLabel) {
      this.localProgressLabel.string = state.localSubmitted
        ? "已填，等待队友"
        : `${state.draft.length}/${localLength}`;
    }
    if (this.teammateLabel) {
      const range = teammateSegment ? `${teammateSegment.start}-${teammateSegment.end}` : "--";
      this.teammateLabel.string = `${teammate?.nickName || "队友"} · 空位 ${range} · ${
        isSpellSubmissionReady(teammateSubmission) ? "已填" : "填写中"
      }`;
    }
    if (this.statusLabel) this.statusLabel.string = this.getStatusText(state);
    this.updateControls(room.state === "playing", state, localLength);
  }

  private getStatusText(state: CoopSpellState): string {
    if (state.error) return state.error;
    if (state.advancingQuestionId === state.activeQuestionId) return state.feedback || "正在切换下一词";
    if (state.pendingAction === "submit") return "正在提交你的字母...";
    if (state.pendingAction === "skip") return "正在跳过当前单词...";
    if (state.pendingAction === "timeout") return "本词时间到，正在换词...";
    if (state.pendingAction === "finish") return "正在结算团队成绩...";
    if (state.localSubmitted) return "你已填写，等待队友提交";
    return state.feedback || "填写你负责的字母后提交";
  }

  private updateControls(playing: boolean, state: CoopSpellState, expectedLength: number): void {
    const editable = playing
      && !!state.activeQuestionId
      && !state.pendingAction
      && !state.localSubmitted
      && state.advancingQuestionId !== state.activeQuestionId;
    const hasDraft = state.draft.length > 0;
    if (this.submitButton) {
      this.submitButton.interactable = editable && expectedLength > 0 && state.draft.length === expectedLength;
    }
    if (this.backspaceButton) this.backspaceButton.interactable = editable && hasDraft;
    if (this.clearButton) this.clearButton.interactable = editable && hasDraft;
    if (this.skipButton) {
      this.skipButton.interactable = playing && !state.pendingAction
        && state.advancingQuestionId !== state.activeQuestionId;
    }
    this.letterKeys.forEach((key) => key.setInteractable(editable && state.draft.length < expectedLength));
  }

  private renderWaiting(state: CoopSpellState): void {
    if (this.meaningLabel) this.meaningLabel.string = "正在同步拼词题";
    if (this.wordLabel) this.wordLabel.string = "";
    if (this.teamScoreLabel) this.teamScoreLabel.string = "团队 0 分";
    if (this.totalTimerLabel) this.totalTimerLabel.string = `本局 ${state.totalTimeLeft}s`;
    if (this.questionTimerLabel) this.questionTimerLabel.string = `本词 ${state.questionTimeLeft}s`;
    if (this.localTitleLabel) this.localTitleLabel.string = "等待分配空位";
    if (this.localInputLabel) this.localInputLabel.string = "";
    if (this.localProgressLabel) this.localProgressLabel.string = "";
    if (this.teammateLabel) this.teammateLabel.string = "队友 · 同步中";
    if (this.statusLabel) this.statusLabel.string = state.error || "请稍候";
    this.updateControls(false, state, 0);
  }
}
