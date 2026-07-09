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
    if (!config.cocosScene) {
      this.logger.info("route.changed", { route });
      return;
    }
    director.loadScene(config.cocosScene, (err) => {
      if (err) {
        this.logger.error("scene.load.fail", { route, scene: config.cocosScene, message: err.message });
        return;
      }
      this.logger.info("scene.loaded", { route, scene: config.cocosScene });
    });
  }
}

