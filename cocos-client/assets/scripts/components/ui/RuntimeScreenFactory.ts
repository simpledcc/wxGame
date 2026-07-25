import { Node } from "cc";
import { app } from "../../core/App";
import { gameplayScreens, type GameplayRoute } from "../../core/GameplayBundles";
import type { RouteName } from "../../store/GameStore";
import { RuntimeUi } from "./RuntimeUi";
import { buildHomeScreen } from "./screens/HomeScreenBuilder";
import { buildBankScreen, buildStudyScreen } from "./screens/LearningScreenBuilders";
import { buildModeCatalogScreen, buildRoomScreen } from "./screens/RoomScreenBuilders";
import {
  buildFeedbackScreen,
  buildHelpScreen,
  buildHistoryScreen,
  buildResultScreen
} from "./screens/SupportScreenBuilders";

type CoreRoute = Exclude<RouteName, GameplayRoute | "boot">;
type CoreScreenBuilder = (parent: Node, ui: RuntimeUi) => Node;

const CORE_SCREEN_BUILDERS: Readonly<Record<CoreRoute, CoreScreenBuilder>> = {
  home: buildHomeScreen,
  bank: buildBankScreen,
  study: buildStudyScreen,
  coopSelect: buildModeCatalogScreen,
  room: buildRoomScreen,
  result: buildResultScreen,
  history: buildHistoryScreen,
  feedback: buildFeedbackScreen,
  help: buildHelpScreen
};

const GAMEPLAY_ROUTES = new Set<RouteName>(["pkGame", "coopShared", "coopSpell"]);

export class RuntimeScreenFactory {
  build(parent: Node, route: RouteName): Node {
    const ui = new RuntimeUi(app.themes.getCurrentTheme());
    if (GAMEPLAY_ROUTES.has(route)) {
      return gameplayScreens.build(route as GameplayRoute, parent, ui);
    }
    const coreRoute = (route === "boot" ? "home" : route) as CoreRoute;
    return CORE_SCREEN_BUILDERS[coreRoute](parent, ui);
  }
}
