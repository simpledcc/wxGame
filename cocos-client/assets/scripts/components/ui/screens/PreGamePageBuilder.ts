import type { Node } from "cc";
import { app } from "../../../core/App";
import { PreGameUi } from "../PreGameUi";
import type { RuntimeUi } from "../RuntimeUi";

export function createPreGamePage(parent: Node, ui: RuntimeUi, name: string) {
  const root = ui.root(parent, `${name}RuntimeScreen`);
  const home = new PreGameUi(app.themes.getCurrentTheme());
  home.scenicBackdrop(root, `${name}Scenery`);
  return { root, home, safe: home.safeArea(root, `${name}SafeArea`) };
}
