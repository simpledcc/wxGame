import {
  _decorator,
  BlockInputEvents,
  Color,
  Component,
  Graphics,
  Label,
  Node,
  Sprite,
  UITransform
} from "cc";
import { RuntimeScreenFactory } from "./ui/RuntimeScreenFactory";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./ui/RuntimeUi";
import { app } from "../core/App";
import { parseThemeColor } from "../themes/ThemeCatalog";
import { getRouteBackgroundAssetKey } from "../themes/ThemeRouteRules";
import type { RouteName } from "../store/GameStore";

const { ccclass, property } = _decorator;

@ccclass("HomePlaceholder")
export class HomePlaceholder extends Component {
  @property(Label)
  titleLabel: Label | null = null;

  @property(Label)
  bodyLabel: Label | null = null;

  private readonly screens = new RuntimeScreenFactory();
  private screenHost: Node | null = null;
  private activeScreen: Node | null = null;
  private fallbackGraphics: Graphics | null = null;
  private backgroundSprite: Sprite | null = null;
  private activeRoute: RouteName | "" = "";
  private pendingRoute: RouteName | "" = "";
  private activeThemeId = "";
  private backgroundSequence = 0;
  private routeLoadSequence = 0;
  private routeLoadingRoot: Node | null = null;
  private routeLoadingLabel: Label | null = null;
  private performanceFrameCounter = 0;
  private unsubscribeStore: (() => void) | null = null;
  private unsubscribeTheme: (() => void) | null = null;

  start(): void {
    app.performance.reset();
    if (this.titleLabel) this.titleLabel.node.active = false;
    if (this.bodyLabel) this.bodyLabel.node.active = false;
    this.createRuntimeRoots();
    this.unsubscribeStore = app.store.subscribe((state) => this.mountRoute(state.route));
    this.unsubscribeTheme = app.themes.subscribe((state) => {
      if (state.loading || state.currentId === this.activeThemeId) return;
      this.activeThemeId = state.currentId;
      this.mountRoute(app.store.getState().route, true);
    });
    this.activeThemeId = app.themes.getState().currentId;
    this.mountRoute(app.store.getState().route);
  }

  onDestroy(): void {
    this.backgroundSequence += 1;
    this.routeLoadSequence += 1;
    this.unsubscribeStore?.();
    this.unsubscribeTheme?.();
    this.unsubscribeStore = null;
    this.unsubscribeTheme = null;
  }

  update(deltaTime: number): void {
    if (!this.activeRoute) return;
    app.performance.recordFrame(this.activeRoute, deltaTime);
    this.performanceFrameCounter += 1;
    if (this.performanceFrameCounter % 60 === 0) {
      app.performance.recordNodeCount(this.activeRoute, this.countNodes(this.node));
    }
  }

  private createRuntimeRoots(): void {
    const backgroundRoot = new Node("RuntimeBackground");
    backgroundRoot.layer = 1 << 25;
    this.node.addChild(backgroundRoot);
    backgroundRoot.setPosition(0, 0, 0);
    backgroundRoot.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);

    const fallback = new Node("FallbackColor");
    fallback.layer = 1 << 25;
    backgroundRoot.addChild(fallback);
    fallback.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
    this.fallbackGraphics = fallback.addComponent(Graphics);

    const image = new Node("ThemeBackground");
    image.layer = 1 << 25;
    backgroundRoot.addChild(image);
    image.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
    this.backgroundSprite = image.addComponent(Sprite);

    this.screenHost = new Node("RuntimeScreens");
    this.screenHost.layer = 1 << 25;
    this.node.addChild(this.screenHost);
    this.screenHost.setPosition(0, 0, 0);
    this.screenHost.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);

    this.createRouteLoadingOverlay();
  }

  private mountRoute(route: RouteName, force = false): void {
    const target = route === "boot" ? "home" : route;
    if (!this.screenHost) return;
    if (!force && target === this.activeRoute) {
      if (this.pendingRoute) {
        this.routeLoadSequence += 1;
        this.pendingRoute = "";
        this.setRouteLoading(null);
      }
      return;
    }
    if (!force && target === this.pendingRoute) return;
    const sequence = ++this.routeLoadSequence;
    this.pendingRoute = target;
    this.setRouteLoading(target);
    void this.prepareRoute(target, sequence);
  }

  private async prepareRoute(route: RouteName, sequence: number): Promise<void> {
    try {
      await app.gameplayBundles.prepare(route);
    } catch (error) {
      if (sequence !== this.routeLoadSequence) return;
      this.pendingRoute = "";
      this.setRouteLoading(null);
      app.runtime.showToast(error instanceof Error ? error.message : "玩法资源加载失败，请重试");
      return;
    }
    let backgroundReady = true;
    try {
      await app.themes.preloadAssets([getRouteBackgroundAssetKey(route)]);
    } catch {
      backgroundReady = false;
    }
    if (sequence !== this.routeLoadSequence || !this.screenHost) return;
    this.pendingRoute = "";
    this.activeRoute = route;
    if (this.activeScreen) {
      this.activeScreen.active = false;
      this.activeScreen.destroy();
    }
    this.activeScreen = this.screens.build(this.screenHost, route);
    this.setRouteLoading(null);
    void this.applyBackground(route, backgroundReady);
  }

  private async applyBackground(route: RouteName, loadImage = true): Promise<void> {
    const sequence = ++this.backgroundSequence;
    const theme = app.themes.getCurrentTheme();
    const [r, g, b, a] = parseThemeColor(theme.colors.backgroundTint);
    if (this.fallbackGraphics) {
      this.fallbackGraphics.clear();
      this.fallbackGraphics.fillColor = new Color(r, g, b, a);
      this.fallbackGraphics.roundRect(
        -DESIGN_WIDTH / 2,
        -DESIGN_HEIGHT / 2,
        DESIGN_WIDTH,
        DESIGN_HEIGHT,
        0
      );
      this.fallbackGraphics.fill();
    }
    if (!loadImage) {
      if (this.backgroundSprite) this.backgroundSprite.spriteFrame = null;
      return;
    }
    try {
      const frame = await app.themes.loadSpriteFrame(getRouteBackgroundAssetKey(route));
      if (sequence === this.backgroundSequence && this.backgroundSprite) {
        this.backgroundSprite.spriteFrame = frame;
        const transform = this.backgroundSprite.node.getComponent(UITransform);
        const sourceFrame = frame as unknown as { width?: number; height?: number };
        const sourceWidth = Number(sourceFrame.width || DESIGN_WIDTH);
        const sourceHeight = Number(sourceFrame.height || DESIGN_HEIGHT);
        const sourceAspect = sourceHeight > 0 ? sourceWidth / sourceHeight : 1;
        const targetAspect = DESIGN_WIDTH / DESIGN_HEIGHT;
        const coverWidth = sourceAspect >= targetAspect
          ? DESIGN_HEIGHT * sourceAspect
          : DESIGN_WIDTH;
        const coverHeight = sourceAspect >= targetAspect
          ? DESIGN_HEIGHT
          : DESIGN_WIDTH / sourceAspect;
        transform?.setContentSize(coverWidth, coverHeight);
        this.backgroundSprite.color = new Color(255, 255, 255, 255);
      }
    } catch {
      if (sequence === this.backgroundSequence && this.backgroundSprite) {
        this.backgroundSprite.spriteFrame = null;
      }
    }
  }

  private countNodes(root: Node): number {
    return 1 + root.children.reduce((total, child) => total + this.countNodes(child), 0);
  }

  private createRouteLoadingOverlay(): void {
    const root = new Node("RouteLoading");
    root.layer = 1 << 25;
    root.active = false;
    this.node.addChild(root);
    root.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
    root.addComponent(BlockInputEvents);

    const shade = new Node("RouteLoadingShade");
    shade.layer = 1 << 25;
    root.addChild(shade);
    shade.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
    const shadeGraphics = shade.addComponent(Graphics);
    shadeGraphics.fillColor = new Color(0, 0, 0, 112);
    shadeGraphics.roundRect(-DESIGN_WIDTH / 2, -DESIGN_HEIGHT / 2, DESIGN_WIDTH, DESIGN_HEIGHT, 0);
    shadeGraphics.fill();

    const panel = new Node("RouteLoadingPanel");
    panel.layer = 1 << 25;
    root.addChild(panel);
    panel.addComponent(UITransform).setContentSize(360, 76);
    const panelGraphics = panel.addComponent(Graphics);
    panelGraphics.fillColor = new Color(28, 38, 45, 236);
    panelGraphics.roundRect(-180, -38, 360, 76, 8);
    panelGraphics.fill();

    const labelNode = new Node("RouteLoadingLabel");
    labelNode.layer = 1 << 25;
    panel.addChild(labelNode);
    labelNode.addComponent(UITransform).setContentSize(320, 52);
    this.routeLoadingLabel = labelNode.addComponent(Label);
    this.routeLoadingLabel.fontSize = 22;
    this.routeLoadingLabel.lineHeight = 28;
    this.routeLoadingLabel.color = new Color(255, 255, 255, 255);
    this.routeLoadingLabel.horizontalAlign = 1;
    this.routeLoadingLabel.verticalAlign = 1;
    this.routeLoadingLabel.overflow = Label.Overflow.SHRINK;
    this.routeLoadingRoot = root;
  }

  private setRouteLoading(route: RouteName | null): void {
    if (this.routeLoadingRoot) this.routeLoadingRoot.active = !!route;
    if (!route || !this.routeLoadingLabel) return;
    this.routeLoadingLabel.string = route === "pkGame" || route === "coopShared" || route === "coopSpell"
      ? "正在准备玩法资源..."
      : "正在加载界面...";
  }
}
