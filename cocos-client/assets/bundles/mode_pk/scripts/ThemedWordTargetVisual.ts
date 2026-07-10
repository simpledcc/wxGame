import { _decorator, Color, Component, Graphics, UITransform } from "cc";
import type { ThemeTargetStyle } from "../../../scripts/themes/ThemeTypes";

const { ccclass, property } = _decorator;

@ccclass("ThemedWordTargetVisual")
export class ThemedWordTargetVisual extends Component {
  @property(Graphics)
  graphics: Graphics | null = null;

  private style: ThemeTargetStyle = "insect";

  configure(style: ThemeTargetStyle, fillColor: Color, strokeColor: Color): void {
    this.style = style;
    const graphics = this.graphics;
    if (!graphics) return;
    graphics.clear();
    graphics.fillColor = fillColor;
    graphics.strokeColor = strokeColor;
    graphics.lineWidth = 3;
    if (style === "fish") this.drawFish(graphics);
    else this.drawInsect(graphics);
  }

  getStyle(): ThemeTargetStyle {
    return this.style;
  }

  private drawFish(graphics: Graphics): void {
    const { width, height } = this.getSize();
    graphics.moveTo(width * 0.28, 0);
    graphics.lineTo(width * 0.46, height * 0.34);
    graphics.lineTo(width * 0.46, -height * 0.34);
    graphics.close();
    graphics.ellipse(-width * 0.05, 0, width * 0.38, height * 0.34);
    graphics.fill();
    graphics.stroke();
  }

  private drawInsect(graphics: Graphics): void {
    const { width, height } = this.getSize();
    graphics.roundRect(-width / 2, -height / 2, width, height, height * 0.35);
    graphics.fill();
    graphics.moveTo(-width * 0.18, -height * 0.44);
    graphics.lineTo(-width * 0.18, height * 0.44);
    graphics.moveTo(width * 0.18, -height * 0.44);
    graphics.lineTo(width * 0.18, height * 0.44);
    graphics.moveTo(-width * 0.34, height * 0.34);
    graphics.lineTo(-width * 0.46, height * 0.58);
    graphics.moveTo(-width * 0.22, height * 0.42);
    graphics.lineTo(-width * 0.28, height * 0.64);
    graphics.stroke();
  }

  private getSize(): { width: number; height: number } {
    const transform = this.node.getComponent(UITransform);
    return {
      width: Math.max(1, transform?.width || 260),
      height: Math.max(1, transform?.height || 58)
    };
  }
}
