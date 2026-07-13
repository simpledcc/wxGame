import type { GameDuration, GameModeKey, WordMode } from "../domain/GameTypes";
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
  | "feedback"
  | "help";

export type RoomEntryIntent = "neutral" | "create" | "join";

export interface AppState {
  route: RouteName;
  booted: boolean;
  cloudReady: boolean;
  openid: string;
  selectedMode: GameModeKey;
  roomEntryIntent: RoomEntryIntent;
  duration: GameDuration;
  bankId: string;
  wordMode: WordMode;
  bankReturnRoute: RouteName;
  bankPickerSelectedBankId: string;
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
    roomEntryIntent: "neutral",
    duration: 60,
    bankId: "jilin-g1a-b1-welcome",
    wordMode: "regular",
    bankReturnRoute: "home",
    bankPickerSelectedBankId: "jilin-g1a-b1-welcome"
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

  openBankPicker(returnRoute: RouteName): void {
    this.patch({
      route: "bank",
      bankReturnRoute: returnRoute,
      bankPickerSelectedBankId: this.state.bankId
    });
  }

  setBankPickerSelectedBankId(bankId: string): void {
    this.patch({ bankPickerSelectedBankId: bankId });
  }

  confirmBankSelection(bankId: string, wordMode: WordMode): RouteName {
    const target = this.state.bankReturnRoute || "home";
    this.patch({
      route: target,
      bankId,
      wordMode,
      bankPickerSelectedBankId: bankId
    });
    return target;
  }
}
