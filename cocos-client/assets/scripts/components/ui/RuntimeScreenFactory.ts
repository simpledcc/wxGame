import { Button, Label, Node } from "cc";
import { DEV } from "cc/env";
import { HistoryRecordItem } from "../history/HistoryRecordItem";
import { PkWordTarget } from "../pk/PkWordTarget";
import { SpellLetterKey } from "../spell/SpellLetterKey";
import { app } from "../../core/App";
import type { GameDuration } from "../../domain/GameTypes";
import { getWordBank, getWordBankLabel } from "../../domain/WordBankRules";
import { BankScene } from "../../scenes/BankScene";
import { CoopSelectScene } from "../../scenes/CoopSelectScene";
import { CoopSharedScene } from "../../scenes/CoopSharedScene";
import { CoopSpellScene } from "../../scenes/CoopSpellScene";
import { FeedbackScene } from "../../scenes/FeedbackScene";
import { HelpScene } from "../../scenes/HelpScene";
import { HistoryScene } from "../../scenes/HistoryScene";
import { HomeScene } from "../../scenes/HomeScene";
import { PkGameScene } from "../../scenes/PkGameScene";
import { ResultScene } from "../../scenes/ResultScene";
import { RoomScene } from "../../scenes/RoomScene";
import { StudyScene } from "../../scenes/StudyScene";
import type { RouteName } from "../../store/GameStore";
import { RuntimeUi, type RuntimeButtonRef } from "./RuntimeUi";

export class RuntimeScreenFactory {
  build(parent: Node, route: RouteName): Node {
    const ui = new RuntimeUi(app.themes.getCurrentTheme());
    switch (route) {
      case "bank": return this.buildBank(parent, ui);
      case "study": return this.buildStudy(parent, ui);
      case "coopSelect": return this.buildCoopSelect(parent, ui);
      case "room": return this.buildRoom(parent, ui);
      case "pkGame": return this.buildPk(parent, ui);
      case "coopShared": return this.buildShared(parent, ui);
      case "coopSpell": return this.buildSpell(parent, ui);
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
    ui.title(root, app.themes.getCurrentTheme().copy.gameTitle);
    const status = ui.label(root, "HomeStatus", "", 0, 210, 760, 72, 21, "textMuted");
    const bestScores = app.historyStore.getBestScores();
    ui.label(
      root,
      "BestScores",
      `最佳：PK ${bestScores.pk?.score ?? "--"} · 默契 ${bestScores.coopShared?.score ?? "--"} · 拼词 ${bestScores.coopSpell?.score ?? "--"}`,
      0,
      154,
      820,
      38,
      19,
      "textPrimary"
    );
    ui.label(root, "DurationTitle", "本局时长", -330, 104, 120, 36, 20, "textMuted", 0);
    const durations: GameDuration[] = [30, 60, 90, 120];
    const durationButtons: RuntimeButtonRef[] = [];
    const renderDurations = (): void => {
      const selected = app.store.getState().duration;
      durationButtons.forEach((ref, index) => {
        ref.label.string = `${durations[index]}s${durations[index] === selected ? " ✓" : ""}`;
      });
    };
    durations.forEach((duration, index) => {
      durationButtons.push(ui.button(
        root,
        `Duration${duration}`,
        `${duration}s`,
        -150 + index * 115,
        104,
        98,
        42,
        () => {
          app.store.patch({ duration });
          renderDurations();
        },
        "plain",
        18
      ));
    });
    renderDurations();

    let controller!: HomeScene;
    ui.button(root, "StudyButton", "开始背", -210, 30, 330, 58, () => controller.openStudy());
    ui.button(root, "PkButton", "双人PK", 210, 30, 330, 58, () => controller.openPkRoom(), "secondary");
    ui.button(root, "CoopButton", "双人合作", -210, -45, 330, 58, () => controller.openCoopSelect());
    ui.button(root, "BankButton", "换词库", 210, -45, 330, 58, () => controller.openBankPicker(), "plain");
    ui.button(root, "HistoryButton", "战绩记录", -210, -120, 330, 58, () => controller.openHistory(), "plain");
    ui.button(root, "HelpButton", "玩法说明", 210, -120, 330, 58, () => controller.openHelp(), "plain");
    ui.button(root, "FeedbackButton", "问题反馈", 0, -195, 330, 54, () => controller.openFeedback(), "plain");

    if (DEV) {
      ui.label(root, "ThemeDevTitle", "DEV THEME", -320, -262, 120, 30, 14, "textMuted");
      ui.button(root, "DefaultTheme", "草地", -215, -262, 92, 34, () => {
        void app.themes.select("default");
      }, "plain", 15);
      ui.button(root, "IslandTheme", "海岛", -110, -262, 92, 34, () => {
        void app.themes.select("island");
      }, "plain", 15);
    }

    controller = root.addComponent(HomeScene);
    controller.statusLabel = status;
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
    ui.backButton(root, () => controller.backHome());
    const mode = ui.label(root, "RoomMode", "", 0, 222, 700, 40, 23);
    const roomCode = ui.label(root, "RoomCode", "------", 0, 178, 360, 44, 30, "secondary");
    const players = ui.label(root, "RoomPlayers", "", 0, 92, 700, 102, 21, "textPrimary");
    const status = ui.label(root, "RoomStatus", "", 0, 17, 760, 54, 19, "textMuted");
    const input = ui.edit(root, "RoomCodeInput", "输入 6 位房间码", -190, -55, 360, 52, 8);
    ui.button(root, "CreateRoom", "创建房间", 240, -55, 210, 52, () => {
      void controller.createSelectedRoom();
    });
    ui.button(root, "JoinRoom", "加入", 390, -55, 90, 52, () => {
      void controller.joinEnteredRoom();
    }, "secondary", 18);
    const ready = ui.button(root, "Ready", "准备 / 取消", -285, -128, 190, 50, () => {
      void controller.toggleReady();
    });
    const bot = ui.button(root, "AddBot", "机器人", -70, -128, 170, 50, () => {
      void controller.addDefaultBot();
    }, "plain", 18);
    const start = ui.button(root, "StartRoom", "开始游戏", 170, -128, 220, 50, () => {
      void controller.startGame();
    }, "secondary");
    ui.button(root, "CopyCode", "复制房间码", -210, -200, 220, 46, () => {
      void controller.copyRoomCode();
    }, "plain", 17);
    ui.button(root, "InviteFriend", "邀请好友", 35, -200, 190, 46, () => {
      void controller.inviteFriend();
    }, "plain", 17);
    ui.button(root, "RefreshRoom", "刷新", 240, -200, 120, 46, () => {
      void controller.refreshRoom();
    }, "plain", 17);
    controller = root.addComponent(RoomScene);
    controller.roomCodeInput = input.editBox;
    controller.roomCodeLabel = roomCode;
    controller.modeLabel = mode;
    controller.playersLabel = players;
    controller.statusLabel = status;
    controller.readyButton = ready.button;
    controller.addBotButton = bot.button;
    controller.startButton = start.button;
    return root;
  }

  private buildPk(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "PkRuntimeScreen");
    const meaning = ui.label(root, "PkMeaning", "", 0, 260, 590, 54, 30);
    const localScore = ui.label(root, "PkLocalScore", "", -285, 205, 220, 40, 21);
    const opponentScore = ui.label(root, "PkOpponentScore", "", 285, 205, 220, 40, 21);
    const timer = ui.label(root, "PkTimer", "", 0, 205, 120, 40, 24, "warning");
    const combo = ui.label(root, "PkCombo", "", 0, 166, 220, 34, 19, "secondary");
    const status = ui.label(root, "PkStatus", "", 0, -220, 700, 40, 18, "textMuted");
    const targets = this.createWordTargets(root, ui, 125);
    let controller!: PkGameScene;
    const power = ui.button(root, "PowerUp", "使用道具", 255, -272, 200, 46, () => {
      void controller.useFirstPowerUp();
    }, "secondary", 17);
    ui.button(root, "LeavePk", "←", -420, -272, 62, 46, () => controller.backHome(), "plain", 28);
    controller = root.addComponent(PkGameScene);
    controller.meaningLabel = meaning;
    controller.localScoreLabel = localScore;
    controller.opponentScoreLabel = opponentScore;
    controller.timerLabel = timer;
    controller.comboLabel = combo;
    controller.statusLabel = status;
    controller.powerUpButton = power.button;
    controller.wordTargets = targets;
    return root;
  }

  private buildShared(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "SharedRuntimeScreen");
    const meaning = ui.label(root, "SharedMeaning", "", 0, 260, 600, 54, 30);
    const team = ui.label(root, "SharedTeam", "", -250, 205, 260, 40, 22);
    const contribution = ui.label(root, "SharedContribution", "", 80, 205, 300, 40, 20);
    const timer = ui.label(root, "SharedTimer", "", 340, 205, 120, 40, 24, "warning");
    const status = ui.label(root, "SharedStatus", "", 0, -220, 720, 40, 18, "textMuted");
    const targets = this.createWordTargets(root, ui, 125);
    let controller!: CoopSharedScene;
    ui.button(root, "LeaveShared", "←", -420, -272, 62, 46, () => controller.backHome(), "plain", 28);
    controller = root.addComponent(CoopSharedScene);
    controller.meaningLabel = meaning;
    controller.teamScoreLabel = team;
    controller.contributionLabel = contribution;
    controller.timerLabel = timer;
    controller.statusLabel = status;
    controller.wordTargets = targets;
    return root;
  }

  private buildSpell(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "SpellRuntimeScreen");
    const meaning = ui.label(root, "SpellMeaning", "", 0, 274, 650, 44, 27);
    const word = ui.label(root, "SpellWord", "", 0, 230, 780, 44, 27);
    const team = ui.label(root, "SpellTeam", "", -270, 188, 230, 34, 19);
    const totalTimer = ui.label(root, "SpellTotal", "", 0, 188, 190, 34, 19, "warning");
    const questionTimer = ui.label(root, "SpellQuestion", "", 270, 188, 190, 34, 19, "warning");
    const localPanel = ui.panel(root, "LocalSpellPanel", 0, 116, 700, 104, "panel", "spellLocal");
    const localTitle = ui.label(localPanel, "LocalSpellTitle", "", -205, 26, 250, 36, 19, "spellLocal", 0);
    const localInput = ui.label(localPanel, "LocalSpellInput", "", 0, -16, 360, 58, 31, "textPrimary");
    const localProgress = ui.label(localPanel, "LocalSpellProgress", "", 245, 26, 150, 34, 17, "textMuted");
    const teammate = ui.label(root, "TeammateSpell", "", 0, 42, 700, 38, 18, "spellPartner");
    const status = ui.label(root, "SpellStatus", "", 0, 4, 760, 34, 17, "textMuted");

    const letterRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
    const letterKeys: SpellLetterKey[] = [];
    letterRows.forEach((letters, rowIndex) => {
      const keyWidth = 62;
      const gap = 6;
      const totalWidth = letters.length * keyWidth + (letters.length - 1) * gap;
      Array.from(letters).forEach((letter, columnIndex) => {
        let key!: SpellLetterKey;
        const ref = ui.button(
          root,
          `Key${letter}`,
          letter,
          -totalWidth / 2 + keyWidth / 2 + columnIndex * (keyWidth + gap),
          -51 - rowIndex * 51,
          keyWidth,
          43,
          () => key.tap(),
          "plain",
          18
        );
        key = ref.node.addComponent(SpellLetterKey);
        key.letterLabel = ref.label;
        key.keyButton = ref.button;
        letterKeys.push(key);
      });
    });
    let controller!: CoopSpellScene;
    const backspace = ui.button(root, "SpellBackspace", "⌫", -300, -213, 90, 44, () => controller.backspace(), "plain", 25);
    const clear = ui.button(root, "SpellClear", "清空", -185, -213, 110, 44, () => controller.clearDraft(), "plain", 17);
    const submit = ui.button(root, "SpellSubmit", "提交", 0, -213, 160, 48, () => {
      void controller.submit();
    });
    const skip = ui.button(root, "SpellSkip", "跳过", 185, -213, 110, 44, () => {
      void controller.skip();
    }, "secondary", 17);
    ui.button(root, "LeaveSpell", "←", -420, -274, 62, 46, () => controller.backHome(), "plain", 28);
    controller = root.addComponent(CoopSpellScene);
    controller.meaningLabel = meaning;
    controller.wordLabel = word;
    controller.teamScoreLabel = team;
    controller.totalTimerLabel = totalTimer;
    controller.questionTimerLabel = questionTimer;
    controller.localTitleLabel = localTitle;
    controller.localInputLabel = localInput;
    controller.localProgressLabel = localProgress;
    controller.teammateLabel = teammate;
    controller.statusLabel = status;
    controller.submitButton = submit.button;
    controller.backspaceButton = backspace.button;
    controller.clearButton = clear.button;
    controller.skipButton = skip.button;
    controller.letterKeys = letterKeys;
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
    const listRoot = ui.node(root, "HistoryList", 0, 0, 960, 640);
    const detailRoot = ui.node(root, "HistoryDetail", 0, 0, 960, 640);
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

  private createWordTargets(parent: Node, ui: RuntimeUi, firstY: number): PkWordTarget[] {
    const targets: PkWordTarget[] = [];
    for (let index = 0; index < 6; index += 1) {
      const node = ui.panel(
        parent,
        `WordTarget${index}`,
        index % 2 === 0 ? -240 : 240,
        firstY - Math.floor(index / 2) * 82,
        260,
        58,
        "targetFill",
        "targetStroke",
        8
      );
      const label = ui.label(node, "Word", "", 0, 0, 238, 48, 21, "targetText");
      const button = node.addComponent(Button);
      let target!: PkWordTarget;
      node.on(Button.EventType.CLICK, () => target.tap(), this);
      target = node.addComponent(PkWordTarget);
      target.wordLabel = label;
      target.tapButton = button;
      target.leftBound = -340;
      target.rightBound = 340;
      targets.push(target);
    }
    return targets;
  }
}
