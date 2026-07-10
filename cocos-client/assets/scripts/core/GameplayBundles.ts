import { assetManager, type Node } from "cc";
import type { RuntimeUi } from "../components/ui/RuntimeUi";
import type { RouteName } from "../store/GameStore";

export type GameplayRoute = "pkGame" | "coopShared" | "coopSpell";
export type GameplayScreenBuilder = (parent: Node, ui: RuntimeUi) => Node;

const ROUTE_BUNDLES: Record<GameplayRoute, string> = {
  pkGame: "mode_pk",
  coopShared: "mode_pk",
  coopSpell: "mode_spell"
};

class GameplayScreenRegistry {
  private readonly builders = new Map<GameplayRoute, GameplayScreenBuilder>();

  register(route: GameplayRoute, builder: GameplayScreenBuilder): void {
    this.builders.set(route, builder);
  }

  has(route: GameplayRoute): boolean {
    return this.builders.has(route);
  }

  build(route: GameplayRoute, parent: Node, ui: RuntimeUi): Node {
    const builder = this.builders.get(route);
    if (!builder) throw new Error(`玩法资源未注册：${route}`);
    return builder(parent, ui);
  }
}

export const gameplayScreens = new GameplayScreenRegistry();

export interface GameplayBundlePort {
  load(name: string): Promise<void>;
}

export function createCocosGameplayBundlePort(): GameplayBundlePort {
  return {
    load: (name) => new Promise<void>((resolve, reject) => {
      if (assetManager.getBundle(name)) return resolve();
      assetManager.loadBundle(name, (error) => error ? reject(error) : resolve());
    })
  };
}

export class GameplayBundleManager {
  private readonly loads = new Map<string, Promise<void>>();

  constructor(private readonly port: GameplayBundlePort) {}

  async prepare(route: RouteName): Promise<void> {
    const bundleName = ROUTE_BUNDLES[route as GameplayRoute];
    if (!bundleName) return;
    let pending = this.loads.get(bundleName);
    if (!pending) {
      pending = this.port.load(bundleName).catch((error) => {
        this.loads.delete(bundleName);
        throw error;
      });
      this.loads.set(bundleName, pending);
    }
    await pending;
    if (!gameplayScreens.has(route as GameplayRoute)) {
      this.loads.delete(bundleName);
      throw new Error(`玩法资源包缺少入口：${bundleName}`);
    }
  }
}
