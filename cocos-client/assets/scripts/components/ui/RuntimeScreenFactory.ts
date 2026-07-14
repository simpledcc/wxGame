import { Button, Label, Node, UITransform } from "cc";
import { HistoryRecordItem } from "../history/HistoryRecordItem";
import { app } from "../../core/App";
import { gameplayScreens, type GameplayRoute } from "../../core/GameplayBundles";
import { ROOM_CODE_LENGTH } from "../../domain/RoomRules";
import { getWordBank, getWordBankLabel } from "../../domain/WordBankRules";
import { BankScene } from "../../scenes/BankScene";
import { CoopSelectScene } from "../../scenes/CoopSelectScene";
import { FeedbackScene } from "../../scenes/FeedbackScene";
import { HelpScene } from "../../scenes/HelpScene";
import { HistoryScene } from "../../scenes/HistoryScene";
import { HomeScene } from "../../scenes/HomeScene";
import { ResultScene } from "../../scenes/ResultScene";
import { RoomScene } from "../../scenes/RoomScene";
import { StudyScene } from "../../scenes/StudyScene";
import type { RouteName } from "../../store/GameStore";
import { PreGameUi, type PreGameActionButtonRef } from "./PreGameUi";
import { RuntimeUi, type RuntimeButtonRef, type RuntimeEditRef } from "./RuntimeUi";

export class RuntimeScreenFactory {
  build(parent: Node, route: RouteName): Node {
    const ui = new RuntimeUi(app.themes.getCurrentTheme());
    switch (route) {
      case "bank": return this.buildBank(parent, ui);
      case "study": return this.buildStudy(parent, ui);
      case "coopSelect": return this.buildCoopSelect(parent, ui);
      case "room": return this.buildRoom(parent, ui);
      case "pkGame":
      case "coopShared":
      case "coopSpell":
        return gameplayScreens.build(route as GameplayRoute, parent, ui);
      case "result": return this.buildResult(parent, ui);
      case "history": return this.buildHistory(parent, ui);
      case "feedback": return this.buildFeedback(parent, ui);
      case "help": return this.buildHelp(parent, ui);
      case "boot":
      case "home":
      default:
        return this.buildHome(parent, ui);
    }
  }

  private buildHome(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "HomeRuntimeScreen");
    const home = new PreGameUi(app.themes.getCurrentTheme());
    const viewportHeight = root.getComponent(UITransform)?.height || 960;
    const backgroundSlot = home.visualSlot(root, "background", 0, 0, 640, viewportHeight);
    backgroundSlot.fallbackNode.active = false;
    home.scenicBackdrop(root, "HomeScenery");
    const safe = home.safeArea(root, "HomeSafeArea");
    const safeTop = safe.height / 2;
    const safeBottom = -safe.height / 2;
    const logoY = safeTop - 145;
    const footerY = safeBottom + 46;
    const top = home.topBar(safe, "HomeTopBar", 86);
    let controller!: HomeScene;
    let openPlayer = (): void => undefined;
    let openSettings = (): void => undefined;
    home.iconButton(top, "HomeAvatarButton", "我", -252, 0, 80, () => openPlayer(), "avatar");
    const playerCard = home.card(top, "HomePlayerCard", -126, 0, 164, 58, 18);
    const player = home.label(playerCard, "HomePlayerName", "", 0, 0, 140, 46, 21, "homeText");
    const coinButton = home.actionButton(
      top, "HomeCoinButton", "", "", "币", 88, 0, 210, 80,
      () => controller.openBankPicker(), "surface", "coin"
    );
    const coins = coinButton.titleLabel;
    coins.node.name = "HomeCoins";
    coins.node.setPosition(20, 0, 0);
    coins.node.getComponent(UITransform)?.setContentSize(88, 44);
    home.label(coinButton.node, "HomeCoinAdd", "+", 82, 0, 30, 42, 28, "homeText");
    home.iconButton(top, "SettingsButton", "设", 252, 0, 80, () => openSettings(), "settings");

    home.visualSlot(safe.node, "logo", 0, logoY, 460, 112);
    home.label(safe.node, "HomeSubtitle", "和好友一起比拼单词实力", 0, logoY - 70, 480, 30, 19, "homeText");
    const bank = home.actionButton(
      safe.node, "CurrentBankBar", "", "", "词", 0, logoY - 124, 560, 80,
      () => controller.openBankPicker(), "surface", "wordBank"
    );
    bank.titleLabel.node.setPosition(-28, 0, 0);
    bank.titleLabel.node.getComponent(UITransform)?.setContentSize(350, 56);
    home.label(bank.node, "CurrentBankChange", "更换 ›", 220, 0, 88, 42, 18, "homeText");
    home.actionButton(
      safe.node, "CreateRoomButton", "创建房间", "邀请好友，一起开始对战", "房", 0, logoY - 220, 560, 96,
      () => controller.openModeCatalog(), "create", "createRoom"
    );
    home.actionButton(
      safe.node, "JoinRoomButton", "加入房间", "输入房间码，快速加入好友对局", "友", 0, logoY - 316, 560, 80,
      () => controller.openJoinRoom(), "join", "joinRoom"
    );
    home.actionButton(
      safe.node, "StudyButton", "赛前练习", "背单词，提升实力", "练", -144, logoY - 407, 272, 80,
      () => controller.openStudy(), "practice", "practice"
    );
    home.actionButton(
      safe.node, "BankButton", "选择词库", "更换词库，准备比赛", "词", 144, logoY - 407, 272, 80,
      () => controller.openBankPicker(), "bank", "wordBank"
    );
    home.actionButton(
      safe.node, "HelpButton", "玩法目录", "了解玩法和比赛规则", "玩", -144, logoY - 495, 272, 80,
      () => controller.openHelp(), "catalog", "catalog"
    );
    const history = home.actionButton(
      safe.node, "HistoryButton", "战绩记录", "查看成绩，复盘提升", "绩", 144, logoY - 495, 272, 80,
      () => controller.openHistory(), "history", "history"
    );
    home.visualSlot(safe.node, "character", 218, footerY + 140, 150, 170);

    let privacy!: PreGameActionButtonRef;
    privacy = home.actionButton(
      safe.node, "HomePrivacy", "隐私保护指引", "", "隐", -144, footerY, 272, 80,
      () => {
        if (!privacy.button.interactable) return;
        privacy.button.interactable = false;
        privacy.titleLabel.string = "正在打开...";
        privacy.visual.refresh();
        void controller.openPrivacyContract().finally(() => {
          if (!privacy.node.active) return;
          privacy.button.interactable = true;
          privacy.titleLabel.string = "隐私保护指引";
          privacy.visual.refresh();
        });
      }, "practice", "privacy"
    );
    home.actionButton(
      safe.node, "FeedbackButton", "问题反馈", "", "言", 144, footerY, 272, 80,
      () => controller.openFeedback(), "bank", "feedback"
    );

    const playerModal = home.modal(root, "HomePlayerModal", 500, 360);
    home.label(playerModal.content, "HomePlayerModalTitle", "玩家信息", 0, 125, 420, 48, 30);
    home.visualSlot(playerModal.content, "avatar", 0, 58, 96, 96);
    const playerDetail = home.label(playerModal.content, "HomePlayerDetailName", "", 0, -14, 400, 42, 24);
    home.label(playerModal.content, "HomePlayerIdentity", "系统安全身份", 0, -52, 400, 32, 18, "homeTextMuted");
    home.actionButton(
      playerModal.content, "HomePlayerClose", "关闭", "", "×", 0, -120, 260, 80,
      () => { playerModal.root.active = false; }, "surface"
    );
    openPlayer = (): void => {
      playerDetail.string = app.playerStore.getLocalPlayer().displayName;
      playerModal.root.active = true;
    };

    const settingsModal = home.modal(root, "HomeSettingsModal", 500, 330);
    home.label(settingsModal.content, "HomeSettingsTitle", "设置", 0, 105, 420, 48, 30);
    const soundStatus = home.label(
      settingsModal.content, "HomeSoundStatus", "", 0, 48, 420, 40, 20, "homeTextMuted"
    );
    let soundToggle!: PreGameActionButtonRef;
    const renderSound = (): void => {
      const muted = app.settingsStore.isMuted();
      soundStatus.string = muted ? "当前音效：已静音" : "当前音效：已开启";
      soundToggle.titleLabel.string = muted ? "开启音效" : "静音音效";
    };
    soundToggle = home.actionButton(
      settingsModal.content, "HomeSoundToggle", "", "", "声", 0, -18, 360, 80,
      () => { controller.toggleMuted(); renderSound(); }, "surface"
    );
    home.actionButton(
      settingsModal.content, "HomeSettingsClose", "关闭", "", "×", 0, -102, 260, 80,
      () => { settingsModal.root.active = false; }, "surface"
    );
    openSettings = (): void => {
      renderSound();
      settingsModal.root.active = true;
    };

    controller = root.addComponent(HomeScene);
    controller.playerLabel = player;
    controller.coinLabel = coins;
    controller.bankLabel = bank.titleLabel;
    controller.historySummaryLabel = history.subtitleLabel;
    return root;
  }

  private buildBank(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "BankRuntimeScreen");
    const home = new PreGameUi(app.themes.getCurrentTheme());
    home.scenicBackdrop(root, "BankScenery");
    const safe = home.safeArea(root, "BankSafeArea");
    const safeTop = safe.height / 2;
    const safeBottom = -safe.height / 2;
    let controller!: BankScene;
    home.pageHeader(safe, "BankHeader", "选择词库", "选择教材单元，练习和房间会同步使用", () => controller.back());
    const statusCard = home.card(safe.node, "BankStatusCard", 0, safeTop - 143, 560, 78);
    home.visualSlot(statusCard, "coin", -238, 0, 54, 54);
    const status = home.label(statusCard, "BankStatus", "", 24, 0, 430, 62, 17, "homeText", 0);
    const filterLabels = ["教材", "年级", "册次", "单元"];
    filterLabels.forEach((label, index) => {
      const chip = home.card(safe.node, `BankFilter${index}`, -210 + index * 140, safeTop - 211, 126, 56, 14);
      home.label(chip, "Label", label, 0, 0, 104, 36, 16, "homeText");
    });
    const entries = Object.entries(app.wordBankCatalog.WORD_BANKS);
    const pageSize = 4;
    let page = Math.max(0, Math.floor(Math.max(0, entries.findIndex(([id]) => id === app.store.getState().bankPickerSelectedBankId)) / pageSize));
    const slotIds = Array.from({ length: pageSize }, () => "");
    const slots: PreGameActionButtonRef[] = [];
    let previous!: RuntimeButtonRef;
    let next!: RuntimeButtonRef;
    for (let index = 0; index < pageSize; index += 1) {
      slots.push(home.actionButton(
        safe.node,
        `BankSlot${index}`,
        "",
        "",
        "词",
        0,
        safeTop - 283 - index * 98,
        560,
        90,
        () => {
          const bankId = slotIds[index];
          if (!bankId) return;
          controller.selectBank(bankId);
          renderPage();
        },
        "surface",
        "wordBank"
      ));
    }
    const pageLabel = home.label(safe.node, "BankPage", "", 0, safeBottom + 183, 120, 44, 18, "homeTextMuted");
    const renderPage = (): void => {
      const selectedId = app.store.getState().bankPickerSelectedBankId;
      const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
      page = Math.max(0, Math.min(page, pageCount - 1));
      const visible = entries.slice(page * pageSize, page * pageSize + pageSize);
      slots.forEach((slot, index) => {
        const entry = visible[index];
        slot.node.active = !!entry;
        slotIds[index] = entry?.[0] || "";
        if (!entry) return;
        const [id, bank] = entry;
        const unlocked = app.wordBankStore.isUnlocked(app.wordBankCatalog, id);
        slot.titleLabel.string = `${id === selectedId ? "✓ " : ""}${getWordBankLabel(bank, true)}`;
        if (slot.subtitleLabel) {
          slot.subtitleLabel.string = `${bank.words.length} 个单词 · ${unlocked ? "已解锁" : "未解锁"}`;
        }
      });
      pageLabel.string = `${page + 1}/${pageCount}`;
      previous.button.interactable = page > 0;
      next.button.interactable = page < pageCount - 1;
      previous.visual.refresh();
      next.visual.refresh();
    };
    previous = home.iconButton(safe.node, "PreviousBanks", "‹", -105, safeBottom + 183, 80, () => {
      page -= 1;
      renderPage();
    });
    next = home.iconButton(safe.node, "NextBanks", "›", 105, safeBottom + 183, 80, () => {
      page += 1;
      renderPage();
    });
    home.actionButton(safe.node, "UnlockBank", "解锁所选", "使用真实单词金币", "币", -144, safeBottom + 81, 272, 82, () => {
      controller.unlockSelectedBank();
      renderPage();
    }, "history", "coin");
    home.actionButton(
      safe.node,
      "ConfirmBank",
      "确定选择",
      "用于练习和下一场比赛",
      "词",
      144,
      safeBottom + 81,
      272,
      82,
      () => controller.confirmSelection(),
      "bank",
      "wordBank"
    );
    controller = root.addComponent(BankScene);
    controller.statusLabel = status;
    renderPage();
    return root;
  }

  private buildStudy(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "StudyRuntimeScreen");
    const home = new PreGameUi(app.themes.getCurrentTheme());
    home.scenicBackdrop(root, "StudyScenery");
    const safe = home.safeArea(root, "StudySafeArea");
    const safeTop = safe.height / 2;
    let controller!: StudyScene;
    home.pageHeader(safe, "StudyHeader", "赛前练习", "背诵当前单元，随时标记需要复习的单词", () => controller.backHome());
    const selectedBank = getWordBank(app.wordBankCatalog, app.wordBankStore.getSelectedBankId());
    home.actionButton(
      safe.node,
      "StudyBankBar",
      getWordBankLabel(selectedBank, true),
      "点击更换练习词库",
      "词",
      0,
       safeTop - 149,
      560,
      82,
      () => controller.changeBank(),
      "surface",
      "wordBank"
    );
    const cardY = safeTop - 377;
    const card = home.card(safe.node, "StudyCard", 0, cardY, 560, 340, 24);
    const status = home.label(card, "StudyStatus", "", 210, 138, 90, 34, 18, "homeTextMuted");
    const word = home.label(card, "StudyWord", "", 0, 42, 500, 86, 54, "homeText");
    const meaning = home.label(card, "StudyMeaning", "", 0, -58, 500, 92, 28, "homeTextMuted");
    home.button(card, "PreviousWord", "上一个", -150, -126, 220, 80, () => controller.previousWord(), "surface", 18);
    home.button(card, "RandomWord", "随机", 150, -126, 220, 80, () => controller.randomWord(), "surface", 18);
    home.button(
      safe.node,
      "RevealWord",
      "查看当前释义",
      -144,
      cardY - 216,
      272,
      80,
      () => controller.revealCurrentMeaning(),
      "join",
      19
    );
    home.button(safe.node, "MarkWrong", "标记错词", 144, cardY - 216, 272, 80, () => controller.markCurrentUnfamiliar(), "history", 19);
    const meaningToggle = home.button(safe.node, "MeaningToggle", "", 0, cardY - 306, 560, 80, () => controller.toggleChinese(), "surface", 19);
    home.actionButton(safe.node, "NextWord", "下一个", "继续背诵本单元", "›", 0, cardY - 404, 560, 96, () => controller.nextWord(), "create", "practice");
    home.button(safe.node, "ChangeStudyBank", "更换词库", 0, cardY - 471, 260, 80, () => controller.changeBank(), "surface", 17);
    controller = root.addComponent(StudyScene);
    controller.wordLabel = word;
    controller.meaningLabel = meaning;
    controller.statusLabel = status;
    controller.meaningToggleLabel = meaningToggle.label;
    return root;
  }

  private buildCoopSelect(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "CoopSelectRuntimeScreen");
    const home = new PreGameUi(app.themes.getCurrentTheme());
    home.scenicBackdrop(root, "ModeCatalogScenery");
    const safe = home.safeArea(root, "CoopSelectSafeArea");
    const firstModeY = safe.height / 2 - 165;
    let controller!: CoopSelectScene;
    home.pageHeader(safe, "CoopSelectHeader", "玩法目录", "先选择玩法，再配置词库并创建房间", () => controller.backHome());
    const modes = [
      ["准备体验模式", "双人房间流程体验", "joinRoom", "practice"],
      ["双人 PK 竞技", "快速抢答，一决高下", "practice", "surface"],
      ["魔法对战", "答对单词积累魔法能量", "catalog", "surface"],
      ["抢夺宝物", "一起争夺宝箱与奖励", "history", "surface"],
      ["搭桥比赛", "答对单词建桥前进", "createRoom", "surface"],
      ["造塔比赛", "收集材料搭建高塔", "wordBank", "surface"],
      ["合作塔防", "合作守护词斗乐园", "joinRoom", "surface"],
      ["合作挑战 Boss", "一起挑战强大对手", "catalog", "surface"]
    ] as const;
    modes.forEach(([title, subtitle, icon, kind], index) => {
      const action = home.actionButton(
        safe.node,
        `ModeOption${index}`,
        title,
        index === 0 ? subtitle : `${subtitle} · 筹备中`,
        index === 0 ? "2" : "…",
        0,
        firstModeY - index * 84,
        560,
        80,
        () => controller.openModeSetup(),
        kind,
        icon
      );
      if (index > 0) {
        action.button.interactable = false;
        action.visual.refresh();
      }
    });
    controller = root.addComponent(CoopSelectScene);
    return root;
  }

  private buildRoom(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "RoomRuntimeScreen");
    const home = new PreGameUi(app.themes.getCurrentTheme());
    home.scenicBackdrop(root, "RoomScenery");
    const safe = home.safeArea(root, "RoomSafeArea");
    const roomContentY = (safe.height - 886) / 2 - 18;
    let controller!: RoomScene;
    const entryIntent = app.store.getState().roomEntryIntent;
    const roomState = app.roomStore.getState();
    const hasSession = !!roomState.roomId || !!roomState.room;
    const headerTitle = entryIntent === "join" ? "加入房间" : entryIntent === "create" ? "创建房间" : "双人房间";
    const header = home.pageHeader(safe, "RoomHeader", headerTitle, "两名真实玩家加入并准备后，由房主开始", () => controller.backHome());

    let createPanel: Node | null = null;
    let selectedBank: Label | null = null;
    let create: PreGameActionButtonRef | null = null;
    let autoReady: RuntimeButtonRef | null = null;
    if (!hasSession && entryIntent === "create") {
      createPanel = home.group(safe.node, "RoomCreatePanel", 0, roomContentY, safe.width, 760);
      const selectedModeCard = home.card(createPanel, "SelectedModeCard", 0, 236, 560, 154, 22);
      home.visualSlot(selectedModeCard, "joinRoom", -216, 0, 88, 88);
      home.label(selectedModeCard, "SelectedModeCaption", "已选模式", -116, 45, 300, 34, 17, "homeTextMuted", 0);
      home.label(selectedModeCard, "SelectedModeTitle", "准备体验模式", 42, 5, 400, 52, 31, "homeText", 0);
      home.label(selectedModeCard, "SelectedModeSummary", "双人房间流程体验", 42, -42, 400, 34, 18, "homeTextMuted", 0);
      const bankCard = home.card(createPanel, "CreateBankCard", 0, 78, 560, 124, 22);
      home.visualSlot(bankCard, "wordBank", -224, 0, 72, 72);
      home.label(bankCard, "CreateBankCaption", "当前词库", -124, 32, 250, 30, 16, "homeTextMuted", 0);
      selectedBank = home.label(bankCard, "CreateBankLabel", "", -18, -10, 360, 48, 24, "homeText", 0);
      home.button(bankCard, "ChangeRoomBank", "更换", 205, 0, 126, 80, () => controller.changeBank(), "practice", 18);
      const guidance = home.card(createPanel, "CreateGuidanceCard", 0, -56, 560, 96, 20);
      home.visualSlot(guidance, "practice", -225, 0, 60, 60);
      home.label(guidance, "CreateGuidance", "创建后邀请好友，双方准备完成即可开始", 32, 0, 430, 58, 19, "homeText", 0);
      create = home.actionButton(createPanel, "CreateRoom", "创建房间", "生成房间码并进入准备房间", "房", 0, -178, 560, 96, () => {
        void controller.createConfiguredRoom();
      }, "create", "createRoom");
      autoReady = home.button(createPanel, "AutoReady", "✓ 房主创建后自动准备", 0, -286, 430, 80, () => {
        controller.toggleAutoReady();
      }, "surface", 18);
    }

    let joinPanel: Node | null = null;
    let input: RuntimeEditRef | null = null;
    let join: PreGameActionButtonRef | null = null;
    if (!hasSession && entryIntent === "join") {
      joinPanel = home.group(safe.node, "RoomJoinPanel", 0, roomContentY, safe.width, 760);
      const joinCard = home.card(joinPanel, "JoinCodeCard", 0, 42, 560, 540, 24);
      home.visualSlot(joinCard, "joinRoom", 0, 194, 100, 100);
      home.label(joinCard, "JoinCodeTitle", "输入六位房间码", 0, 118, 480, 48, 28, "homeText");
      home.label(joinCard, "JoinCodeHint", "房间码支持英文字母和数字", 0, 74, 480, 34, 17, "homeTextMuted");
      input = home.edit(joinCard, "RoomCodeInput", `输入 ${ROOM_CODE_LENGTH} 位房间码`, 0, 0, 500, 88, ROOM_CODE_LENGTH);
      home.label(joinCard, "JoinInviteHint", "也可以通过好友邀请直接进入准备房间", 0, -88, 480, 54, 18, "homeTextMuted");
      join = home.actionButton(joinCard, "JoinRoom", "加入房间", "查找好友创建的房间", "友", 0, -190, 500, 92, () => {
        void controller.joinEnteredRoom();
      }, "join", "joinRoom");
    }

    const lobbyPanel = home.group(safe.node, "RoomLobbyPanel", 0, roomContentY, safe.width, 760);
    const codeCard = home.card(lobbyPanel, "RoomCodeCard", 0, 276, 560, 92);
    home.label(codeCard, "RoomCodeCaption", "房间码", -210, 0, 92, 34, 16, "homeTextMuted");
    const roomCode = home.label(codeCard, "RoomCode", "------", -52, 0, 220, 48, 30, "homeText");
    const copy = home.button(codeCard, "CopyCode", "复制", 108, 0, 120, 80, () => {
      void controller.copyRoomCode();
    }, "join", 16);
    const invite = home.button(codeCard, "InviteFriend", "邀请", 220, 0, 96, 80, () => {
      void controller.inviteFriend();
    }, "practice", 16);
    const lobbyBank = home.card(lobbyPanel, "LobbyBankCard", 0, 188, 520, 70, 18);
    home.visualSlot(lobbyBank, "wordBank", -220, 0, 48, 48);
    const mode = home.label(lobbyBank, "RoomMode", "", 15, 0, 430, 44, 20, "homeText");
    const playersCard = home.card(lobbyPanel, "RoomPlayersCard", 0, 38, 560, 210, 22);
    home.label(playersCard, "RoomPlayersTitle", "房间玩家", 0, 74, 500, 34, 19, "homeTextMuted");
    const players = home.label(playersCard, "RoomPlayers", "", 0, -12, 500, 120, 23, "homeText");
    const statusCard = home.card(lobbyPanel, "RoomStatusCard", 0, -102, 520, 68, 18);
    const status = home.label(statusCard, "RoomStatus", "", 0, 0, 480, 46, 17, "homeTextMuted");
    const ready = home.button(lobbyPanel, "Ready", "我准备好了", 0, -190, 520, 84, () => {
      void controller.toggleReady();
    }, "practice", 22);
    const start = home.actionButton(lobbyPanel, "StartRoom", "开始游戏", "仅房主可在双方准备后开始", "▶", 0, -288, 560, 92, () => {
      void controller.startSelectedMode();
    }, "create", "createRoom");
    const leave = home.button(lobbyPanel, "LeaveRoom", "离开房间", 0, -382, 360, 80, () => controller.backHome(), "join", 19);

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
    controller.playersLabel = players;
    controller.statusLabel = status;
    controller.createButton = create?.button ?? null;
    controller.joinButton = join?.button ?? null;
    controller.copyButton = copy.button;
    controller.inviteButton = invite.button;
    controller.backButton = header.backButton.button;
    controller.leaveButton = leave.button;
    controller.readyButton = ready.button;
    controller.startButton = start.button;
    controller.startSubtitleLabel = start.subtitleLabel;
    controller.autoReadyButton = autoReady?.button ?? null;
    return root;
  }

  private buildResult(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "ResultRuntimeScreen");
    const home = new PreGameUi(app.themes.getCurrentTheme());
    home.scenicBackdrop(root, "ResultScenery");
    const safe = home.safeArea(root, "ResultSafeArea");
    let controller!: ResultScene;
    home.pageHeader(safe, "ResultHeader", "本局结算", "成绩已保存，可在战绩记录中继续查看", () => controller.backHome());
    const resultCard = home.card(safe.node, "ResultCard", 0, 74, 560, 470, 24);
    home.visualSlot(resultCard, "history", 0, 150, 112, 112);
    const title = home.label(resultCard, "ResultTitle", "", 0, 62, 500, 70, 38, "homeText");
    const score = home.label(resultCard, "ResultScore", "", 0, -18, 440, 70, 42, "homeText");
    const players = home.label(resultCard, "ResultPlayers", "", 0, -118, 480, 120, 22, "homeTextMuted");
    home.actionButton(
      safe.node,
      "ResultHome",
      "返回首页",
      "继续准备下一场对局",
      "房",
      0,
      -228,
      560,
      86,
      () => controller.backHome(),
      "create",
      "createRoom"
    );
    home.actionButton(
      safe.node,
      "ResultHistory",
      "查看战绩",
      "回顾本局和历史最佳成绩",
      "绩",
      0,
      -330,
      560,
      86,
      () => controller.openHistory(),
      "history",
      "history"
    );
    controller = root.addComponent(ResultScene);
    controller.titleLabel = title;
    controller.scoreLabel = score;
    controller.playersLabel = players;
    return root;
  }

  private buildHistory(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "HistoryRuntimeScreen");
    const home = new PreGameUi(app.themes.getCurrentTheme());
    home.scenicBackdrop(root, "HistoryScenery");
    const safe = home.safeArea(root, "HistorySafeArea");
    const safeTop = safe.height / 2;
    const safeBottom = -safe.height / 2;
    const listRoot = home.group(safe.node, "HistoryList", 0, 0, safe.width, safe.height);
    const detailRoot = home.group(safe.node, "HistoryDetail", 0, 0, safe.width, safe.height);
    detailRoot.active = false;
    let controller!: HistoryScene;
    home.pageHeader(safe, "HistoryHeader", "战绩记录", "查看真实比赛成绩和历史最佳", () => controller.back());
    const tabs = [
      ["HistoryAll", "全部", () => controller.showAll(), "join"],
      ["HistoryPk", "PK", () => controller.showPk(), "surface"],
      ["HistoryShared", "合作", () => controller.showCoopShared(), "surface"],
      ["HistorySpell", "拼词", () => controller.showCoopSpell(), "surface"],
      ["HistoryOther", "其他", () => undefined, "surface"]
    ] as const;
    tabs.forEach(([name, label, action, kind], index) => {
      const tab = home.button(listRoot, name, label, -224 + index * 112, safeTop - 149, 104, 80, action, kind, 16);
      if (name === "HistoryOther") {
        tab.button.interactable = false;
        tab.visual.refresh();
      }
    });
    const recentCard = home.card(listRoot, "HistoryRecentCard", -144, safeTop - 225, 272, 88, 18);
    home.visualSlot(recentCard, "history", -102, 0, 56, 56);
    home.label(recentCard, "HistoryRecentCaption", "最近记录", 24, 24, 190, 28, 16, "homeTextMuted");
    const recentSummary = home.label(recentCard, "HistoryRecentSummary", "", 24, -16, 190, 46, 15, "homeText", 0);
    const bestCard = home.card(listRoot, "HistoryBestCard", 144, safeTop - 225, 272, 88, 18);
    home.visualSlot(bestCard, "coin", -102, 0, 56, 56);
    home.label(bestCard, "HistoryBestCaption", "最佳成绩", 24, 22, 190, 28, 16, "homeTextMuted");
    const bestSummary = home.label(bestCard, "HistoryBestSummary", "", 24, -16, 190, 40, 23, "homeText", 0);
    const title = home.label(listRoot, "HistoryTitle", "", -120, safeTop - 293, 320, 38, 24, "homeText", 0);
    const best = home.label(listRoot, "HistoryBest", "", 190, safeTop - 293, 220, 34, 16, "homeTextMuted");
    const empty = home.label(listRoot, "HistoryEmpty", "", 0, -10, 500, 42, 20, "homeTextMuted");
    const items: HistoryRecordItem[] = [];
    for (let index = 0; index < 4; index += 1) {
      const row = home.card(listRoot, `HistoryRow${index}`, 0, safeTop - 343 - index * 88, 560, 82, 16);
      const rowTitle = home.label(row, "Title", "", -90, 14, 350, 30, 17, "homeText", 0);
      const meta = home.label(row, "Meta", "", -75, -16, 380, 26, 13, "homeTextMuted", 0);
      const rowScore = home.label(row, "Score", "", 210, 0, 110, 34, 18, "homeText");
      const button = row.addComponent(Button);
      let item!: HistoryRecordItem;
      row.on(Button.EventType.CLICK, () => {
        if (button.interactable) item.open();
      }, this);
      item = row.addComponent(HistoryRecordItem);
      item.titleLabel = rowTitle;
      item.metaLabel = meta;
      item.scoreLabel = rowScore;
      item.detailButton = button;
      items.push(item);
    }
    const page = home.label(listRoot, "HistoryPage", "", 0, safeBottom + 92, 120, 44, 17, "homeTextMuted");
    const previous = home.iconButton(listRoot, "HistoryPrevious", "‹", -105, safeBottom + 92, 80, () => controller.previousPage());
    const next = home.iconButton(listRoot, "HistoryNext", "›", 105, safeBottom + 92, 80, () => controller.nextPage());

    const detailCard = home.card(detailRoot, "HistoryDetailCard", 0, -5, 560, 680, 22);
    home.iconButton(detailRoot, "CloseDetail", "‹", -242, 300, 80, () => controller.closeDetail());
    const detailTitle = home.label(detailCard, "DetailTitle", "", 40, 278, 400, 54, 27, "homeText");
    const detailBody = home.label(detailCard, "DetailBody", "", 0, 5, 500, 490, 17, "homeText", 0);
    const detailPage = home.label(detailCard, "DetailPage", "", 0, -282, 120, 44, 17, "homeTextMuted");
    const detailPrevious = home.iconButton(detailCard, "DetailPrevious", "‹", -105, -282, 80, () => controller.previousDetailPage());
    const detailNext = home.iconButton(detailCard, "DetailNext", "›", 105, -282, 80, () => controller.nextDetailPage());

    controller = root.addComponent(HistoryScene);
    controller.titleLabel = title;
    controller.bestLabel = best;
    controller.recentSummaryLabel = recentSummary;
    controller.bestSummaryLabel = bestSummary;
    controller.emptyLabel = empty;
    controller.pageLabel = page;
    controller.previousButton = previous.button;
    controller.nextButton = next.button;
    controller.recordItems = items;
    controller.listNode = listRoot;
    controller.detailNode = detailRoot;
    controller.detailTitleLabel = detailTitle;
    controller.detailBodyLabel = detailBody;
    controller.detailPageLabel = detailPage;
    controller.detailPreviousButton = detailPrevious.button;
    controller.detailNextButton = detailNext.button;
    return root;
  }

  private buildFeedback(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "FeedbackRuntimeScreen");
    const home = new PreGameUi(app.themes.getCurrentTheme());
    home.scenicBackdrop(root, "FeedbackScenery");
    const safe = home.safeArea(root, "FeedbackSafeArea");
    const contentTop = safe.height / 2 - 143;
    let controller!: FeedbackScene;
    home.pageHeader(safe, "FeedbackHeader", "问题反馈", "告诉我们遇到的问题或改进建议", () => controller.backHome());
    const promptCard = home.card(safe.node, "FeedbackPromptCard", 0, contentTop, 560, 82);
    home.visualSlot(promptCard, "feedback", -238, 0, 56, 56);
    home.label(promptCard, "FeedbackPrompt", "反馈内容仅用于定位问题和改进体验", 25, 0, 430, 52, 18, "homeTextMuted", 0);
    const content = home.edit(safe.node, "FeedbackContent", "反馈内容（4-300 字）", 0, contentTop - 166, 560, 220, 300, true);
    const contact = home.edit(safe.node, "FeedbackContact", "联系方式（选填）", 0, contentTop - 336, 560, 80, 80);
    const status = home.label(safe.node, "FeedbackStatus", "", 0, contentTop - 404, 560, 40, 18, "homeTextMuted");
    const privacy = home.label(safe.node, "FeedbackPrivacy", "", 0, contentTop - 460, 540, 58, 15, "homeTextMuted");
    const submit = home.actionButton(safe.node, "SubmitFeedback", "提交反馈", "提交前会检查内容长度与格式", "言", 0, contentTop - 550, 560, 86, () => {
      void controller.submit();
    }, "join", "feedback");
    home.actionButton(safe.node, "OpenPrivacy", "隐私保护指引", "查看反馈数据处理说明", "隐", 0, contentTop - 650, 560, 82, () => {
      void controller.openPrivacyContract();
    }, "surface", "privacy");
    controller = root.addComponent(FeedbackScene);
    controller.contentInput = content.editBox;
    controller.contactInput = contact.editBox;
    controller.statusLabel = status;
    controller.privacyLabel = privacy;
    controller.submitButton = submit.button;
    return root;
  }

  private buildHelp(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "HelpRuntimeScreen");
    const home = new PreGameUi(app.themes.getCurrentTheme());
    home.scenicBackdrop(root, "HelpScenery");
    const safe = home.safeArea(root, "HelpSafeArea");
    let controller!: HelpScene;
    home.pageHeader(safe, "HelpHeader", "玩法目录", "玩法说明：了解练习、对战和合作规则", () => controller.backHome());
    const helpCard = home.card(safe.node, "HelpCard", 0, -16, 560, 690, 22);
    home.visualSlot(helpCard, "catalog", 0, 280, 92, 92);
    const body = home.label(helpCard, "HelpBody", "", 0, -35, 500, 560, 18, "homeText", 0);
    controller = root.addComponent(HelpScene);
    controller.bodyLabel = body;
    return root;
  }

}
