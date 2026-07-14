import { _decorator, Button, Color, Component, Graphics, Sprite, UITransform } from "cc";

const { ccclass } = _decorator;

@ccclass("RuntimeButtonVisual")
export class RuntimeButtonVisual extends Component {
  private button: Button | null = null;
  private background: Graphics | null = null;
  private skin: Sprite | null = null;
  private normalColor = new Color();
  private pressedColor = new Color();
  private disabledColor = new Color();
  private width = 0;
  private height = 0;
  private radius = 8;
  private lastInteractable: boolean | null = null;
  private pressed = false;

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

  setSkin(skin: Sprite | null): void {
    this.skin = skin;
    this.ensureSkinSize();
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
      ? (this.pressed ? this.pressedColor : this.normalColor)
      : this.disabledColor;
    this.background.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, this.radius);
    this.background.fill();
    if (this.skin) {
      const channel = interactable ? (this.pressed ? 220 : 255) : 158;
      this.skin.color = new Color(channel, channel, channel, interactable ? 255 : 210);
    }
  }

  isShowingDisabledState(): boolean {
    return this.lastInteractable === false;
  }

  getVisualGeometry(): { width: number; height: number; radius: number } {
    return { width: this.width, height: this.height, radius: this.radius };
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
    if (!transform || (transform.width === this.width && transform.height === this.height)) return;
    transform.setContentSize(this.width, this.height);
  }
}
