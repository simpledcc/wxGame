import { _decorator, Color, Component, Label, Sprite, SpriteFrame } from "cc";
import { app } from "../../core/App";
import {
  isThemeAssetKey,
  isThemeColorToken,
  parseThemeColor
} from "../../themes/ThemeCatalog";

const { ccclass, property } = _decorator;

@ccclass("ThemeBinding")
export class ThemeBinding extends Component {
  @property(Sprite)
  sprite: Sprite | null = null;

  @property(Label)
  label: Label | null = null;

  @property(String)
  assetKey = "";

  @property(String)
  colorToken = "";

  private unsubscribe: (() => void) | null = null;
  private applySequence = 0;

  onLoad(): void {
    this.unsubscribe = app.themes.subscribe(() => {
      void this.applyTheme();
    });
    void this.applyTheme();
  }

  onDestroy(): void {
    this.applySequence += 1;
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private async applyTheme(): Promise<void> {
    const sequence = ++this.applySequence;
    const theme = app.themes.getCurrentTheme();
    if (isThemeColorToken(this.colorToken)) {
      const [r, g, b, a] = parseThemeColor(theme.colors[this.colorToken]);
      const color = new Color(r, g, b, a);
      if (this.label) this.label.color = color;
      if (this.sprite) this.sprite.color = color;
    }
    if (!this.sprite || !isThemeAssetKey(this.assetKey)) return;
    try {
      const frame = await app.themes.loadSpriteFrame(this.assetKey);
      if (sequence === this.applySequence) this.sprite.spriteFrame = frame as SpriteFrame;
    } catch {
      // ThemeManager already exposes the active fallback and error state.
    }
  }
}
