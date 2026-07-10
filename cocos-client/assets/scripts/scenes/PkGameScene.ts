import { _decorator, Button, Component, Label } from "cc";
import { PkWordTarget } from "../components/pk/PkWordTarget";
import { app } from "../core/App";
import { getLocalRoomPlayer } from "../domain/RoomRules";
import type { FishingState } from "../store/FishingStore";
import type { RoomSessionState } from "../store/RoomStore";

const { ccclass, property } = _decorator;

@ccclass("PkGameScene")
export class PkGameScene extends Component {
  @property(Label)
  meaningLabel: Label | null = null;

  @property(Label)
  localScoreLabel: Label | null = null;

  @property(Label)
  opponentScoreLabel: Label | null = null;

  @property(Label)
  timerLabel: Label | null = null;

  @property(Label)
  comboLabel: Label | null = null;

  @property(Label)
  statusLabel: Label | null = null;

  @property(Button)
  powerUpButton: Button | null = null;

  @property([PkWordTarget])
  wordTargets: PkWordTarget[] = [];

  private unsubscribeRoom: (() => void) | null = null;
  private unsubscribeFishing: (() => void) | null = null;

  onLoad(): void {
    app.store.setRoute("pkGame");
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

  async useFirstPowerUp(): Promise<void> {
    try {
      await app.fishingMatch.usePowerUp();
    } catch (error) {
      app.runtime.showToast(error instanceof Error ? error.message : "道具使用失败");
    }
  }

  backHome(): void {
    app.roomSession.leave();
    app.fishingMatch.reset();
    app.router.navigate("home");
  }

  private tapFish(fishId: string): void {
    void app.fishingMatch.catchFish(fishId).catch((error: unknown) => {
      app.runtime.showToast(error instanceof Error ? error.message : "操作失败");
    });
  }

  private render(): void {
    const roomState = app.roomStore.getState();
    const fishingState = app.fishingStore.getState();
    const room = roomState.room;
    if (!room) {
      this.renderMissingRoom();
      return;
    }
    const localOpenId = app.playerStore.getLocalPlayer().openid;
    const local = getLocalRoomPlayer(room, localOpenId);
    const opponent = room.players.find((player) => player.openid !== localOpenId) || null;
    if (this.meaningLabel) this.meaningLabel.string = room.currentMeaning || "正在准备下一题";
    if (this.localScoreLabel) {
      this.localScoreLabel.string = `我方 ${Number(local?.score || 0) + fishingState.optimisticScoreDelta}`;
    }
    if (this.opponentScoreLabel) {
      this.opponentScoreLabel.string = `${opponent?.isBot ? "机器人" : "对手"} ${Number(opponent?.score || 0)}`;
    }
    if (this.timerLabel) this.timerLabel.string = `${fishingState.timeLeft}s`;
    const combo = fishingState.optimisticCombo || Number(local?.combo || 0);
    if (this.comboLabel) this.comboLabel.string = combo > 1 ? `连击 x${combo}` : "";
    if (this.statusLabel) this.statusLabel.string = this.getStatusText(fishingState);
    const powerUps = local?.powerUps || [];
    if (this.powerUpButton) {
      this.powerUpButton.interactable = powerUps.length > 0 && !fishingState.pendingAction;
    }
    const fishes = room.fishes.filter((fish) => fish.alive);
    const targetsEnabled = !fishingState.pendingAction && room.state === "playing";
    this.wordTargets.forEach((target, index) => {
      const fish = fishes[index];
      if (fish) target.bind(fish, (fishId) => this.tapFish(fishId), targetsEnabled);
      else target.clear();
    });
  }

  private getStatusText(state: FishingState): string {
    if (state.error) return state.error;
    if (state.feedback) return state.feedback.text;
    if (state.pendingAction === "catch") return "正在确认答案...";
    if (state.pendingAction === "powerUp") return "正在使用道具...";
    if (state.finishing) return "正在结算...";
    return "根据中文提示点击正确单词";
  }

  private renderMissingRoom(): void {
    if (this.meaningLabel) this.meaningLabel.string = "房间已退出";
    if (this.localScoreLabel) this.localScoreLabel.string = "我方 0";
    if (this.opponentScoreLabel) this.opponentScoreLabel.string = "对手 0";
    if (this.timerLabel) this.timerLabel.string = "0s";
    if (this.comboLabel) this.comboLabel.string = "";
    if (this.statusLabel) this.statusLabel.string = "请返回首页重新进入房间";
    if (this.powerUpButton) this.powerUpButton.interactable = false;
    this.wordTargets.forEach((target) => target.clear());
  }
}
