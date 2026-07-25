import { Label, Node, UITransform } from "cc";
import { app } from "../../../core/App";
import { getWordBank, getWordBankLabel, isUnlockableWordBankId } from "../../../domain/WordBankRules";
import { BankScene } from "../../../scenes/BankScene";
import { StudyScene } from "../../../scenes/StudyScene";
import type { PreGameActionButtonRef } from "../PreGameUi";
import type { RuntimeButtonRef, RuntimeUi } from "../RuntimeUi";
import { createPreGamePage } from "./PreGamePageBuilder";

export function buildBankScreen(parent: Node, ui: RuntimeUi): Node {
  const { root, home, safe } = createPreGamePage(parent, ui, "Bank");
  const safeTop = safe.height / 2;
  const safeBottom = -safe.height / 2;
  let controller!: BankScene;
  home.pageHeader(safe, "BankHeader", "选择词库", "选择教材单元，练习和房间会同步使用",
    () => controller.back(), "wordBank", "bank");
  const statusCard = home.sectionCard(safe.node, "BankStatusCard", "词库状态", 0,
    safeTop - 164, 540, 80, "history", "coin");
  home.visualSlot(statusCard, "coin", -232, -13, 32, 32);
  const status = home.label(statusCard, "BankStatus", "", 20, -13, 456, 36, 18, "homeText", 0);
  const entries = Object.entries(app.wordBankCatalog.WORD_BANKS);
  const pageSize = 4;
  let page = Math.max(0, Math.floor(Math.max(0, entries.findIndex(
    ([id]) => id === app.store.getState().bankPickerSelectedBankId
  )) / pageSize));
  const slotIds = Array.from({ length: pageSize }, () => "");
  const slots: PreGameActionButtonRef[] = [];
  const slotStates: Label[] = [];
  let previous!: RuntimeButtonRef;
  let next!: RuntimeButtonRef;
  const firstSlotY = safeTop - 256;
  const slotGap = 104;
  for (let index = 0; index < pageSize; index += 1) {
    const slot = home.actionButton(safe.node, `BankSlot${index}`, "", "词库信息", "词", 0,
      firstSlotY - index * slotGap, 540, 88, () => {
        const bankId = slotIds[index];
        if (!bankId) return;
        controller.selectBank(bankId);
        renderPage();
      }, "surface", "wordBank");
    home.selectionStyle(slot.visual, "practice");
    slot.titleLabel.node.setPosition(-31.36, 18, 0);
    slot.titleLabel.node.getComponent(UITransform)?.setContentSize(314.72, 36);
    slot.subtitleLabel?.node.setPosition(-31.36, -22, 0);
    slot.subtitleLabel?.node.getComponent(UITransform)?.setContentSize(314.72, 28);
    const badge = home.pill(slot.node, `BankSlot${index}Badge`, 190, 0, 112, 54,
      "homeCard", "homeCardBorder");
    slotStates.push(home.label(badge, `BankSlot${index}State`, "", 0, 0, 92, 36, 15, "homeText"));
    slots.push(slot);
  }
  const pageLabel = home.label(safe.node, "BankPage", "", 0, safeBottom + 162, 112, 44, 18, "homeTextMuted");
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
  previous = home.iconButton(safe.node, "PreviousBanks", "‹", -105, safeBottom + 162, 80, () => {
    page -= 1;
    renderPage();
  });
  next = home.iconButton(safe.node, "NextBanks", "›", 105, safeBottom + 162, 80, () => {
    page += 1;
    renderPage();
  });
  const unlock = home.actionButton(safe.node, "UnlockBank", "解锁所选", "使用真实单词金币", "币", -152, safeBottom + 48, 256, 80, () => {
    controller.unlockSelectedBank();
    renderPage();
  }, "history", "coin");
  home.actionButton(safe.node, "ConfirmBank", "确定选择", "用于练习和下一场比赛", "词", 136,
    safeBottom + 56, 288, 96, () => controller.confirmSelection(), "bank", "wordBank");
  controller = root.addComponent(BankScene);
  controller.statusLabel = status;
  renderPage();
  return root;
}

export function buildStudyScreen(parent: Node, ui: RuntimeUi): Node {
  const { root, home, safe } = createPreGamePage(parent, ui, "Study");
  const safeTop = safe.height / 2;
  const stretch = Math.max(0, Math.min(360, safe.height - 822));
  let controller!: StudyScene;
  home.pageHeader(safe, "StudyHeader", "赛前练习", "背诵当前单元，随时标记需要复习的单词",
    () => controller.backHome(), "practice", "practice");
  const selectedBank = getWordBank(app.wordBankCatalog, app.wordBankStore.getSelectedBankId());
  const bankBar = home.actionButton(safe.node, "StudyBankBar", getWordBankLabel(selectedBank, true),
    "当前词库", "词", 0, safeTop - 160, 560, 72, () => controller.changeBank(), "surface", "wordBank");
  [bankBar.titleLabel, bankBar.subtitleLabel].forEach((label) => {
    if (!label) return;
    label.node.setPosition(-31.84, label.node.position.y, 0);
    label.node.getComponent(UITransform)?.setContentSize(351.68, label.node.getComponent(UITransform)?.height || 44);
  });
  const bankChange = home.pill(bankBar.node, "StudyBankChangeBadge", 204, 0, 104, 54,
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
  home.actionButton(safe.node, "RevealWord", "查看当前释义", "", "书", -134, revealY, 252, 72,
    () => controller.revealCurrentMeaning(), "join", "practice");
  const markWrong = home.actionButton(safe.node, "MarkWrong", "标记错词", "", "★", 134, revealY, 252, 72,
    () => controller.markCurrentUnfamiliar(), "history", "wordBank");
  home.selectionStyle(markWrong.visual, "history");
  const meaningToggle = home.actionButton(safe.node, "MeaningToggle", "", "", "书", 0,
    cardY - 304 - stretch * 0.39, 500, 72, () => controller.toggleChinese(), "surface", "practice");
  home.selectionStyle(meaningToggle.visual, "join");
  home.actionButton(safe.node, "NextWord", "下一个", "继续背诵本单元", "→", 0,
    cardY - 388 - stretch * 0.6, 500, 80, () => controller.nextWord(), "create", "practice");
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
