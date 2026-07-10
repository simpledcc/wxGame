import { EventBus } from "../core/EventBus";
import { normalizeSpellLetter } from "../domain/CoopSpellRules";
import type { MatchRecord, SpellSubmission } from "../domain/RoomTypes";

export type CoopSpellPendingAction = "submit" | "skip" | "timeout" | "finish";

export interface OptimisticSpellSubmission extends SpellSubmission {
  questionId: string;
  answer: string;
  length: number;
  optimistic: true;
}

export interface CoopSpellState {
  activeQuestionId: string;
  draft: string[];
  optimisticSubmission: OptimisticSpellSubmission | null;
  localSubmitted: boolean;
  advancingQuestionId: string;
  autoTimeoutQuestionId: string;
  localQuestionStartedAt: number;
  questionTimeLeft: number;
  totalTimeLeft: number;
  pendingAction: CoopSpellPendingAction | null;
  feedback: string;
  error: string;
  result: MatchRecord | null;
}

interface CoopSpellEvents {
  changed: CoopSpellState;
}

export class CoopSpellStore {
  private readonly events = new EventBus<CoopSpellEvents>();
  private state: CoopSpellState = this.createInitialState();

  getState(): CoopSpellState {
    return {
      ...this.state,
      draft: [...this.state.draft],
      optimisticSubmission: this.state.optimisticSubmission
        ? { ...this.state.optimisticSubmission }
        : null,
      result: this.state.result ? {
        ...this.state.result,
        players: this.state.result.players.map((player) => ({ ...player }))
      } : null
    };
  }

  subscribe(handler: (state: CoopSpellState) => void): () => void {
    return this.events.on("changed", handler);
  }

  syncQuestion(questionId: string, authoritativeSubmitted: boolean, now: number): void {
    const changed = questionId !== this.state.activeQuestionId;
    if (changed) {
      this.patch({
        activeQuestionId: questionId,
        draft: [],
        optimisticSubmission: null,
        localSubmitted: authoritativeSubmitted,
        advancingQuestionId: "",
        autoTimeoutQuestionId: "",
        localQuestionStartedAt: questionId ? now : 0,
        questionTimeLeft: 20,
        pendingAction: null,
        feedback: questionId ? "新单词已就绪" : "等待拼词题",
        error: ""
      });
      return;
    }
    const localSubmitted = authoritativeSubmitted || !!this.state.optimisticSubmission;
    if (localSubmitted !== this.state.localSubmitted) {
      this.patch({ localSubmitted });
    }
  }

  addLetter(letter: string, maxLength: number): boolean {
    const normalized = normalizeSpellLetter(letter);
    if (!normalized || !this.canEdit() || this.state.draft.length >= maxLength) return false;
    this.patch({ draft: [...this.state.draft, normalized], error: "" });
    return true;
  }

  backspace(): boolean {
    if (!this.canEdit() || !this.state.draft.length) return false;
    this.patch({ draft: this.state.draft.slice(0, -1), error: "" });
    return true;
  }

  clearDraft(): void {
    if (this.canEdit()) this.patch({ draft: [] });
  }

  beginSubmit(openid: string, expectedLength: number, now: number): OptimisticSpellSubmission | null {
    if (
      !openid
      || !this.state.activeQuestionId
      || !this.canEdit()
      || this.state.draft.length !== expectedLength
    ) return null;
    const submission: OptimisticSpellSubmission = {
      status: "submitted",
      questionId: this.state.activeQuestionId,
      answer: this.state.draft.join(""),
      length: expectedLength,
      submittedAt: now,
      optimistic: true
    };
    this.patch({
      optimisticSubmission: submission,
      localSubmitted: true,
      pendingAction: "submit",
      feedback: "已填写，等待队友",
      error: ""
    });
    return submission;
  }

  confirmWaiting(questionId: string): void {
    if (questionId !== this.state.activeQuestionId) return;
    this.patch({ pendingAction: null, feedback: "已填写，等待队友" });
  }

  markAdvancing(questionId: string, feedback: string): void {
    if (questionId !== this.state.activeQuestionId) return;
    this.patch({
      draft: [],
      optimisticSubmission: null,
      localSubmitted: true,
      advancingQuestionId: questionId,
      pendingAction: null,
      feedback,
      error: ""
    });
  }

  rollbackSubmit(questionId: string, message: string): void {
    if (questionId !== this.state.activeQuestionId) return;
    this.patch({
      optimisticSubmission: null,
      localSubmitted: false,
      pendingAction: null,
      error: message
    });
  }

  beginSkip(questionId: string, automatic: boolean): boolean {
    if (
      !questionId
      || questionId !== this.state.activeQuestionId
      || this.state.pendingAction
      || this.state.advancingQuestionId === questionId
    ) return false;
    this.patch({
      pendingAction: automatic ? "timeout" : "skip",
      autoTimeoutQuestionId: automatic ? questionId : this.state.autoTimeoutQuestionId,
      error: ""
    });
    return true;
  }

  rollbackSkip(questionId: string, message = ""): void {
    if (questionId !== this.state.activeQuestionId) return;
    this.patch({
      pendingAction: null,
      autoTimeoutQuestionId: "",
      error: message
    });
  }

  setClocks(questionTimeLeft: number, totalTimeLeft: number): void {
    const question = Math.max(0, Math.ceil(questionTimeLeft));
    const total = Math.max(0, Math.ceil(totalTimeLeft));
    if (question !== this.state.questionTimeLeft || total !== this.state.totalTimeLeft) {
      this.patch({ questionTimeLeft: question, totalTimeLeft: total });
    }
  }

  beginFinish(): boolean {
    if (this.state.pendingAction || this.state.result) return false;
    this.patch({ pendingAction: "finish", error: "" });
    return true;
  }

  endFinish(message = ""): void {
    this.patch({
      pendingAction: this.state.pendingAction === "finish" ? null : this.state.pendingAction,
      error: message
    });
  }

  setResult(record: MatchRecord): void {
    this.patch({ result: record, pendingAction: null, feedback: record.result, error: "" });
  }

  reset(): void {
    this.state = this.createInitialState();
    this.emit();
  }

  private canEdit(): boolean {
    return !!this.state.activeQuestionId
      && !this.state.pendingAction
      && !this.state.localSubmitted
      && this.state.advancingQuestionId !== this.state.activeQuestionId;
  }

  private createInitialState(): CoopSpellState {
    return {
      activeQuestionId: "",
      draft: [],
      optimisticSubmission: null,
      localSubmitted: false,
      advancingQuestionId: "",
      autoTimeoutQuestionId: "",
      localQuestionStartedAt: 0,
      questionTimeLeft: 20,
      totalTimeLeft: 0,
      pendingAction: null,
      feedback: "",
      error: "",
      result: null
    };
  }

  private patch(patch: Partial<CoopSpellState>): void {
    this.state = { ...this.state, ...patch };
    this.emit();
  }

  private emit(): void {
    this.events.emit("changed", this.getState());
  }
}
