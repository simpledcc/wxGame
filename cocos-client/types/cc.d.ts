declare module "cc" {
  export class Node {
    constructor(name?: string);
    name: string;
    active: boolean;
    layer: number;
    position: Vec3;
    addChild(child: Node): void;
    addComponent<T>(type: new (...args: any[]) => T): T;
    getComponent<T>(type: new (...args: any[]) => T): T | null;
    setPosition(x: number, y: number, z?: number): void;
    on(type: string, callback: (...args: any[]) => void, target?: unknown): void;
    destroy(): boolean;
  }

  export class Component {
    node: Node;
    onLoad?(): void;
    start?(): void;
    onDestroy?(): void;
    update?(deltaTime: number): void;
  }

  export class Label {
    node: Node;
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

  export class Asset {}

  export class SpriteFrame extends Asset {}

  export class Sprite {
    spriteFrame: SpriteFrame | null;
    color: Color;
  }

  export class Graphics {
    fillColor: Color;
    strokeColor: Color;
    lineWidth: number;
    roundRect(x: number, y: number, width: number, height: number, radius: number): void;
    fill(): void;
    stroke(): void;
    clear(): void;
  }

  export class Button {
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

  export class EditBox {
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
