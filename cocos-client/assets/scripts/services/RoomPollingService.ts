import { Logger } from "../core/Logger";
import type { RoomSnapshot } from "../domain/RoomTypes";
import type { RoomStore } from "../store/RoomStore";
import type { RoomService } from "./RoomService";

export interface RoomPollingOptions {
  standardIntervalMs?: number;
  coopSpellIntervalMs?: number;
  queuedRefreshDelayMs?: number;
  schedule?: (callback: () => void, delayMs: number) => unknown;
  cancel?: (handle: unknown) => void;
  logger?: Logger;
}

export class RoomPollingService {
  private readonly standardIntervalMs: number;
  private readonly coopSpellIntervalMs: number;
  private readonly queuedRefreshDelayMs: number;
  private readonly scheduleTimer: (callback: () => void, delayMs: number) => unknown;
  private readonly cancelTimer: (handle: unknown) => void;
  private readonly logger: Logger;

  private activeRoomId = "";
  private generation = 0;
  private timer: unknown = null;
  private inFlight: Promise<RoomSnapshot | null> | null = null;
  private inFlightGeneration = 0;
  private refreshQueued = false;

  constructor(
    private readonly rooms: RoomService,
    private readonly store: RoomStore,
    options: RoomPollingOptions = {}
  ) {
    this.standardIntervalMs = Math.max(250, options.standardIntervalMs ?? 1000);
    this.coopSpellIntervalMs = Math.max(250, options.coopSpellIntervalMs ?? 600);
    this.queuedRefreshDelayMs = Math.max(0, options.queuedRefreshDelayMs ?? 80);
    this.scheduleTimer = options.schedule ?? ((callback, delayMs) => setTimeout(callback, delayMs));
    this.cancelTimer = options.cancel ?? ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>));
    this.logger = options.logger ?? new Logger("RoomPollingService");
  }

  start(roomId: string, immediate = true): void {
    this.stop();
    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      return;
    }
    this.activeRoomId = normalizedRoomId;
    this.generation += 1;
    this.logger.info("poll.start", { roomId: normalizedRoomId, immediate });
    if (immediate) {
      void this.refresh().catch(() => undefined);
    } else {
      this.scheduleNext(this.getInterval());
    }
  }

  stop(): void {
    if (this.timer != null) {
      this.cancelTimer(this.timer);
      this.timer = null;
    }
    if (this.activeRoomId) {
      this.logger.info("poll.stop", { roomId: this.activeRoomId });
    }
    this.activeRoomId = "";
    this.refreshQueued = false;
    this.generation += 1;
    this.store.setSyncing(false);
  }

  isRunning(): boolean {
    return !!this.activeRoomId;
  }

  refresh(): Promise<RoomSnapshot | null> {
    if (!this.activeRoomId) {
      return Promise.resolve(null);
    }
    if (this.inFlight && this.inFlightGeneration === this.generation) {
      this.refreshQueued = true;
      return this.inFlight;
    }
    if (this.timer != null) {
      this.cancelTimer(this.timer);
      this.timer = null;
    }

    const requestedRoomId = this.activeRoomId;
    const requestedGeneration = this.generation;
    const startedAt = Date.now();
    this.store.setSyncing(true);
    let request: Promise<RoomSnapshot | null>;
    request = this.rooms.fetch(requestedRoomId)
      .then((room) => {
        if (!this.isCurrent(requestedRoomId, requestedGeneration)) {
          return null;
        }
        this.store.applySnapshot(room);
        this.logger.info("poll.success", {
          roomId: requestedRoomId,
          elapsedMs: Date.now() - startedAt,
          roomState: room.state
        });
        return room;
      })
      .catch((error: unknown) => {
        if (this.isCurrent(requestedRoomId, requestedGeneration)) {
          this.store.setSyncError("同步房间失败，请检查网络后重试");
          this.logger.warn("poll.fail", {
            roomId: requestedRoomId,
            elapsedMs: Date.now() - startedAt,
            reason: error instanceof Error ? error.name : "unknown"
          });
        }
        throw error;
      })
      .finally(() => {
        if (this.inFlight === request) {
          this.inFlight = null;
          this.inFlightGeneration = 0;
        }
        if (!this.isCurrent(requestedRoomId, requestedGeneration)) {
          return;
        }
        if (this.refreshQueued) {
          this.refreshQueued = false;
          this.scheduleNext(this.queuedRefreshDelayMs);
          return;
        }
        this.scheduleNext(this.getInterval());
      });
    this.inFlight = request;
    this.inFlightGeneration = requestedGeneration;
    return request;
  }

  private isCurrent(roomId: string, generation: number): boolean {
    return this.activeRoomId === roomId && this.generation === generation;
  }

  private getInterval(): number {
    const room = this.store.getRoom();
    return room?.gameOptions.matchMode === "coop" && room.gameOptions.coopMode === "spell"
      ? this.coopSpellIntervalMs
      : this.standardIntervalMs;
  }

  private scheduleNext(delayMs: number): void {
    if (!this.activeRoomId || this.timer != null) {
      return;
    }
    this.timer = this.scheduleTimer(() => {
      this.timer = null;
      void this.refresh().catch(() => undefined);
    }, delayMs);
  }
}
