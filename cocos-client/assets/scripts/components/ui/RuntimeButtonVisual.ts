import { _decorator, Button, Color, Component, Graphics, Label, Node, Sprite, UITransform } from "cc";

const { ccclass } = _decorator;

@ccclass("RuntimeButtonVisual")
export class RuntimeButtonVisual extends Component {
  private button: Button | null = null;
  private background: Graphics | null = null;
  private skin: Sprite | null = null;
  private density = 1;
  private fill = new Color();
  private pressedFill = new Color();
  private disabledFill = new Color();
  private w = 0;
  private h = 0;
  private r = 8;
  private lastEnabled: boolean | null = null;
  private pressed = false;
  private content: Node[] = [];
  private labels: Label[] = [];
  private labelColors: Color[] = [];
  private sprites: Sprite[] = [];
  private spriteColors: Color[] = [];
  private contentY = 0;
  private tintMode: "normal" | "selected" | "disabled" = "normal";
  private selected = false;
  private selectedFill: Color | null = null;
  private selectedText: Color | null = null;
  private ring: Node | null = null;

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
    this.w = width;
    this.h = height;
    this.r = Math.max(0, Math.min(radius, width / 2, height / 2));
    this.fill = normalColor;
    this.pressedFill = pressedColor;
    this.disabledFill = disabledColor;
    this.refresh(true);
  }

  update(): void {
    this.refresh();
  }

  setSkin(skin: Sprite | null, density = 1): void {
    this.skin = skin;
    this.density = skin ? Math.max(1, density) : 1;
    this.ensureSkinSize();
    this.refresh(true);
  }

  setContent(nodes: readonly Node[], labels: readonly Label[] = [], sprites: readonly Sprite[] = []): void {
    this.content = [...nodes];
    this.labels = [...labels];
    this.labelColors = this.labels.map((label) => this.copyColor(label.color));
    this.sprites = [...sprites];
    this.spriteColors = this.sprites.map((sprite) => this.copyColor(sprite.color));
    this.contentY = 0;
    this.tintMode = "normal";
    this.refresh(true);
  }

  setSelectionStyle(fillColor: Color, strokeColor: Color, contentColor: Color): void {
    this.selectedFill = this.copyColor(fillColor);
    this.selectedText = this.copyColor(contentColor);
    if (!this.ring) {
      const inset = 4;
      const ring = new Node(`${this.node.name}SelectionRing`);
      ring.layer = this.node.layer;
      this.node.addChild(ring);
      ring.addComponent(UITransform).setContentSize(this.w, this.h);
      const graphics = ring.addComponent(Graphics);
      graphics.strokeColor = strokeColor;
      graphics.lineWidth = 4;
      graphics.roundRect(-this.w / 2 + inset, -this.h / 2 + inset,
        this.w - inset * 2, this.h - inset * 2, Math.max(0, this.r - inset));
      graphics.stroke();
      ring.active = false;
      this.ring = ring;
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
    const bg=this.background;
    if (!this.button || !bg) return;
    this.ensureSkinSize();
    const interactable = this.button.interactable;
    if (!force && interactable === this.lastEnabled) return;
    this.lastEnabled = interactable;
    if (!interactable) this.pressed = false;
    bg.clear();
    bg.fillColor = new Color(24, 42, 56, interactable ? 42 : 24);
    const shadowOffset = this.pressed ? -1 : -4;
    bg.roundRect(
      -this.w / 2,
      -this.h / 2 + shadowOffset,
      this.w,
      this.h,
      this.r
    );
    bg.fill();
    bg.fillColor = interactable
      ? (this.pressed
          ? this.pressedFill
          : (this.selected && this.selectedFill ? this.selectedFill : this.fill))
      : this.disabledFill;
    bg.roundRect(-this.w / 2, -this.h / 2, this.w, this.h, this.r);
    bg.fill();
    bg.stroke();
    if (this.skin) {
      const channel = interactable ? (this.pressed ? 220 : 255) : 158;
      this.skin.color = new Color(channel, channel, channel, interactable ? 255 : 210);
    }
    const highlight=this.node.getChildByName(`${this.node.name}Highlight`);
    if(highlight)highlight.active=interactable&&!this.pressed&&!this.skin;
    if (this.ring) this.ring.active = this.selected && interactable;
    this.refreshContent(interactable);
  }

  isShowingDisabledState(): boolean {
    return this.lastEnabled === false;
  }

  getVisualGeometry(): { width: number; height: number; radius: number } {
    return { width: this.w, height: this.h, radius: this.r };
  }

  isShowingSelectedState(): boolean {
    return this.selected && this.lastEnabled === true;
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
    const targetW = this.w * this.density;
    const targetH = this.h * this.density;
    if (transform && (transform.width !== targetW || transform.height !== targetH)) {
      transform.setContentSize(targetW, targetH);
    }
    const scale = 1 / this.density;
    if (this.skin.node.scale.x !== scale || this.skin.node.scale.y !== scale) {
      this.skin.node.setScale(scale, scale, 1);
    }
  }

  private refreshContent(interactable: boolean): void {
    const nextOffsetY = this.pressed && interactable ? -2 : 0;
    if (nextOffsetY !== this.contentY) {
      this.content.forEach((node) => {
        node.setPosition(node.position.x, node.position.y - this.contentY + nextOffsetY, node.position.z);
      });
      this.contentY = nextOffsetY;
    }
    const nextTintMode = !interactable
      ? "disabled"
      : (this.selected && this.selectedText ? "selected" : "normal");
    if (this.tintMode === "normal" && nextTintMode !== "normal") {
      this.labelColors = this.labels.map((label) => this.copyColor(label.color));
      this.spriteColors = this.sprites.map((sprite) => this.copyColor(sprite.color));
    }
    if (nextTintMode !== "normal" || this.tintMode !== "normal") {
      this.tint(this.labels, this.labelColors, nextTintMode, 0.68, 190);
      this.tint(this.sprites, this.spriteColors, nextTintMode, 0.72, 184);
    }
    this.tintMode = nextTintMode;
  }

  private tint(items: readonly { color: Color }[], colors: readonly Color[], mode: string,
    keep: number, alpha: number): void {
    items.forEach((item, index) => {
      const base = colors[index] || item.color;
      item.color = mode === "disabled"
        ? new Color(
            Math.round(base.r * keep + this.disabledFill.r * (1 - keep)),
            Math.round(base.g * keep + this.disabledFill.g * (1 - keep)),
            Math.round(base.b * keep + this.disabledFill.b * (1 - keep)),
            Math.min(base.a, alpha)
          )
        : mode === "selected" && this.selectedText
          ? new Color(this.selectedText.r, this.selectedText.g, this.selectedText.b,
              Math.min(base.a, this.selectedText.a))
          : this.copyColor(base);
    });
  }

  private copyColor(color: Color): Color {
    return new Color(color.r, color.g, color.b, color.a);
  }
}
