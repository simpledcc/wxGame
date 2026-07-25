import { Label, Node, UITransform } from "cc";
import { app } from "../../../core/App";
import { ROOM_CODE_LENGTH } from "../../../domain/RoomRules";
import { CoopSelectScene } from "../../../scenes/CoopSelectScene";
import { RoomScene } from "../../../scenes/RoomScene";
import type { PreGameActionButtonRef } from "../PreGameUi";
import type { RuntimeButtonRef, RuntimeEditRef, RuntimeUi } from "../RuntimeUi";
import { createPreGamePage } from "./PreGamePageBuilder";

export function buildModeCatalogScreen(parent: Node, ui: RuntimeUi): Node {
  const { root, home, safe } = createPreGamePage(parent, ui, "CoopSelect");
  const safeTop = safe.height / 2;
  let controller!: CoopSelectScene;
  const header = home.pageHeader(safe, "CoopSelectHeader", "选择玩法", "选择本次想体验的双人玩法",
    () => controller.backHome(), "catalog", "catalog");
  header.titleLabel.node.getComponent(UITransform)?.setContentSize(230, 42);
  header.subtitleLabel.node.getComponent(UITransform)?.setContentSize(334, 24);
  home.iconButton(header.node, "ModeHelpButton", "?", 229, 0, 80,
    () => controller.openHelp(), undefined, "join", 36);
  const modes = [
    ["好友房间体验", "创建、邀请、准备并开始", "joinRoom", "practice"],
    ["双人 PK 竞技", "快速抢答，一决高下", "practice", "practice"],
    ["魔法对战", "答对单词积累魔法能量", "catalog", "catalog"],
    ["抢夺宝物", "一起争夺宝箱与奖励", "history", "history"],
    ["搭桥比赛", "答对单词建桥前进", "createRoom", "create"],
    ["造塔比赛", "收集材料搭建高塔", "wordBank", "bank"],
    ["合作塔防", "合作守护词斗乐园", "joinRoom", "join"],
    ["合作挑战 Boss", "一起挑战强大对手", "catalog", "catalog"]
  ] as const;
  modes.forEach(([title, subtitle, icon, kind], index) => {
    const row = home.group(safe.node, `ModeOption${index}`, 0,
      safeTop - 163 - index * 86, 548, 80);
    const action = home.actionButton(row, `ModeOption${index}Action`, title, subtitle, "玩",
      0, 0, 548, 80, () => controller.openModeSetup(), index ? kind : "practice", icon);
    action.titleLabel.node.setPosition(-48, 17, 0);
    action.titleLabel.node.getComponent(UITransform)?.setContentSize(292, 28);
    action.titleLabel.fontSize = 23;
    action.titleLabel.lineHeight = 28;
    action.subtitleLabel?.node.setPosition(-48, -18, 0);
    action.subtitleLabel?.node.getComponent(UITransform)?.setContentSize(292, 26);
    if (action.subtitleLabel) {
      action.subtitleLabel.fontSize = 15;
      action.subtitleLabel.lineHeight = 20;
    }
    home.statusBadge(action.node, `ModeOption${index}Status`, index ? "筹备中" : "可体验",
      208, 0, 102, index ? "surface" : "practice", 16);
    if (index) {
      action.button.interactable = false;
      action.visual.refresh();
    }
  });
  controller = root.addComponent(CoopSelectScene);
  return root;
}

export function buildRoomScreen(parent: Node, ui: RuntimeUi): Node {
  const { root, home, safe } = createPreGamePage(parent, ui, "Room");
  const roomContentY = (safe.height - 886) / 2 - 21;
  const lobbyContentY = (safe.height - 822) / 2 - 17;
  let controller!: RoomScene;
  const entryIntent = app.store.getState().roomEntryIntent;
  const roomState = app.roomStore.getState();
  const hasSession = !!roomState.roomId || !!roomState.room;
  const headerTitle = entryIntent === "join" ? "加入房间" : entryIntent === "create" ? "创建房间" : "双人房间";
  const headerIcon = entryIntent === "join" ? "joinRoom" : "createRoom";
  const header = home.pageHeader(safe, "RoomHeader", headerTitle,
    "两名真实玩家加入并准备后，由房主开始", () => controller.backHome(), headerIcon,
    entryIntent === "join" ? "join" : entryIntent === "create" ? "create" : "practice");

  let createPanel: Node | null = null;
  let selectedBank: Label | null = null;
  let create: PreGameActionButtonRef | null = null;
  let autoReady: RuntimeButtonRef | null = null;
  if (!hasSession && entryIntent === "create") {
    createPanel = home.group(safe.node, "RoomCreatePanel", 0, roomContentY, safe.width, 760);
    const selectedModeCard = home.sectionCard(createPanel, "SelectedModeCard", "已选模式", 0, 248,
      548, 184, "join", "joinRoom");
    home.visualSlot(selectedModeCard, "joinRoom", -198, -21, 92, 92);
    home.label(selectedModeCard, "SelectedModeTitle", "好友房间体验", 50, -2, 388, 48, 31, "homeText", 0);
    home.label(selectedModeCard, "SelectedModeSummary", "创建房间并邀请好友，双方准备后开始", 50, -52,
      388, 34, 18, "homeTextMuted", 0);
    const bankCard = home.sectionCard(createPanel, "CreateBankCard", "当前词库", 0, 74,
      548, 148, "bank", "wordBank");
    home.visualSlot(bankCard, "wordBank", -210, -26, 66, 66);
    selectedBank = home.label(bankCard, "CreateBankLabel", "", -17, -16, 304, 46, 25, "homeText", 0);
    home.actionButton(bankCard, "ChangeRoomBank", "更换", "", "词", 202, -15, 118, 80,
      () => controller.changeBank(), "bank", "wordBank");
    const guidance = home.sectionCard(createPanel, "CreateGuidanceCard", "开始条件", 0, -64,
      548, 112, "history", "practice");
    home.visualSlot(guidance, "practice", -220, -13, 52, 52);
    home.label(guidance, "CreateGuidance", "创建后邀请好友加入；两名玩家准备后由房主开始", 30, -13,
      432, 58, 19, "homeText", 0);
    create = home.actionButton(createPanel, "CreateRoom", "创建房间", "生成房间码并等待好友", "房", 0,
      -192, 480, 128, () => void controller.createConfiguredRoom(), "create", "createRoom");
    autoReady = home.actionButton(createPanel, "AutoReady", "创建后自动准备", "", "✓", 0, -304,
      390, 80, () => controller.toggleAutoReady(), "surface", "practice");
    home.selectionStyle(autoReady.visual, "practice");
  }

  let joinPanel: Node | null = null;
  let input: RuntimeEditRef | null = null;
  let join: PreGameActionButtonRef | null = null;
  let joinHint: Label | null = null;
  if (!hasSession && entryIntent === "join") {
    joinPanel = home.group(safe.node, "RoomJoinPanel", 0, roomContentY, safe.width, 760);
    const joinCard = home.accentCard(joinPanel, "JoinCodeCard", 0, 20, 560, 600, "join", 24);
    home.visualSlot(joinCard, "joinRoom", 0, 212, 90, 90);
    home.label(joinCard, "JoinCodeTitle", "输入六位房间码", 0, 100, 480, 50, 30, "homeText");
    joinHint = home.label(joinCard, "JoinCodeHint", "请输入 6 位英文字母或数字", 0, 50, 480, 34, 18, "homeTextMuted");
    input = home.edit(joinCard, "RoomCodeInput", 0, -27, 500, 104, ROOM_CODE_LENGTH);
    home.label(joinCard, "JoinInviteHint", "也可以通过好友邀请直接进入准备房间", 0, -114, 480, 54, 18, "homeTextMuted");
    join = home.actionButton(joinCard, "JoinRoom", "加入房间", "查找好友创建的房间", "友", 0, -221,
      520, 120, () => void controller.joinEnteredRoom(), "join", "joinRoom");
  }

  const lobbyPanel = home.group(safe.node, "RoomLobbyPanel", 0, lobbyContentY, safe.width, 760);
  const codeCard = home.sectionCard(lobbyPanel, "RoomCodeCard", "房间码", 0, 252,
    548, 104, "join", "joinRoom");
  const roomCode = home.label(codeCard, "RoomCode", "------", -85, -4, 222, 44, 30, "homeText");
  const copy = home.actionButton(codeCard, "CopyCode", "复制", "", "码", 90, -4, 112, 80,
    () => void controller.copyRoomCode(), "join");
  const invite = home.actionButton(codeCard, "InviteFriend", "邀请", "", "友", 210, -4, 112, 80,
    () => void controller.inviteFriend(), "practice", "joinRoom");
  const lobbyBank = home.sectionCard(lobbyPanel, "LobbyBankCard", "当前词库", 0, 155,
    520, 72, "practice", "wordBank");
  const mode = home.label(lobbyBank, "RoomMode", "", 0, -14, 472, 28, 20, "homeText");
  const playerOne = home.playerStatusCard(lobbyPanel, "RoomPlayerOne", "房主", -140, "practice");
  const playerTwo = home.playerStatusCard(lobbyPanel, "RoomPlayerTwo", "玩家", 140, "join");
  const statusCard = home.sectionCard(lobbyPanel, "RoomStatusCard", "当前状态", 0, -150,
    520, 70, "history");
  const roomReadyIndicator = home.pill(statusCard, "RoomStatusReady", -222, -13, 28, 28,
    "homePractice", "homeTextOnColor");
  roomReadyIndicator.active = false;
  const roomAttentionIndicator = home.pill(statusCard, "RoomStatusAttention", -222, -13, 28, 28,
    "homeHistory", "homeTextOnColor");
  roomAttentionIndicator.active = false;
  const status = home.label(statusCard, "RoomStatus", "", 18, -14, 436, 26, 17, "homeTextMuted");
  const ready = home.actionButton(lobbyPanel, "Ready", "我准备好了", "", "✓", 0, -233, 440, 80,
    () => void controller.toggleReady(), "practice", "practice");
  home.selectionStyle(ready.visual, "practice");
  const start = home.actionButton(lobbyPanel, "StartRoom", "开始游戏", "仅房主可在双方准备后开始", "▶", 0,
    -334, 520, 104, () => void controller.startSelectedMode(), "create", "createRoom");
  home.selectionStyle(start.visual, "create");

  controller = root.addComponent(RoomScene);
  controller.roomCodeInput = input?.editBox ?? null;
  controller.pageTitleLabel = header.titleLabel;
  controller.selectedBankLabel = selectedBank;
  controller.autoReadyLabel = autoReady?.label ?? null;
  controller.readyLabel = ready.label;
  controller.createPanel = createPanel;
  controller.joinPanel = joinPanel;
  controller.lobbyPanel = lobbyPanel;
  controller.roomCodeLabel = roomCode;
  controller.modeLabel = mode;
  controller.playerOneLabel = playerOne.label;
  controller.playerTwoLabel = playerTwo.label;
  controller.statusLabel = status;
  controller.createButton = create?.button ?? null;
  controller.joinButton = join?.button ?? null;
  controller.joinHintLabel = joinHint;
  controller.joinSubtitleLabel = join?.subtitleLabel ?? null;
  controller.copyButton = copy.button;
  controller.inviteButton = invite.button;
  controller.backButton = header.backButton.button;
  controller.readyButton = ready.button;
  controller.startButton = start.button;
  controller.startSubtitleLabel = start.subtitleLabel;
  controller.autoReadyButton = autoReady?.button ?? null;
  controller.autoReadyVisual = autoReady?.visual ?? null;
  controller.readyVisual = ready.visual;
  controller.startVisual = start.visual;
  controller.playerReadyIndicators = [playerOne.ready, playerTwo.ready];
  controller.playerWaitingIndicators = [playerOne.waiting, playerTwo.waiting];
  controller.readyIndicator = roomReadyIndicator;
  controller.attentionIndicator = roomAttentionIndicator;
  return root;
}
