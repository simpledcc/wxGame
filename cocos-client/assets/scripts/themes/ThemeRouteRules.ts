import type { RouteName } from "../store/GameStore";
import type { ThemeAssetKey } from "./ThemeTypes";

export function getRouteBackgroundAssetKey(route: RouteName): ThemeAssetKey {
  if (route === "pkGame" || route === "coopShared") {
    return "gameplayBackground";
  }
  if (route === "coopSpell") {
    return "spellBackground";
  }
  return "homeBackground";
}
