import { _decorator, Button, Component, EditBox, Label, Node } from "cc";
import { RuntimeButtonVisual } from "../components/ui/RuntimeButtonVisual";
import { app } from "../core/App";
import {
  buildRoomGameOptions,
  getLocalRoomPlayer,
  getRoomActionAvailability,
  getRoomStartStatusText,
  normalizeRoomCode
} from "../domain/RoomRules";
import type { RoomSnapshot } from "../domain/RoomTypes";
import { getSpellTemplatesForBank } from "../domain/SpellTemplateCatalog";
import { getWordBank, getWordBankLabel } from "../domain/WordBankRules";
import type { RoomSessionState } from "../store/RoomStore";

const { ccclass, property } = _decorator;

const ACTION_LABELS: Record<string, string> = {
  create: "正在创建房间...",
  join: "正在加入房间...",
  ready: "正在更新准备状态...",
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
  playerOneLabel: Label | null = null;

  @property(Label)
  playerTwoLabel: Label | null = null;

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
  backButton: Button | null = null;

  @property(Button)
  leaveButton: Button | null = null;

  @property(Button)
  startButton: Button | null = null;

  @property(Label)
  startSubtitleLabel: Label | null = null;

  @property(Button)
  autoReadyButton: Button | null = null;

  autoReadyVisual: RuntimeButtonVisual | null = null;
  readyVisual: RuntimeButtonVisual | null = null;
  startVisual: RuntimeButtonVisual | null = null;
  playerReadyIndicators: Node[] = [];
  playerWaitingIndicators: Node[] = [];
  roomReadyIndicator: Node | null = null;
  joinHintLabel: Label | null = null;
  joinSubtitleLabel: Label | null = null;

  private unsubscribe: (() => void) | null = null;

  onLoad(): void {
    app.store.setRoute("room");
    this.unsubscribe = app.roomStore.subscribe((state) => this.render(state));
  }

  start(): void {
    this.roomCodeInput?.node.on("text-changed", () => this.renderJoinDraft(), this);
    this.render(app.roomStore.getState());
  }

  onDestroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  async createConfiguredRoom(): Promise<void> {
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

  async startSelectedMode(): Promise<void> {
    try {
      await app.roomSession.startPreparedMode();
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

  backHome(): void {
    app.roomSession.leave();
    app.router.navigate("home");
  }

  private render(state: RoomSessionState): void {
    const room = state.room;
    const hasSession = !!state.roomId || !!room;
    const intent = app.store.getState().roomEntryIntent;
    if (hasSession) {
      this.releaseEntryPanels();
    } else {
      if (this.createPanel) this.createPanel.active = intent === "create";
      if (this.joinPanel) this.joinPanel.active = intent === "join";
    }
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
      this.renderPlayerStateIndicators([]);
      if (this.roomReadyIndicator) this.roomReadyIndicator.active = false;
      this.readyVisual?.setSelected(false);
      this.startVisual?.setSelected(false);
      if (hasSession) {
        if (this.modeLabel) this.modeLabel.string = this.getSelectedBankLabel();
        if (this.playerOneLabel) this.playerOneLabel.string = "玩家1（你）\n正在读取...";
        if (this.playerTwoLabel) this.playerTwoLabel.string = "等待玩家加入\n○ 未准备";
        if (this.statusLabel) {
          this.statusLabel.string = state.pendingAction
            ? ACTION_LABELS[state.pendingAction]
            : (state.syncError ? `${state.syncError}，后台将自动重试` : "正在进入房间...");
        }
      }
      this.setLobbyButtons(false, false);
      return;
    }

    const localOpenId = app.playerStore.getLocalPlayer().openid;
    const availability = getRoomActionAvailability(room, localOpenId);
    const localPlayer = getLocalRoomPlayer(room, localOpenId);
    this.renderPlayerStateIndicators(room.players);
    if (this.roomReadyIndicator) this.roomReadyIndicator.active = availability.canStart;
    this.readyVisual?.setSelected(!!localPlayer?.ready);
    this.startVisual?.setSelected(availability.canStart);
    if (this.modeLabel) {
      this.modeLabel.string = this.getSelectedBankLabel(room);
    }
    if (this.playerOneLabel) {
      this.playerOneLabel.string = this.formatPlayer(room.players[0], 0, localOpenId);
    }
    if (this.playerTwoLabel) {
      this.playerTwoLabel.string = this.formatPlayer(room.players[1], 1, localOpenId);
    }
    if (this.statusLabel) {
      this.statusLabel.string = state.pendingAction
        ? ACTION_LABELS[state.pendingAction]
        : (state.syncError
          ? `${state.syncError}，后台将自动重试`
          : getRoomStartStatusText(availability.startBlockReason));
    }
    this.setLobbyButtons(availability.canToggleReady, availability.canStart);
    if (this.startSubtitleLabel) {
      this.startSubtitleLabel.string = availability.canStart
        ? "双方已准备，点击开始游戏"
        : localPlayer?.ready
          ? "你已准备，等待另一名玩家"
          : "双方准备后可开始";
    }
    if (this.readyLabel) {
      this.readyLabel.string = localPlayer?.ready ? "✓ 已准备，点击取消" : "✓ 我准备好了";
    }
  }

  private setLobbyButtons(canReady: boolean, canStart: boolean): void {
    const busy = !!app.roomStore.getState().pendingAction;
    if (this.readyButton) this.readyButton.interactable = canReady && !busy;
    if (this.startButton) this.startButton.interactable = canStart && !busy;
    this.readyVisual?.refresh();
    this.startVisual?.refresh();
  }

  private setSessionControls(state: RoomSessionState, hasSession: boolean): void {
    const busy = !!state.pendingAction;
    if (this.createButton) this.createButton.interactable = !hasSession && !busy;
    if (this.joinButton) this.renderJoinDraft();
    if (this.copyButton) this.copyButton.interactable = !!state.room && !busy;
    if (this.inviteButton) this.inviteButton.interactable = !!state.room && !busy;
    if (this.backButton) this.backButton.interactable = !busy;
    if (this.leaveButton) this.leaveButton.interactable = !busy;
    if (this.autoReadyButton) this.autoReadyButton.interactable = !busy;
  }

  private releaseEntryPanels(): void {
    this.createPanel?.destroy();
    this.joinPanel?.destroy();
    this.createPanel = null;
    this.joinPanel = null;
    this.roomCodeInput = null;
    this.selectedBankLabel = null;
    this.autoReadyLabel = null;
    this.createButton = null;
    this.joinButton = null;
    this.autoReadyButton = null;
    this.autoReadyVisual = null;
  }

  private renderJoinDraft(): boolean {
    const length = normalizeRoomCode(this.roomCodeInput?.string || "").length;
    const ready = length === 6;
    if (this.joinHintLabel) this.joinHintLabel.string = ready
      ? "房间码已完整，可以加入"
      : length ? `还需输入 ${6 - length} 位` : "请输入 6 位英文字母或数字";
    if (this.joinSubtitleLabel) this.joinSubtitleLabel.string = ready
      ? "房间码已完整，点击加入"
      : "输入完整房间码后可加入";
    if (this.joinButton) this.joinButton.interactable = ready && !app.roomStore.getState().pendingAction;
    this.joinButton?.node.getComponent(RuntimeButtonVisual)?.refresh();
    return ready;
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

  private getSelectedBankLabel(room: RoomSnapshot | null = null): string {
    const bankId = room?.gameOptions.bankId || app.wordBankStore.getSelectedBankId();
    return getWordBankLabel(getWordBank(app.wordBankCatalog, bankId), true);
  }

  private formatPlayer(player: RoomSnapshot["players"][number] | undefined, index: number,
    localOpenId: string): string {
    if (!player) return `玩家${index + 1}\n○ 等待加入`;
    const identity = player.openid === localOpenId ? "（你）" : "";
    return `玩家${index + 1}${identity}\n${player.ready ? "✓ 已准备" : "○ 未准备"}`;
  }

  private renderAutoReady(): void {
    const enabled = app.store.getState().roomAutoReady;
    if (this.autoReadyLabel) {
      this.autoReadyLabel.string = enabled
        ? "✓ 房主创建后自动准备"
        : "房主创建后手动准备";
    }
    this.autoReadyVisual?.setSelected(enabled);
  }

  private renderPlayerStateIndicators(players: RoomSnapshot["players"]): void {
    this.playerReadyIndicators.forEach((indicator, index) => {
      indicator.active = !!players[index]?.ready;
    });
    this.playerWaitingIndicators.forEach((indicator, index) => {
      indicator.active = !players[index]?.ready;
    });
  }

  private showError(error: unknown, fallback: string): void {
    const message = error instanceof Error && error.message ? error.message : fallback;
    app.runtime.showToast(message);
  }
}
