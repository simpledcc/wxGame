import { _decorator, Color, Component, Graphics } from "cc";
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
    graphics.moveTo(86, 0);
    graphics.lineTo(122, 25);
    graphics.lineTo(122, -25);
    graphics.close();
    graphics.ellipse(-12, 0, 108, 27);
    graphics.fill();
    graphics.stroke();
  }

  private drawInsect(graphics: Graphics): void {
    graphics.roundRect(-116, -27, 232, 54, 26);
    graphics.fill();
    graphics.moveTo(-44, -24);
    graphics.lineTo(-44, 24);
    graphics.moveTo(42, -24);
    graphics.lineTo(42, 24);
    graphics.moveTo(-88, 22);
    graphics.lineTo(-110, 38);
    graphics.moveTo(-72, 25);
    graphics.lineTo(-82, 43);
    graphics.stroke();
  }
}
