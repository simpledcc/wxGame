import { EventBus } from "../core/EventBus";
import type { CatchFishResponse } from "../domain/CloudFunctionTypes";
import type { FishingTapEvaluation } from "../domain/FishingRules";
import type { MatchRecord } from "../domain/RoomTypes";

export type FishingPendingAction = "catch" | "powerUp" | "finish";
export type FishingFeedbackType = "hit" | "miss" | "correction" | "powerUp" | "bot" | "stunned" | "error";

export interface FishingFeedback {
  id: number;
  type: FishingFeedbackType;
  text: string;
  delta: number;
  fishId?: string;
  corrected?: boolean;
}

export interface FishingState {
  pendingAction: FishingPendingAction | null;
  pendingFishId: string;
  pendingPowerUpId: string;
  optimisticScoreDelta: number;
  optimisticCombo: number;
  baselineScore: number;
  timeLeft: number;
  finishing: boolean;
  feedback: FishingFeedback | null;
  error: string;
  result: MatchRecord | null;
}

interface FishingStoreEvents {
  changed: FishingState;
}

export class FishingStore {
  private readonly events = new EventBus<FishingStoreEvents>();
  private feedbackSequence = 0;
  private state: FishingState = {
    pendingAction: null,
    pendingFishId: "",
    pendingPowerUpId: "",
    optimisticScoreDelta: 0,
    optimisticCombo: 0,
    baselineScore: 0,
    timeLeft: 0,
    finishing: false,
    feedback: null,
    error: "",
    result: null
  };

  getState(): FishingState {
    return {
      ...this.state,
      feedback: this.state.feedback ? { ...this.state.feedback } : null,
      result: this.state.result ? {
        ...this.state.result,
        players: this.state.result.players.map((player) => ({ ...player }))
      } : null
    };
  }

  subscribe(handler: (state: FishingState) => void): () => void {
    return this.events.on("changed", handler);
  }

  beginCatch(evaluation: FishingTapEvaluation): boolean {
    if (this.state.pendingAction || !evaluation.ok) return false;
    const combo = evaluation.correct ? evaluation.baselineCombo + 1 : 0;
    this.patch({
      pendingAction: "catch",
      pendingFishId: evaluation.fishId,
      pendingPowerUpId: "",
      optimisticScoreDelta: evaluation.delta,
      optimisticCombo: combo,
      baselineScore: evaluation.baselineScore,
      error: "",
      feedback: this.makeFeedback(
        evaluation.correct ? "hit" : "miss",
        evaluation.correct
          ? (combo > 1 ? `+${evaluation.delta} 连击x${combo}` : `+${evaluation.delta}`)
          : String(evaluation.delta),
        evaluation.delta,
        evaluation.fishId
      )
    });
    return true;
  }

  reconcileAuthoritativeScore(score: number): void {
    if (this.state.pendingAction !== "catch" || score === this.state.baselineScore) return;
    this.patch({ optimisticScoreDelta: 0 });
  }

  settleCatch(response: CatchFishResponse, evaluation: FishingTapEvaluation): void {
    const delta = Number(response.delta || 0);
    const corrected = response.stale === true
      || response.stunned === true
      || delta !== evaluation.delta
      || response.correct !== evaluation.correct;
    let type: FishingFeedbackType = response.stunned ? "stunned" : (corrected ? "correction" : (response.correct ? "hit" : "miss"));
    let text = response.stunned
      ? "暂时无法操作"
      : (delta > 0 ? `+${delta}` : String(delta));
    if (response.stale) text = "目标已更新";
    if (response.powerUp) {
      type = "powerUp";
      text = response.powerUp.type === "pesticide" ? "获得杀虫剂" : "获得苍蝇拍";
    }
    this.patch({
      pendingAction: null,
      pendingFishId: "",
      optimisticScoreDelta: 0,
      optimisticCombo: 0,
      error: "",
      feedback: this.makeFeedback(type, text, delta, evaluation.fishId, corrected)
    });
  }

  beginPowerUp(powerUpId: string): boolean {
    if (this.state.pendingAction || !powerUpId) return false;
    this.patch({
      pendingAction: "powerUp",
      pendingPowerUpId: powerUpId,
      pendingFishId: "",
      error: ""
    });
    return true;
  }

  settlePowerUp(response: CatchFishResponse): void {
    const delta = Number(response.delta || 0);
    const type = response.usedPowerUp?.type;
    this.patch({
      pendingAction: null,
      pendingPowerUpId: "",
      optimisticScoreDelta: 0,
      optimisticCombo: 0,
      feedback: this.makeFeedback(
        "powerUp",
        type === "pesticide"
          ? `杀虫剂 +${delta}`
          : (type === "swatter" ? "苍蝇拍已使用" : "道具已使用"),
        delta
      ),
      error: ""
    });
  }

  beginFinish(): boolean {
    if (this.state.finishing || this.state.pendingAction) return false;
    this.patch({ finishing: true, pendingAction: "finish", error: "" });
    return true;
  }

  endFinish(error = ""): void {
    this.patch({
      finishing: false,
      pendingAction: this.state.pendingAction === "finish" ? null : this.state.pendingAction,
      error
    });
  }

  failPending(message: string): void {
    this.patch({
      pendingAction: null,
      pendingFishId: "",
      pendingPowerUpId: "",
      optimisticScoreDelta: 0,
      optimisticCombo: 0,
      error: message,
      feedback: this.makeFeedback("error", message, 0, this.state.pendingFishId, true)
    });
  }

  setTimeLeft(value: number): void {
    const timeLeft = Math.max(0, Math.ceil(Number(value) || 0));
    if (timeLeft !== this.state.timeLeft) this.patch({ timeLeft });
  }

  showBotFeedback(delta: number): void {
    this.patch({
      feedback: this.makeFeedback("bot", `机器人 +${Math.max(0, delta)}`, delta)
    });
  }

  setResult(record: MatchRecord): void {
    this.patch({ result: record, finishing: false, pendingAction: null });
  }

  reset(timeLeft = 0): void {
    this.state = {
      pendingAction: null,
      pendingFishId: "",
      pendingPowerUpId: "",
      optimisticScoreDelta: 0,
      optimisticCombo: 0,
      baselineScore: 0,
      timeLeft: Math.max(0, Math.ceil(timeLeft)),
      finishing: false,
      feedback: null,
      error: "",
      result: null
    };
    this.emit();
  }

  private makeFeedback(
    type: FishingFeedbackType,
    text: string,
    delta: number,
    fishId?: string,
    corrected = false
  ): FishingFeedback {
    return {
      id: ++this.feedbackSequence,
      type,
      text,
      delta,
      fishId,
      corrected
    };
  }

  private patch(patch: Partial<FishingState>): void {
    this.state = { ...this.state, ...patch };
    this.emit();
  }

  private emit(): void {
    this.events.emit("changed", this.getState());
  }
}
