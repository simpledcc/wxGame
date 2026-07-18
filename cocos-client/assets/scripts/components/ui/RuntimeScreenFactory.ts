import { Button, Label, Node, UITransform } from "cc";
import { HistoryRecordItem } from "../history/HistoryRecordItem";
import { app } from "../../core/App";
import { gameplayScreens, type GameplayRoute } from "../../core/GameplayBundles";
import { ROOM_CODE_LENGTH } from "../../domain/RoomRules";
import { getWordBank, getWordBankLabel, isUnlockableWordBankId } from "../../domain/WordBankRules";
import { BankScene } from "../../scenes/BankScene";
import { CoopSelectScene } from "../../scenes/CoopSelectScene";
import { FeedbackScene } from "../../scenes/FeedbackScene";
import { HELP_RULES, HelpScene } from "../../scenes/HelpScene";
import { HistoryScene } from "../../scenes/HistoryScene";
import { HomeScene } from "../../scenes/HomeScene";
import { ResultScene } from "../../scenes/ResultScene";
import { RoomScene } from "../../scenes/RoomScene";
import { StudyScene } from "../../scenes/StudyScene";
import type { RouteName } from "../../store/GameStore";
import { PreGameUi, type PreGameActionButtonRef } from "./PreGameUi";
import { RuntimeButtonVisual } from "./RuntimeButtonVisual";
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
    home.visualSlot(root, "background", 0, 0, 640, viewportHeight).fallbackNode.active = false;
    home.scenicBackdrop(root, "HomeScenery");
    const safe = home.safeArea(root, "HomeSafeArea");
    const safeTop = safe.height / 2;
    const safeBottom = -safe.height / 2;
    const compact = safe.height < 1000;
    const fit = (a: number, b: number) => compact ? a : b;
    const logoY = safeTop - fit(174, 180);
    const footerY = safeBottom + 46;
    const top = home.topBar(safe, "HomeTopBar", 92);
    let controller!: HomeScene;
    let openPlayer!: () => void;
    let openSettings!: () => void;
    home.iconButton(
      top, "HomeAvatarButton", "我", -252, 0, 80, () => openPlayer(), "avatar", "transparent", 68
    );
    const playerCard = home.pill(top, "HomePlayerCard", -114, 0, 178, 62);
    const player = home.label(playerCard, "HomePlayerName", "", 0, 12, 152, 30, 21, "homeTextOnColor");
    home.label(playerCard, "HomePlayerIdentityLabel", "系统安全身份", 0, -17, 152, 18, 13, "homeTextOnColor");
    home.pill(top, "HomeCoinPill", 90, 0, 206, 64);
    const coinButton = home.actionButton(
      top, "HomeCoinButton", "", "", "币", 90, 0, 206, 80,
      () => controller.openBankPicker(), "surface", "coin"
    );
    coinButton.background.enabled = false;
    const coins = coinButton.titleLabel;
    coins.node.name = "HomeCoins";
    coins.node.setPosition(17, 0, 0);
    coins.node.getComponent(UITransform)?.setContentSize(82, 44);
    coins.color = home.color("homeTextOnColor");
    home.statusBadge(coinButton.node, "HomeCoinAdd", "+", 82, 0, 34, "join", 26);
    home.iconButton(
      top, "SettingsButton", "设", 252, 0, 80, () => openSettings(), "settings", "transparent", 54
    );

    home.visualSlot(safe.node, "logo", 0, logoY, 520, fit(108, 156));
    const subtitleRibbon = home.pill(safe.node, "HomeSubtitleRibbon", 0, logoY - fit(67, 96), 372, fit(40, 48),
      "homeCreate", "homeTextOnColor");
    home.label(subtitleRibbon, "HomeSubtitle", "和好友一起比拼单词实力", 0, 0, 338, 34, 20, "homeTextOnColor");
    const bank = home.actionButton(
      safe.node, "CurrentBankBar", "", "", "词", 0, logoY - fit(131, 170), 520, fit(80, 92),
      () => controller.openBankPicker(), "surface", "wordBank"
    );
    bank.titleLabel.node.setPosition(-10, -15, 0);
    bank.titleLabel.node.getComponent(UITransform)?.setContentSize(320, 34);
    home.label(bank.node, "CurrentBankCaption", "当前词库", -103, 20, 140, 20, 15, "homeTextMuted");
    const bankChange = home.pill(bank.node, "CurrentBankChangeBadge", 204, 0, 92, 54,
      "homeHistory", "homeTextOnColor");
    home.label(bankChange, "CurrentBankChangeLabel", "更换", 0, 0, 72, 36, 17, "homeTextOnColor");
    home.actionButton(
      safe.node, "CreateRoomButton", "创建房间", "邀请好友，一起开始对战", "房", 0, logoY - fit(223, 302), 520, fit(96, 146),
      () => controller.openModeCatalog(), "create", "createRoom"
    );
    home.actionButton(
      safe.node, "JoinRoomButton", "加入房间", "输入房间码，快速加入好友对局", "友", 0, logoY - fit(323, 452), 520, fit(96, 136),
      () => controller.openJoinRoom(), "join", "joinRoom"
    );
    home.actionButton(
      safe.node, "StudyButton", "赛前练习", "背单词，提升实力", "练", -134, logoY - fit(415, 586), 252, fit(80, 118),
      () => controller.openStudy(), "practice", "practice"
    );
    home.actionButton(
      safe.node, "BankButton", "选择词库", "更换词库，准备比赛", "词", 134, logoY - fit(415, 586), 252, fit(80, 118),
      () => controller.openBankPicker(), "bank", "wordBank"
    );
    home.actionButton(
      safe.node, "HelpButton", "玩法目录", "多种玩法，敬请期待", "玩", -134, logoY - fit(499, 712), 252, fit(80, 118),
      () => controller.openModeCatalog(), "catalog", "catalog"
    );
    const history = home.actionButton(
      safe.node, "HistoryButton", "战绩记录", "查看成绩，复盘提升", "绩", 134, logoY - fit(499, 712), 252, fit(80, 118),
      () => controller.openHistory(), "history", "history"
    );
    const secondaryBottom = logoY - fit(499, 712) - fit(40, 59);
    const footerTop = footerY + 42;
    const characterSpace = secondaryBottom - footerTop;
    const characterVisible = characterSpace >= 136;
    const characterHeight = Math.max(120, Math.min(236, characterSpace - 16));
    const character = home.visualSlot(
      safe.node,
      "character",
      205,
      (secondaryBottom + footerTop) / 2,
      180 * characterHeight / 236,
      characterHeight
    );
    character.node.active = characterVisible;

    let privacy!: PreGameActionButtonRef;
    privacy = home.actionButton(
      safe.node, "HomePrivacy", "隐私保护指引", "", "隐", -134, footerY, 252, 84,
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
      safe.node, "FeedbackButton", "问题反馈", "", "言", 134, footerY, 252, 84,
      () => controller.openFeedback(), "bank", "feedback"
    );

    const playerModal = home.modal(root, "HomePlayerModal", 500, 400);
    home.label(playerModal.content, "HomePlayerModalTitle", "玩家信息", 0, 145, 420, 48, 30);
    home.visualSlot(playerModal.content, "avatar", 0, 62, 96, 96);
    const playerDetail = home.label(playerModal.content, "HomePlayerDetailName", "", 0, -18, 400, 42, 24);
    home.statusBadge(playerModal.content, "HomePlayerIdentity", "系统安全身份", 0, -64, 160, "surface");
    home.actionButton(
      playerModal.content, "HomePlayerClose", "关闭", "", "×", 0, -130, 260, 80,
      () => { playerModal.root.active = false; }, "surface"
    );
    openPlayer = (): void => {
      playerDetail.string = app.playerStore.getLocalPlayer().displayName;
      playerModal.root.active = true;
    };

    const settingsModal = home.modal(root, "HomeSettingsModal", 500, 350);
    home.visualSlot(settingsModal.content, "settings", -150, 112, 52, 52);
    home.label(settingsModal.content, "HomeSettingsTitle", "设置", 28, 112, 330, 48, 30);
    const soundStatus = home.label(
      settingsModal.content, "HomeSoundStatus", "", 0, 57, 420, 36, 20, "homeTextMuted"
    );
    let soundToggle!: PreGameActionButtonRef;
    const renderSound = (): void => {
      const muted = app.settingsStore.isMuted();
      soundStatus.string = muted ? "当前音效：已静音" : "当前音效：已开启";
      soundToggle.titleLabel.string = muted ? "开启音效" : "静音音效";
      soundToggle.visual.setSelected(!muted);
    };
    soundToggle = home.actionButton(
      settingsModal.content, "HomeSoundToggle", "", "", "声", 0, -11, 360, 80,
      () => { controller.toggleMuted(); renderSound(); }, "surface"
    );
    home.selectionStyle(soundToggle.visual, "join");
    home.actionButton(
      settingsModal.content, "HomeSettingsClose", "关闭", "", "×", 0, -99, 260, 80,
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
    const { root, home, safe } = this.page(parent, ui, "Bank");
    const safeTop = safe.height / 2;
    const safeBottom = -safe.height / 2;
    let controller!: BankScene;
    home.pageHeader(safe, "BankHeader", "选择词库", "选择教材单元，练习和房间会同步使用",
      () => controller.back(), "wordBank");
    const statusCard = home.sectionCard(safe.node, "BankStatusCard", "词库状态", 0,
      safeTop - 160, 540, 80, "history", "coin");
    home.visualSlot(statusCard, "coin", -232, -18, 32, 32);
    const status = home.label(statusCard, "BankStatus", "", 24, -14, 430, 46, 18, "homeText", 0);
    const entries = Object.entries(app.wordBankCatalog.WORD_BANKS);
    const pageSize = 4;
    let page = Math.max(0, Math.floor(Math.max(0, entries.findIndex(([id]) => id === app.store.getState().bankPickerSelectedBankId)) / pageSize));
    const slotIds = Array.from({ length: pageSize }, () => "");
    const slots: PreGameActionButtonRef[] = [];
    const slotStates: Label[] = [];
    let previous!: RuntimeButtonRef;
    let next!: RuntimeButtonRef;
    const firstSlotY = safeTop - 252;
    const slotGap = 104;
    for (let index = 0; index < pageSize; index += 1) {
      const slot = home.actionButton(safe.node, `BankSlot${index}`, "", "词库信息", "词", 0,
        firstSlotY - index * slotGap, 540, 96, () => {
          const bankId = slotIds[index];
          if (!bankId) return;
          controller.selectBank(bankId);
          renderPage();
        }, "surface", "wordBank");
      home.selectionStyle(slot.visual, "practice");
      slot.titleLabel.node.setPosition(-32, 21, 0);
      slot.titleLabel.node.getComponent(UITransform)?.setContentSize(300, 42);
      slot.subtitleLabel?.node.setPosition(-32, -24, 0);
      slot.subtitleLabel?.node.getComponent(UITransform)?.setContentSize(300, 32);
      const badge = home.pill(slot.node, `BankSlot${index}Badge`, 198, 0, 112, 54,
        "homeCard", "homeCardBorder");
      slotStates.push(home.label(badge, `BankSlot${index}State`, "", 0, 0, 92, 36, 15, "homeText"));
      slots.push(slot);
    }
    const pageLabel = home.label(safe.node, "BankPage", "", 0, safeBottom + 164, 120, 44, 18, "homeTextMuted");
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
        const selected = id === selectedId;
        slot.visual.setSelected(selected);
        slot.titleLabel.string = getWordBankLabel(bank, true);
        if (slot.subtitleLabel) {
          slot.subtitleLabel.string = `${bank.words.length} 个单词 · ${unlocked ? "已解锁" : "未解锁"}`;
        }
        slotStates[index].string = selected ? "已选择" : unlocked ? "选择" : "需解锁";
        slotStates[index].color = selected ? home.color("homePractice") : home.color("homeText");
      });
      const canUnlock = isUnlockableWordBankId(app.wordBankCatalog, selectedId)
        && !app.wordBankStore.isUnlocked(app.wordBankCatalog, selectedId);
      unlock.button.interactable = canUnlock;
      unlock.titleLabel.string = canUnlock ? "解锁所选" : "无需解锁";
      if (unlock.subtitleLabel) unlock.subtitleLabel.string = canUnlock ? "使用真实单词金币" : "当前词库可以直接使用";
      unlock.visual.refresh();
      pageLabel.string = `${page + 1}/${pageCount}`;
      previous.button.interactable = page > 0;
      next.button.interactable = page < pageCount - 1;
      previous.visual.refresh();
      next.visual.refresh();
    };
    previous = home.iconButton(safe.node, "PreviousBanks", "‹", -105, safeBottom + 164, 80, () => {
      page -= 1;
      renderPage();
    });
    next = home.iconButton(safe.node, "NextBanks", "›", 105, safeBottom + 164, 80, () => {
      page += 1;
      renderPage();
    });
    const unlock = home.actionButton(safe.node, "UnlockBank", "解锁所选", "使用真实单词金币", "币", -144, safeBottom + 48, 272, 80, () => {
      controller.unlockSelectedBank();
      renderPage();
    }, "history", "coin");
    home.actionButton(safe.node, "ConfirmBank", "确定选择", "用于练习和下一场比赛", "词", 144,
      safeBottom + 48, 272, 80, () => controller.confirmSelection(), "bank", "wordBank");
    controller = root.addComponent(BankScene);
    controller.statusLabel = status;
    renderPage();
    return root;
  }

  private buildStudy(parent: Node, ui: RuntimeUi): Node {
    const { root, home, safe } = this.page(parent, ui, "Study");
    const safeTop = safe.height / 2;
    const stretch = Math.max(0, Math.min(360, safe.height - 822));
    let controller!: StudyScene;
    home.pageHeader(safe, "StudyHeader", "赛前练习", "背诵当前单元，随时标记需要复习的单词",
      () => controller.backHome(), "practice");
    const selectedBank = getWordBank(app.wordBankCatalog, app.wordBankStore.getSelectedBankId());
    const bankBar = home.actionButton(safe.node, "StudyBankBar", getWordBankLabel(selectedBank, true),
      "当前词库", "词", 0, safeTop - 160, 560, 80, () => controller.changeBank(), "surface", "wordBank");
    [bankBar.titleLabel, bankBar.subtitleLabel].forEach((label) => {
      if (!label) return;
      label.node.setPosition(-20, label.node.position.y, 0);
      label.node.getComponent(UITransform)?.setContentSize(350, label.node.getComponent(UITransform)?.height || 44);
    });
    const bankChange = home.pill(bankBar.node, "StudyBankChangeBadge", 220, 0, 104, 54,
      "homePractice", "homeTextOnColor");
    home.label(bankChange, "StudyBankChangeLabel", "更换", 0, 0, 78, 36, 17, "homeTextOnColor");
    const cardY = safeTop - 384 - stretch * 0.05;
    const card = home.sectionCard(safe.node, "StudyCard", "学习卡", 0, cardY,
      540, 360, "practice", "practice");
    home.label(card, "StudyProgressCaption", "学习进度", 182, 142, 120, 24, 16, "homeTextMuted");
    const status = home.label(card, "StudyStatus", "", 182, 110, 120, 24, 18, "homeTextMuted");
    const progress = home.progressBar(card, "StudyProgress", 182, 84, 124, 12, "practice");
    const word = home.label(card, "StudyWord", "", 0, 32, 480, 76, 58, "homeText");
    const meaning = home.label(card, "StudyMeaning", "", 0, -50, 480, 68, 29, "homeTextMuted");
    home.actionButton(card, "PreviousWord", "上一个", "", "词", -142, -132, 220, 80,
      () => controller.previousWord(), "join", "wordBank");
    home.actionButton(card, "RandomWord", "随机", "", "练", 142, -132, 220, 80,
      () => controller.randomWord(), "surface", "practice");
    const revealY = cardY - 224 - stretch * 0.28;
    home.actionButton(safe.node, "RevealWord", "查看当前释义", "", "书", -134, revealY, 252, 80,
      () => controller.revealCurrentMeaning(), "join", "practice");
    const markWrong = home.actionButton(safe.node, "MarkWrong", "标记错词", "", "★", 134, revealY, 252, 80,
      () => controller.markCurrentUnfamiliar(), "history", "wordBank");
    home.selectionStyle(markWrong.visual, "history");
    const meaningToggle = home.actionButton(safe.node, "MeaningToggle", "", "", "书", 0,
      cardY - 308 - stretch * 0.39, 500, 80, () => controller.toggleChinese(), "surface", "practice");
    home.selectionStyle(meaningToggle.visual, "join");
    home.actionButton(safe.node, "NextWord", "下一个", "继续背诵本单元", "→", 0,
      cardY - 392 - stretch * 0.6, 500, 80, () => controller.nextWord(), "create", "practice");
    controller = root.addComponent(StudyScene);
    controller.wordLabel = word;
    controller.meaningLabel = meaning;
    controller.statusLabel = status;
    controller.meaningToggleLabel = meaningToggle.label;
    controller.progressView = progress;
    controller.meaningToggleVisual = meaningToggle.visual;
    controller.wrongVisual = markWrong.visual;
    return root;
  }

  private buildCoopSelect(parent: Node, ui: RuntimeUi): Node {
    const { root, home, safe } = this.page(parent, ui, "CoopSelect");
    const safeTop = safe.height / 2;
    let controller!: CoopSelectScene;
    const header = home.pageHeader(safe, "CoopSelectHeader", "玩法目录", "选择想体验的双人玩法",
      () => controller.backHome(), "catalog");
    header.titleLabel.node.getComponent(UITransform)?.setContentSize(250, 44);
    header.subtitleLabel.node.getComponent(UITransform)?.setContentSize(348, 24);
    home.iconButton(header.node, "ModeHelpButton", "?", 229, 14, 80,
      () => controller.openHelp(), undefined, "transparent", 36);
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
      const featured = index === 0;
      const row = home.accentCard(safe.node, `ModeOption${index}`, 0, safeTop - 160 - index * 84,
        548, 80, featured ? "practice" : "surface", 18);
      home.visualSlot(row, icon, -226, 0, 64, 64);
      home.label(row, `ModeOption${index}Title`, title, -65, 19, 236, 28, 23, "homeText", 0);
      home.label(row, `ModeOption${index}Subtitle`, subtitle, -65, -17, 236, 28, 15, "homeTextMuted", 0);
      home.statusBadge(row, `ModeOption${index}Players`, "双人", 96, -17, 70, "surface");
      const action = home.button(row, `ModeOption${index}Action`, featured ? "立即体验" : "筹备中",
        204, 0, 126, 80, () => controller.openModeSetup(), featured ? "practice" : kind, 17);
      if (index > 0) {
        action.button.interactable = false;
        action.visual.refresh();
      }
    });
    controller = root.addComponent(CoopSelectScene);
    return root;
  }

  private buildRoom(parent: Node, ui: RuntimeUi): Node {
    const { root, home, safe } = this.page(parent, ui, "Room");
    const roomContentY = (safe.height - 886) / 2 - 18;
    const lobbyContentY = (safe.height - 822) / 2 - 14;
    let controller!: RoomScene;
    const entryIntent = app.store.getState().roomEntryIntent;
    const roomState = app.roomStore.getState();
    const hasSession = !!roomState.roomId || !!roomState.room;
    const headerTitle = entryIntent === "join" ? "加入房间" : entryIntent === "create" ? "创建房间" : "双人房间";
    const headerIcon = entryIntent === "join" ? "joinRoom" : "createRoom";
    const header = home.pageHeader(safe, "RoomHeader", headerTitle,
      "两名真实玩家加入并准备后，由房主开始", () => controller.backHome(), headerIcon);

    let createPanel: Node | null = null;
    let selectedBank: Label | null = null;
    let create: PreGameActionButtonRef | null = null;
    let autoReady: RuntimeButtonRef | null = null;
    if (!hasSession && entryIntent === "create") {
      createPanel = home.group(safe.node, "RoomCreatePanel", 0, roomContentY, safe.width, 760);
      const selectedModeCard = home.sectionCard(createPanel, "SelectedModeCard", "已选模式", 0, 248,
        548, 184, "join", "joinRoom");
      home.visualSlot(selectedModeCard, "joinRoom", -198, -21, 92, 92);
      home.label(selectedModeCard, "SelectedModeTitle", "准备体验模式", 42, -2, 360, 48, 32, "homeText", 0);
      home.label(selectedModeCard, "SelectedModeSummary", "双人房间流程体验", 42, -50, 360, 32, 19, "homeTextMuted", 0);
      const bankCard = home.sectionCard(createPanel, "CreateBankCard", "当前词库", 0, 74,
        548, 148, "practice", "wordBank");
      home.visualSlot(bankCard, "wordBank", -210, -26, 66, 66);
      selectedBank = home.label(bankCard, "CreateBankLabel", "", -18, -16, 300, 46, 25, "homeText", 0);
      home.actionButton(bankCard, "ChangeRoomBank", "更换", "", "词", 202, -15, 118, 80,
        () => controller.changeBank(), "practice", "wordBank");
      const guidance = home.sectionCard(createPanel, "CreateGuidanceCard", "开始条件", 0, -64,
        548, 112, "history", "practice");
      home.visualSlot(guidance, "practice", -220, -13, 52, 52);
      home.label(guidance, "CreateGuidance", "创建后邀请好友加入；两名玩家准备后由房主开始", 28, -13,
        430, 58, 19, "homeText", 0);
      create = home.actionButton(createPanel, "CreateRoom", "创建房间", "生成房间码并等待好友", "房", 0,
        -187, 460, 118, () => void controller.createConfiguredRoom(), "create", "createRoom");
      autoReady = home.actionButton(createPanel, "AutoReady", "创建后自动准备", "", "✓", 0, -294,
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
      input = home.edit(joinCard, "RoomCodeInput", "", 0, -27, 500, 104, ROOM_CODE_LENGTH);
      home.label(joinCard, "JoinInviteHint", "也可以通过好友邀请直接进入准备房间", 0, -114, 480, 54, 18, "homeTextMuted");
      join = home.actionButton(joinCard, "JoinRoom", "加入房间", "查找好友创建的房间", "友", 0, -218,
        500, 110, () => void controller.joinEnteredRoom(), "join", "joinRoom");
    }

    const lobbyPanel = home.group(safe.node, "RoomLobbyPanel", 0, lobbyContentY, safe.width, 760);
    const codeCard = home.sectionCard(lobbyPanel, "RoomCodeCard", "房间码", 0, 252,
      548, 104, "join", "joinRoom");
    const roomCode = home.label(codeCard, "RoomCode", "------", -88, -15, 216, 48, 30, "homeText");
    const copy = home.actionButton(codeCard, "CopyCode", "复制", "", "码", 84, -15, 112, 80,
      () => void controller.copyRoomCode(), "join");
    const invite = home.actionButton(codeCard, "InviteFriend", "邀请", "", "友", 210, -15, 112, 80,
      () => void controller.inviteFriend(), "practice", "joinRoom");
    const lobbyBank = home.sectionCard(lobbyPanel, "LobbyBankCard", "当前词库", 0, 155,
      520, 72, "practice", "wordBank");
    const mode = home.label(lobbyBank, "RoomMode", "", 18, -16, 430, 36, 20, "homeText");
    const playerOne = home.playerStatusCard(lobbyPanel, "RoomPlayerOne", "房主", -140, "practice");
    const playerTwo = home.playerStatusCard(lobbyPanel, "RoomPlayerTwo", "玩家", 140, "join");
    const statusCard = home.sectionCard(lobbyPanel, "RoomStatusCard", "当前状态", 0, -150,
      520, 70, "history");
    const roomReadyIndicator = home.pill(statusCard, "RoomStatusReady", -222, -13, 30, 30,
      "homePractice", "homeTextOnColor");
    roomReadyIndicator.active = false;
    const roomAttentionIndicator = home.pill(statusCard, "RoomStatusAttention", -222, -13, 30, 30,
      "homeHistory", "homeTextOnColor");
    roomAttentionIndicator.active = false;
    const status = home.label(statusCard, "RoomStatus", "", 42, -16, 420, 34, 17, "homeTextMuted");
    const ready = home.actionButton(lobbyPanel, "Ready", "我准备好了", "", "✓", 0, -233, 440, 80,
      () => void controller.toggleReady(), "practice", "practice");
    home.selectionStyle(ready.visual, "practice");
    const start = home.actionButton(lobbyPanel, "StartRoom", "开始游戏", "仅房主可在双方准备后开始", "▶", 0,
      -342, 500, 90, () => void controller.startSelectedMode(), "create", "createRoom");
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

  private buildResult(parent: Node, ui: RuntimeUi): Node {
    const { root, home, safe } = this.page(parent, ui, "Result");
    const stretch = Math.max(0, Math.min(360, safe.height - 822));
    let controller!: ResultScene;
    home.pageHeader(safe, "ResultHeader", "本局结算", "成绩已保存，可在战绩记录中继续查看",
      () => controller.backHome(), "history");
    const resultCardY = 70 + stretch * 0.56;
    const resultCard = home.accentCard(safe.node, "ResultCard", 0, resultCardY, 560, 450, "history", 24);
    home.visualSlot(resultCard, "history", 0, 154, 118, 118);
    const title = home.label(resultCard, "ResultTitle", "", 0, 43, 500, 66, 38, "homeText");
    const score = home.label(resultCard, "ResultScore", "", 0, -32, 440, 74, 46, "homeText");
    const players = home.label(resultCard, "ResultPlayers", "", 0, -140, 480, 126, 23, "homeTextMuted");
    const resultHomeY = -220 - stretch * 0.38;
    home.actionButton(safe.node, "ResultHome", "返回首页", "继续准备下一场对局", "房", 0, resultHomeY,
      560, 96, () => controller.backHome(), "create", "createRoom");
    home.actionButton(safe.node, "ResultHistory", "查看战绩", "回顾本局和历史最佳成绩", "绩", 0,
      resultHomeY - 112, 560, 96, () => controller.openHistory(), "history", "history");
    controller = root.addComponent(ResultScene);
    controller.titleLabel = title;
    controller.scoreLabel = score;
    controller.playersLabel = players;
    return root;
  }

  private buildHistory(parent: Node, ui: RuntimeUi): Node {
    const { root, home, safe } = this.page(parent, ui, "History");
    const safeTop = safe.height / 2;
    const safeBottom = -safe.height / 2;
    const stretch = Math.max(0, Math.min(112, safe.height - 822));
    const listRoot = home.group(safe.node, "HistoryList", 0, 0, safe.width, safe.height);
    const detailRoot = home.group(safe.node, "HistoryDetail", 0, 0, safe.width, safe.height);
    detailRoot.active = false;
    let controller!: HistoryScene;
    home.pageHeader(safe, "HistoryHeader", "战绩记录", "查看真实比赛成绩和历史最佳",
      () => controller.back(), "history");
    const tabs = [
      ["HistoryAll", "全部", () => controller.showAll(), "surface"],
      ["HistoryPk", "PK", () => controller.showPk(), "surface"],
      ["HistoryShared", "合作", () => controller.showCoopShared(), "surface"],
      ["HistorySpell", "拼词", () => controller.showCoopSpell(), "surface"],
      ["HistoryOther", "其他", () => undefined, "surface"]
    ] as const;
    const modeIndicators: Node[] = [];
    const modeVisuals: RuntimeButtonVisual[] = [];
    tabs.forEach(([name, label, action, kind], index) => {
      const tab = home.button(listRoot, name, label, -224 + index * 112, safeTop - 160,
        104, 80, action, kind, 16);
      home.selectionStyle(tab.visual, "join");
      modeVisuals.push(tab.visual);
      const indicator = home.pill(tab.node, `${name}Selected`, 0, -31, 58, 6,
        "homeJoin", "homeJoin");
      indicator.active = index === 0;
      modeIndicators.push(indicator);
      if (name === "HistoryOther") {
        tab.button.interactable = false;
        tab.visual.refresh();
      }
    });
    const recentCard = home.sectionCard(listRoot, "HistoryRecentCard", "最近记录", -144,
      safeTop - 244, 272, 110, "join", "history");
    const recentSummary = home.label(recentCard, "HistoryRecentSummary", "", 0, -24, 236, 54, 15, "homeText", 0);
    const bestCard = home.sectionCard(listRoot, "HistoryBestCard", "最佳成绩", 144,
      safeTop - 244, 272, 110, "history", "coin");
    const bestSummary = home.label(bestCard, "HistoryBestSummary", "", 0, -22, 236, 44, 23, "homeText", 0);
    const titleY = safeTop - 338 + stretch * 12 / 112;
    const title = home.label(listRoot, "HistoryTitle", "", -120, titleY, 320, 40, 25, "homeText", 0);
    const best = home.label(listRoot, "HistoryBest", "", 190, titleY, 220, 36, 17, "homeTextMuted");
    const emptyState = home.sectionCard(listRoot, "HistoryEmptyState", "暂无记录", 0,
      safeTop - 488, 520, 236, "history", "history");
    home.visualSlot(emptyState, "history", 0, 58, 92, 92);
    const empty = home.label(emptyState, "HistoryEmpty", "", 0, -16, 440, 44, 26, "homeText");
    home.label(emptyState, "HistoryEmptyHint", "完成一局对战后，成绩会保存在这里", 0, -62, 450, 38, 17, "homeTextMuted");
    const items: HistoryRecordItem[] = [];
    const rowHeight = 86 + stretch * 16 / 112;
    const rowGap = 94 + stretch * 16 / 112;
    for (let index = 0; index < 4; index += 1) {
      const row = home.accentCard(listRoot, `HistoryRow${index}`, 0,
        safeTop - 405 + stretch * 15 / 112 - index * rowGap, 548, rowHeight, "history", 18);
      home.visualSlot(row, "history", -230, 0, 58, 58);
      const rowTitle = home.label(row, "Title", "", -82, 22, 286, 32, 18, "homeText", 0);
      const meta = home.label(row, "Meta", "", -82, -20, 286, 34, 13, "homeTextMuted", 0);
      const rowScore = home.label(row, "Score", "", 118, 0, 90, 42, 20, "homeText");
      const detail = home.actionButton(row, `HistoryRow${index}Detail`, "详情", "", "绩", 220, 0, 92, 80,
        () => item.open(), "surface", "history");
      let item!: HistoryRecordItem;
      item = row.addComponent(HistoryRecordItem);
      item.titleLabel = rowTitle;
      item.metaLabel = meta;
      item.scoreLabel = rowScore;
      item.detailButton = detail.button;
      items.push(item);
    }
    const pageY = safeBottom + 48 + stretch * 44 / 112;
    const page = home.label(listRoot, "HistoryPage", "", 0, pageY, 120, 44, 17, "homeTextMuted");
    const previous = home.iconButton(listRoot, "HistoryPrevious", "‹", -105, pageY, 80, () => controller.previousPage());
    const next = home.iconButton(listRoot, "HistoryNext", "›", 105, pageY, 80, () => controller.nextPage());

    const detailCard = home.accentCard(detailRoot, "HistoryDetailCard", 0, -5, 560, 680, "catalog", 22);
    home.iconButton(detailRoot, "CloseDetail", "←", -242, 300, 80,
      () => controller.closeDetail(), undefined, "join", 44);
    const detailTitle = home.label(detailCard, "DetailTitle", "", 40, 286, 400, 54, 27, "homeText");
    const detailBody = home.label(detailCard, "DetailBody", "", 0, 5, 500, 490, 17, "homeText", 0);
    const detailPage = home.label(detailCard, "DetailPage", "", 0, -288, 120, 44, 17, "homeTextMuted");
    const detailPrevious = home.iconButton(detailCard, "DetailPrevious", "‹", -105, -288, 80, () => controller.previousDetailPage());
    const detailNext = home.iconButton(detailCard, "DetailNext", "›", 105, -288, 80, () => controller.nextDetailPage());

    controller = root.addComponent(HistoryScene);
    controller.titleLabel = title;
    controller.bestLabel = best;
    controller.recentSummaryLabel = recentSummary;
    controller.bestSummaryLabel = bestSummary;
    controller.emptyLabel = empty;
    controller.emptyStateNode = emptyState;
    controller.pageLabel = page;
    controller.previousButton = previous.button;
    controller.nextButton = next.button;
    controller.modeIndicators = modeIndicators;
    controller.modeVisuals = modeVisuals;
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
    const { root, home, safe } = this.page(parent, ui, "Feedback");
    const safeTop = safe.height / 2;
    const stretch = Math.max(0, Math.min(112, safe.height - 822));
    const formY = safeTop - 370 + stretch * 10 / 112;
    let controller!: FeedbackScene;
    home.pageHeader(safe, "FeedbackHeader", "问题反馈", "告诉我们遇到的问题或改进建议",
      () => controller.backHome(), "feedback");
    const formCard = home.accentCard(safe.node, "FeedbackFormCard", 0, formY, 560, 500, "join", 24);
    home.visualSlot(formCard, "feedback", -228, 198, 48, 48);
    home.label(formCard, "FeedbackPrompt", "反馈内容仅用于定位问题和改进体验", 28, 202, 424, 40, 18, "homeTextMuted", 0);
    const privacy = home.label(formCard, "FeedbackPrivacy", "", 0, 158, 500, 32, 14, "homeTextMuted");
    home.label(formCard, "FeedbackContentCaption", "反馈内容（4-300 字）", 0, 118, 460, 28, 16, "homeTextMuted", 0);
    const content = home.edit(safe.node, "FeedbackContent", "", 0, formY - 2, 500, 196, 300, true);
    home.label(formCard, "FeedbackContactCaption", "联系方式（选填）", 0, -122, 460, 28, 16, "homeTextMuted", 0);
    const contact = home.edit(safe.node, "FeedbackContact", "", 0, formY - 172, 500, 56, 80);
    home.pill(formCard, "FeedbackStatusBand", 0, -226, 500, 36, "homeCard", "homeCardBorder");
    const status = home.label(formCard, "FeedbackStatus", "", 0, -226, 500, 34, 18, "homeTextMuted");
    const submit = home.actionButton(safe.node, "SubmitFeedback", "提交反馈", "提交前会检查内容长度与格式", "言", 0,
      formY - 309, 560, 94, () => void controller.submit(), "join", "feedback");
    home.actionButton(safe.node, "OpenPrivacy", "隐私保护指引", "查看反馈数据处理说明", "隐", 0,
      formY - 404, 560, 80, () => void controller.openPrivacyContract(), "surface", "privacy");
    controller = root.addComponent(FeedbackScene);
    controller.contentInput = content.editBox;
    controller.contactInput = contact.editBox;
    controller.statusLabel = status;
    controller.privacyLabel = privacy;
    controller.submitButton = submit.button;
    return root;
  }

  private buildHelp(parent: Node, ui: RuntimeUi): Node {
    const { root, home, safe } = this.page(parent, ui, "Help");
    const safeTop = safe.height / 2;
    let controller!: HelpScene;
    home.pageHeader(safe, "HelpHeader", "玩法说明", "了解练习、对战和合作规则",
      () => controller.backCatalog(), "catalog");
    const cardHeight = Math.min(820, safe.height - 140);
    const cardY = safeTop - 120 - cardHeight / 2;
    const helpCard = home.accentCard(safe.node, "HelpCard", 0, cardY, 560, cardHeight, "catalog", 22);
    home.visualSlot(helpCard, "catalog", -218, cardHeight / 2 - 76, 72, 72);
    home.label(helpCard, "HelpRulesSummary", "学习、对战、合作与战绩规则", 52,
      cardHeight / 2 - 76, 360, 40, 17, "homeTextMuted", 0);
    const pitch = (cardHeight - 178) / HELP_RULES.length;
    HELP_RULES.forEach(([title, copy, kind], index) => {
      const y = cardHeight / 2 - 154 - index * pitch;
      home.statusBadge(helpCard, `HelpRule${index}Number`, `${index + 1}`, -218, y, 44, kind, 16);
      home.label(helpCard, `HelpRule${index}Title`, title, 22, y + 20, 430, 24, 18, "homeText", 0);
      home.label(helpCard, `HelpRule${index}Body`, copy, 22, y - 18, 430, 36, 14, "homeTextMuted", 0);
    });
    controller = root.addComponent(HelpScene);
    return root;
  }

  private page(parent: Node, ui: RuntimeUi, name: string) {
    const root = ui.root(parent, `${name}RuntimeScreen`);
    const home = new PreGameUi(app.themes.getCurrentTheme());
    home.scenicBackdrop(root, `${name}Scenery`);
    return { root, home, safe: home.safeArea(root, `${name}SafeArea`) };
  }

}
