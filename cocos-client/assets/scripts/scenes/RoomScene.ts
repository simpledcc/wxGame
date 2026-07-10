import { _decorator, Button, Component, EditBox, Label } from "cc";
import { app } from "../core/App";
import {
  buildRoomGameOptions,
  getLocalRoomPlayer,
  getRoomActionAvailability,
  getRoomModeLabel,
  getRoomStartStatusText
} from "../domain/RoomRules";
import type { BotDifficulty } from "../domain/GameTypes";
import type { RoomSessionState } from "../store/RoomStore";

const { ccclass, property } = _decorator;

const ACTION_LABELS: Record<string, string> = {
  create: "正在创建房间...",
  join: "正在加入房间...",
  ready: "正在更新准备状态...",
  bot: "正在设置机器人...",
  start: "正在开始游戏...",
  copy: "正在复制房间码...",
  invite: "正在打开邀请..."
};

@ccclass("RoomScene")
export class RoomScene extends Component {
  @property(EditBox)
  roomCodeInput: EditBox | null = null;

  @property(Label)
  roomCodeLabel: Label | null = null;

  @property(Label)
  modeLabel: Label | null = null;

  @property(Label)
  playersLabel: Label | null = null;

  @property(Label)
  statusLabel: Label | null = null;

  @property(Button)
  readyButton: Button | null = null;

  @property(Button)
  addBotButton: Button | null = null;

  @property(Button)
  startButton: Button | null = null;

  private unsubscribe: (() => void) | null = null;

  onLoad(): void {
    app.store.setRoute("room");
    this.unsubscribe = app.roomStore.subscribe((state) => this.render(state));
  }

  start(): void {
    this.render(app.roomStore.getState());
  }

  onDestroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  async createSelectedRoom(): Promise<void> {
    const state = app.store.getState();
    const words = app.wordBankStore.getSelectedWords(app.wordBankCatalog);
    if (!words.length) {
      app.runtime.showToast("当前词库暂无可用单词");
      return;
    }
    const gameOptions = buildRoomGameOptions({
      modeKey: state.selectedMode,
      duration: state.duration,
      bankId: state.bankId,
      wordMode: state.wordMode,
      words,
      wrongWords: app.wordBankStore.getWrongWords()
    });
    try {
      await app.roomSession.create(gameOptions);
    } catch (error) {
      this.showError(error, "创建房间失败");
    }
  }

  async joinEnteredRoom(): Promise<void> {
    const roomCode = this.roomCodeInput?.string ?? "";
    try {
      await app.roomSession.join(roomCode);
      if (this.roomCodeInput) {
        this.roomCodeInput.string = "";
      }
    } catch (error) {
      this.showError(error, "加入房间失败");
    }
  }

  async toggleReady(): Promise<void> {
    try {
      await app.roomSession.toggleReady();
    } catch (error) {
      this.showError(error, "更新准备状态失败");
    }
  }

  async addDefaultBot(): Promise<void> {
    await this.addBot("medium");
  }

  async addLowBot(): Promise<void> {
    await this.addBot("low");
  }

  async addMediumBot(): Promise<void> {
    await this.addBot("medium");
  }

  async addHighBot(): Promise<void> {
    await this.addBot("high");
  }

  async startGame(): Promise<void> {
    try {
      await app.roomSession.startGame();
    } catch (error) {
      this.showError(error, "无法开始游戏");
    }
  }

  async copyRoomCode(): Promise<void> {
    try {
      await app.roomSession.copyRoomCode();
    } catch (error) {
      this.showError(error, "复制房间码失败");
    }
  }

  async inviteFriend(): Promise<void> {
    try {
      const result = await app.roomSession.invite();
      if (result === "copied") {
        app.runtime.showToast("当前环境无法直接分享，房间码已复制");
      }
    } catch (error) {
      this.showError(error, "邀请暂时不可用");
    }
  }

  async refreshRoom(): Promise<void> {
    try {
      await app.roomSession.refresh();
    } catch (error) {
      this.showError(error, "同步房间失败");
    }
  }

  backHome(): void {
    app.roomSession.leave();
    app.router.navigate("home");
  }

  private async addBot(difficulty: BotDifficulty): Promise<void> {
    try {
      await app.roomSession.addBot(difficulty);
    } catch (error) {
      this.showError(error, "设置机器人失败");
    }
  }

  private render(state: RoomSessionState): void {
    const room = state.room;
    if (this.roomCodeLabel) {
      this.roomCodeLabel.string = state.roomCode || "------";
    }
    if (!room) {
      if (this.modeLabel) this.modeLabel.string = this.getSelectedModeLabel();
      const joiningAccepted = !!state.roomId;
      if (this.playersLabel) {
        this.playersLabel.string = joiningAccepted ? "正在读取房间信息" : "尚未进入房间";
      }
      if (this.statusLabel) {
        this.statusLabel.string = state.pendingAction
          ? ACTION_LABELS[state.pendingAction]
          : (joiningAccepted
            ? (state.syncError ? `${state.syncError}，正在自动重试` : "正在同步房间...")
            : "创建新房间，或输入 6 位房间码加入");
      }
      this.setRoomButtons(false, false, false);
      return;
    }

    const localOpenId = app.playerStore.getLocalPlayer().openid;
    const availability = getRoomActionAvailability(room, localOpenId);
    const localPlayer = getLocalRoomPlayer(room, localOpenId);
    if (this.modeLabel) {
      this.modeLabel.string = `${getRoomModeLabel(room)} · ${room.duration}秒`;
    }
    if (this.playersLabel) {
      this.playersLabel.string = room.players.length
        ? room.players.map((player, index) => {
            const identity = player.openid === localOpenId ? "（我）" : "";
            const role = player.isBot ? "机器人" : `玩家${index + 1}`;
            return `${role}${identity} ${player.nickName} · ${player.ready ? "已准备" : "未准备"}`;
          }).join("\n")
        : "等待玩家加入";
    }
    if (this.statusLabel) {
      this.statusLabel.string = state.pendingAction
        ? ACTION_LABELS[state.pendingAction]
        : state.syncError || (state.syncing
          ? "正在同步房间..."
          : getRoomStartStatusText(availability.startBlockReason));
    }
    this.setRoomButtons(
      availability.canToggleReady,
      availability.canAddBot,
      availability.canStart
    );
    if (this.readyButton && localPlayer) {
      this.readyButton.interactable = availability.canToggleReady && !state.pendingAction;
    }
  }

  private setRoomButtons(canReady: boolean, canAddBot: boolean, canStart: boolean): void {
    const busy = !!app.roomStore.getState().pendingAction;
    if (this.readyButton) this.readyButton.interactable = canReady && !busy;
    if (this.addBotButton) this.addBotButton.interactable = canAddBot && !busy;
    if (this.startButton) this.startButton.interactable = canStart && !busy;
  }

  private getSelectedModeLabel(): string {
    const mode = app.store.getState().selectedMode;
    if (mode === "coopShared") return "默契捕词赛";
    if (mode === "coopSpell") return "同舟拼词记";
    return "双人PK";
  }

  private showError(error: unknown, fallback: string): void {
    const message = error instanceof Error && error.message ? error.message : fallback;
    app.runtime.showToast(message);
  }
}
