import { _decorator, Button, Component, Label } from "cc";
import { app } from "../../core/App";
import type { ThemeId, ThemeState } from "../../themes/ThemeTypes";

const { ccclass, property } = _decorator;

@ccclass("ThemeDebugPanel")
export class ThemeDebugPanel extends Component {
  @property(Boolean)
  developerVisible = false;

  @property(Label)
  statusLabel: Label | null = null;

  @property(Button)
  defaultButton: Button | null = null;

  @property(Button)
  islandButton: Button | null = null;

  private unsubscribe: (() => void) | null = null;

  onLoad(): void {
    this.node.active = this.developerVisible;
    if (!this.developerVisible) return;
    this.unsubscribe = app.themes.subscribe((state) => this.render(state));
    this.render(app.themes.getState());
  }

  onDestroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  useDefault(): void {
    void this.selectTheme("default");
  }

  useIsland(): void {
    void this.selectTheme("island");
  }

  private async selectTheme(themeId: ThemeId): Promise<void> {
    await app.themes.select(themeId);
    const state = app.themes.getState();
    if (state.error) app.runtime.showToast(state.error);
  }

  private render(state: ThemeState): void {
    const current = app.themes.getCurrentTheme();
    if (this.statusLabel) {
      this.statusLabel.string = state.loading
        ? "正在切换主题..."
        : `${current.label}${state.fallbackUsed ? " · 已回退" : ""}`;
    }
    if (this.defaultButton) {
      this.defaultButton.interactable = !state.loading && state.currentId !== "default";
    }
    if (this.islandButton) {
      this.islandButton.interactable = !state.loading && state.currentId !== "island";
    }
  }
}
