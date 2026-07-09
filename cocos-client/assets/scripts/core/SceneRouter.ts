import { director } from "cc";
import { Logger } from "./Logger";
import type { GameStore, RouteName } from "../store/GameStore";

export interface RouteConfig {
  route: RouteName;
  cocosScene?: string;
}

const ROUTES: Record<RouteName, RouteConfig> = {
  boot: { route: "boot", cocosScene: "Boot" },
  home: { route: "home", cocosScene: "Home" },
  bank: { route: "bank" },
  study: { route: "study" },
  coopSelect: { route: "coopSelect" },
  room: { route: "room" },
  pkGame: { route: "pkGame" },
  coopShared: { route: "coopShared" },
  coopSpell: { route: "coopSpell" },
  result: { route: "result" },
  history: { route: "history" },
  feedback: { route: "feedback" }
};

export class SceneRouter {
  private readonly logger = new Logger("SceneRouter");

  constructor(private readonly store: GameStore) {}

  navigate(route: RouteName): void {
    const config = ROUTES[route];
    this.store.setRoute(route);
    this.loadSceneIfNeeded(config);
  }

  openBankPicker(returnRoute = this.store.getState().route): void {
    this.store.openBankPicker(returnRoute);
    this.logger.info("route.changed", { route: "bank", returnRoute });
  }

  returnFromBankPicker(): void {
    const target = this.store.getState().bankReturnRoute || "home";
    this.navigate(target);
  }

  private loadSceneIfNeeded(config: RouteConfig): void {
    if (!config.cocosScene) {
      this.logger.info("route.changed", { route: config.route });
      return;
    }
    director.loadScene(config.cocosScene, (err) => {
      if (err) {
        this.logger.error("scene.load.fail", { route: config.route, scene: config.cocosScene, message: err.message });
        return;
      }
      this.logger.info("scene.loaded", { route: config.route, scene: config.cocosScene });
    });
  }
}
