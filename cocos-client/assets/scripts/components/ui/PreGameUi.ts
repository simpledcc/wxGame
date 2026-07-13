import {
  BlockInputEvents,
  Button,
  Color,
  Graphics,
  Label,
  Node,
  Sprite,
  SpriteFrame,
  UITransform
} from "cc";
import { parseThemeColor } from "../../themes/ThemeCatalog";
import type { ThemeColorToken, ThemeManifest } from "../../themes/ThemeTypes";
import { DESIGN_HEIGHT, DESIGN_WIDTH, type RuntimeButtonRef } from "./RuntimeUi";
import { RuntimeButtonVisual } from "./RuntimeButtonVisual";

const UI_LAYER = 1 << 25;

export const PRE_GAME_SAFE_INSETS = Object.freeze({
  top: 40,
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

export class PreGameUi {
  constructor(readonly theme: ThemeManifest) {}

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
    return { key, width, height, node, spriteNode, sprite, fallbackNode, fallbackLabel, vectorNode };
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
    const width = DESIGN_WIDTH - PRE_GAME_SAFE_INSETS.left - PRE_GAME_SAFE_INSETS.right;
    const height = DESIGN_HEIGHT - PRE_GAME_SAFE_INSETS.top - PRE_GAME_SAFE_INSETS.bottom;
    const x = (PRE_GAME_SAFE_INSETS.left - PRE_GAME_SAFE_INSETS.right) / 2;
    const y = (PRE_GAME_SAFE_INSETS.bottom - PRE_GAME_SAFE_INSETS.top) / 2;
    return { node: this.node(parent, name, x, y, width, height), width, height };
  }

  topBar(parent: PreGameSafeAreaRef, name = "PreGameTopBar", height = 84): Node {
    return this.node(parent.node, name, 0, parent.height / 2 - height / 2, parent.width, height);
  }

  card(
    parent: Node,
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    radius = 18
  ): Node {
    const node = this.node(parent, name, x, y, width, height);
    this.addRoundedBackground(node, width, height, radius, "homeCard", "homeCardBorder");
    return node;
  }

  actionButton(
    parent: Node,
    name: string,
    title: string,
    subtitle: string,
    fallbackIcon: string,
    x: number,
    y: number,
    width: number,
    height: number,
    handler: () => void,
    kind: PreGameActionKind,
    visualKey?: HomeVisualSlotKey
  ): PreGameActionButtonRef {
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

    const iconSize = Math.max(44, Math.min(height - 20, width * 0.25));
    const iconSlot = this.node(node, `${name}IconSlot`, -width / 2 + 18 + iconSize / 2, 0, iconSize, iconSize);
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
    if (visualKey) {
      iconLabel.node.active = false;
      this.visualSlot(iconSlot, visualKey, 0, 0, iconSize, iconSize, textToken);
    }

    const textLeft = -width / 2 + 30 + iconSize;
    const textWidth = Math.max(40, width - (textLeft + width / 2) - 20);
    const titleY = subtitle ? 13 : 0;
    const titleLabel = this.label(
      node,
      `${name}Title`,
      title,
      textLeft + textWidth / 2,
      titleY,
      textWidth,
      subtitle ? height * 0.46 : height * 0.7,
      height >= 100 ? 30 : 24,
      textToken
    );
    const subtitleLabel = subtitle
      ? this.label(
          node,
          `${name}Subtitle`,
          subtitle,
          textLeft + textWidth / 2,
          -height * 0.24,
          textWidth,
          height * 0.3,
          15,
          textToken
        )
      : null;

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
    this.bindButton(node, button, visual, handler);
    return { node, button, label: titleLabel, background, visual, iconSlot, iconLabel, titleLabel, subtitleLabel };
  }

  iconButton(
    parent: Node,
    name: string,
    fallbackIcon: string,
    x: number,
    y: number,
    size: number,
    handler: () => void,
    visualKey?: HomeVisualSlotKey
  ): PreGameActionButtonRef {
    const node = this.node(parent, name, x, y, size, size);
    const radius = Math.min(18, size / 2);
    const baseColor = this.color("homeCard");
    const background = this.addRoundedBackground(
      node,
      size,
      size,
      radius,
      "homeCard",
      "homeCardBorder"
    );
    const iconSlot = this.node(node, `${name}IconSlot`, 0, 0, size - 14, size - 14);
    const iconLabel = this.label(
      iconSlot,
      `${name}IconFallback`,
      fallbackIcon,
      0,
      0,
      size - 14,
      size - 14,
      Math.min(30, size * 0.46),
      "homeText"
    );
    if (visualKey) {
      iconLabel.node.active = false;
      this.visualSlot(iconSlot, visualKey, 0, 0, size - 14, size - 14);
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

  modal(
    parent: Node,
    name: string,
    panelWidth: number,
    panelHeight: number
  ): PreGameModalRef {
    const root = this.node(parent, name, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    root.active = false;
    root.addComponent(BlockInputEvents);
    const shade = this.node(root, `${name}Shade`, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    const shadeGraphics = shade.addComponent(Graphics);
    shadeGraphics.fillColor = this.color("homeModalShade");
    shadeGraphics.roundRect(-DESIGN_WIDTH / 2, -DESIGN_HEIGHT / 2, DESIGN_WIDTH, DESIGN_HEIGHT, 0);
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
