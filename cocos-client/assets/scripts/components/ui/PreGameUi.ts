import {
  BlockInputEvents,
  Button,
  Color,
  EditBox,
  Graphics,
  Label,
  Node,
  Sprite,
  SpriteFrame,
  UITransform
} from "cc";
import { parseThemeColor } from "../../themes/ThemeCatalog";
import {
  homeArt,
  type HomeButtonSkinKey
} from "../../themes/CocosThemeBundlePort";
import type { ThemeColorToken, ThemeManifest } from "../../themes/ThemeTypes";
import {
  DESIGN_WIDTH,
  getPortraitViewportHeight,
  type RuntimeButtonRef,
  type RuntimeEditRef
} from "./RuntimeUi";
import { RuntimeButtonVisual } from "./RuntimeButtonVisual";

const UI_LAYER = 1 << 25;

export const PRE_GAME_SAFE_INSETS = Object.freeze({
  top: 104,
  right: 24,
  bottom: 34,
  left: 24
});

export type PreGameActionKind =
  | "create"
  | "join"
  | "practice"
  | "bank"
  | "catalog"
  | "history"
  | "surface";

export type PreGameIconBackground = "card" | "transparent" | "join";

export const HOME_VISUAL_SLOT_KEYS = [
  "background",
  "logo",
  "avatar",
  "coin",
  "character",
  "createRoom",
  "joinRoom",
  "practice",
  "wordBank",
  "catalog",
  "history",
  "settings",
  "privacy",
  "feedback"
] as const;
export type HomeVisualSlotKey = typeof HOME_VISUAL_SLOT_KEYS[number];

const HOME_VISUAL_FALLBACKS: Record<HomeVisualSlotKey, string> = {
  background: "",
  logo: "词斗乐园",
  avatar: "我",
  coin: "币",
  character: "伙伴",
  createRoom: "房",
  joinRoom: "友",
  practice: "练",
  wordBank: "词",
  catalog: "玩",
  history: "绩",
  settings: "设",
  privacy: "隐",
  feedback: "言"
};

export interface HomeVisualSlotRef {
  key: HomeVisualSlotKey;
  width: number;
  height: number;
  node: Node;
  spriteNode: Node;
  sprite: Sprite;
  fallbackNode: Node;
  fallbackLabel: Label | null;
  vectorNode: Node | null;
}

export interface PreGameSafeAreaRef {
  node: Node;
  width: number;
  height: number;
}

export interface PreGameActionButtonRef extends RuntimeButtonRef {
  iconSlot: Node;
  iconLabel: Label;
  titleLabel: Label;
  subtitleLabel: Label | null;
}

export interface PreGameModalRef {
  root: Node;
  shade: Node;
  panel: Node;
  content: Node;
}

export interface PreGamePageHeaderRef {
  node: Node;
  backButton: PreGameActionButtonRef;
  titleLabel: Label;
  subtitleLabel: Label;
}

export interface PreGameProgressRef {
  setValue(current: number, total: number): void;
}

export class PreGameUi {
  constructor(readonly theme: ThemeManifest) {}

  scenicBackdrop(parent: Node, name = "PreGameScenery"): Node {
    const viewportHeight = parent.getComponent(UITransform)?.height || getPortraitViewportHeight();
    const root = this.node(parent, name, 0, 0, DESIGN_WIDTH, viewportHeight);
    const island = this.theme.id === "island";

    const sky = this.node(root, `${name}SkyWash`, 0, viewportHeight * 0.22, DESIGN_WIDTH, viewportHeight * 0.56);
    const skyGraphics = sky.addComponent(Graphics);
    skyGraphics.fillColor = island
      ? new Color(105, 222, 229, 82)
      : new Color(112, 203, 255, 82);
    skyGraphics.roundRect(-DESIGN_WIDTH / 2, -viewportHeight * 0.28, DESIGN_WIDTH, viewportHeight * 0.56, 0);
    skyGraphics.fill();

    const meadow = this.node(root, `${name}MeadowWash`, 0, -viewportHeight * 0.28, DESIGN_WIDTH, viewportHeight * 0.44);
    const meadowGraphics = meadow.addComponent(Graphics);
    meadowGraphics.fillColor = island
      ? new Color(82, 194, 168, 88)
      : new Color(122, 198, 92, 82);
    meadowGraphics.roundRect(-DESIGN_WIDTH / 2, -viewportHeight * 0.22, DESIGN_WIDTH, viewportHeight * 0.44, 0);
    meadowGraphics.fill();

    const hills = this.node(root, `${name}Hills`, 0, -viewportHeight * 0.09, DESIGN_WIDTH, 280);
    const hillGraphics = hills.addComponent(Graphics);
    hillGraphics.fillColor = island
      ? new Color(65, 166, 153, 92)
      : new Color(77, 154, 83, 88);
    hillGraphics.moveTo(-320, -140);
    hillGraphics.lineTo(-320, 18);
    hillGraphics.lineTo(-235, 92);
    hillGraphics.lineTo(-145, 36);
    hillGraphics.lineTo(-35, 116);
    hillGraphics.lineTo(78, 42);
    hillGraphics.lineTo(184, 104);
    hillGraphics.lineTo(320, 16);
    hillGraphics.lineTo(320, -140);
    hillGraphics.close();
    hillGraphics.fill();

    const pathHeight = Math.min(340, viewportHeight * 0.36);
    const path = this.node(root, `${name}LearningPath`, 0, -viewportHeight * 0.31, DESIGN_WIDTH, pathHeight);
    const pathGraphics = path.addComponent(Graphics);
    pathGraphics.fillColor = island
      ? new Color(255, 226, 163, 105)
      : new Color(255, 223, 151, 112);
    pathGraphics.moveTo(-58, pathHeight / 2);
    pathGraphics.lineTo(56, pathHeight / 2);
    pathGraphics.lineTo(172, -pathHeight / 2);
    pathGraphics.lineTo(-196, -pathHeight / 2);
    pathGraphics.close();
    pathGraphics.fill();

    const clouds = this.node(root, `${name}Clouds`, 0, viewportHeight / 2 - 180, DESIGN_WIDTH, 120);
    const cloudGraphics = clouds.addComponent(Graphics);
    cloudGraphics.fillColor = new Color(255, 255, 255, 118);
    [[-215, -5, 48, 22], [-170, 3, 64, 30], [178, 4, 56, 25], [226, -7, 42, 20]]
      .forEach(([x, y, rx, ry]) => {
        cloudGraphics.ellipse(x, y, rx, ry);
        cloudGraphics.fill();
      });

    const foliage = this.node(root, `${name}Foliage`, 0, 0, DESIGN_WIDTH, viewportHeight);
    const foliageGraphics = foliage.addComponent(Graphics);
    foliageGraphics.fillColor = island
      ? new Color(22, 133, 119, 142)
      : new Color(38, 127, 61, 142);
    [[-300, viewportHeight / 2 - 42, 60, 34], [-268, viewportHeight / 2 - 78, 54, 30],
      [300, viewportHeight / 2 - 52, 64, 36], [272, viewportHeight / 2 - 92, 48, 28],
      [-304, -viewportHeight / 2 + 88, 42, 26], [302, -viewportHeight / 2 + 104, 46, 28]]
      .forEach(([x, y, rx, ry]) => {
        foliageGraphics.ellipse(x, y, rx, ry);
        foliageGraphics.fill();
      });

    const sparkles = this.node(root, `${name}Sparkles`, 0, 0, DESIGN_WIDTH, viewportHeight);
    const sparkleGraphics = sparkles.addComponent(Graphics);
    [[-252, -viewportHeight / 2 + 152], [-210, -viewportHeight / 2 + 118],
      [246, -viewportHeight / 2 + 170], [278, -viewportHeight / 2 + 132]]
      .forEach(([x, y], index) => {
        sparkleGraphics.fillColor = index % 2
          ? new Color(255, 122, 112, 190)
          : new Color(255, 210, 70, 200);
        sparkleGraphics.circle(x, y, 7);
        sparkleGraphics.fill();
      });
    void homeArt.load("background").then(() => {
      if (root.active) root.active = false;
    }).catch(() => undefined);
    return root;
  }

  visualSlot(
    parent: Node,
    key: HomeVisualSlotKey,
    x: number,
    y: number,
    width: number,
    height: number,
    textToken: ThemeColorToken = "homeText"
  ): HomeVisualSlotRef {
    const stem = key.charAt(0).toUpperCase() + key.slice(1);
    const node = this.node(parent, `Home${stem}Slot`, x, y, width, height);
    const fallbackNode = this.node(node, `Home${stem}Fallback`, 0, 0, width, height);
    const background = fallbackNode.addComponent(Graphics);
    const framed = key === "background" || key === "avatar";
    background.fillColor = framed
      ? this.color(key === "background" ? "backgroundTint" : "homeCard")
      : new Color(255, 255, 255, 0);
    background.strokeColor = this.color("homeCardBorder");
    background.lineWidth = key === "avatar" || key === "character" ? 2 : 0;
    background.roundRect(
      -width / 2,
      -height / 2,
      width,
      height,
      key === "background" ? 0 : Math.min(width, height) * 0.22
    );
    background.fill();
    if (background.lineWidth) background.stroke();

    const fallback = HOME_VISUAL_FALLBACKS[key];
    const fallbackLabel = fallback
      ? this.label(
          fallbackNode,
          `Home${stem}FallbackLabel`,
          fallback,
          0,
          0,
          width * 0.84,
          height * 0.72,
          Math.min(key === "logo" ? 54 : 38, height * (key === "logo" ? 0.58 : 0.42)),
          textToken
        )
      : null;
    const vectorNode = key === "logo"
      ? this.drawProgrammaticLogo(fallbackNode, width, height)
      : this.drawProgrammaticIcon(fallbackNode, key, width, height, textToken);
    if (vectorNode && fallbackLabel) fallbackLabel.node.active = false;
    const spriteNode = this.node(node, `Home${stem}Sprite`, 0, 0, width, height);
    const sprite = spriteNode.addComponent(Sprite);
    spriteNode.active = false;
    const slot = { key, width, height, node, spriteNode, sprite, fallbackNode, fallbackLabel, vectorNode };
    void homeArt.load(key).then((frame) => {
      if (slot.node.active) this.setVisualAsset(slot, frame);
    }).catch(() => undefined);
    return slot;
  }

  setVisualAsset(slot: HomeVisualSlotRef, frame: SpriteFrame | null): void {
    slot.sprite.spriteFrame = frame;
    slot.spriteNode.active = frame !== null;
    slot.fallbackNode.active = frame === null;
    const transform = slot.spriteNode.getComponent(UITransform);
    if (!frame) {
      transform?.setContentSize(slot.width, slot.height);
      return;
    }
    const source = frame as unknown as { width?: number; height?: number };
    const sourceWidth = Math.max(1, Number(source.width) || slot.width);
    const sourceHeight = Math.max(1, Number(source.height) || slot.height);
    const scaleX = slot.width / sourceWidth;
    const scaleY = slot.height / sourceHeight;
    const scale = slot.key === "background" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
    transform?.setContentSize(sourceWidth * scale, sourceHeight * scale);
  }

  safeArea(parent: Node, name = "PreGameSafeArea"): PreGameSafeAreaRef {
    const viewportHeight = parent.getComponent(UITransform)?.height || getPortraitViewportHeight();
    const width = DESIGN_WIDTH - PRE_GAME_SAFE_INSETS.left - PRE_GAME_SAFE_INSETS.right;
    const height = viewportHeight - PRE_GAME_SAFE_INSETS.top - PRE_GAME_SAFE_INSETS.bottom;
    const x = (PRE_GAME_SAFE_INSETS.left - PRE_GAME_SAFE_INSETS.right) / 2;
    const y = (PRE_GAME_SAFE_INSETS.bottom - PRE_GAME_SAFE_INSETS.top) / 2;
    return { node: this.node(parent, name, x, y, width, height), width, height };
  }

  topBar(parent: PreGameSafeAreaRef, name = "PreGameTopBar", height = 84): Node {
    return this.node(parent.node, name, 0, parent.height / 2 - height / 2, parent.width, height);
  }

  pageHeader(parent: PreGameSafeAreaRef, name: string, title: string, subtitle: string,
    backHandler: () => void, icon: HomeVisualSlotKey = "catalog"): PreGamePageHeaderRef {
    const node = this.topBar(parent, name, 116);
    this.pill(node, `${name}Backdrop`, 42, 0, 454, 96, "homeJoin", "homeTextOnColor");
    const backButton = this.iconButton(node, "BackButton", "←", -250, 0, 86, backHandler, undefined, "join", 48);
    backButton.titleLabel.color = this.color("homeTextOnColor");
    const iconPlate = this.pill(node, `${name}Icon`, -126, 18, 58, 58, "homeCard", "homeTextOnColor");
    this.visualSlot(iconPlate, icon, 0, 0, 48, 48);
    const titleLabel = this.label(node, `${name}Title`, title, 66, 22, 302, 44, 31, "homeTextOnColor");
    titleLabel.enableOutline = true;
    titleLabel.outlineColor = this.darken(this.color("homeJoin"), 0.5);
    titleLabel.outlineWidth = 2;
    const divider = this.node(node, `${name}Divider`, 62, -9, 286, 2);
    const dividerGraphics = divider.addComponent(Graphics);
    dividerGraphics.fillColor = new Color(255, 255, 255, 92);
    dividerGraphics.roundRect(-143, -1, 286, 2, 1);
    dividerGraphics.fill();
    const subtitleLabel = this.label(node, `${name}Subtitle`, subtitle, 14, -31, 382, 24, 15, "homeTextOnColor");
    subtitleLabel.enableOutline = true;
    subtitleLabel.outlineColor = this.darken(this.color("homeJoin"), 0.54);
    subtitleLabel.outlineWidth = 1;
    return { node, backButton, titleLabel, subtitleLabel };
  }

  group(parent: Node, name: string, x: number, y: number, width: number, height: number): Node {
    return this.node(parent, name, x, y, width, height);
  }

  card(parent: Node, name: string, x: number, y: number, width: number, height: number,
    radius = 18): Node {
    const node = this.node(parent, name, x, y, width, height);
    this.addRoundedBackground(node, width, height, radius, "homeCard", "homeCardBorder");
    this.addInnerBorder(node, `${name}InnerBorder`, width, height, radius);
    this.addHighlight(node, `${name}Highlight`, width - 24, height, radius, 10);
    return node;
  }

  accentCard(parent: Node, name: string, x: number, y: number, width: number, height: number,
    kind: PreGameActionKind, radius = 20): Node {
    const node = this.card(parent, name, x, y, width, height, radius);
    const accent=this.node(node,`${name}Accent`,-width/2+3,0,4,height-36);
    const graphics = accent.addComponent(Graphics);
    graphics.fillColor = this.color(this.actionToken(kind));
    graphics.roundRect(-2,-(height-36)/2,4,height-36,2);
    graphics.fill();
    return node;
  }

  sectionCard(parent: Node, name: string, title: string, x: number, y: number, width: number,
    height: number, kind: PreGameActionKind, visualKey?: HomeVisualSlotKey): Node {
    const card = this.card(parent, name, x, y, width, height, 22);
    const h=height<120?24:58;
    const tabWidth=Math.min(width-36,Math.max(170,title.length*26+(visualKey?76:42)));
    const tabShadow = this.node(card, `${name}TabShadow`, -width/2+tabWidth/2+14,
      height/2-h/2-5, tabWidth, h);
    const tabShadowGraphics = tabShadow.addComponent(Graphics);
    tabShadowGraphics.fillColor = new Color(24, 42, 56, 46);
    tabShadowGraphics.roundRect(-tabWidth/2,-h/2,tabWidth,h,Math.min(18,h/2));
    tabShadowGraphics.fill();
    const tab = this.node(card, `${name}Tab`, -width/2+tabWidth/2+14,
      height/2-h/2-1, tabWidth, h);
    const tabBackground = tab.addComponent(Graphics);
    tabBackground.fillColor = this.color(this.actionToken(kind));
    tabBackground.strokeColor=kind==="surface"?this.color("homeCardBorder"):this.color("homeTextOnColor");
    tabBackground.lineWidth = 2;
    tabBackground.roundRect(-tabWidth/2,-h/2,tabWidth,h,Math.min(18,h/2));
    tabBackground.fill();
    tabBackground.stroke();
    const textToken:ThemeColorToken=kind==="surface"?"homeText":"homeTextOnColor";
    if (visualKey) this.visualSlot(tab, visualKey, -tabWidth/2+(h<58?18:32), 0,
      h<58?16:38, h<58?16:38, textToken);
    const tabTitle = this.label(tab, `${name}TabTitle`, title, visualKey?(h<58?14:22):0, 0,
      tabWidth-(visualKey?(h<58?48:76):24), h<58?16:42, h<58?14:22, textToken);
    if (kind!=="surface") {
      tabTitle.enableOutline = true;
      tabTitle.outlineColor = this.darken(this.color(this.actionToken(kind)), 0.42);
      tabTitle.outlineWidth = 1;
    }
    return card;
  }

  pill(parent: Node, name: string, x: number, y: number, width: number, height: number,
    fillToken: ThemeColorToken = "homeModalShade", borderToken: ThemeColorToken = "homeTextOnColor"): Node {
    const node = this.node(parent, name, x, y, width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = this.color(fillToken);
    graphics.strokeColor = this.color(borderToken);
    graphics.lineWidth = 2;
    graphics.roundRect(-width / 2, -height / 2, width, height, height / 2);
    graphics.fill();
    graphics.stroke();
    return node;
  }

  selectionStyle(visual: RuntimeButtonVisual, kind: PreGameActionKind): void {
    const onColor = this.color("homeTextOnColor");
    visual.setSelectionStyle(this.color(this.actionToken(kind)), onColor, onColor);
  }

  statusBadge(parent: Node, name: string, text: string, x: number, y: number, width: number,
    kind: PreGameActionKind, fontSize = 14): Node {
    const surface = kind === "surface";
    const node = this.pill(parent, name, x, y, width, 34, this.actionToken(kind),
      surface ? "homeCardBorder" : "homeTextOnColor");
    this.label(node, `${name}Label`, text, 0, 0, width - 16, fontSize>20?28:26, fontSize,
      surface ? "homeTextMuted" : "homeTextOnColor");
    return node;
  }

  playerStatusCard(parent: Node, name: string, title: string, x: number,
    kind: PreGameActionKind): { label: Label; ready: Node; waiting: Node } {
    const card=this.sectionCard(parent, `${name}Card`, title, x, 2, 264, 220, kind);
    this.visualSlot(card, "avatar", -72, -27, 72, 72);
    const ready = this.statusBadge(card, `${name}Ready`, "已准备", 58, 10, 94, "practice");
    ready.active = false;
    return {
      label: this.label(card, name, "", 58, -52, 130, 58, 20, "homeText"),
      ready,
      waiting: this.statusBadge(card, `${name}Waiting`, "等待中", 58, 10, 94, "surface")
    };
  }

  progressBar(parent: Node, name: string, x: number, y: number, width: number, height: number,
    kind: PreGameActionKind): PreGameProgressRef {
    const node = this.node(parent, name, x, y, width, height);
    const track = node.addComponent(Graphics);
    track.fillColor = new Color(48, 68, 91, 40);
    track.roundRect(-width / 2, -height / 2, width, height, height / 2);
    track.fill();
    track.strokeColor = this.color("homeCardBorder");
    track.lineWidth = 1;
    track.roundRect(-width / 2, -height / 2, width, height, height / 2);
    track.stroke();
    const fillNode = this.node(node, `${name}Fill`, 0, 0, width, height);
    const fill = fillNode.addComponent(Graphics);
    const setValue = (current: number, total: number): void => {
      const ratio = total > 0 ? Math.max(0, Math.min(1, current / total)) : 0;
      fill.clear();
      if (ratio <= 0) return;
      const fillWidth = Math.max(height, width * ratio);
      fill.fillColor = this.color(this.actionToken(kind));
      fill.roundRect(-width / 2, -height / 2, fillWidth, height, height / 2);
      fill.fill();
    };
    setValue(0, 1);
    return { setValue };
  }

  button(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number,
    handler: () => void, kind: PreGameActionKind = "surface", fontSize = 20): RuntimeButtonRef {
    const node = this.node(parent, name, x, y, width, height);
    const radius = Math.min(18, height / 2);
    const token = this.actionToken(kind);
    const baseColor = this.color(token);
    const textToken: ThemeColorToken = kind === "surface" ? "homeText" : "homeTextOnColor";
    const background = this.addRoundedBackground(
      node,
      width,
      height,
      radius,
      token,
      kind === "surface" ? "homeCardBorder" : "homeTextOnColor"
    );
    this.addHighlight(node, `${name}Highlight`, width - 22, height, radius);
    const label = this.label(node, `${name}Label`, text, 0, 0, width - 18, height - 32, fontSize, textToken);
    if (kind !== "surface") {
      label.enableOutline = true;
      label.outlineColor = this.darken(baseColor, 0.4);
      label.outlineWidth = height >= 88 ? 2 : 1;
    }
    const button = node.addComponent(Button);
    const visual = node.addComponent(RuntimeButtonVisual);
    visual.configure(
      button,
      background,
      width,
      height,
      radius,
      baseColor,
      this.darken(baseColor, kind === "surface" ? 0.08 : 0.14),
      this.color("disabled")
    );
    visual.setContent([label.node], [label]);
    this.bindButton(node, button, visual, handler);
    return { node, button, label, background, visual };
  }

  edit(parent: Node, name: string, _placeholder: string, x: number, y: number, width: number, height: number,
    maxLength: number, multiline = false): RuntimeEditRef {
    const node = this.node(parent, name, x, y, width, height);
    const backgroundNode = this.node(node, `${name}Background`, 0, 0, width, height);
    const background = this.addRoundedBackground(
      backgroundNode,
      width,
      height,
      16,
      "homeCard",
      "homeCardBorder"
    );
    this.addInnerBorder(backgroundNode, `${name}InnerBorder`, width, height, 16);
    const focusRing = this.node(node, `${name}FocusRing`, 0, 0, width - 6, height - 6);
    const focusGraphics = focusRing.addComponent(Graphics);
    focusGraphics.strokeColor = this.color("homeJoin");
    focusGraphics.lineWidth = 3;
    focusGraphics.roundRect(-(width - 6) / 2, -(height - 6) / 2, width - 6, height - 6, 14);
    focusGraphics.stroke();
    focusRing.active = false;
    const textLabel = this.label(node, `${name}Text`, "", 0, 0, width - 32, height - 18,
      multiline ? 18 : 20, "homeText", 0);
    const placeholderLabel = this.label(node, `${name}Placeholder`, "", 0, 0, width - 32,
      height - 18, multiline ? 17 : 19, "homeTextMuted", 0);
    const textTransform = textLabel.node.getComponent(UITransform);
    if (textTransform) { textTransform.anchorX=0; textTransform.anchorY=1; }
    const editBox = node.addComponent(EditBox);
    editBox.string = "";
    editBox.placeholder = "";
    editBox.maxLength = maxLength;
    editBox.textLabel = textLabel;
    editBox.placeholderLabel = placeholderLabel;
    if (multiline) editBox.inputMode = EditBox.InputMode.ANY;
    node.on("editing-did-began", () => { focusRing.active = true; });
    node.on("editing-did-ended", () => { focusRing.active = false; });
    if (height >= 100) {
      const count = this.label(node, `${name}Count`, "", width / 2 - 56, -height / 2 + 17,
        96, 24, 13, "homeTextMuted");
      const refresh = (): void => { count.string = `${editBox.string.length}/${maxLength}`; };
      node.on("text-changed", refresh);
      refresh();
    }
    return { node, backgroundNode, background, editBox, textLabel, placeholderLabel };
  }

  actionButton(parent: Node, name: string, title: string, subtitle: string, fallbackIcon: string,
    x: number, y: number, width: number, height: number, handler: () => void, kind: PreGameActionKind,
    visualKey?: HomeVisualSlotKey): PreGameActionButtonRef {
    const node = this.node(parent, name, x, y, width, height);
    const radius = Math.min(22, height / 2);
    const baseColor = this.color(this.actionToken(kind));
    const textToken: ThemeColorToken = kind === "surface" ? "homeText" : "homeTextOnColor";
    const strokeToken: ThemeColorToken = kind === "surface" ? "homeCardBorder" : "homeTextOnColor";
    const background = this.addRoundedBackground(
      node,
      width,
      height,
      radius,
      this.actionToken(kind),
      strokeToken
    );
    background.lineWidth = 2;
    const skinNode = this.node(node, `${name}Skin`, 0, 0, width, height);
    const skin = skinNode.addComponent(Sprite);
    skin.type = Sprite.Type.SLICED;
    skin.sizeMode = Sprite.SizeMode.CUSTOM;
    skinNode.active = false;
    this.addHighlight(node, `${name}Highlight`, width - 22, height, radius);

    const compact=width<120;
    const iconSize = compact?24:Math.max(36, Math.min(height * 0.56, width * 0.18, 56));
    const iconInset = compact?12:Math.max(18, Math.min(24, width * 0.07));
    const iconSlot = this.node(
      node,
      `${name}IconSlot`,
      -width / 2 + iconInset + iconSize / 2,
      0,
      iconSize,
      iconSize
    );
    const iconLabel = this.label(
      iconSlot,
      `${name}IconFallback`,
      fallbackIcon,
      0,
      0,
      iconSize,
      iconSize,
      Math.min(34, iconSize * 0.5),
      textToken
    );
    let iconSprite: Sprite | null = null;
    if (visualKey) {
      iconLabel.node.active = false;
      iconSprite = this.visualSlot(iconSlot, visualKey, 0, 0, iconSize, iconSize, textToken).sprite;
    }

    const textLeft = -width / 2 + iconInset + iconSize + (compact?8:12);
    const textWidth = Math.max(40, width - (textLeft + width / 2) - (compact?8:24));
    const titleY = subtitle ? (height >= 120 ? 24 : height >= 96 ? 20 : height>=90?18:16) : 0;
    const titleFontSize = height >= 120 ? 38 : height >= 96 ? 31 : height >= 80 ? 27 : 24;
    const titleLabel = this.label(
      node,
      `${name}Title`,
      title,
      textLeft + textWidth / 2,
      titleY,
      textWidth,
      subtitle ? height * 0.4 : height * 0.7,
      titleFontSize,
      textToken
    );
    if (kind !== "surface") {
      titleLabel.enableOutline = true;
      titleLabel.outlineColor = this.darken(baseColor, 0.42);
      titleLabel.outlineWidth = height >= 100 ? 3 : 2;
    }
    const subtitleLabel = subtitle
      ? this.label(
          node,
          `${name}Subtitle`,
          subtitle,
          textLeft + textWidth / 2,
          -height/4,
          textWidth,
          height * 0.3,
          height >= 100 ? 17 : 15,
          textToken
        )
      : null;
    if (subtitleLabel && kind !== "surface") {
      subtitleLabel.enableOutline = true;
      subtitleLabel.outlineColor = this.darken(baseColor, 0.4);
      subtitleLabel.outlineWidth = 1;
    }

    const button = node.addComponent(Button);
    const visual = node.addComponent(RuntimeButtonVisual);
    visual.configure(
      button,
      background,
      width,
      height,
      radius,
      baseColor,
      this.darken(baseColor, 0.14),
      this.color("disabled")
    );
    visual.setContent(
      [iconSlot, titleLabel.node, ...(subtitleLabel ? [subtitleLabel.node] : [])],
      [iconLabel, titleLabel, ...(subtitleLabel ? [subtitleLabel] : [])],
      iconSprite ? [iconSprite] : []
    );
    const skinKey = this.buttonSkinKey(kind);
    if (skinKey) {
      void homeArt.loadButtonSkin(skinKey).then((frame) => {
        if (!node.active) return;
        const skinDensity = 2;
        frame.insetLeft = 28 * skinDensity;
        frame.insetRight = frame.insetLeft;
        frame.insetTop = 28 * skinDensity;
        frame.insetBottom = frame.insetTop;
        skin.spriteFrame = frame;
        skin.sizeMode = Sprite.SizeMode.CUSTOM;
        skinNode.active = true;
        background.enabled = false;
        visual.setSkin(skin, skinDensity);
      }).catch(() => undefined);
    }
    this.bindButton(node, button, visual, handler);
    return { node, button, label: titleLabel, background, visual, iconSlot, iconLabel, titleLabel, subtitleLabel };
  }

  iconButton(parent: Node, name: string, fallbackIcon: string, x: number, y: number, size: number,
    handler: () => void, visualKey?: HomeVisualSlotKey, backgroundStyle: PreGameIconBackground = "card",
    iconSizeOverride = 0): PreGameActionButtonRef {
    const node = this.node(parent, name, x, y, size, size);
    const radius=size/2;
    const fillToken: ThemeColorToken = backgroundStyle === "join" ? "homeJoin" : "homeCard";
    const textToken: ThemeColorToken = backgroundStyle === "join" ? "homeTextOnColor" : "homeText";
    const baseColor = this.color(fillToken);
    const background = this.addRoundedBackground(
      node,
      size,
      size,
      radius,
      fillToken,
      backgroundStyle === "join" ? "homeTextOnColor" : "homeCardBorder"
    );
    background.enabled=backgroundStyle!=="transparent";
    this.addHighlight(node, `${name}Highlight`, size/2-4, size, radius);
    const iconSize = iconSizeOverride > 0
      ? Math.max(32, Math.min(iconSizeOverride, size - 8))
      : Math.max(32, Math.min(size * 0.6, size - 28, 48));
    const iconSlot = this.node(node, `${name}IconSlot`, 0, 0, iconSize, iconSize);
    const iconLabel = this.label(
      iconSlot,
      `${name}IconFallback`,
      fallbackIcon,
      0,
      0,
      iconSize,
      iconSize,
      Math.min(34, size * 0.46),
      textToken
    );
    let iconSprite: Sprite | null = null;
    if (visualKey) {
      iconLabel.node.active = false;
      iconSprite = this.visualSlot(iconSlot, visualKey, 0, 0, iconSize, iconSize, textToken).sprite;
    }
    const button = node.addComponent(Button);
    const visual = node.addComponent(RuntimeButtonVisual);
    visual.configure(
      button,
      background,
      size,
      size,
      radius,
      baseColor,
      this.darken(baseColor, 0.08),
      this.color("disabled")
    );
    visual.setContent([iconSlot], [iconLabel], iconSprite ? [iconSprite] : []);
    this.bindButton(node, button, visual, handler);
    return {
      node,
      button,
      label: iconLabel,
      background,
      visual,
      iconSlot,
      iconLabel,
      titleLabel: iconLabel,
      subtitleLabel: null
    };
  }

  modal(parent: Node, name: string, panelWidth: number, panelHeight: number): PreGameModalRef {
    const viewportHeight = parent.getComponent(UITransform)?.height || getPortraitViewportHeight();
    const root = this.node(parent, name, 0, 0, DESIGN_WIDTH, viewportHeight);
    root.active = false;
    root.addComponent(BlockInputEvents);
    const shade = this.node(root, `${name}Shade`, 0, 0, DESIGN_WIDTH, viewportHeight);
    const shadeGraphics = shade.addComponent(Graphics);
    shadeGraphics.fillColor = this.color("homeModalShade");
    shadeGraphics.roundRect(-DESIGN_WIDTH / 2, -viewportHeight / 2, DESIGN_WIDTH, viewportHeight, 0);
    shadeGraphics.fill();
    const panel = this.card(root, `${name}Panel`, 0, 0, panelWidth, panelHeight, 20);
    const content = this.node(panel, `${name}Content`, 0, 0, panelWidth - 36, panelHeight - 36);
    return { root, shade, panel, content };
  }

  label(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fontSize: number,
    colorToken: ThemeColorToken = "homeText",
    horizontalAlign = 1
  ): Label {
    const node = this.node(parent, name, x, y, width, height);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = Math.max(12, Math.round(fontSize));
    label.lineHeight = Math.max(label.fontSize + 4, Math.round(label.fontSize * 1.2));
    label.color = this.color(colorToken);
    label.horizontalAlign = horizontalAlign;
    label.verticalAlign = 1;
    label.enableWrapText = true;
    label.overflow = Label.Overflow.SHRINK;
    return label;
  }

  color(token: ThemeColorToken): Color {
    const [r, g, b, a] = parseThemeColor(this.theme.colors[token]);
    return new Color(r, g, b, a);
  }

  private node(parent: Node, name: string, x: number, y: number, width: number, height: number): Node {
    const node = new Node(name);
    node.layer = UI_LAYER;
    parent.addChild(node);
    node.setPosition(x, y, 0);
    node.addComponent(UITransform).setContentSize(width, height);
    return node;
  }

  private addRoundedBackground(
    node: Node,
    width: number,
    height: number,
    radius: number,
    fillToken: ThemeColorToken,
    strokeToken: ThemeColorToken
  ): Graphics {
    const graphics = node.addComponent(Graphics);
    const fillColor = this.color(fillToken);
    graphics.fillColor = new Color(24, 42, 56, 36);
    graphics.roundRect(
      -width / 2,
      -height / 2 - 4,
      width,
      height,
      Math.min(radius, width / 2, height / 2)
    );
    graphics.fill();
    graphics.fillColor = fillColor;
    graphics.strokeColor = this.color(strokeToken);
    graphics.lineWidth = 2;
    graphics.roundRect(-width / 2, -height / 2, width, height, Math.min(radius, width / 2, height / 2));
    graphics.fill();
    graphics.stroke();
    return graphics;
  }

  private addHighlight(parent: Node, name: string, width: number, height: number, radius: number,
    topInset = 7): Node {
    const highlight = this.node(parent, name, 0, height / 2 - topInset, width, 4);
    const graphics = highlight.addComponent(Graphics);
    graphics.fillColor = new Color(255, 255, 255, 88);
    graphics.roundRect(-width / 2, -2, width, 4, Math.min(2, radius));
    graphics.fill();
    return highlight;
  }

  private addInnerBorder(parent: Node, name: string, width: number, height: number, radius: number): Node {
    const inset = 6;
    const inner = this.node(parent, name, 0, 1, width - inset * 2, height - inset * 2);
    const graphics = inner.addComponent(Graphics);
    graphics.strokeColor = new Color(255, 255, 255, 112);
    graphics.lineWidth = 1;
    graphics.roundRect(
      -(width - inset * 2) / 2,
      -(height - inset * 2) / 2,
      width - inset * 2,
      height - inset * 2,
      Math.max(4, Math.min(radius - 3, (width - inset * 2) / 2, (height - inset * 2) / 2))
    );
    graphics.stroke();
    return inner;
  }

  private bindButton(
    node: Node,
    button: Button,
    visual: RuntimeButtonVisual,
    handler: () => void
  ): void {
    node.on(Node.EventType.TOUCH_START, () => visual.setPressed(true), this);
    node.on(Node.EventType.TOUCH_END, () => visual.setPressed(false), this);
    node.on(Node.EventType.TOUCH_CANCEL, () => visual.setPressed(false), this);
    node.on(Button.EventType.CLICK, () => {
      if (button.interactable) handler();
    }, this);
  }

  private drawProgrammaticIcon(
    parent: Node,
    key: HomeVisualSlotKey,
    width: number,
    height: number,
    token: ThemeColorToken
  ): Node | null {
    if (key === "background" || key === "logo") return null;
    const stem = key.charAt(0).toUpperCase() + key.slice(1);
    const node = this.node(parent, `Home${stem}VectorIcon`, 0, 0, width, height);
    const graphics = node.addComponent(Graphics);
    const size = Math.min(width, height);
    const ink = this.color(token);
    graphics.fillColor = ink;
    graphics.strokeColor = ink;
    graphics.lineWidth = Math.max(2, Math.round(size * 0.055));

    const circle = (x: number, y: number, radius: number, fill = false): void => {
      graphics.circle(x * size, y * size, radius * size);
      fill ? graphics.fill() : graphics.stroke();
    };
    const ellipse = (x: number, y: number, rx: number, ry: number, fill = false): void => {
      graphics.ellipse(x * size, y * size, rx * size, ry * size);
      fill ? graphics.fill() : graphics.stroke();
    };
    const line = (...points: Array<[number, number]>): void => {
      if (!points.length) return;
      graphics.moveTo(points[0][0] * size, points[0][1] * size);
      points.slice(1).forEach(([x, y]) => graphics.lineTo(x * size, y * size));
      graphics.stroke();
    };

    if (key === "avatar") {
      graphics.fillColor = this.color("homeJoin");
      ellipse(0, -0.3, 0.34, 0.22, true);
      graphics.fillColor = this.color("homeCard");
      circle(0, 0.12, 0.25, true);
      circle(0, 0.12, 0.25);
      return node;
    }
    if (key === "coin") {
      graphics.fillColor = this.color("homeHistory");
      circle(0, 0, 0.39, true);
      circle(0, 0, 0.39);
      const star: Array<[number, number]> = [];
      for (let index = 0; index < 10; index += 1) {
        const angle = Math.PI / 2 + index * Math.PI / 5;
        const radius = index % 2 === 0 ? 0.22 : 0.1;
        star.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
      }
      line(...star, star[0]);
      return node;
    }
    if (key === "character") {
      graphics.fillColor = this.color("homeCard");
      ellipse(-0.14, 0.33, 0.1, 0.25, true);
      ellipse(0.14, 0.33, 0.1, 0.25, true);
      circle(0, 0.08, 0.3, true);
      ellipse(0, -0.31, 0.3, 0.24, true);
      graphics.fillColor = ink;
      circle(-0.1, 0.12, 0.025, true);
      circle(0.1, 0.12, 0.025, true);
      line([-0.06, 0], [0, -0.04], [0.06, 0]);
      return node;
    }
    if (key === "createRoom") {
      line([-0.38, 0.02], [0, 0.35], [0.38, 0.02]);
      graphics.roundRect(-size * 0.3, -size * 0.34, size * 0.6, size * 0.39, size * 0.04);
      graphics.stroke();
      graphics.roundRect(-size * 0.08, -size * 0.34, size * 0.16, size * 0.24, size * 0.02);
      graphics.stroke();
      return node;
    }
    if (key === "joinRoom") {
      circle(-0.16, 0.16, 0.16);
      circle(0.18, 0.2, 0.13);
      ellipse(-0.16, -0.22, 0.27, 0.17);
      ellipse(0.2, -0.2, 0.22, 0.14);
      return node;
    }
    if (key === "practice") {
      line([-0.38, 0.27], [-0.04, 0.2], [-0.04, -0.32], [-0.38, -0.23], [-0.38, 0.27]);
      line([0.38, 0.27], [0.04, 0.2], [0.04, -0.32], [0.38, -0.23], [0.38, 0.27]);
      return node;
    }
    if (key === "wordBank") {
      [-0.24, 0, 0.24].forEach((y, index) => {
        graphics.roundRect(-size * (index === 1 ? 0.34 : 0.3), size * y - size * 0.08, size * 0.64, size * 0.16, size * 0.04);
        graphics.stroke();
      });
      return node;
    }
    if (key === "catalog") {
      ellipse(0, -0.02, 0.4, 0.27);
      line([-0.22, 0.02], [-0.08, 0.02]);
      line([-0.15, -0.05], [-0.15, 0.09]);
      circle(0.16, 0.04, 0.035, true);
      circle(0.27, -0.05, 0.035, true);
      return node;
    }
    if (key === "history") {
      line([-0.28, 0.3], [-0.21, -0.02], [0, -0.16], [0.21, -0.02], [0.28, 0.3], [-0.28, 0.3]);
      line([-0.28, 0.22], [-0.42, 0.18], [-0.32, -0.06], [-0.18, -0.08]);
      line([0.28, 0.22], [0.42, 0.18], [0.32, -0.06], [0.18, -0.08]);
      line([0, -0.16], [0, -0.34]);
      line([-0.2, -0.35], [0.2, -0.35]);
      return node;
    }
    if (key === "settings") {
      circle(0, 0, 0.2);
      for (let index = 0; index < 8; index += 1) {
        const angle = index * Math.PI / 4;
        line(
          [Math.cos(angle) * 0.27, Math.sin(angle) * 0.27],
          [Math.cos(angle) * 0.42, Math.sin(angle) * 0.42]
        );
      }
      return node;
    }
    if (key === "privacy") {
      line([-0.32, 0.3], [0, 0.4], [0.32, 0.3], [0.27, -0.16], [0, -0.4], [-0.27, -0.16], [-0.32, 0.3]);
      line([-0.15, -0.02], [-0.03, -0.14], [0.18, 0.12]);
      return node;
    }
    if (key === "feedback") {
      graphics.roundRect(-size * 0.38, -size * 0.24, size * 0.76, size * 0.54, size * 0.12);
      graphics.stroke();
      line([-0.18, -0.24], [-0.3, -0.4], [0.02, -0.24]);
      [-0.17, 0, 0.17].forEach((x) => circle(x, 0.03, 0.03, true));
      return node;
    }
    return null;
  }

  private drawProgrammaticLogo(parent: Node, width: number, height: number): Node {
    const node = this.node(parent, "HomeLogoProgrammatic", 0, 0, width, height);
    const colors = [
      new Color(255, 178, 60),
      new Color(255, 216, 74),
      new Color(58, 139, 255),
      new Color(76, 201, 107)
    ];
    ["词", "斗", "乐", "园"].forEach((character, index) => {
      const label = this.label(
        node,
        `HomeLogoCharacter${index}`,
        character,
        (index - 1.5) * width * 0.22,
        index % 2 === 0 ? 2 : -2,
        width * 0.24,
        height * 0.9,
        Math.min(64, height * 0.62),
        "homeText"
      );
      label.color = colors[index];
    });
    return node;
  }

  private actionToken(kind: PreGameActionKind): ThemeColorToken {
    if (kind === "create") return "homeCreate";
    if (kind === "join") return "homeJoin";
    if (kind === "practice") return "homePractice";
    if (kind === "bank") return "homeBank";
    if (kind === "catalog") return "homeCatalog";
    if (kind === "history") return "homeHistory";
    return "homeCard";
  }

  private buttonSkinKey(kind: PreGameActionKind): HomeButtonSkinKey | null {
    if (kind === "create" || kind === "history") return "orange";
    if (kind === "join" || kind === "bank") return "blue";
    if (kind === "practice") return "green";
    if (kind === "catalog") return "purple";
    return null;
  }

  private darken(color: Color, amount: number): Color {
    const factor = Math.max(0, Math.min(1, 1 - amount));
    return new Color(
      Math.round(color.r * factor),
      Math.round(color.g * factor),
      Math.round(color.b * factor),
      color.a
    );
  }
}
