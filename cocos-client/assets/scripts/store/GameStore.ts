import type { GameDuration, GameModeKey } from "../domain/GameTypes";
import type { RoomSnapshot } from "../domain/RoomTypes";
import { EventBus } from "../core/EventBus";

export type RouteName =
  | "boot"
  | "home"
  | "bank"
  | "study"
  | "coopSelect"
  | "room"
  | "pkGame"
  | "coopShared"
  | "coopSpell"
  | "result"
  | "history"
  | "feedback";

export interface AppState {
  route: RouteName;
  booted: boolean;
  cloudReady: boolean;
  openid: string;
  selectedMode: GameModeKey;
  duration: GameDuration;
  bankId: string;
  room: RoomSnapshot | null;
}

export interface StoreEvents {
  changed: AppState;
}

export class GameStore {
  private readonly events = new EventBus<StoreEvents>();
  private state: AppState = {
    route: "boot",
    booted: false,
    cloudReady: false,
    openid: "",
    selectedMode: "pk",
    duration: 60,
    bankId: "jilin-g1a-b1-welcome",
    room: null
  };

  getState(): AppState {
    return { ...this.state };
  }

  subscribe(handler: (state: AppState) => void): () => void {
    return this.events.on("changed", handler);
  }

  patch(patch: Partial<AppState>): void {
    this.state = { ...this.state, ...patch };
    this.events.emit("changed", this.getState());
  }

  setRoute(route: RouteName): void {
    this.patch({ route });
  }

  setRoom(room: RoomSnapshot | null): void {
    this.patch({ room });
  }
}

