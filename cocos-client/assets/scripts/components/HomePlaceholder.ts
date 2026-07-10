import {
  _decorator,
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
  private activeThemeId = "";
  private backgroundSequence = 0;
  private unsubscribeStore: (() => void) | null = null;
  private unsubscribeTheme: (() => void) | null = null;

  start(): void {
    if (this.titleLabel) this.titleLabel.node.active = false;
    if (this.bodyLabel) this.bodyLabel.node.active = false;
    this.createRuntimeRoots();
    this.unsubscribeStore = app.store.subscribe((state) => this.mountRoute(state.route));
    this.unsubscribeTheme = app.themes.subscribe((state) => {
      if (state.loading || state.currentId === this.activeThemeId) return;
      this.activeThemeId = state.currentId;
      void this.applyBackground();
      this.remountActiveRoute();
    });
    this.activeThemeId = app.themes.getState().currentId;
    void this.applyBackground();
    this.mountRoute(app.store.getState().route);
  }

  onDestroy(): void {
    this.backgroundSequence += 1;
    this.unsubscribeStore?.();
    this.unsubscribeTheme?.();
    this.unsubscribeStore = null;
    this.unsubscribeTheme = null;
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
  }

  private mountRoute(route: RouteName): void {
    const target = route === "boot" ? "home" : route;
    if (!this.screenHost || target === this.activeRoute) return;
    this.activeRoute = target;
    if (this.activeScreen) {
      this.activeScreen.active = false;
      this.activeScreen.destroy();
    }
    this.activeScreen = this.screens.build(this.screenHost, target);
  }

  private remountActiveRoute(): void {
    if (!this.screenHost || !this.activeRoute) return;
    const route = this.activeRoute;
    this.activeRoute = "";
    this.mountRoute(route);
  }

  private async applyBackground(): Promise<void> {
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
    try {
      const frame = await app.themes.loadSpriteFrame("homeBackground");
      if (sequence === this.backgroundSequence && this.backgroundSprite) {
        this.backgroundSprite.spriteFrame = frame;
        this.backgroundSprite.color = new Color(255, 255, 255, 255);
      }
    } catch {
      if (sequence === this.backgroundSequence && this.backgroundSprite) {
        this.backgroundSprite.spriteFrame = null;
      }
    }
  }
}
