import { _decorator, Button, Color, Component, Graphics, Label, Node, Sprite, UITransform } from "cc";

const { ccclass } = _decorator;

@ccclass("RuntimeButtonVisual")
export class RuntimeButtonVisual extends Component {
  private button: Button | null = null;
  private background: Graphics | null = null;
  private skin: Sprite | null = null;
  private skinDensity = 1;
  private normalColor = new Color();
  private pressedColor = new Color();
  private disabledColor = new Color();
  private width = 0;
  private height = 0;
  private radius = 8;
  private lastInteractable: boolean | null = null;
  private pressed = false;
  private contentNodes: Node[] = [];
  private contentLabels: Label[] = [];
  private contentLabelColors: Color[] = [];
  private contentSprites: Sprite[] = [];
  private contentSpriteColors: Color[] = [];
  private contentOffsetY = 0;
  private contentTintMode: "normal" | "selected" | "disabled" = "normal";
  private selected = false;
  private selectedFillColor: Color | null = null;
  private selectedContentColor: Color | null = null;
  private selectionRing: Node | null = null;

  configure(
    button: Button,
    background: Graphics,
    width: number,
    height: number,
    radius: number,
    normalColor: Color,
    pressedColor: Color,
    disabledColor: Color
  ): void {
    this.button = button;
    this.background = background;
    this.width = width;
    this.height = height;
    this.radius = Math.max(0, Math.min(radius, width / 2, height / 2));
    this.normalColor = normalColor;
    this.pressedColor = pressedColor;
    this.disabledColor = disabledColor;
    this.refresh(true);
  }

  update(): void {
    this.refresh();
  }

  setSkin(skin: Sprite | null, density = 1): void {
    this.skin = skin;
    this.skinDensity = skin ? Math.max(1, density) : 1;
    this.ensureSkinSize();
    this.refresh(true);
  }

  setContent(nodes: readonly Node[], labels: readonly Label[] = [], sprites: readonly Sprite[] = []): void {
    this.contentNodes = [...nodes];
    this.contentLabels = [...labels];
    this.contentLabelColors = this.contentLabels.map((label) => this.copyColor(label.color));
    this.contentSprites = [...sprites];
    this.contentSpriteColors = this.contentSprites.map((sprite) => this.copyColor(sprite.color));
    this.contentOffsetY = 0;
    this.contentTintMode = "normal";
    this.refresh(true);
  }

  setSelectionStyle(fillColor: Color, strokeColor: Color, contentColor: Color): void {
    this.selectedFillColor = this.copyColor(fillColor);
    this.selectedContentColor = this.copyColor(contentColor);
    if (!this.selectionRing) {
      const inset = 4;
      const ring = new Node(`${this.node.name}SelectionRing`);
      ring.layer = this.node.layer;
      this.node.addChild(ring);
      ring.addComponent(UITransform).setContentSize(this.width, this.height);
      const graphics = ring.addComponent(Graphics);
      graphics.strokeColor = strokeColor;
      graphics.lineWidth = 4;
      graphics.roundRect(-this.width / 2 + inset, -this.height / 2 + inset,
        this.width - inset * 2, this.height - inset * 2, Math.max(0, this.radius - inset));
      graphics.stroke();
      ring.active = false;
      this.selectionRing = ring;
    }
    this.refresh(true);
  }

  setSelected(selected: boolean): void {
    const next = !!selected;
    if (next === this.selected) return;
    this.selected = next;
    this.refresh(true);
  }

  refresh(force = false): void {
    if (!this.button || !this.background) return;
    this.ensureSkinSize();
    const interactable = this.button.interactable;
    if (!force && interactable === this.lastInteractable) return;
    this.lastInteractable = interactable;
    if (!interactable) this.pressed = false;
    this.background.clear();
    this.background.fillColor = new Color(24, 42, 56, interactable ? 42 : 24);
    const shadowOffset = this.pressed ? -1 : -4;
    this.background.roundRect(
      -this.width / 2,
      -this.height / 2 + shadowOffset,
      this.width,
      this.height,
      this.radius
    );
    this.background.fill();
    this.background.fillColor = interactable
      ? (this.pressed
          ? this.pressedColor
          : (this.selected && this.selectedFillColor ? this.selectedFillColor : this.normalColor))
      : this.disabledColor;
    this.background.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, this.radius);
    this.background.fill();
    if (this.skin) {
      const channel = interactable ? (this.pressed ? 220 : 255) : 158;
      this.skin.color = new Color(channel, channel, channel, interactable ? 255 : 210);
    }
    if (this.selectionRing) this.selectionRing.active = this.selected && interactable;
    this.refreshContent(interactable);
  }

  isShowingDisabledState(): boolean {
    return this.lastInteractable === false;
  }

  getVisualGeometry(): { width: number; height: number; radius: number } {
    return { width: this.width, height: this.height, radius: this.radius };
  }

  getContentOffsetY(): number {
    return this.contentOffsetY;
  }

  isShowingSelectedState(): boolean {
    return this.selected && this.lastInteractable === true;
  }

  setPressed(pressed: boolean): void {
    const next = !!pressed && !!this.button?.interactable;
    if (next === this.pressed) return;
    this.pressed = next;
    this.refresh(true);
  }

  private ensureSkinSize(): void {
    if (!this.skin) return;
    this.skin.sizeMode = Sprite.SizeMode.CUSTOM;
    const transform = this.skin.node.getComponent(UITransform);
    const targetW = this.width * this.skinDensity;
    const targetH = this.height * this.skinDensity;
    if (transform && (transform.width !== targetW || transform.height !== targetH)) {
      transform.setContentSize(targetW, targetH);
    }
    const scale = 1 / this.skinDensity;
    if (this.skin.node.scale.x !== scale || this.skin.node.scale.y !== scale) {
      this.skin.node.setScale(scale, scale, 1);
    }
  }

  private refreshContent(interactable: boolean): void {
    const nextOffsetY = this.pressed && interactable ? -2 : 0;
    if (nextOffsetY !== this.contentOffsetY) {
      this.contentNodes.forEach((node) => {
        node.setPosition(node.position.x, node.position.y - this.contentOffsetY + nextOffsetY, node.position.z);
      });
      this.contentOffsetY = nextOffsetY;
    }
    const nextTintMode = !interactable
      ? "disabled"
      : (this.selected && this.selectedContentColor ? "selected" : "normal");
    if (this.contentTintMode === "normal" && nextTintMode !== "normal") {
      this.contentLabelColors = this.contentLabels.map((label) => this.copyColor(label.color));
      this.contentSpriteColors = this.contentSprites.map((sprite) => this.copyColor(sprite.color));
    }
    if (nextTintMode === "disabled") {
      this.contentLabels.forEach((label, index) => {
        const base = this.contentLabelColors[index] || label.color;
        label.color = new Color(
          Math.round(base.r * 0.68 + this.disabledColor.r * 0.32),
          Math.round(base.g * 0.68 + this.disabledColor.g * 0.32),
          Math.round(base.b * 0.68 + this.disabledColor.b * 0.32),
          Math.min(base.a, 190)
        );
      });
      this.contentSprites.forEach((sprite, index) => {
        const base = this.contentSpriteColors[index] || sprite.color;
        sprite.color = new Color(
          Math.round(base.r * 0.72 + this.disabledColor.r * 0.28),
          Math.round(base.g * 0.72 + this.disabledColor.g * 0.28),
          Math.round(base.b * 0.72 + this.disabledColor.b * 0.28),
          Math.min(base.a, 184)
        );
      });
    } else if (nextTintMode === "selected" && this.selectedContentColor) {
      const tint = (base: Color): Color => new Color(
        this.selectedContentColor!.r, this.selectedContentColor!.g, this.selectedContentColor!.b,
        Math.min(base.a, this.selectedContentColor!.a)
      );
      this.contentLabels.forEach((label, index) => {
        label.color = tint(this.contentLabelColors[index] || label.color);
      });
      this.contentSprites.forEach((sprite, index) => {
        sprite.color = tint(this.contentSpriteColors[index] || sprite.color);
      });
    } else if (this.contentTintMode !== "normal") {
      this.contentLabels.forEach((label, index) => {
        label.color = this.copyColor(this.contentLabelColors[index] || label.color);
      });
      this.contentSprites.forEach((sprite, index) => {
        sprite.color = this.copyColor(this.contentSpriteColors[index] || sprite.color);
      });
    }
    this.contentTintMode = nextTintMode;
  }

  private copyColor(color: Color): Color {
    return new Color(color.r, color.g, color.b, color.a);
  }
}
