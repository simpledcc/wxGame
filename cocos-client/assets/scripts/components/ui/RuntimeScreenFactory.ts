import { Button, Node, UITransform } from "cc";
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
import { RuntimeUi, type RuntimeButtonRef } from "./RuntimeUi";

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
    const backgroundSlot = home.visualSlot(root, "background", 0, 0, 640, 960);
    backgroundSlot.fallbackNode.active = false;
    const safe = home.safeArea(root, "HomeSafeArea");
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

    home.visualSlot(safe.node, "logo", 0, 298, 460, 112);
    home.label(safe.node, "HomeSubtitle", "和好友一起比拼单词实力", 0, 228, 480, 30, 19, "homeText");
    const bank = home.actionButton(
      safe.node, "CurrentBankBar", "", "", "词", 0, 174, 560, 80,
      () => controller.openBankPicker(), "surface", "wordBank"
    );
    bank.titleLabel.node.setPosition(-28, 0, 0);
    bank.titleLabel.node.getComponent(UITransform)?.setContentSize(350, 56);
    home.label(bank.node, "CurrentBankChange", "更换 ›", 220, 0, 88, 42, 18, "homeText");
    home.actionButton(
      safe.node, "CreateRoomButton", "创建房间", "邀请好友，一起开始对战", "房", 0, 76, 560, 96,
      () => controller.openPkRoom(), "create", "createRoom"
    );
    home.actionButton(
      safe.node, "JoinRoomButton", "加入房间", "输入房间码，快速加入好友对局", "友", 0, -20, 560, 80,
      () => controller.openJoinRoom(), "join", "joinRoom"
    );
    home.actionButton(
      safe.node, "StudyButton", "赛前练习", "背单词，提升实力", "练", -144, -108, 272, 80,
      () => controller.openStudy(), "practice", "practice"
    );
    home.actionButton(
      safe.node, "BankButton", "选择词库", "更换词库，准备比赛", "词", 144, -108, 272, 80,
      () => controller.openBankPicker(), "bank", "wordBank"
    );
    home.actionButton(
      safe.node, "HelpButton", "玩法目录", "了解玩法和比赛规则", "玩", -144, -196, 272, 80,
      () => controller.openHelp(), "catalog", "catalog"
    );
    const history = home.actionButton(
      safe.node, "HistoryButton", "战绩记录", "查看成绩，复盘提升", "绩", 144, -196, 272, 80,
      () => controller.openHistory(), "history", "history"
    );
    home.visualSlot(safe.node, "character", 232, -294, 112, 112);

    let privacy!: PreGameActionButtonRef;
    privacy = home.actionButton(
      safe.node, "HomePrivacy", "隐私保护指引", "", "隐", -144, -397, 272, 80,
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
      safe.node, "FeedbackButton", "问题反馈", "", "言", 144, -397, 272, 80,
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
    const safe = home.safeArea(root, "BankSafeArea");
    let controller!: BankScene;
    home.pageHeader(safe, "BankHeader", "选择词库", "为练习和比赛选择学习内容", () => controller.back());
    const statusCard = home.card(safe.node, "BankStatusCard", 0, 292, 560, 94);
    home.visualSlot(statusCard, "coin", -238, 0, 58, 58);
    const status = home.label(statusCard, "BankStatus", "", 26, 0, 430, 76, 18, "homeText", 0);
    const entries = Object.entries(app.wordBankCatalog.WORD_BANKS);
    const pageSize = 8;
    let page = Math.max(0, Math.floor(Math.max(0, entries.findIndex(([id]) => id === app.store.getState().bankPickerSelectedBankId)) / pageSize));
    const slotIds = Array.from({ length: pageSize }, () => "");
    const slots: RuntimeButtonRef[] = [];
    let previous!: RuntimeButtonRef;
    let next!: RuntimeButtonRef;
    for (let index = 0; index < pageSize; index += 1) {
      const column = index % 2;
      const row = Math.floor(index / 2);
      slots.push(home.button(
        safe.node,
        `BankSlot${index}`,
        "",
        column === 0 ? -144 : 144,
        194 - row * 88,
        272,
        80,
        () => {
          const bankId = slotIds[index];
          if (!bankId) return;
          controller.selectBank(bankId);
          renderPage();
        },
        "surface",
        17
      ));
    }
    const pageLabel = home.label(safe.node, "BankPage", "", 0, -164, 120, 44, 18, "homeTextMuted");
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
        slot.label.string = `${id === selectedId ? "✓ " : ""}${getWordBankLabel(bank, true)}${unlocked ? "" : " · 锁定"}`;
      });
      pageLabel.string = `${page + 1}/${pageCount}`;
      previous.button.interactable = page > 0;
      next.button.interactable = page < pageCount - 1;
      previous.visual.refresh();
      next.visual.refresh();
    };
    previous = home.iconButton(safe.node, "PreviousBanks", "‹", -105, -164, 80, () => {
      page -= 1;
      renderPage();
    });
    next = home.iconButton(safe.node, "NextBanks", "›", 105, -164, 80, () => {
      page += 1;
      renderPage();
    });
    home.actionButton(safe.node, "UnlockBank", "解锁所选", "使用真实单词金币", "币", -144, -276, 272, 82, () => {
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
      -276,
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
    const safe = home.safeArea(root, "StudySafeArea");
    let controller!: StudyScene;
    home.pageHeader(safe, "StudyHeader", "赛前练习", "熟悉当前词库，标记需要复习的单词", () => controller.backHome());
    const selectedBank = getWordBank(app.wordBankCatalog, app.wordBankStore.getSelectedBankId());
    home.actionButton(
      safe.node,
      "StudyBankBar",
      getWordBankLabel(selectedBank, true),
      "点击更换练习词库",
      "词",
      0,
      292,
      560,
      82,
      () => controller.changeBank(),
      "surface",
      "wordBank"
    );
    const card = home.card(safe.node, "StudyCard", 0, 86, 560, 300, 22);
    home.visualSlot(card, "practice", 0, 92, 72, 72);
    const word = home.label(card, "StudyWord", "", 0, 28, 500, 72, 48, "homeText");
    const meaning = home.label(card, "StudyMeaning", "", 0, -45, 500, 66, 25, "homeTextMuted");
    const status = home.label(card, "StudyStatus", "", 0, -116, 160, 36, 18, "homeTextMuted");
    home.iconButton(safe.node, "PreviousWord", "‹", -232, -112, 80, () => controller.previousWord());
    home.button(safe.node, "RandomWord", "随机一个", 0, -112, 264, 80, () => controller.randomWord(), "surface", 20);
    home.iconButton(safe.node, "NextWord", "›", 232, -112, 80, () => controller.nextWord());
    home.button(
      safe.node,
      "RevealWord",
      "查看本词释义",
      0,
      -202,
      560,
      80,
      () => controller.revealCurrentMeaning(),
      "practice",
      22
    );
    home.button(safe.node, "MarkWrong", "加入错题库", -144, -292, 272, 80, () => controller.markCurrentUnfamiliar(), "history", 20);
    home.button(safe.node, "ChangeStudyBank", "更换词库", 144, -292, 272, 80, () => controller.changeBank(), "bank", 20);
    home.button(safe.node, "HideMeaning", "隐藏中文", -144, -382, 272, 80, () => controller.hideChinese(), "surface", 19);
    home.button(safe.node, "ShowMeaning", "显示中文", 144, -382, 272, 80, () => controller.showChinese(), "surface", 19);
    controller = root.addComponent(StudyScene);
    controller.wordLabel = word;
    controller.meaningLabel = meaning;
    controller.statusLabel = status;
    return root;
  }

  private buildCoopSelect(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "CoopSelectRuntimeScreen");
    const home = new PreGameUi(app.themes.getCurrentTheme());
    const safe = home.safeArea(root, "CoopSelectSafeArea");
    let controller!: CoopSelectScene;
    home.pageHeader(safe, "CoopSelectHeader", "双人合作", "选择一种和好友共同完成的玩法", () => controller.backHome());
    const statusCard = home.card(safe.node, "CoopStatusCard", 0, 292, 560, 94);
    const status = home.label(statusCard, "CoopStatus", "", 0, 0, 520, 76, 18, "homeTextMuted");
    const shared = home.card(safe.node, "SharedInfo", 0, 116, 560, 210, 22);
    home.visualSlot(shared, "joinRoom", -226, 22, 74, 74);
    home.label(shared, "SharedTitle", "默契捕词赛", 20, 58, 420, 42, 28, "homeText", 0);
    home.label(shared, "SharedBody", "两人共同捕获正确单词，团队成绩为双方得分之和", 20, 12, 420, 58, 17, "homeTextMuted", 0);
    home.button(shared, "OpenShared", "进入默契房间", 20, -66, 420, 80, () => controller.openSharedRoom(), "practice", 21);
    const spell = home.card(safe.node, "SpellInfo", 0, -118, 560, 210, 22);
    home.visualSlot(spell, "practice", -226, 22, 74, 74);
    home.label(spell, "SpellTitle", "同舟拼词记", 20, 58, 420, 42, 28, "homeText", 0);
    home.label(spell, "SpellBody", "双方各填写两个空位，每个单词限时 20 秒", 20, 12, 420, 58, 17, "homeTextMuted", 0);
    home.button(spell, "OpenSpell", "进入拼词房间", 20, -66, 420, 80, () => controller.openSpellRoom(), "catalog", 21);
    home.actionButton(
      safe.node,
      "CoopBank",
      "更换当前词库",
      "合作玩法使用同一套真实词库",
      "词",
      0,
      -345,
      560,
      82,
      () => controller.changeBank(),
      "bank",
      "wordBank"
    );
    controller = root.addComponent(CoopSelectScene);
    controller.statusLabel = status;
    return root;
  }

  private buildRoom(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "RoomRuntimeScreen");
    const home = new PreGameUi(app.themes.getCurrentTheme());
    const safe = home.safeArea(root, "RoomSafeArea");
    let controller!: RoomScene;
    const entryIntent = app.store.getState().roomEntryIntent;
    const headerTitle = entryIntent === "join" ? "加入房间" : entryIntent === "create" ? "创建房间" : "双人房间";
    const header = home.pageHeader(safe, "RoomHeader", headerTitle, "邀请好友，双方准备后开始对局", () => controller.backHome());
    const modeCard = home.card(safe.node, "RoomModeCard", 0, 306, 560, 64);
    const mode = home.label(modeCard, "RoomMode", "", 0, 0, 520, 46, 21, "homeText");
    const codeCard = home.card(safe.node, "RoomCodeCard", 0, 226, 560, 76);
    home.label(codeCard, "RoomCodeCaption", "房间码", -198, 0, 100, 34, 16, "homeTextMuted");
    const roomCode = home.label(codeCard, "RoomCode", "------", 45, 0, 330, 46, 30, "homeText");
    const playersCard = home.card(safe.node, "RoomPlayersCard", 0, 110, 560, 136);
    const players = home.label(playersCard, "RoomPlayers", "", 0, 0, 520, 112, 20, "homeText");
    const status = home.label(safe.node, "RoomStatus", "", 0, 20, 560, 44, 17, "homeTextMuted");
    const input = home.edit(
      safe.node,
      "RoomCodeInput",
      `输入 ${ROOM_CODE_LENGTH} 位房间码`,
      -95,
      -44,
      370,
      80,
      ROOM_CODE_LENGTH
    );
    const join = home.button(safe.node, "JoinRoom", "加入", 190, -44, 170, 80, () => {
      void controller.joinEnteredRoom();
    }, "join", 22);
    const create = home.actionButton(safe.node, "CreateRoom", "创建房间", "生成房间码并等待好友", "房", 0, -136, 560, 84, () => {
      void controller.createSelectedRoom();
    }, "create", "createRoom");
    home.label(safe.node, "BotDifficultyTitle", "机器人难度（仅双人 PK）", 0, -190, 360, 22, 15, "homeTextMuted");
    const botLow = home.button(safe.node, "BotLow", "低", -136, -243, 120, 80, () => {
      void controller.addLowBot();
    }, "surface", 19);
    const botMedium = home.button(safe.node, "BotMedium", "中", 0, -243, 120, 80, () => {
      void controller.addMediumBot();
    }, "surface", 19);
    const botHigh = home.button(safe.node, "BotHigh", "高", 136, -243, 120, 80, () => {
      void controller.addHighBot();
    }, "surface", 19);
    const ready = home.button(safe.node, "Ready", "准备 / 取消", -144, -323, 272, 80, () => {
      void controller.toggleReady();
    }, "practice", 19);
    const start = home.button(safe.node, "StartRoom", "开始游戏", 144, -323, 272, 80, () => {
      void controller.startGame();
    }, "create", 21);
    const copy = home.button(safe.node, "CopyCode", "复制房间码", -192, -403, 176, 80, () => {
      void controller.copyRoomCode();
    }, "surface", 16);
    const invite = home.button(safe.node, "InviteFriend", "邀请好友", 0, -403, 176, 80, () => {
      void controller.inviteFriend();
    }, "surface", 16);
    const refresh = home.button(safe.node, "RefreshRoom", "刷新房间", 192, -403, 176, 80, () => {
      void controller.refreshRoom();
    }, "surface", 16);
    controller = root.addComponent(RoomScene);
    controller.roomCodeInput = input.editBox;
    controller.pageTitleLabel = header.titleLabel;
    controller.roomCodeLabel = roomCode;
    controller.modeLabel = mode;
    controller.playersLabel = players;
    controller.statusLabel = status;
    controller.createButton = create.button;
    controller.joinButton = join.button;
    controller.copyButton = copy.button;
    controller.inviteButton = invite.button;
    controller.refreshButton = refresh.button;
    controller.backButton = header.backButton.button;
    controller.readyButton = ready.button;
    controller.addBotButton = botMedium.button;
    controller.botDifficultyButtons = [botLow.button, botMedium.button, botHigh.button];
    controller.botDifficultyLabels = [botLow.label, botMedium.label, botHigh.label];
    controller.startButton = start.button;
    return root;
  }

  private buildResult(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "ResultRuntimeScreen");
    const home = new PreGameUi(app.themes.getCurrentTheme());
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
    const safe = home.safeArea(root, "HistorySafeArea");
    const listRoot = home.group(safe.node, "HistoryList", 0, 0, safe.width, safe.height);
    const detailRoot = home.group(safe.node, "HistoryDetail", 0, 0, safe.width, safe.height);
    detailRoot.active = false;
    let controller!: HistoryScene;
    home.pageHeader(safe, "HistoryHeader", "战绩记录", "按玩法回顾最近比赛和历史最佳", () => controller.back());
    home.button(listRoot, "HistoryPk", "双人PK", -190, 288, 176, 80, () => controller.showPk(), "join", 17);
    home.button(listRoot, "HistoryShared", "默契捕词", 0, 288, 176, 80, () => controller.showCoopShared(), "practice", 17);
    home.button(listRoot, "HistorySpell", "同舟拼词", 190, 288, 176, 80, () => controller.showCoopSpell(), "catalog", 17);
    const title = home.label(listRoot, "HistoryTitle", "", -110, 220, 320, 42, 27, "homeText", 0);
    const best = home.label(listRoot, "HistoryBest", "", 190, 220, 220, 38, 18, "homeTextMuted");
    const empty = home.label(listRoot, "HistoryEmpty", "", 0, -20, 500, 42, 20, "homeTextMuted");
    const items: HistoryRecordItem[] = [];
    for (let index = 0; index < 5; index += 1) {
      const row = home.card(listRoot, `HistoryRow${index}`, 0, 140 - index * 84, 560, 80, 16);
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
    const page = home.label(listRoot, "HistoryPage", "", 0, -286, 120, 44, 17, "homeTextMuted");
    const previous = home.iconButton(listRoot, "HistoryPrevious", "‹", -105, -286, 80, () => controller.previousPage());
    const next = home.iconButton(listRoot, "HistoryNext", "›", 105, -286, 80, () => controller.nextPage());

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
    const safe = home.safeArea(root, "FeedbackSafeArea");
    let controller!: FeedbackScene;
    home.pageHeader(safe, "FeedbackHeader", "问题反馈", "告诉我们遇到的问题或改进建议", () => controller.backHome());
    const promptCard = home.card(safe.node, "FeedbackPromptCard", 0, 292, 560, 82);
    home.visualSlot(promptCard, "feedback", -238, 0, 56, 56);
    home.label(promptCard, "FeedbackPrompt", "反馈内容仅用于定位问题和改进体验", 25, 0, 430, 52, 18, "homeTextMuted", 0);
    const content = home.edit(safe.node, "FeedbackContent", "反馈内容（4-300 字）", 0, 126, 560, 220, 300, true);
    const contact = home.edit(safe.node, "FeedbackContact", "联系方式（选填）", 0, -44, 560, 80, 80);
    const status = home.label(safe.node, "FeedbackStatus", "", 0, -112, 560, 40, 18, "homeTextMuted");
    const privacy = home.label(safe.node, "FeedbackPrivacy", "", 0, -168, 540, 58, 15, "homeTextMuted");
    const submit = home.actionButton(safe.node, "SubmitFeedback", "提交反馈", "提交前会检查内容长度与格式", "言", 0, -258, 560, 86, () => {
      void controller.submit();
    }, "join", "feedback");
    home.actionButton(safe.node, "OpenPrivacy", "隐私保护指引", "查看反馈数据处理说明", "隐", 0, -358, 560, 82, () => {
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
