import {
  Button,
  Color,
  EditBox,
  Graphics,
  Label,
  Node,
  ResolutionPolicy,
  screen,
  UITransform,
  view
} from "cc";
import { parseThemeColor } from "../../themes/ThemeCatalog";
import type { ThemeColorToken, ThemeManifest } from "../../themes/ThemeTypes";
import { RuntimeButtonVisual } from "./RuntimeButtonVisual";

export const DESIGN_WIDTH = 640;
export const DESIGN_HEIGHT = 960;
export const MAX_PORTRAIT_VIEWPORT_HEIGHT = 1440;
const LEGACY_WIDTH = 960;
const LEGACY_HEIGHT = 640;
const X_SCALE = DESIGN_WIDTH / LEGACY_WIDTH;
const POSITION_Y_SCALE = DESIGN_HEIGHT / LEGACY_HEIGHT;
const SIZE_Y_SCALE = 1.15;
const FONT_SCALE = 0.92;
const UI_LAYER = 1 << 25;

export function configurePortraitViewport(): void {
  view.setDesignResolutionSize(DESIGN_WIDTH, DESIGN_HEIGHT, ResolutionPolicy.FIXED_WIDTH);
}

export function getPortraitViewportHeight(): number {
  const width = Number(screen.windowSize.width);
  const height = Number(screen.windowSize.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return DESIGN_HEIGHT;
  }
  return Math.max(
    DESIGN_HEIGHT,
    Math.min(MAX_PORTRAIT_VIEWPORT_HEIGHT, Math.round(DESIGN_WIDTH * height / width))
  );
}

export type RuntimeButtonKind = "primary" | "secondary" | "plain" | "danger";

export interface RuntimeButtonRef {
  node: Node;
  button: Button;
  label: Label;
  background: Graphics;
  visual: RuntimeButtonVisual;
}

export interface RuntimeEditRef {
  node: Node;
  backgroundNode: Node;
  background: Graphics;
  editBox: EditBox;
  textLabel: Label;
  placeholderLabel: Label;
}

export class RuntimeUi {
  constructor(readonly theme: ThemeManifest) {}

  root(parent: Node, name: string): Node {
    const node = new Node(name);
    node.layer = UI_LAYER;
    parent.addChild(node);
    node.setPosition(0, 0, 0);
    node.addComponent(UITransform).setContentSize(DESIGN_WIDTH, getPortraitViewportHeight());
    return node;
  }

  node(
    parent: Node,
    name: string,
    x: number,
    y: number,
    width = 0,
    height = 0
  ): Node {
    const node = new Node(name);
    node.layer = UI_LAYER;
    parent.addChild(node);
    node.setPosition(this.x(x), this.y(y), 0);
    if (width > 0 || height > 0) {
      node.addComponent(UITransform).setContentSize(this.width(width), this.height(height));
    }
    return node;
  }

  panel(
    parent: Node,
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fillToken: ThemeColorToken = "panel",
    strokeToken: ThemeColorToken = "panelBorder",
    radius = 8
  ): Node {
    const node = this.node(parent, name, x, y, width, height);
    const actualWidth = this.width(width);
    const actualHeight = this.height(height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = this.color(fillToken);
    graphics.strokeColor = this.color(strokeToken);
    graphics.lineWidth = 2;
    graphics.roundRect(
      -actualWidth / 2,
      -actualHeight / 2,
      actualWidth,
      actualHeight,
      Math.min(this.height(radius), actualHeight / 2)
    );
    graphics.fill();
    graphics.stroke();
    return node;
  }

  label(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fontSize = 24,
    colorToken: ThemeColorToken = "textPrimary",
    horizontalAlign = 1
  ): Label {
    const node = this.node(parent, name, x, y, width, height);
    const label = node.addComponent(Label);
    label.string = text;
    const actualFontSize = this.font(fontSize);
    label.fontSize = actualFontSize;
    label.lineHeight = Math.max(actualFontSize + 4, Math.round(actualFontSize * 1.25));
    label.color = this.color(colorToken);
    label.horizontalAlign = horizontalAlign;
    label.verticalAlign = 1;
    label.enableWrapText = true;
    label.overflow = Label.Overflow.SHRINK;
    return label;
  }

  button(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    handler: () => void,
    kind: RuntimeButtonKind = "primary",
    fontSize = 22
  ): RuntimeButtonRef {
    const node = this.node(parent, name, x, y, width, height);
    const actualWidth = this.width(width);
    const actualHeight = this.height(height);
    const background = node.addComponent(Graphics);
    background.fillColor = this.buttonColor(kind);
    background.roundRect(
      -actualWidth / 2,
      -actualHeight / 2,
      actualWidth,
      actualHeight,
      Math.min(this.height(8), actualHeight / 2)
    );
    background.fill();
    const label = this.label(
      node,
      `${name}Label`,
      text,
      0,
      0,
      Math.max(20, width - 16),
      Math.max(20, height - 6),
      fontSize,
      kind === "plain" || kind === "secondary" ? "textPrimary" : "keyFill"
    );
    const button = node.addComponent(Button);
    const visual = node.addComponent(RuntimeButtonVisual);
    visual.configure(
      button,
      background,
      actualWidth,
      actualHeight,
      Math.min(this.height(8), actualHeight / 2),
      this.buttonColor(kind),
      this.buttonPressedColor(kind),
      this.color("disabled")
    );
    node.on(Node.EventType.TOUCH_START, () => visual.setPressed(true), this);
    node.on(Node.EventType.TOUCH_END, () => visual.setPressed(false), this);
    node.on(Node.EventType.TOUCH_CANCEL, () => visual.setPressed(false), this);
    node.on(Button.EventType.CLICK, () => {
      if (button.interactable) handler();
    }, this);
    return { node, button, label, background, visual };
  }

  edit(
    parent: Node,
    name: string,
    placeholder: string,
    x: number,
    y: number,
    width: number,
    height: number,
    maxLength: number,
    multiline = false
  ): RuntimeEditRef {
    const node = this.node(parent, name, x, y, width, height);
    const backgroundNode = this.panel(
      node,
      `${name}Background`,
      0,
      0,
      width,
      height,
      "panel",
      "panelBorder",
      6
    );
    const background = backgroundNode.getComponent(Graphics);
    if (!background) throw new Error(`Edit background was not created: ${name}`);
    const textLabel = this.label(
      node,
      `${name}Text`,
      "",
      0,
      0,
      width - 28,
      height - 12,
      21,
      "textPrimary",
      0
    );
    const placeholderLabel = this.label(
      node,
      `${name}Placeholder`,
      placeholder,
      0,
      0,
      width - 28,
      height - 12,
      20,
      "textMuted",
      0
    );
    const editBox = node.addComponent(EditBox);
    editBox.string = "";
    editBox.placeholder = placeholder;
    editBox.maxLength = maxLength;
    editBox.textLabel = textLabel;
    editBox.placeholderLabel = placeholderLabel;
    if (multiline) editBox.inputMode = EditBox.InputMode.ANY;
    return { node, backgroundNode, background, editBox, textLabel, placeholderLabel };
  }

  title(parent: Node, text: string): Label {
    return this.label(parent, "ScreenTitle", text, 0, 278, 760, 52, 34, "textPrimary");
  }

  backButton(parent: Node, handler: () => void): RuntimeButtonRef {
    return this.button(parent, "BackButton", "←", -420, 278, 62, 48, handler, "plain", 30);
  }

  color(token: ThemeColorToken): Color {
    const [r, g, b, a] = parseThemeColor(this.theme.colors[token]);
    return new Color(r, g, b, a);
  }

  private x(value: number): number {
    return Math.round(value * X_SCALE);
  }

  private y(value: number): number {
    return Math.round(value * POSITION_Y_SCALE);
  }

  private width(value: number): number {
    return Math.max(1, Math.round(value * X_SCALE));
  }

  private height(value: number): number {
    return Math.max(1, Math.round(value * SIZE_Y_SCALE));
  }

  private font(value: number): number {
    return Math.max(12, Math.round(value * FONT_SCALE));
  }

  private buttonPressedColor(kind: RuntimeButtonKind): Color {
    if (kind === "plain") return this.color("panelBorder");
    if (kind === "danger") return this.color("error");
    return this.color("primaryPressed");
  }

  private buttonColor(kind: RuntimeButtonKind): Color {
    if (kind === "secondary") return this.color("secondary");
    if (kind === "plain") return this.color("panel");
    if (kind === "danger") return this.color("error");
    return this.color("primary");
  }
}
