import { _decorator, Component, Label } from "cc";
import { GameplayFeedbackPool } from "../components/pk/GameplayFeedbackPool";
import { PkWordTarget } from "../components/pk/PkWordTarget";
import { app } from "../core/App";
import { getFishingTeamScore } from "../domain/FishingRules";
import { getLocalRoomPlayer } from "../domain/RoomRules";
import { FishingMatchError } from "../services/FishingMatchService";
import type { FishingState } from "../store/FishingStore";

const { ccclass, property } = _decorator;

@ccclass("CoopSharedScene")
export class CoopSharedScene extends Component {
  @property(Label)
  meaningLabel: Label | null = null;

  @property(Label)
  teamScoreLabel: Label | null = null;

  @property(Label)
  contributionLabel: Label | null = null;

  @property(Label)
  timerLabel: Label | null = null;

  @property(Label)
  statusLabel: Label | null = null;

  @property([PkWordTarget])
  wordTargets: PkWordTarget[] = [];

  @property(GameplayFeedbackPool)
  feedbackPool: GameplayFeedbackPool | null = null;

  private unsubscribeRoom: (() => void) | null = null;
  private unsubscribeFishing: (() => void) | null = null;

  onLoad(): void {
    app.store.setRoute("coopShared");
    this.unsubscribeRoom = app.roomStore.subscribe(() => this.render());
    this.unsubscribeFishing = app.fishingStore.subscribe(() => this.render());
  }

  start(): void {
    app.fishingMatch.updateClock();
    this.render();
  }

  update(): void {
    app.fishingMatch.updateClock();
  }

  onDestroy(): void {
    this.unsubscribeRoom?.();
    this.unsubscribeFishing?.();
    this.unsubscribeRoom = null;
    this.unsubscribeFishing = null;
  }

  backHome(): void {
    app.roomSession.leave();
    app.fishingMatch.reset();
    app.router.navigate("home");
  }

  private tapFish(fishId: string): void {
    void app.fishingMatch.catchFish(fishId).catch((error: unknown) => {
      if (error instanceof FishingMatchError && error.silent) return;
      app.runtime.showToast(error instanceof Error ? error.message : "操作失败");
    });
  }

  private render(): void {
    const room = app.roomStore.getRoom();
    const fishing = app.fishingStore.getState();
    this.feedbackPool?.show(fishing.feedback);
    if (!room) {
      this.renderMissingRoom();
      return;
    }
    const localOpenId = app.playerStore.getLocalPlayer().openid;
    const local = getLocalRoomPlayer(room, localOpenId);
    const teammate = room.players.find((player) => player.openid !== localOpenId) || null;
    if (this.meaningLabel) this.meaningLabel.string = room.currentMeaning || "正在准备下一题";
    if (this.teamScoreLabel) {
      this.teamScoreLabel.string = `团队 ${getFishingTeamScore(room, fishing.optimisticScoreDelta)} 分`;
    }
    if (this.contributionLabel) {
      const localScore = Number(local?.score || 0) + fishing.optimisticScoreDelta;
      this.contributionLabel.string = `我 ${localScore} · 队友 ${Number(teammate?.score || 0)}`;
    }
    if (this.timerLabel) this.timerLabel.string = `${fishing.timeLeft}s`;
    if (this.statusLabel) this.statusLabel.string = this.getStatusText(fishing);
    const enabled = !fishing.pendingAction && room.state === "playing";
    const fishes = room.fishes.filter((fish) => fish.alive);
    this.wordTargets.forEach((target, index) => {
      const fish = fishes[index];
      if (fish) target.bind(fish, (fishId) => this.tapFish(fishId), enabled);
      else target.clear();
    });
  }

  private getStatusText(state: FishingState): string {
    if (state.error) return state.error;
    if (state.feedback) return state.feedback.text;
    if (state.pendingAction === "catch") return "正在同步本次捕词...";
    if (state.finishing) return "正在结算团队成绩...";
    return "两人都可以根据中文提示捕获正确单词";
  }

  private renderMissingRoom(): void {
    if (this.meaningLabel) this.meaningLabel.string = "房间已退出";
    if (this.teamScoreLabel) this.teamScoreLabel.string = "团队 0 分";
    if (this.contributionLabel) this.contributionLabel.string = "我 0 · 队友 0";
    if (this.timerLabel) this.timerLabel.string = "0s";
    if (this.statusLabel) this.statusLabel.string = "请返回首页重新进入房间";
    this.wordTargets.forEach((target) => target.clear());
  }
}
