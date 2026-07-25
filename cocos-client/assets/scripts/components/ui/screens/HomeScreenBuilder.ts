import { Node, UITransform } from "cc";
import { app } from "../../../core/App";
import { HomeScene } from "../../../scenes/HomeScene";
import { PreGameUi, type PreGameActionButtonRef } from "../PreGameUi";
import type { RuntimeUi } from "../RuntimeUi";

export function buildHomeScreen(parent: Node, ui: RuntimeUi): Node {
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
  const logoY = safeTop - fit(163, 180);
  const footerY = safeBottom + 48;
  const top = home.topBar(safe, "HomeTopBar", 92);
  let controller!: HomeScene;
  let openPlayer!: () => void;
  let openSettings!: () => void;
  home.iconButton(
    top, "HomeAvatarButton", "我", -252, 0, 80, () => openPlayer(), "avatar", "transparent", 68
  );
  const playerCard = home.pill(top, "HomePlayerCard", -107, 0, 194, 64);
  const player = home.label(playerCard, "HomePlayerName", "", 0, 13, 152, 26, 21, "homeTextOnColor");
  home.label(playerCard, "HomePlayerIdentityLabel", "系统安全身份", 0, -17, 152, 18, 15, "homeTextOnColor");
  home.pill(top, "HomeCoinPill", 101, 0, 206, 64);
  const coinButton = home.actionButton(
    top, "HomeCoinButton", "", "", "币", 101, 0, 206, 80,
    () => controller.openBankPicker(), "surface", "coin"
  );
  coinButton.background.enabled = false;
  const coins = coinButton.titleLabel;
  coins.node.name = "HomeCoins";
  coins.node.setPosition(15, 0, 0);
  coins.node.getComponent(UITransform)?.setContentSize(76, 44);
  coins.color = home.color("homeTextOnColor");
  home.statusBadge(coinButton.node, "HomeCoinAdd", "+", 78, 0, 34, "join", 26);
  home.iconButton(
    top, "SettingsButton", "设", 252, 0, 80, () => openSettings(), "settings", "transparent", 54
  );

  home.visualSlot(safe.node, "logo", 0, logoY, fit(416, 520), fit(130, 156));
  const subtitleRibbon = home.pill(safe.node, "HomeSubtitleRibbon", 0, logoY - fit(78, 96), 372, fit(40, 48),
    "homeCreate", "homeTextOnColor");
  home.label(subtitleRibbon, "HomeSubtitle", "和好友一起比拼单词实力", 0, 0, 338, 24, 20, "homeTextOnColor");
  const bank = home.actionButton(
    safe.node, "CurrentBankBar", "", "", "词", 0, logoY - fit(146, 174), 520, fit(80, 92),
    () => controller.openBankPicker(), "surface", "wordBank"
  );
  bank.titleLabel.node.setPosition(fit(-23.6, -20.24), -15, 0);
  bank.titleLabel.node.getComponent(UITransform)?.setContentSize(fit(319.2, 312.48), 34);
  home.label(bank.node, "CurrentBankCaption", "当前词库", fit(-113.2, -106.48), 20, 140, 20, 15, "homeTextMuted");
  const bankChange = home.pill(bank.node, "CurrentBankChangeBadge", 190, 0, 92, 54,
    "homeHistory", "homeTextOnColor");
  home.label(bankChange, "CurrentBankChangeLabel", "更换", 0, 0, 72, 36, 17, "homeTextOnColor");
  home.actionButton(
    safe.node, "CreateRoomButton", "创建房间", "邀请好友，一起开始对战", "房", 0, logoY - fit(242, 301), 520, fit(96, 146),
    () => controller.openModeCatalog(), "create", "createRoom"
  );
  home.actionButton(
    safe.node, "JoinRoomButton", "加入房间", "输入房间码，快速加入好友对局", "友", 0, logoY - fit(342, 450), 520, fit(88, 136),
    () => controller.openJoinRoom(), "join", "joinRoom"
  );
  home.actionButton(
    safe.node, "StudyButton", "赛前练习", "背单词，提升实力", "练", -132, logoY - fit(434, 585), 256, fit(80, 118),
    () => controller.openStudy(), "practice", "practice"
  );
  home.actionButton(
    safe.node, "BankButton", "选择词库", "更换词库，准备比赛", "词", 132, logoY - fit(434, 585), 256, fit(80, 118),
    () => controller.openBankPicker(), "bank", "wordBank"
  );
  home.actionButton(
    safe.node, "HelpButton", "玩法介绍", "了解目标，选择喜欢的玩法", "玩", -132,
    logoY - fit(522, 711), 256, fit(80, 118), () => controller.openHelp(), "catalog", "catalog"
  );
  const history = home.actionButton(
    safe.node, "HistoryButton", "战绩记录", "查看成绩，复盘提升", "绩", 132, logoY - fit(522, 711), 256, fit(80, 118),
    () => controller.openHistory(), "history", "history"
  );
  const secondaryBottom = logoY - fit(522, 711) - fit(40, 59);
  const footerTop = footerY + 40;
  const characterSpace = secondaryBottom - footerTop;
  const characterVisible = characterSpace >= 152;
  const characterHeight = Math.max(120, Math.min(236, characterSpace - 32));
  const character = home.visualSlot(
    safe.node,
    "character",
    safe.width / 2 - 24 - characterHeight / 3,
    (secondaryBottom + footerTop) / 2,
    2 * characterHeight / 3,
    characterHeight
  );
  character.node.active = characterVisible;

  let privacy!: PreGameActionButtonRef;
  privacy = home.actionButton(
    safe.node, "HomePrivacy", "隐私保护指引", "", "隐", -132, footerY, 256, 80,
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
    safe.node, "FeedbackButton", "问题反馈", "", "言", 132, footerY, 256, 80,
    () => controller.openFeedback(), "bank", "feedback"
  );

  const playerModal = home.modal(root, "HomePlayerModal", 500, 400);
  home.label(playerModal.content, "HomePlayerModalTitle", "玩家信息", 0, 145, 420, 48, 30);
  home.visualSlot(playerModal.content, "avatar", 0, 62, 96, 96);
  const playerDetail = home.label(playerModal.content, "HomePlayerDetailName", "", 0, -18, 420, 42, 24);
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
  home.visualSlot(settingsModal.content, "settings", -182, 112, 52, 52);
  home.label(settingsModal.content, "HomeSettingsTitle", "设置", 30, 112, 356, 48, 30);
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
