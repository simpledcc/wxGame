type Constructor<T> = new (...args: any[]) => T;

const startQueue: Component[] = [];

export function flushStartQueue(): void {
  while (startQueue.length) {
    const component = startQueue.shift();
    if (component?.node.active) component.start?.();
  }
}

export class Vec3 {
  constructor(public x = 0, public y = 0, public z = 0) {}
}

export const ResolutionPolicy = {
  FIXED_WIDTH: 4
};

export const screen = {
  windowSize: { width: 640, height: 960 }
};

export function setMockWindowSize(width: number, height: number): void {
  screen.windowSize = { width, height };
}

export const view = {
  designResolution: { width: 640, height: 960, policy: ResolutionPolicy.FIXED_WIDTH },
  setDesignResolutionSize(width: number, height: number, policy: number): void {
    this.designResolution = { width, height, policy };
  }
};

export class Component {
  node!: Node;
  enabled = true;
  onLoad?(): void;
  start?(): void;
  onDestroy?(): void;
  update?(_deltaTime: number): void;
}

export class BlockInputEvents extends Component {}

export class Node {
  static readonly EventType = {
    TOUCH_START: "touch-start",
    TOUCH_END: "touch-end",
    TOUCH_CANCEL: "touch-cancel"
  };
  active = true;
  private destroyed = false;
  layer = 0;
  position = new Vec3();
  parent: Node | null = null;
  readonly children: Node[] = [];
  private readonly components: Component[] = [];
  private readonly listeners = new Map<string, Array<(...args: unknown[]) => void>>();

  constructor(public name = "") {}

  addChild(child: Node): void {
    child.parent = this;
    this.children.push(child);
  }

  addComponent<T extends Component>(type: Constructor<T>): T {
    const component = new type();
    component.node = this;
    this.components.push(component);
    component.onLoad?.();
    if (component.start) startQueue.push(component);
    return component;
  }

  getComponent<T extends Component>(type: Constructor<T>): T | null {
    return (this.components.find((component) => component instanceof type) as T | undefined) || null;
  }

  getChildByName(name: string): Node | null {
    return this.children.find((child) => child.name === name) || null;
  }

  setPosition(x: number, y: number, z = 0): void {
    this.position = new Vec3(x, y, z);
  }

  on(type: string, callback: (...args: any[]) => void, target?: unknown): void {
    const handlers = this.listeners.get(type) || [];
    handlers.push((...args) => callback.apply(target, args));
    this.listeners.set(type, handlers);
  }

  emit(type: string, ...args: unknown[]): void {
    this.listeners.get(type)?.forEach((handler) => handler(...args));
  }

  destroy(): boolean {
    if (this.destroyed) return false;
    this.destroyed = true;
    this.active = false;
    this.children.slice().forEach((child) => child.destroy());
    this.components.slice().reverse().forEach((component) => component.onDestroy?.());
    if (this.parent) {
      const index = this.parent.children.indexOf(this);
      if (index >= 0) this.parent.children.splice(index, 1);
    }
    return true;
  }
}

export class Color {
  constructor(public r = 255, public g = 255, public b = 255, public a = 255) {}
}

export class UITransform extends Component {
  width = 0;
  height = 0;
  setContentSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}

export class Label extends Component {
  static readonly Overflow = {
    NONE: 0,
    CLAMP: 1,
    SHRINK: 2,
    RESIZE_HEIGHT: 3
  };
  string = "";
  fontSize = 20;
  lineHeight = 24;
  color = new Color();
  horizontalAlign = 1;
  verticalAlign = 1;
  enableWrapText = true;
  overflow = Label.Overflow.NONE;
}

export class Graphics extends Component {
  fillColor = new Color();
  strokeColor = new Color();
  lineWidth = 1;
  lastRoundRect: { x: number; y: number; width: number; height: number; radius: number } | null = null;
  roundRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.lastRoundRect = { x, y, width, height, radius };
  }
  circle(_cx: number, _cy: number, _radius: number): void {}
  ellipse(_cx: number, _cy: number, _radiusX: number, _radiusY: number): void {}
  moveTo(_x: number, _y: number): void {}
  lineTo(_x: number, _y: number): void {}
  close(): void {}
  fill(): void {}
  stroke(): void {}
  clear(): void {
    this.lastRoundRect = null;
  }
}

export class Button extends Component {
  static readonly EventType = { CLICK: "click" };
  interactable = true;
}

export class Asset {}
export class SpriteFrame extends Asset {
  insetLeft = 0;
  insetRight = 0;
  insetTop = 0;
  insetBottom = 0;
}

export class Sprite extends Component {
  static readonly Type = { SIMPLE: 0, SLICED: 1 };
  static readonly SizeMode = { CUSTOM: 0 };
  spriteFrame: SpriteFrame | null = null;
  color = new Color();
  type = Sprite.Type.SIMPLE;
  sizeMode = Sprite.SizeMode.CUSTOM;
}

export class EditBox extends Component {
  static readonly InputMode = { ANY: 0, SINGLE_LINE: 6 };
  string = "";
  placeholder = "";
  maxLength = -1;
  inputMode = EditBox.InputMode.SINGLE_LINE;
  textLabel: Label | null = null;
  placeholderLabel: Label | null = null;
}

const deferredAssetLoads = new Set<string>();
const pendingAssetLoads = new Map<string, Array<() => void>>();
const deferredBundleLoads = new Set<string>();
const pendingBundleLoads = new Map<
  string,
  Array<(error: Error | null, bundle?: MockBundle) => void>
>();

export function deferMockAssetLoad(bundleName: string, path: string): void {
  deferredAssetLoads.add(`${bundleName}:${path}`);
}

export function resolveMockAssetLoad(bundleName: string, path: string): void {
  const key = `${bundleName}:${path}`;
  deferredAssetLoads.delete(key);
  const pending = pendingAssetLoads.get(key) || [];
  pendingAssetLoads.delete(key);
  pending.forEach((complete) => complete());
}

export function deferMockBundleLoad(bundleName: string): void {
  deferredBundleLoads.add(bundleName);
}

export function resolveMockBundleLoad(bundleName: string): void {
  deferredBundleLoads.delete(bundleName);
  const bundle = bundles.get(bundleName) || new MockBundle(bundleName);
  bundles.set(bundleName, bundle);
  const pending = pendingBundleLoads.get(bundleName) || [];
  pendingBundleLoads.delete(bundleName);
  pending.forEach((complete) => complete(null, bundle));
}

export function rejectMockBundleLoad(bundleName: string, error = new Error("mock bundle load failed")): void {
  deferredBundleLoads.delete(bundleName);
  const pending = pendingBundleLoads.get(bundleName) || [];
  pendingBundleLoads.delete(bundleName);
  pending.forEach((complete) => complete(error));
}

class MockBundle {
  constructor(private readonly bundleName: string) {}

  load<T extends Asset>(
    path: string,
    type: Constructor<T>,
    callback: (error: Error | null, asset?: T) => void
  ): void {
    const key = `${this.bundleName}:${path}`;
    const complete = (): void => callback(null, new type());
    if (deferredAssetLoads.has(key)) {
      const pending = pendingAssetLoads.get(key) || [];
      pending.push(complete);
      pendingAssetLoads.set(key, pending);
      return;
    }
    complete();
  }
}

const bundles = new Map<string, MockBundle>();

export const assetManager = {
  getBundle(name: string): MockBundle | null {
    return bundles.get(name) || null;
  },
  loadBundle(name: string, callback: (error: Error | null, bundle?: MockBundle) => void): void {
    if (deferredBundleLoads.has(name)) {
      const pending = pendingBundleLoads.get(name) || [];
      pending.push(callback);
      pendingBundleLoads.set(name, pending);
      return;
    }
    const bundle = bundles.get(name) || new MockBundle(name);
    bundles.set(name, bundle);
    callback(null, bundle);
  }
};

let currentScene = new Node("Home");

export function setMockScene(scene: Node): void {
  currentScene = scene;
}

export const director = {
  getScene(): Node {
    return currentScene;
  },
  loadScene(name: string, onLaunched?: (error?: Error | null) => void): void {
    currentScene = new Node(name);
    onLaunched?.(null);
  }
};

export const _decorator = {
  ccclass: (_name?: string): ClassDecorator => (target) => target,
  property: (_type?: unknown): PropertyDecorator => () => undefined
};
