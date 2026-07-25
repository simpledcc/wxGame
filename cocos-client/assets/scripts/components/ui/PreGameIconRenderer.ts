import { Color, Graphics, Label, Node } from "cc";
import type { ThemeColorToken } from "../../themes/ThemeTypes";
import type { HomeVisualSlotKey } from "./HomeVisualTypes";

interface IconRendererHost {
  node(parent: Node, name: string, x: number, y: number, width: number, height: number): Node;
  label(
    parent: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fontSize: number,
    colorToken?: ThemeColorToken
  ): Label;
  color(token: ThemeColorToken): Color;
}

export class PreGameIconRenderer {
  constructor(private readonly host: IconRendererHost) {}

  drawIcon(
    parent: Node,
    key: HomeVisualSlotKey,
    width: number,
    height: number,
    token: ThemeColorToken
  ): Node | null {
    if (key === "background" || key === "logo") return null;
    const stem = key.charAt(0).toUpperCase() + key.slice(1);
    const node = this.host.node(parent, `Home${stem}VectorIcon`, 0, 0, width, height);
    const graphics = node.addComponent(Graphics);
    const size = Math.min(width, height);
    const ink = this.host.color(token);
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
      graphics.fillColor = this.host.color("homeJoin");
      ellipse(0, -0.3, 0.34, 0.22, true);
      graphics.fillColor = this.host.color("homeCard");
      circle(0, 0.12, 0.25, true);
      circle(0, 0.12, 0.25);
      return node;
    }
    if (key === "coin") {
      graphics.fillColor = this.host.color("homeHistory");
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
      graphics.fillColor = this.host.color("homeCard");
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

  drawLogo(parent: Node, width: number, height: number): Node {
    const node = this.host.node(parent, "HomeLogoProgrammatic", 0, 0, width, height);
    const colors = [
      new Color(255, 178, 60),
      new Color(255, 216, 74),
      new Color(58, 139, 255),
      new Color(76, 201, 107)
    ];
    ["词", "斗", "乐", "园"].forEach((character, index) => {
      const label = this.host.label(
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
}
