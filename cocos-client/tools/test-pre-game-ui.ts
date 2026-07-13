import {
  BlockInputEvents,
  Button,
  EditBox,
  Graphics,
  Node,
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

  const visualSlots = HOME_VISUAL_SLOT_KEYS.map((key, index) =>
    preGame.visualSlot(root, key, 0, 400 - index * 8, key === "background" ? 640 : 96, key === "background" ? 960 : 96)
  );
  assertEqual(visualSlots.length, 13);
  visualSlots.forEach((slot) => {
    assertEqual(slot.spriteNode.active, false, `${slot.key} must start with its fallback`);
    assertEqual(slot.fallbackNode.active, true);
    assertEqual(slot.node.name, `Home${slot.key.charAt(0).toUpperCase()}${slot.key.slice(1)}Slot`);
  });
  const logoSlot = visualSlots[1];
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
  assertEqual(transform(action.iconSlot).width, 92);
  action.node.emit(Button.EventType.CLICK);
  assertEqual(actionCount, 1);
  action.node.emit(Node.EventType.TOUCH_START);
  assertVisualMatchesHitArea(action.node, action.visual);
  action.node.emit(Node.EventType.TOUCH_END);
  action.button.interactable = false;
  action.visual.refresh();
  assertEqual(action.visual.isShowingDisabledState(), true);
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
  assertVisualMatchesHitArea(surfaceAction.node, surfaceAction.visual);
  assertDeepEqual(surfaceAction.titleLabel.color, preGame.color("homeText"));

  let iconCount = 0;
  const icon = preGame.iconButton(topBar, "SettingsIcon", "设", 250, 0, 64, () => { iconCount += 1; });
  assertVisualMatchesHitArea(icon.node, icon.visual);
  icon.node.emit(Button.EventType.CLICK);
  assertEqual(iconCount, 1);

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

  console.log("Pre-game UI foundation OK: visual slots, fallbacks, cards, controls, hit geometry, and EditBox layering passed.");
}

main();
