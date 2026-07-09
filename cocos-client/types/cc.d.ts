declare module "cc" {
  export class Node {
    name: string;
    active: boolean;
    getComponent<T>(type: new (...args: any[]) => T): T | null;
  }

  export class Component {
    node: Node;
    onLoad?(): void;
    start?(): void;
  }

  export class Label {
    string: string;
  }

  export const director: {
    loadScene(name: string, onLaunched?: (err?: Error | null) => void): void;
  };

  export const _decorator: {
    ccclass(name?: string): ClassDecorator;
    property(type?: unknown): PropertyDecorator;
  };
}

