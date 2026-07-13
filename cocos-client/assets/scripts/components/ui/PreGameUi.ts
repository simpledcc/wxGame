import {
  BlockInputEvents,
  Button,
  Color,
  Graphics,
  Label,
  Node,
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
    kind: PreGameActionKind
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
    handler: () => void
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
    graphics.fillColor = this.color(fillToken);
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
    node.on(Button.EventType.CLICK, handler, this);
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
