declare module "cc" {
  export class Node {
    static readonly EventType: {
      TOUCH_START: string;
      TOUCH_END: string;
      TOUCH_CANCEL: string;
    };
    constructor(name?: string);
    name: string;
    active: boolean;
    layer: number;
    position: Vec3;
    scale: Vec3;
    readonly children: Node[];
    addChild(child: Node): void;
    getChildByName(name: string): Node | null;
    addComponent<T>(type: new (...args: any[]) => T): T;
    getComponent<T>(type: new (...args: any[]) => T): T | null;
    setPosition(x: number, y: number, z?: number): void;
    setScale(x: number, y: number, z?: number): void;
    on(type: string, callback: (...args: any[]) => void, target?: unknown): void;
    emit(type: string, ...args: any[]): void;
    destroy(): boolean;
  }

  export class Component {
    node: Node;
    enabled: boolean;
    onLoad?(): void;
    start?(): void;
    onDestroy?(): void;
    update?(deltaTime: number): void;
  }

  export class Label {
    static readonly Overflow: {
      NONE: number;
      CLAMP: number;
      SHRINK: number;
      RESIZE_HEIGHT: number;
    };
    node: Node;
    string: string;
    fontSize: number;
    lineHeight: number;
    color: Color;
    horizontalAlign: number;
    verticalAlign: number;
    enableWrapText: boolean;
    overflow: number;
    enableOutline: boolean;
    outlineColor: Color;
    outlineWidth: number;
  }

  export class UITransform {
    width: number;
    height: number;
    anchorX: number;
    anchorY: number;
    setContentSize(width: number, height: number): void;
  }

  export class Color {
    constructor(r?: number, g?: number, b?: number, a?: number);
    r: number;
    g: number;
    b: number;
    a: number;
  }

  export class BlockInputEvents extends Component {}

  export class Asset {}

  export class SpriteFrame extends Asset {
    insetLeft: number;
    insetRight: number;
    insetTop: number;
    insetBottom: number;
  }

  export class Sprite {
    static readonly Type: {
      SIMPLE: number;
      SLICED: number;
    };
    static readonly SizeMode: {
      CUSTOM: number;
    };
    node: Node;
    spriteFrame: SpriteFrame | null;
    color: Color;
    type: number;
    sizeMode: number;
  }

  export class Graphics {
    enabled: boolean;
    fillColor: Color;
    strokeColor: Color;
    lineWidth: number;
    roundRect(x: number, y: number, width: number, height: number, radius: number): void;
    circle(cx: number, cy: number, radius: number): void;
    ellipse(cx: number, cy: number, radiusX: number, radiusY: number): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    close(): void;
    fill(): void;
    stroke(): void;
    clear(): void;
  }

  export class Button extends Component {
    static readonly EventType: {
      CLICK: string;
    };
    interactable: boolean;
  }

  export class Vec3 {
    x: number;
    y: number;
    z: number;
  }

  export const ResolutionPolicy: {
    FIXED_WIDTH: number;
  };

  export const screen: {
    windowSize: {
      width: number;
      height: number;
    };
  };

  export const view: {
    setDesignResolutionSize(width: number, height: number, resolutionPolicy: number): void;
  };

  export class EditBox extends Component {
    static readonly InputMode: {
      ANY: number;
      SINGLE_LINE: number;
    };
    string: string;
    placeholder: string;
    maxLength: number;
    inputMode: number;
    textLabel: Label | null;
    placeholderLabel: Label | null;
  }

  export const director: {
    getScene(): Node | null;
    loadScene(name: string, onLaunched?: (err?: Error | null) => void): void;
  };

  export namespace AssetManager {
    class Bundle {
      load<T extends Asset>(
        path: string,
        type: new (...args: any[]) => T,
        callback: (error: Error | null, asset?: T) => void
      ): void;
    }
  }

  export const assetManager: {
    getBundle(name: string): AssetManager.Bundle | null;
    loadBundle(
      name: string,
      callback: (error: Error | null, bundle?: AssetManager.Bundle) => void
    ): void;
  };

  export const _decorator: {
    ccclass(name?: string): ClassDecorator;
    property(type?: unknown): PropertyDecorator;
  };
}

declare module "cc/env" {
  export const DEV: boolean;
  export const DEBUG: boolean;
}
