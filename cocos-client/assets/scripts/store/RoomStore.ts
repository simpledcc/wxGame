import { EventBus } from "../core/EventBus";
import type { RoomSnapshot } from "../domain/RoomTypes";
import { normalizeRoomCode, normalizeRoomSnapshot } from "../domain/RoomRules";

export type RoomPendingAction =
  | "create"
  | "join"
  | "ready"
  | "bot"
  | "start"
  | "copy"
  | "invite";

export interface RoomSessionState {
  roomId: string;
  roomCode: string;
  room: RoomSnapshot | null;
  syncing: boolean;
  syncError: string;
  pendingAction: RoomPendingAction | null;
  lastSyncedAt: number;
}

interface RoomStoreEvents {
  changed: RoomSessionState;
}

export class RoomStore {
  private readonly events = new EventBus<RoomStoreEvents>();
  private sessionVersion = 0;
  private state: RoomSessionState = {
    roomId: "",
    roomCode: "",
    room: null,
    syncing: false,
    syncError: "",
    pendingAction: null,
    lastSyncedAt: 0
  };

  getState(): RoomSessionState {
    return {
      ...this.state,
      room: this.state.room
        ? normalizeRoomSnapshot(this.state.room, this.state.roomId, this.state.roomCode)
        : null
    };
  }

  getRoom(): RoomSnapshot | null {
    return this.getState().room;
  }

  getSessionVersion(): number {
    return this.sessionVersion;
  }

  subscribe(handler: (state: RoomSessionState) => void): () => void {
    return this.events.on("changed", handler);
  }

  enter(roomId: string, roomCode: string, room: RoomSnapshot | null = null): void {
    this.sessionVersion += 1;
    const normalizedRoom = room
      ? normalizeRoomSnapshot(room, roomId, roomCode)
      : null;
    this.patch({
      roomId: String(roomId ?? "").trim(),
      roomCode: normalizeRoomCode(roomCode || normalizedRoom?.roomCode || ""),
      room: normalizedRoom,
      syncing: false,
      syncError: "",
      lastSyncedAt: normalizedRoom ? Date.now() : 0
    });
  }

  applySnapshot(room: RoomSnapshot): boolean {
    const normalized = normalizeRoomSnapshot(room, this.state.roomId, this.state.roomCode);
    if (this.state.roomId && normalized._id && normalized._id !== this.state.roomId) {
      return false;
    }
    this.patch({
      roomId: this.state.roomId || normalized._id || "",
      roomCode: normalized.roomCode || this.state.roomCode,
      room: normalized,
      syncing: false,
      syncError: "",
      lastSyncedAt: Date.now()
    });
    return true;
  }

  setSyncing(syncing: boolean): void {
    this.patch({ syncing });
  }

  setSyncError(message: string): void {
    this.patch({
      syncing: false,
      syncError: String(message ?? "")
    });
  }

  setPendingAction(action: RoomPendingAction | null): void {
    this.patch({ pendingAction: action });
  }

  leave(): void {
    this.sessionVersion += 1;
    this.state = {
      roomId: "",
      roomCode: "",
      room: null,
      syncing: false,
      syncError: "",
      pendingAction: null,
      lastSyncedAt: 0
    };
    this.emit();
  }

  private patch(patch: Partial<RoomSessionState>): void {
    this.state = { ...this.state, ...patch };
    this.emit();
  }

  private emit(): void {
    this.events.emit("changed", this.getState());
  }
}

