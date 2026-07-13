import { _decorator, Button, Component, EditBox, Label, Node } from "cc";
import { app } from "../core/App";
import {
  buildRoomGameOptions,
  getLocalRoomPlayer,
  getRoomActionAvailability,
  getRoomStartStatusText,
  isBotPlayer
} from "../domain/RoomRules";
import type { BotDifficulty } from "../domain/GameTypes";
import type { RoomSnapshot } from "../domain/RoomTypes";
import { getSpellTemplatesForBank } from "../domain/SpellTemplateCatalog";
import { getWordBank, getWordBankLabel } from "../domain/WordBankRules";
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

const BOT_DIFFICULTIES: BotDifficulty[] = ["low", "medium", "high"];
const BOT_DIFFICULTY_LABELS: Record<BotDifficulty, string> = {
  low: "低",
  medium: "中",
  high: "高"
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

  @property(Label)
  pageTitleLabel: Label | null = null;

  @property(Label)
  selectedBankLabel: Label | null = null;

  @property(Label)
  autoReadyLabel: Label | null = null;

  @property(Label)
  readyLabel: Label | null = null;

  @property(Node)
  createPanel: Node | null = null;

  @property(Node)
  joinPanel: Node | null = null;

  @property(Node)
  lobbyPanel: Node | null = null;

  @property(Button)
  readyButton: Button | null = null;

  @property(Button)
  createButton: Button | null = null;

  @property(Button)
  joinButton: Button | null = null;

  @property(Button)
  copyButton: Button | null = null;

  @property(Button)
  inviteButton: Button | null = null;

  @property(Button)
  refreshButton: Button | null = null;

  @property(Button)
  backButton: Button | null = null;

  @property(Button)
  leaveButton: Button | null = null;

  @property(Button)
  addBotButton: Button | null = null;

  @property([Button])
  botDifficultyButtons: Button[] = [];

  @property([Label])
  botDifficultyLabels: Label[] = [];

  @property(Button)
  startButton: Button | null = null;

  @property(Button)
  autoReadyButton: Button | null = null;

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
    const roomSpellQuestions = state.selectedMode === "coopSpell"
      ? getSpellTemplatesForBank(
          app.spellTemplateData,
          app.wordBankCatalog,
          state.bankId,
          words
        )
      : [];
    const gameOptions = buildRoomGameOptions({
      modeKey: state.selectedMode,
      duration: state.duration,
      bankId: state.bankId,
      wordMode: state.wordMode,
      words,
      wrongWords: app.wordBankStore.getWrongWords(),
      roomSpellQuestions
    });
    let room: RoomSnapshot;
    try {
      room = await app.roomSession.create(gameOptions);
    } catch (error) {
      this.showError(error, "创建房间失败");
      return;
    }
    if (!app.store.getState().roomAutoReady) return;
    const localOpenId = app.playerStore.getLocalPlayer().openid;
    const localPlayer = getLocalRoomPlayer(room, localOpenId);
    if (!localPlayer || localPlayer.ready) return;
    try {
      await app.roomSession.toggleReady();
    } catch {
      app.runtime.showToast("房间已创建，请手动点击准备");
    }
  }

  changeBank(): void {
    app.router.openBankPicker("room");
  }

  toggleAutoReady(): void {
    if (app.roomStore.getState().pendingAction) return;
    app.store.patch({ roomAutoReady: !app.store.getState().roomAutoReady });
    this.renderAutoReady();
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
    const hasSession = !!state.roomId || !!room;
    const intent = app.store.getState().roomEntryIntent;
    if (this.createPanel) this.createPanel.active = !hasSession && intent === "create";
    if (this.joinPanel) this.joinPanel.active = !hasSession && intent === "join";
    if (this.lobbyPanel) this.lobbyPanel.active = hasSession;
    this.setSessionControls(state, hasSession);
    this.renderAutoReady();
    if (this.pageTitleLabel) {
      this.pageTitleLabel.string = hasSession
        ? this.getSelectedModeLabel(room)
        : intent === "join"
          ? "加入房间"
          : intent === "create"
            ? "创建房间"
            : "双人房间";
    }
    if (this.selectedBankLabel) {
      const selectedBank = getWordBank(app.wordBankCatalog, app.wordBankStore.getSelectedBankId());
      this.selectedBankLabel.string = getWordBankLabel(selectedBank, true);
    }
    if (this.roomCodeLabel) {
      this.roomCodeLabel.string = state.roomCode || "------";
    }
    if (!room) {
      if (this.modeLabel) this.modeLabel.string = this.getSelectedModeLabel();
      const joiningAccepted = !!state.roomId;
      if (this.playersLabel) {
        this.playersLabel.string = joiningAccepted
          ? "正在读取房间信息"
          : this.getEntryGuidance();
      }
      if (this.statusLabel) {
        this.statusLabel.string = state.pendingAction
          ? ACTION_LABELS[state.pendingAction]
          : (joiningAccepted
            ? (state.syncError ? `${state.syncError}，正在自动重试` : "正在同步房间...")
            : "创建新房间，或输入 6 位房间码加入");
      }
      this.setRoomButtons(false, false, false, "medium");
      return;
    }

    const localOpenId = app.playerStore.getLocalPlayer().openid;
    const availability = getRoomActionAvailability(room, localOpenId);
    const localPlayer = getLocalRoomPlayer(room, localOpenId);
    if (this.modeLabel) {
      this.modeLabel.string = `${this.getSelectedModeLabel(room)} · ${room.duration}秒`;
    }
    if (this.playersLabel) {
      this.playersLabel.string = room.players.length
        ? room.players.map((player, index) => {
            const identity = player.openid === localOpenId ? "（我）" : "";
            const displayName = isBotPlayer(player)
              ? `机器人 ${player.nickName || "对手"}`
              : `${player.nickName || `玩家${index + 1}`}${identity}`;
            return `${displayName} · ${player.ready ? "已准备" : "未准备"}`;
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
    const bot = room.players.find(isBotPlayer);
    const selectedDifficulty = bot?.botDifficulty || room.gameOptions.botDifficulty || "medium";
    this.setRoomButtons(
      availability.canToggleReady,
      availability.canAddBot,
      availability.canStart,
      selectedDifficulty
    );
    if (this.readyButton && localPlayer) {
      this.readyButton.interactable = availability.canToggleReady && !state.pendingAction;
    }
    if (this.readyLabel) {
      this.readyLabel.string = localPlayer?.ready ? "取消准备" : "我准备好了";
    }
  }

  private setRoomButtons(
    canReady: boolean,
    canAddBot: boolean,
    canStart: boolean,
    selectedDifficulty: BotDifficulty
  ): void {
    const busy = !!app.roomStore.getState().pendingAction;
    if (this.readyButton) this.readyButton.interactable = canReady && !busy;
    const difficultyButtons = this.botDifficultyButtons.length
      ? this.botDifficultyButtons
      : (this.addBotButton ? [this.addBotButton] : []);
    difficultyButtons.forEach((button) => {
      button.interactable = canAddBot && !busy;
    });
    this.botDifficultyLabels.forEach((label, index) => {
      const difficulty = BOT_DIFFICULTIES[index];
      if (!difficulty) return;
      label.string = `${difficulty === selectedDifficulty ? "✓ " : ""}${BOT_DIFFICULTY_LABELS[difficulty]}`;
    });
    if (this.startButton) this.startButton.interactable = canStart && !busy;
  }

  private setSessionControls(state: RoomSessionState, hasSession: boolean): void {
    const busy = !!state.pendingAction;
    if (this.createButton) this.createButton.interactable = !hasSession && !busy;
    if (this.joinButton) this.joinButton.interactable = !hasSession && !busy;
    if (this.copyButton) this.copyButton.interactable = !!state.room && !busy;
    if (this.inviteButton) this.inviteButton.interactable = !!state.room && !busy;
    if (this.refreshButton) {
      this.refreshButton.interactable = !!state.roomId && !state.syncing && !busy;
    }
    if (this.backButton) this.backButton.interactable = !busy;
    if (this.leaveButton) this.leaveButton.interactable = !busy;
    if (this.autoReadyButton) this.autoReadyButton.interactable = !busy;
  }

  private getSelectedModeLabel(room: RoomSnapshot | null = null): string {
    if (room?.gameOptions.matchMode === "coop") {
      return room.gameOptions.coopMode === "spell" ? "同舟拼词记" : "默契捕词赛";
    }
    const mode = app.store.getState().selectedMode;
    if (mode === "coopShared") return "默契捕词赛";
    if (mode === "coopSpell") return "同舟拼词记";
    return "准备体验模式";
  }

  private renderAutoReady(): void {
    if (this.autoReadyLabel) {
      this.autoReadyLabel.string = app.store.getState().roomAutoReady
        ? "✓ 房主创建后自动准备"
        : "房主创建后手动准备";
    }
  }

  private getEntryGuidance(): string {
    const intent = app.store.getState().roomEntryIntent;
    if (intent === "create") return "已选择创建房间\n确认词库与玩法后点击“创建房间”";
    if (intent === "join") return "已选择加入房间\n输入好友的 6 位房间码";
    return "尚未进入房间";
  }

  private showError(error: unknown, fallback: string): void {
    const message = error instanceof Error && error.message ? error.message : fallback;
    app.runtime.showToast(message);
  }
}
