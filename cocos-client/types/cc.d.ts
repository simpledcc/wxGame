declare module "cc" {
  export class Node {
    constructor(name?: string);
    name: string;
    active: boolean;
    addChild(child: Node): void;
    addComponent<T>(type: new (...args: any[]) => T): T;
    getComponent<T>(type: new (...args: any[]) => T): T | null;
    setPosition(x: number, y: number, z?: number): void;
    on(type: string, callback: (...args: any[]) => void, target?: unknown): void;
  }

  export class Component {
    node: Node;
    onLoad?(): void;
    start?(): void;
  }

  export class Label {
    string: string;
    fontSize: number;
    lineHeight: number;
    color: Color;
    horizontalAlign: number;
    verticalAlign: number;
    enableWrapText: boolean;
  }

  export class UITransform {
    setContentSize(width: number, height: number): void;
  }

  export class Color {
    constructor(r?: number, g?: number, b?: number, a?: number);
  }

  export class Graphics {
    fillColor: Color;
    roundRect(x: number, y: number, width: number, height: number, radius: number): void;
    fill(): void;
  }

  export class Button {
    static readonly EventType: {
      CLICK: string;
    };
    interactable: boolean;
  }

  export const director: {
    loadScene(name: string, onLaunched?: (err?: Error | null) => void): void;
  };

  export const _decorator: {
    ccclass(name?: string): ClassDecorator;
    property(type?: unknown): PropertyDecorator;
  };
}
