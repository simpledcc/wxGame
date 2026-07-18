import {
  BlockInputEvents,
  Button,
  EditBox,
  Graphics,
  Label,
  Node,
  setMockWindowSize,
  Sprite,
  SpriteFrame,
  UITransform
} from "cc";
import {
  HOME_VISUAL_SLOT_KEYS,
  PRE_GAME_SAFE_INSETS,
  PreGameUi
} from "../assets/scripts/components/ui/PreGameUi";
import { RuntimeButtonVisual } from "../assets/scripts/components/ui/RuntimeButtonVisual";
import {
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  getPortraitViewportHeight,
  RuntimeUi
} from "../assets/scripts/components/ui/RuntimeUi";
import { getThemeManifest } from "../assets/scripts/themes/ThemeCatalog";

function assertOk(value: unknown, message = "expected a truthy value"): asserts value {
  if (!value) throw new Error(message);
}

function assertEqual(actual: unknown, expected: unknown, message = "values are not equal"): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, received ${String(actual)}`);
  }
}

function assertDeepEqual(actual: unknown, expected: unknown, message = "values are not deeply equal"): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${message}: expected ${expectedJson}, received ${actualJson}`);
  }
}

function transform(node: Node): UITransform {
  const value = node.getComponent(UITransform);
  assertOk(value, `${node.name} must have a UITransform`);
  return value;
}

function assertVisualMatchesHitArea(node: Node, visual: RuntimeButtonVisual): void {
  const hitArea = transform(node);
  const geometry = visual.getVisualGeometry();
  assertEqual(geometry.width, hitArea.width, `${node.name} visual width must match its hit area`);
  assertEqual(geometry.height, hitArea.height, `${node.name} visual height must match its hit area`);
  assertOk(geometry.radius <= Math.min(hitArea.width, hitArea.height) / 2);
}

function assertActionIconClearOfText(action: ReturnType<PreGameUi["actionButton"]>): void {
  const iconBounds = transform(action.iconSlot);
  const titleBounds = transform(action.titleLabel.node);
  const iconRight = action.iconSlot.position.x + iconBounds.width / 2;
  const titleLeft = action.titleLabel.node.position.x - titleBounds.width / 2;
  assertOk(iconRight + 8 <= titleLeft, `${action.node.name} icon must not overlap its title area`);
  assertOk(iconBounds.width <= 56, `${action.node.name} icon must stay within the compact visual cap`);
}

function assertActionTextRhythm(action: ReturnType<PreGameUi["actionButton"]>): void {
  const subtitle = action.subtitleLabel?.node;
  assertOk(subtitle, `${action.node.name} must have a subtitle`);
  const buttonBounds = transform(action.node);
  const titleBounds = transform(action.titleLabel.node);
  const subtitleBounds = transform(subtitle);
  const gap = action.titleLabel.node.position.y - titleBounds.height / 2
    - subtitle.position.y - subtitleBounds.height / 2;
  const bottomInset = subtitle.position.y - subtitleBounds.height / 2 + buttonBounds.height / 2;
  assertOk(gap >= 8, `${action.node.name} title and subtitle need an eight-pixel gap`);
  assertOk(bottomInset >= 8, `${action.node.name} subtitle needs an eight-pixel bottom inset`);
}

function assertSectionTabSpacing(card: Node, name: string, visualKey: string): void {
  const tab = card.getChildByName(`${name}Tab`);
  assertOk(tab, `${name} must have a section tab`);
  const icon = tab.getChildByName(`Home${visualKey}Slot`);
  const title = tab.getChildByName(`${name}TabTitle`);
  assertOk(icon, `${name} must have its visual slot`);
  assertOk(title, `${name} must have its tab title`);
  const tabBounds = transform(tab);
  const iconBounds = transform(icon);
  const titleBounds = transform(title);
  const iconLeft = icon.position.x - iconBounds.width / 2;
  const iconRight = icon.position.x + iconBounds.width / 2;
  const titleLeft = title.position.x - titleBounds.width / 2;
  const titleRight = title.position.x + titleBounds.width / 2;
  const iconBottom = icon.position.y - iconBounds.height / 2;
  const iconTop = icon.position.y + iconBounds.height / 2;
  const titleBottom = title.position.y - titleBounds.height / 2;
  const titleTop = title.position.y + titleBounds.height / 2;
  assertOk(iconLeft >= -tabBounds.width / 2 + 8, `${name} icon must keep its left inset`);
  assertOk(titleLeft - iconRight >= 8, `${name} icon must not crowd its title`);
  assertOk(titleRight <= tabBounds.width / 2 - 8, `${name} title must keep its right inset`);
  assertOk(iconBottom >= -tabBounds.height / 2 + 4, `${name} icon must keep its bottom inset`);
  assertOk(iconTop <= tabBounds.height / 2 - 4, `${name} icon must keep its top inset`);
  assertOk(titleBottom >= -tabBounds.height / 2 + 4, `${name} title must keep its bottom inset`);
  assertOk(titleTop <= tabBounds.height / 2 - 4, `${name} title must keep its top inset`);
}

function main(): void {
  const root = new Node("PreGameTestRoot");
  root.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
  const preGame = new PreGameUi(getThemeManifest("default"));

  const safe = preGame.safeArea(root);
  assertEqual(safe.width, DESIGN_WIDTH - PRE_GAME_SAFE_INSETS.left - PRE_GAME_SAFE_INSETS.right);
  assertEqual(safe.height, DESIGN_HEIGHT - PRE_GAME_SAFE_INSETS.top - PRE_GAME_SAFE_INSETS.bottom);
  assertDeepEqual(
    { x: safe.node.position.x, y: safe.node.position.y },
    {
      x: (PRE_GAME_SAFE_INSETS.left - PRE_GAME_SAFE_INSETS.right) / 2,
      y: (PRE_GAME_SAFE_INSETS.bottom - PRE_GAME_SAFE_INSETS.top) / 2
    }
  );

  const topBar = preGame.topBar(safe);
  assertEqual(transform(topBar).width, safe.width);
  assertEqual(transform(topBar).height, 84);
  assertOk(PRE_GAME_SAFE_INSETS.top >= 96, "top controls must stay below the WeChat capsule safe zone");

  const visualSlots = HOME_VISUAL_SLOT_KEYS.map((key, index) =>
    preGame.visualSlot(root, key, 0, 400 - index * 8, key === "background" ? 640 : 96, key === "background" ? 960 : 96)
  );
  assertEqual(visualSlots.length, 14);
  visualSlots.forEach((slot) => {
    assertEqual(slot.spriteNode.active, false, `${slot.key} must start with its fallback`);
    assertEqual(slot.fallbackNode.active, true);
    assertEqual(slot.node.name, `Home${slot.key.charAt(0).toUpperCase()}${slot.key.slice(1)}Slot`);
  });
  visualSlots
    .filter((slot) => slot.key !== "background" && slot.key !== "logo")
    .forEach((slot) => {
      assertOk(slot.vectorNode, `${slot.key} must have a programmatic vector icon`);
      assertOk(slot.vectorNode.getComponent(Graphics), `${slot.key} vector icon must use Cocos Graphics`);
      assertEqual(slot.fallbackLabel?.node.active, false, `${slot.key} text fallback must yield to its vector icon`);
  });
  const logoSlot = visualSlots[1];
  assertOk(logoSlot.vectorNode, "logo must have a programmatic fallback");
  assertEqual(logoSlot.vectorNode.children.length, 4, "programmatic logo must keep four independently styled characters");
  assertEqual(logoSlot.fallbackLabel?.node.active, false);
  const logoFrame = new SpriteFrame();
  Object.assign(logoFrame, { width: 560, height: 220 });
  preGame.setVisualAsset(logoSlot, logoFrame);
  assertEqual(logoSlot.sprite.spriteFrame, logoFrame);
  assertEqual(logoSlot.spriteNode.active, true);
  assertEqual(logoSlot.fallbackNode.active, false);
  assertEqual(transform(logoSlot.spriteNode).width, 96);
  assertEqual(transform(logoSlot.spriteNode).height, 220 * (96 / 560));
  preGame.setVisualAsset(logoSlot, null);
  assertEqual(logoSlot.spriteNode.active, false);
  assertEqual(logoSlot.fallbackNode.active, true);
  assertEqual(transform(logoSlot.spriteNode).height, 96);
  const backgroundFrame = new SpriteFrame();
  Object.assign(backgroundFrame, { width: 720, height: 1280 });
  preGame.setVisualAsset(visualSlots[0], backgroundFrame);
  assertEqual(transform(visualSlots[0].spriteNode).width, 640);
  assertOk(transform(visualSlots[0].spriteNode).height > 960, "background must use cover fitting");
  assertEqual(topBar.position.y, safe.height / 2 - 42);

  const card = preGame.card(safe.node, "FoundationCard", 0, 80, 560, 120);
  assertDeepEqual(card.getComponent(Graphics)?.lastRoundRect, {
    x: -280,
    y: -60,
    width: 560,
    height: 120,
    radius: 18
  });
  const cardInner = card.getChildByName("FoundationCardInnerBorder")!;
  const cardHighlight = card.getChildByName("FoundationCardHighlight")!;
  assertOk(cardInner.getComponent(Graphics));
  assertEqual(cardHighlight.position.y, 50);
  assertEqual(cardInner.position.y + transform(cardInner).height / 2
    - cardHighlight.position.y - transform(cardHighlight).height / 2, 3,
  "card highlight must remain clear of the inner border");
  const accentCard = preGame.accentCard(safe.node, "FoundationAccentCard", 0, 210, 560, 140, "practice");
  const accent = accentCard.getChildByName("FoundationAccentCardAccent");
  assertOk(accent?.getComponent(Graphics));
  assertEqual(accent?.position.x, -277);
  assertEqual(accent?.position.y, 0);
  assertEqual(transform(accent!).width, 4);
  assertEqual(transform(accent!).height, 104);
  assertDeepEqual(accent?.getComponent(Graphics)?.lastRoundRect, {
    x: -2, y: -52, width: 4, height: 104, radius: 2
  });
  const accentInner = accentCard.getChildByName("FoundationAccentCardInnerBorder")!;
  assertEqual(accent!.position.x + transform(accent!).width / 2 + 1,
    accentInner.position.x - transform(accentInner).width / 2,
    "accent rail must remain clear of the card inner border");
  const largeSection = preGame.sectionCard(
    safe.node, "FoundationLargeSection", "当前词库", 0, 210, 560, 148, "practice", "wordBank"
  );
  const compactSection = preGame.sectionCard(
    safe.node, "FoundationCompactSection", "当前状态", 0, 130, 560, 70, "history", "history"
  );
  assertSectionTabSpacing(largeSection, "FoundationLargeSection", "WordBank");
  assertSectionTabSpacing(compactSection, "FoundationCompactSection", "History");
  assertEqual(
    largeSection.getChildByName("FoundationLargeSectionTab")
      ?.getChildByName("FoundationLargeSectionTabTitle")?.getComponent(Label)?.fontSize,
    22
  );
  assertEqual(
    compactSection.getChildByName("FoundationCompactSectionTab")
      ?.getChildByName("FoundationCompactSectionTabTitle")?.getComponent(Label)?.fontSize,
    14
  );

  let actionCount = 0;
  const action = preGame.actionButton(
    safe.node,
    "FoundationAction",
    "创建房间",
    "邀请好友，一起开始对战",
    "房",
    0,
    -60,
    560,
    112,
    () => { actionCount += 1; },
    "create"
  );
  assertVisualMatchesHitArea(action.node, action.visual);
  assertEqual(action.titleLabel.string, "创建房间");
  assertEqual(action.subtitleLabel?.string, "邀请好友，一起开始对战");
  assertEqual(action.titleLabel.enableOutline, true);
  assertEqual(action.titleLabel.outlineWidth, 3);
  assertEqual(action.background.strokeCount, 1, "fallback action border must survive visual setup");
  assertEqual(transform(action.iconSlot).width, 56);
  assertActionIconClearOfText(action);
  assertActionTextRhythm(action);
  const actionSkinNode = action.node.getChildByName("FoundationActionSkin");
  assertOk(actionSkinNode, "action button must keep a dedicated skin node");
  assertEqual(actionSkinNode.getComponent(Sprite)?.sizeMode, Sprite.SizeMode.CUSTOM);
  assertEqual(transform(actionSkinNode).width, 560);
  assertEqual(transform(actionSkinNode).height, 112);
  const actionHighlight = action.node.getChildByName("FoundationActionHighlight");
  assertOk(actionHighlight, "action button must keep a fallback highlight node");
  assertEqual(actionHighlight.active, true);
  action.visual.setSkin(actionSkinNode.getComponent(Sprite), 2);
  assertEqual(transform(actionSkinNode).width, 1120);
  assertEqual(transform(actionSkinNode).height, 224);
  assertEqual(actionSkinNode.scale.x, 0.5);
  assertEqual(actionSkinNode.scale.y, 0.5);
  transform(actionSkinNode).setContentSize(384, 164);
  actionSkinNode.setScale(1, 1, 1);
  action.visual.update();
  assertEqual(transform(actionSkinNode).width, 1120, "runtime visual must repair a late 2x sprite-size reset");
  assertEqual(transform(actionSkinNode).height, 224, "runtime visual must repair a late 2x sprite-size reset");
  assertEqual(actionSkinNode.scale.x, 0.5, "runtime visual must preserve 2x skin density");
  assertEqual(actionSkinNode.scale.y, 0.5, "runtime visual must preserve 2x skin density");
  action.node.emit(Button.EventType.CLICK);
  assertEqual(actionCount, 1);
  action.node.emit(Node.EventType.TOUCH_START);
  assertEqual(actionHighlight.active, false, "pressed action must suppress its static highlight");
  assertEqual(action.background.strokeCount, 1, "pressed action must redraw its fallback border");
  assertEqual(action.iconSlot.position.y, -2);
  assertVisualMatchesHitArea(action.node, action.visual);
  action.node.emit(Node.EventType.TOUCH_END);
  assertEqual(actionHighlight.active, false, "formal skin must keep the fallback highlight suppressed");
  assertEqual(action.iconSlot.position.y, 0);
  action.button.interactable = false;
  action.visual.refresh();
  assertEqual(actionHighlight.active, false, "disabled action must suppress its bright highlight");
  assertEqual(action.visual.isShowingDisabledState(), true);
  assertEqual(action.background.strokeCount, 1, "disabled action must redraw its fallback border");
  assertOk(action.titleLabel.color.a < 255, "disabled button copy must visibly soften with its background");
  action.node.emit(Button.EventType.CLICK);
  assertEqual(actionCount, 1, "disabled pre-game buttons must not execute their action");
  assertVisualMatchesHitArea(action.node, action.visual);

  const surfaceAction = preGame.actionButton(
    safe.node,
    "FoundationSurfaceAction",
    "当前词库",
    "",
    "书",
    0,
    -190,
    420,
    72,
    () => undefined,
    "surface"
  );
  assertEqual(transform(surfaceAction.node).width, 420);
  assertEqual(transform(surfaceAction.node).height, 80,
    "compact action must retain the shared target-device touch height");
  assertDeepEqual(surfaceAction.visual.getVisualGeometry(), { width: 420, height: 72, radius: 22 });
  assertDeepEqual(surfaceAction.titleLabel.color, preGame.color("homeText"));
  assertEqual(surfaceAction.titleLabel.enableOutline, false);
  assertActionIconClearOfText(surfaceAction);
  surfaceAction.visual.setSelectionStyle(
    preGame.color("homeJoin"),
    preGame.color("homeTextOnColor"),
    preGame.color("homeTextOnColor")
  );
  surfaceAction.visual.setSelected(true);
  assertEqual(surfaceAction.visual.isShowingSelectedState(), true);
  assertEqual(surfaceAction.node.getChildByName("FoundationSurfaceActionSelectionRing")?.active, true);
  assertDeepEqual(surfaceAction.titleLabel.color, preGame.color("homeTextOnColor"));
  surfaceAction.visual.setSelected(false);
  assertEqual(surfaceAction.visual.isShowingSelectedState(), false);
  assertDeepEqual(surfaceAction.titleLabel.color, preGame.color("homeText"));

  const progress = preGame.progressBar(safe.node, "FoundationProgress", 0, -240, 240, 14, "practice");
  progress.setValue(3, 8);
  progress.setValue(99, 8);

  let iconCount = 0;
  const icon = preGame.iconButton(topBar, "SettingsIcon", "设", 250, 0, 64, () => { iconCount += 1; });
  assertVisualMatchesHitArea(icon.node, icon.visual);
  assertEqual(transform(icon.iconSlot).width, 36);
  assertEqual(icon.visual.getVisualGeometry().radius, 32);
  const iconHighlight = icon.node.getChildByName("SettingsIconHighlight")!;
  assertEqual(transform(iconHighlight).width, 28);
  assertEqual(iconHighlight.active, true);
  icon.node.emit(Node.EventType.TOUCH_START);
  assertEqual(iconHighlight.active, false, "pressed round control must suppress its static highlight");
  icon.node.emit(Node.EventType.TOUCH_END);
  assertEqual(iconHighlight.active, true);
  icon.button.interactable = false;
  icon.visual.refresh();
  assertEqual(iconHighlight.active, false, "disabled round control must suppress its bright highlight");
  icon.button.interactable = true;
  icon.visual.refresh();
  icon.node.emit(Button.EventType.CLICK);
  assertEqual(iconCount, 1);
  const transparentIcon = preGame.iconButton(
    topBar, "TransparentSettings", "设", -250, 0, 64, () => undefined, "settings", "transparent"
  );
  assertEqual(transparentIcon.background.enabled, false);
  const transparentHighlight = transparentIcon.node.getChildByName("TransparentSettingsHighlight")!;
  assertEqual(transparentHighlight.active, false, "transparent control must not show a floating highlight");
  transparentIcon.node.emit(Node.EventType.TOUCH_START);
  transparentIcon.node.emit(Node.EventType.TOUCH_END);
  assertEqual(transparentHighlight.active, false, "transparent control must stay highlight-free after release");
  const utilityPill = preGame.pill(topBar, "FoundationUtilityPill", 0, 0, 180, 56);
  assertOk(utilityPill.getComponent(Graphics));
  assertEqual(transform(utilityPill).width, 180);
  assertEqual(transform(utilityPill).height, 56);
  const badge = preGame.statusBadge(topBar, "FoundationStatusBadge", "已准备", 0, 0, 94, "practice");
  const badgeLabel = badge.getChildByName("FoundationStatusBadgeLabel")!;
  assertEqual(transform(badge).height, 34);
  assertEqual(transform(badgeLabel).width, 78);
  assertEqual(transform(badgeLabel).height, 26);
  const largeBadge = preGame.statusBadge(topBar, "FoundationLargeBadge", "+", 0, 0, 34, "join", 26);
  assertEqual(transform(largeBadge.getChildByName("FoundationLargeBadgeLabel")!).height, 28);

  const pageGroup = preGame.group(root, "FoundationPageGroup", 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  const pageSafe = preGame.safeArea(pageGroup, "FoundationPageSafeArea");
  const pageHeader = preGame.pageHeader(
    pageSafe,
    "FoundationPageHeader",
    "选择词库",
    "为练习和比赛选择学习内容",
    () => undefined
  );
  assertEqual(pageHeader.titleLabel.string, "选择词库");
  assertEqual(pageHeader.subtitleLabel.string, "为练习和比赛选择学习内容");
  assertEqual(transform(pageHeader.backButton.node).height, 86);
  assertEqual(pageHeader.backButton.visual.getVisualGeometry().radius, 43);
  assertEqual(pageHeader.backButton.iconLabel.fontSize, 34);
  assertEqual(transform(pageHeader.backButton.node.getChildByName("BackButtonHighlight")!).width, 39);
  const directButton = preGame.button(
    pageSafe.node,
    "FoundationTextButton",
    "确定选择",
    0,
    0,
    280,
    80,
    () => undefined,
    "bank"
  );
  assertVisualMatchesHitArea(directButton.node, directButton.visual);
  assertEqual(transform(directButton.label.node).height, 48);
  assertEqual((transform(directButton.node).height - transform(directButton.label.node).height) / 2, 16);
  assertEqual(directButton.background.strokeCount, 1, "plain buttons must retain their border after setup");
  const compactAction = preGame.actionButton(
    pageSafe.node, "FoundationCompactAction", "详情", "", "绩", 0, 100, 92, 80,
    () => undefined, "surface", "history"
  );
  assertEqual(transform(compactAction.iconSlot).width, 24);
  assertActionIconClearOfText(compactAction);
  assertOk(compactAction.titleLabel.node.position.x + transform(compactAction.titleLabel.node).width / 2
    <= transform(compactAction.node).width / 2 - 8);
  assertOk(pageHeader.node.getChildByName("FoundationPageHeaderBackdrop")?.getComponent(Graphics));
  assertEqual(pageHeader.backButton.background.enabled, true);
  assertOk(pageHeader.node.getChildByName("FoundationPageHeaderIcon"));
  assertOk(pageHeader.node.getChildByName("FoundationPageHeaderDivider")?.getComponent(Graphics));
  assertOk(pageHeader.node.getChildByName("FoundationPageHeaderIcon")?.getChildByName("HomeCatalogSlot"));
  const headerIcon = pageHeader.node.getChildByName("FoundationPageHeaderIcon")!;
  const headerDivider = pageHeader.node.getChildByName("FoundationPageHeaderDivider")!;
  const edgeGap = (upper: Node, lower: Node): number =>
    upper.position.y - transform(upper).height / 2 - lower.position.y - transform(lower).height / 2;
  assertOk(edgeGap(pageHeader.titleLabel.node, headerDivider) >= 8);
  assertOk(edgeGap(headerDivider, pageHeader.subtitleLabel.node) >= 8);
  assertOk(edgeGap(headerIcon, pageHeader.subtitleLabel.node) >= 8);
  assertOk(pageHeader.titleLabel.node.position.x - transform(pageHeader.titleLabel.node).width / 2
    - headerIcon.position.x - transform(headerIcon).width / 2 >= 8);
  assertEqual(pageHeader.titleLabel.enableOutline, true);
  assertDeepEqual(pageHeader.titleLabel.color, preGame.color("homeTextOnColor"));
  const directEdit = preGame.edit(pageSafe.node, "FoundationEdit", "输入房间码", 0, -100, 420, 80, 6);
  assertOk(directEdit.node.getComponent(EditBox));
  const focusRing = directEdit.node.getChildByName("FoundationEditFocusRing");
  assertEqual(focusRing?.active, false);
  directEdit.node.emit("editing-did-began");
  assertEqual(focusRing?.active, true);
  directEdit.node.emit("editing-did-ended");
  assertEqual(focusRing?.active, false);
  assertEqual(directEdit.textLabel.node.getComponent(UITransform)?.anchorX, 0);
  assertEqual(directEdit.textLabel.node.getComponent(UITransform)?.anchorY, 1);
  assertEqual(directEdit.editBox.placeholder, "", "native placeholder must stay blank to avoid adapter ghost text");
  assertEqual(directEdit.node.getComponent(Graphics), null, "PreGame EditBox host must not carry Graphics");
  assertOk(directEdit.backgroundNode.getComponent(Graphics));
  assertEqual(directEdit.backgroundNode.parent, directEdit.node);

  const modal = preGame.modal(root, "FoundationModal", 520, 360);
  assertEqual(modal.root.active, false);
  assertOk(modal.root.getComponent(BlockInputEvents));
  assertEqual(transform(modal.root).width, DESIGN_WIDTH);
  assertEqual(transform(modal.root).height, DESIGN_HEIGHT);
  assertEqual(transform(modal.panel).width, 520);
  assertEqual(transform(modal.panel).height, 360);
  assertOk(modal.shade.getComponent(Graphics));

  const legacy = new RuntimeUi(getThemeManifest("default"));
  const legacyButton = legacy.button(root, "LegacyButton", "按钮", 0, 0, 330, 58, () => undefined);
  assertVisualMatchesHitArea(legacyButton.node, legacyButton.visual);
  assertEqual(transform(legacyButton.node).width, 220);
  assertEqual(transform(legacyButton.node).height, 67);

  const edit = legacy.edit(root, "LayeredEdit", "输入内容", 0, 0, 360, 52, 20);
  assertOk(edit.node.getComponent(EditBox));
  assertEqual(edit.node.getComponent(Graphics), null, "EditBox host must not also carry Graphics");
  assertOk(edit.backgroundNode.getComponent(Graphics), "Edit background must live on a child node");
  assertEqual(edit.backgroundNode.parent, edit.node);

  setMockWindowSize(393, 852);
  const tallRoot = new Node("TallPhoneRoot");
  tallRoot.addComponent(UITransform).setContentSize(DESIGN_WIDTH, getPortraitViewportHeight());
  const tallScenery = preGame.scenicBackdrop(tallRoot, "TallPhoneScenery");
  const tallSafe = preGame.safeArea(tallRoot, "TallPhoneSafeArea");
  assertEqual(transform(tallRoot).height, 1387);
  assertEqual(transform(tallScenery).height, 1387);
  assertEqual(tallSafe.height, 1249);
  assertEqual(tallSafe.node.position.y, -35);
  setMockWindowSize(640, 960);

  console.log("Pre-game UI foundation OK: long-screen scenery, page headers, controls, hit geometry, and EditBox layering passed.");
}

main();
