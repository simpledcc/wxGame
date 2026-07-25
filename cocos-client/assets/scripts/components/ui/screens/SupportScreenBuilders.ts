import { Node } from "cc";
import { HistoryRecordItem } from "../../history/HistoryRecordItem";
import { FeedbackScene } from "../../../scenes/FeedbackScene";
import { HELP_RULES, HelpScene } from "../../../scenes/HelpScene";
import { HistoryScene } from "../../../scenes/HistoryScene";
import { ResultScene } from "../../../scenes/ResultScene";
import { RuntimeButtonVisual } from "../RuntimeButtonVisual";
import type { RuntimeUi } from "../RuntimeUi";
import { createPreGamePage } from "./PreGamePageBuilder";

export function buildResultScreen(parent: Node, ui: RuntimeUi): Node {
  const { root, home, safe } = createPreGamePage(parent, ui, "Result");
  const stretch = Math.max(0, Math.min(360, safe.height - 822));
  let controller!: ResultScene;
  home.pageHeader(safe, "ResultHeader", "本局结算", "成绩已保存，可在战绩记录中继续查看",
    () => controller.backHome(), "history", "history");
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

export function buildHistoryScreen(parent: Node, ui: RuntimeUi): Node {
  const { root, home, safe } = createPreGamePage(parent, ui, "History");
  const safeTop = safe.height / 2;
  const safeBottom = -safe.height / 2;
  const stretch = Math.max(0, Math.min(112, safe.height - 822));
  const listRoot = home.group(safe.node, "HistoryList", 0, 0, safe.width, safe.height);
  const detailRoot = home.group(safe.node, "HistoryDetail", 0, 0, safe.width, safe.height);
  detailRoot.active = false;
  let controller!: HistoryScene;
  home.pageHeader(safe, "HistoryHeader", "战绩记录", "查看真实比赛成绩和历史最佳",
    () => controller.back(), "history", "history");
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
    const button = home.button(listRoot, name, label, -224 + index * 112, safeTop - 156,
      104, 56, action, kind, 16);
    home.selectionStyle(button.visual, "join");
    button.label.node.setPosition(0, 7, 0);
    modeVisuals.push(button.visual);
    const mark = home.pill(button.node, `${name}Selected`, 0, -16, 58, 6,
      "homeJoin", "homeJoin");
    mark.active = index === 0;
    modeIndicators.push(mark);
    if (name === "HistoryOther") {
      button.button.interactable = false;
      button.visual.refresh();
    }
  });
  const recentCard = home.sectionCard(listRoot, "HistoryRecentCard", "最近记录", -144,
    safeTop - 247, 272, 110, "join", "history");
  const recentSummary = home.label(recentCard, "HistoryRecentSummary", "", 0, -22, 236, 46, 15, "homeText", 0);
  const bestCard = home.sectionCard(listRoot, "HistoryBestCard", "最佳成绩", 144,
    safeTop - 247, 272, 110, "history", "coin");
  const bestSummary = home.label(bestCard, "HistoryBestSummary", "", 0, -22, 236, 44, 23, "homeText", 0);
  const titleY = safeTop - 330;
  const title = home.label(listRoot, "HistoryTitle", "", -120, titleY, 320, 40, 25, "homeText", 0);
  const best = home.label(listRoot, "HistoryBest", "", 190, titleY, 220, 36, 17, "homeTextMuted");
  const emptyState = home.sectionCard(listRoot, "HistoryEmptyState", "暂无记录", 0,
    safeTop - 488, 520, 236, "history", "history");
  home.visualSlot(emptyState, "history", 0, 58, 92, 92);
  const empty = home.label(emptyState, "HistoryEmpty", "", 0, -15, 440, 38, 26, "homeText");
  home.label(emptyState, "HistoryEmptyHint", "完成一局对战后，成绩会保存在这里", 0, -62, 450, 38, 17, "homeTextMuted");
  const items: HistoryRecordItem[] = [];
  const rowHeight = 86 + stretch * 16 / 112;
  const rowGap = 94 + stretch * 16 / 112;
  for (let index = 0; index < 4; index += 1) {
    const row = home.accentCard(listRoot, `HistoryRow${index}`, 0,
      safeTop - 401 - stretch * 8 / 112 - index * rowGap, 548, rowHeight, "history", 18);
    home.visualSlot(row, "history", -230, 0, 58, 58);
    const titleLabel = home.label(row, "Title", "", -64, 17, 258, 28, 18, "homeText", 0);
    const metaLabel = home.label(row, "Meta", "", -64, -18, 258, 26, 15, "homeTextMuted", 0);
    const scoreLabel = home.label(row, "Score", "", 118, 0, 90, 42, 20, "homeText");
    let record!: HistoryRecordItem;
    const detail = home.actionButton(row, `HistoryRow${index}Detail`, "详情", "", "绩", 220, 0, 92, 70,
      () => record.open(), "surface", "history");
    record = row.addComponent(HistoryRecordItem);
    record.titleLabel = titleLabel;
    record.metaLabel = metaLabel;
    record.scoreLabel = scoreLabel;
    record.detailButton = detail.button;
    items.push(record);
  }
  const pageY = safeBottom + 48 + stretch * 44 / 112;
  const page = home.label(listRoot, "HistoryPage", "", 0, pageY, 112, 44, 17, "homeTextMuted");
  const previous = home.iconButton(listRoot, "HistoryPrevious", "‹", -105, pageY, 80, () => controller.previousPage());
  const next = home.iconButton(listRoot, "HistoryNext", "›", 105, pageY, 80, () => controller.nextPage());

  const detailCard = home.accentCard(detailRoot, "HistoryDetailCard", 0, -5, 560, 680, "catalog", 22);
  home.iconButton(detailRoot, "CloseDetail", "←", -242, 300, 80,
    () => controller.closeDetail(), undefined, "join", 44);
  const detailTitle = home.label(detailCard, "DetailTitle", "", 40, 286, 400, 54, 27, "homeText");
  const detailBody = home.label(detailCard, "DetailBody", "", 0, 5, 500, 490, 17, "homeText", 0);
  const detailPage = home.label(detailCard, "DetailPage", "", 0, -288, 112, 44, 17, "homeTextMuted");
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

export function buildFeedbackScreen(parent: Node, ui: RuntimeUi): Node {
  const { root, home, safe } = createPreGamePage(parent, ui, "Feedback");
  const formY = safe.height / 2 - 374;
  let controller!: FeedbackScene;
  home.pageHeader(safe, "FeedbackHeader", "问题反馈", "告诉我们遇到的问题或改进建议",
    () => controller.backHome(), "feedback", "join");
  const formCard = home.accentCard(safe.node, "FeedbackFormCard", 0, formY, 560, 500, "join", 24);
  home.visualSlot(formCard, "feedback", -228, 206, 48, 48);
  home.label(formCard, "FeedbackPrompt", "反馈内容仅用于定位问题和改进体验", 28, 202, 448, 40, 18, "homeTextMuted", 0);
  const privacy = home.label(formCard, "FeedbackPrivacy", "", 0, 158, 500, 32, 15, "homeTextMuted");
  home.label(formCard, "FeedbackContentCaption", "反馈内容（4-300 字）", 0, 118, 460, 28, 16, "homeTextMuted", 0);
  const content = home.edit(safe.node, "FeedbackContent", 0, formY - 2, 500, 196, 300, true);
  home.label(formCard, "FeedbackContactCaption", "联系方式（选填）", 0, -122, 460, 28, 16, "homeTextMuted", 0);
  const contact = home.edit(safe.node, "FeedbackContact", 0, formY - 172, 500, 56, 80);
  home.pill(formCard, "FeedbackStatusBand", 0, -225, 500, 34, "homeCard", "homeCardBorder");
  const status = home.label(formCard, "FeedbackStatus", "", 0, -225, 468, 26, 18, "homeTextMuted");
  const submit = home.actionButton(safe.node, "SubmitFeedback", "提交反馈", "提交前会检查内容长度与格式", "言", 0,
    formY - 305, 560, 94, () => void controller.submit(), "join", "feedback");
  submit.titleLabel.fontSize = 31;
  submit.titleLabel.lineHeight = 38;
  home.actionButton(safe.node, "OpenPrivacy", "隐私保护指引", "查看反馈数据处理说明", "隐", 0,
    formY - 400, 520, 80, () => void controller.openPrivacyContract(), "surface", "privacy");
  controller = root.addComponent(FeedbackScene);
  controller.contentInput = content.editBox;
  controller.contactInput = contact.editBox;
  controller.statusLabel = status;
  controller.privacyLabel = privacy;
  controller.submitButton = submit.button;
  return root;
}

export function buildHelpScreen(parent: Node, ui: RuntimeUi): Node {
  const { root, home, safe } = createPreGamePage(parent, ui, "Help");
  const safeTop = safe.height / 2;
  let controller!: HelpScene;
  home.pageHeader(safe, "HelpHeader", "玩法介绍", "了解每种玩法的目标和乐趣",
    () => controller.back(), "catalog", "catalog");
  const cardHeight = Math.min(820, safe.height - 140);
  const cardY = safeTop - 124 - cardHeight / 2;
  const helpCard = home.accentCard(safe.node, "HelpCard", 0, cardY, 560, cardHeight, "catalog", 22);
  home.visualSlot(helpCard, "catalog", -218, cardHeight / 2 - 76, 72, 72);
  home.label(helpCard, "HelpRulesSummary", "学习、竞技、建造与合作玩法", 40,
    cardHeight / 2 - 76, 428, 40, 17, "homeTextMuted", 0);
  const pitch = (cardHeight - 164) / HELP_RULES.length;
  HELP_RULES.forEach(([title, copy, kind], index) => {
    const y = cardHeight / 2 - 146 - index * pitch;
    home.statusBadge(helpCard, `HelpRule${index}Number`, `${index + 1}`, -218, y, 44, kind, 18);
    home.label(helpCard, `HelpRule${index}Title`, title, 27, y + 16, 430, 22, 19, "homeText", 0);
    home.label(helpCard, `HelpRule${index}Body`, copy, 27, y - 15, 430, 24, 15, "homeTextMuted", 0);
  });
  controller = root.addComponent(HelpScene);
  return root;
}
