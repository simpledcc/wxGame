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
    ui.title(root, "选择词库");
    let controller!: BankScene;
    ui.backButton(root, () => controller.back());
    const status = ui.label(root, "BankStatus", "", 0, 216, 780, 72, 19, "textMuted");
    const entries = Object.entries(app.wordBankCatalog.WORD_BANKS);
    const pageSize = 8;
    let page = Math.max(0, Math.floor(Math.max(0, entries.findIndex(([id]) => id === app.store.getState().bankPickerSelectedBankId)) / pageSize));
    const slotIds = Array.from({ length: pageSize }, () => "");
    const slots: RuntimeButtonRef[] = [];
    for (let index = 0; index < pageSize; index += 1) {
      const column = index % 2;
      const row = Math.floor(index / 2);
      slots.push(ui.button(
        root,
        `BankSlot${index}`,
        "",
        column === 0 ? -215 : 215,
        128 - row * 62,
        390,
        50,
        () => {
          const bankId = slotIds[index];
          if (!bankId) return;
          controller.selectBank(bankId);
          renderPage();
        },
        "plain",
        17
      ));
    }
    const pageLabel = ui.label(root, "BankPage", "", 0, -132, 160, 34, 18, "textMuted");
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
    };
    ui.button(root, "PreviousBanks", "←", -105, -132, 68, 38, () => {
      page -= 1;
      renderPage();
    }, "plain", 24);
    ui.button(root, "NextBanks", "→", 105, -132, 68, 38, () => {
      page += 1;
      renderPage();
    }, "plain", 24);
    ui.button(root, "UnlockBank", "解锁所选", -205, -205, 280, 52, () => {
      controller.unlockSelectedBank();
      renderPage();
    }, "secondary");
    ui.button(root, "ConfirmBank", "确定选择", 205, -205, 280, 52, () => controller.confirmSelection());
    controller = root.addComponent(BankScene);
    controller.statusLabel = status;
    renderPage();
    return root;
  }

  private buildStudy(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "StudyRuntimeScreen");
    ui.title(root, "背单词");
    let controller!: StudyScene;
    ui.backButton(root, () => controller.backHome());
    const card = ui.panel(root, "StudyCard", 0, 50, 760, 310);
    const word = ui.label(card, "StudyWord", "", 0, 78, 700, 82, 48);
    const meaning = ui.label(card, "StudyMeaning", "", 0, -2, 680, 78, 25, "textMuted");
    const status = ui.label(card, "StudyStatus", "", 0, -115, 220, 34, 19, "textMuted");
    ui.button(root, "PreviousWord", "←", -330, -150, 72, 52, () => controller.previousWord(), "plain", 28);
    ui.button(root, "RevealWord", "查看本词释义", -185, -150, 190, 52, () => controller.revealCurrentMeaning(), "plain", 18);
    ui.button(root, "RandomWord", "随机", 30, -150, 110, 52, () => controller.randomWord(), "plain", 18);
    ui.button(root, "NextWord", "→", 190, -150, 110, 52, () => controller.nextWord(), "primary", 28);
    ui.button(root, "MarkWrong", "加入错题库", 340, -150, 150, 52, () => controller.markCurrentUnfamiliar(), "secondary", 17);
    ui.button(root, "HideMeaning", "隐藏中文", -205, -220, 180, 48, () => controller.hideChinese(), "plain", 17);
    ui.button(root, "ShowMeaning", "显示中文", 0, -220, 180, 48, () => controller.showChinese(), "plain", 17);
    ui.button(root, "ChangeStudyBank", "换词库", 205, -220, 180, 48, () => controller.changeBank(), "plain", 17);
    controller = root.addComponent(StudyScene);
    controller.wordLabel = word;
    controller.meaningLabel = meaning;
    controller.statusLabel = status;
    return root;
  }

  private buildCoopSelect(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "CoopSelectRuntimeScreen");
    ui.title(root, "双人合作");
    let controller!: CoopSelectScene;
    ui.backButton(root, () => controller.backHome());
    const status = ui.label(root, "CoopStatus", "", 0, 195, 760, 72, 20, "textMuted");
    const shared = ui.panel(root, "SharedInfo", -220, 35, 380, 230);
    ui.label(shared, "SharedTitle", "默契捕词赛", 0, 65, 330, 44, 28);
    ui.label(shared, "SharedBody", "两人都可捕获正确单词\n团队成绩为双方得分之和", 0, 0, 320, 80, 19, "textMuted");
    ui.button(shared, "OpenShared", "进入房间", 0, -75, 250, 50, () => controller.openSharedRoom());
    const spell = ui.panel(root, "SpellInfo", 220, 35, 380, 230);
    ui.label(spell, "SpellTitle", "同舟拼词记", 0, 65, 330, 44, 28);
    ui.label(spell, "SpellBody", "双方各填写两个空位\n每个单词限时 20 秒", 0, 0, 320, 80, 19, "textMuted");
    ui.button(spell, "OpenSpell", "进入房间", 0, -75, 250, 50, () => controller.openSpellRoom(), "secondary");
    ui.button(root, "CoopBank", "更换词库", 0, -170, 260, 50, () => controller.changeBank(), "plain");
    controller = root.addComponent(CoopSelectScene);
    controller.statusLabel = status;
    return root;
  }

  private buildRoom(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "RoomRuntimeScreen");
    ui.title(root, "双人房间");
    let controller!: RoomScene;
    const back = ui.backButton(root, () => controller.backHome());
    const mode = ui.label(root, "RoomMode", "", 0, 222, 700, 40, 23);
    const roomCode = ui.label(root, "RoomCode", "------", 0, 178, 360, 44, 30, "secondary");
    const players = ui.label(root, "RoomPlayers", "", 0, 92, 700, 102, 21, "textPrimary");
    const status = ui.label(root, "RoomStatus", "", 0, 17, 760, 54, 19, "textMuted");
    const input = ui.edit(
      root,
      "RoomCodeInput",
      `输入 ${ROOM_CODE_LENGTH} 位房间码`,
      -190,
      -55,
      360,
      52,
      ROOM_CODE_LENGTH
    );
    const create = ui.button(root, "CreateRoom", "创建房间", 240, -55, 210, 52, () => {
      void controller.createSelectedRoom();
    });
    const join = ui.button(root, "JoinRoom", "加入", 390, -55, 90, 52, () => {
      void controller.joinEnteredRoom();
    }, "secondary", 18);
    ui.label(root, "BotDifficultyTitle", "机器人难度", 0, -93, 180, 20, 14, "textMuted");
    const ready = ui.button(root, "Ready", "准备 / 取消", -305, -128, 170, 50, () => {
      void controller.toggleReady();
    });
    const botLow = ui.button(root, "BotLow", "低", -105, -128, 90, 50, () => {
      void controller.addLowBot();
    }, "plain", 17);
    const botMedium = ui.button(root, "BotMedium", "中", 0, -128, 90, 50, () => {
      void controller.addMediumBot();
    }, "plain", 17);
    const botHigh = ui.button(root, "BotHigh", "高", 105, -128, 90, 50, () => {
      void controller.addHighBot();
    }, "plain", 17);
    const start = ui.button(root, "StartRoom", "开始游戏", 305, -128, 170, 50, () => {
      void controller.startGame();
    }, "secondary");
    const copy = ui.button(root, "CopyCode", "复制房间码", -210, -200, 220, 46, () => {
      void controller.copyRoomCode();
    }, "plain", 17);
    const invite = ui.button(root, "InviteFriend", "邀请好友", 35, -200, 190, 46, () => {
      void controller.inviteFriend();
    }, "plain", 17);
    const refresh = ui.button(root, "RefreshRoom", "刷新", 240, -200, 120, 46, () => {
      void controller.refreshRoom();
    }, "plain", 17);
    controller = root.addComponent(RoomScene);
    controller.roomCodeInput = input.editBox;
    controller.roomCodeLabel = roomCode;
    controller.modeLabel = mode;
    controller.playersLabel = players;
    controller.statusLabel = status;
    controller.createButton = create.button;
    controller.joinButton = join.button;
    controller.copyButton = copy.button;
    controller.inviteButton = invite.button;
    controller.refreshButton = refresh.button;
    controller.backButton = back.button;
    controller.readyButton = ready.button;
    controller.addBotButton = botMedium.button;
    controller.botDifficultyButtons = [botLow.button, botMedium.button, botHigh.button];
    controller.botDifficultyLabels = [botLow.label, botMedium.label, botHigh.label];
    controller.startButton = start.button;
    return root;
  }

  private buildResult(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "ResultRuntimeScreen");
    const title = ui.label(root, "ResultTitle", "", 0, 170, 700, 70, 44);
    const score = ui.label(root, "ResultScore", "", 0, 85, 420, 60, 38, "secondary");
    const players = ui.label(root, "ResultPlayers", "", 0, -5, 580, 110, 23, "textMuted");
    let controller!: ResultScene;
    ui.button(root, "ResultHome", "返回首页", -170, -165, 260, 56, () => controller.backHome());
    ui.button(root, "ResultHistory", "查看战绩", 170, -165, 260, 56, () => controller.openHistory(), "plain");
    controller = root.addComponent(ResultScene);
    controller.titleLabel = title;
    controller.scoreLabel = score;
    controller.playersLabel = players;
    return root;
  }

  private buildHistory(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "HistoryRuntimeScreen");
    const listRoot = ui.root(root, "HistoryList");
    const detailRoot = ui.root(root, "HistoryDetail");
    detailRoot.active = false;
    let controller!: HistoryScene;
    const title = ui.label(listRoot, "HistoryTitle", "", 0, 275, 620, 44, 32);
    ui.backButton(listRoot, () => controller.back());
    ui.button(listRoot, "HistoryPk", "双人PK", -245, 220, 190, 42, () => controller.showPk(), "plain", 17);
    ui.button(listRoot, "HistoryShared", "默契捕词赛", 0, 220, 210, 42, () => controller.showCoopShared(), "plain", 17);
    ui.button(listRoot, "HistorySpell", "同舟拼词记", 245, 220, 210, 42, () => controller.showCoopSpell(), "plain", 17);
    const best = ui.label(listRoot, "HistoryBest", "", 0, 176, 500, 34, 19, "secondary");
    const empty = ui.label(listRoot, "HistoryEmpty", "", 0, 18, 500, 42, 20, "textMuted");
    const items: HistoryRecordItem[] = [];
    for (let index = 0; index < 5; index += 1) {
      const row = ui.panel(listRoot, `HistoryRow${index}`, 0, 126 - index * 58, 760, 50);
      const rowTitle = ui.label(row, "Title", "", -185, 9, 370, 26, 17, "textPrimary", 0);
      const meta = ui.label(row, "Meta", "", -140, -13, 460, 22, 13, "textMuted", 0);
      const rowScore = ui.label(row, "Score", "", 300, 0, 120, 30, 18, "secondary");
      const button = row.addComponent(Button);
      let item!: HistoryRecordItem;
      row.on(Button.EventType.CLICK, () => item.open(), this);
      item = row.addComponent(HistoryRecordItem);
      item.titleLabel = rowTitle;
      item.metaLabel = meta;
      item.scoreLabel = rowScore;
      item.detailButton = button;
      items.push(item);
    }
    const page = ui.label(listRoot, "HistoryPage", "", 0, -180, 120, 32, 17, "textMuted");
    const previous = ui.button(listRoot, "HistoryPrevious", "←", -105, -180, 68, 38, () => controller.previousPage(), "plain", 23);
    const next = ui.button(listRoot, "HistoryNext", "→", 105, -180, 68, 38, () => controller.nextPage(), "plain", 23);

    const detailTitle = ui.label(detailRoot, "DetailTitle", "", 0, 245, 720, 52, 30);
    const detailBody = ui.label(detailRoot, "DetailBody", "", 0, 10, 780, 400, 17, "textPrimary", 0);
    const detailPage = ui.label(detailRoot, "DetailPage", "", 0, -225, 120, 32, 17, "textMuted");
    const detailPrevious = ui.button(
      detailRoot,
      "DetailPrevious",
      "←",
      -105,
      -225,
      68,
      38,
      () => controller.previousDetailPage(),
      "plain",
      23
    );
    const detailNext = ui.button(
      detailRoot,
      "DetailNext",
      "→",
      105,
      -225,
      68,
      38,
      () => controller.nextDetailPage(),
      "plain",
      23
    );
    ui.button(detailRoot, "CloseDetail", "←", -420, 275, 62, 46, () => controller.closeDetail(), "plain", 28);

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
    ui.title(root, "问题反馈");
    let controller!: FeedbackScene;
    ui.backButton(root, () => controller.backHome());
    ui.label(root, "FeedbackPrompt", "请描述遇到的问题或建议", 0, 205, 720, 40, 22);
    const content = ui.edit(root, "FeedbackContent", "反馈内容（4-300 字）", 0, 95, 720, 150, 300, true);
    const contact = ui.edit(root, "FeedbackContact", "联系方式（选填）", 0, -35, 720, 54, 80);
    const status = ui.label(root, "FeedbackStatus", "", 0, -92, 720, 38, 18, "textMuted");
    const privacy = ui.label(root, "FeedbackPrivacy", "", 0, -142, 760, 54, 15, "textMuted");
    const submit = ui.button(root, "SubmitFeedback", "提交反馈", 0, -210, 300, 54, () => {
      void controller.submit();
    });
    ui.button(root, "OpenPrivacy", "隐私保护指引", 300, -210, 190, 44, () => {
      void controller.openPrivacyContract();
    }, "plain", 15);
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
    ui.title(root, "玩法说明");
    let controller!: HelpScene;
    ui.backButton(root, () => controller.backHome());
    const body = ui.label(root, "HelpBody", "", 0, -5, 790, 500, 19, "textPrimary", 0);
    controller = root.addComponent(HelpScene);
    controller.bodyLabel = body;
    return root;
  }

}
