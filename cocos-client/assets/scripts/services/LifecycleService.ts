import type { RuntimeEntryOptions, RuntimePort } from "../adapters/RuntimePort";
import { Logger } from "../core/Logger";
import { isValidRoomCode, normalizeRoomCode } from "../domain/RoomRules";
import type { GameStore, RouteName } from "../store/GameStore";
import type { RoomStore } from "../store/RoomStore";

export interface LifecycleRoomSession {
  join(roomCode: string): Promise<unknown>;
}

export interface LifecycleRoomPolling {
  isRunning(): boolean;
  start(roomId: string, immediate?: boolean): void;
  stop(): void;
  refresh(): Promise<unknown>;
}

const GAMEPLAY_ROUTES = new Set<RouteName>(["pkGame", "coopShared", "coopSpell"]);

export class LifecycleService {
  private started = false;
  private active = false;
  private hidden = false;
  private pendingInviteCode = "";
  private invitePromise: Promise<boolean> | null = null;
  private unsubscribeShow: (() => void) | null = null;
  private unsubscribeHide: (() => void) | null = null;

  constructor(
    private readonly runtime: RuntimePort,
    private readonly gameStore: GameStore,
    private readonly roomStore: RoomStore,
    private readonly roomSession: LifecycleRoomSession,
    private readonly polling: LifecycleRoomPolling,
    private readonly logger = new Logger("LifecycleService")
  ) {}

  start(): void {
    if (this.started) return;
    this.started = true;
    this.captureInvite(this.runtime.getLaunchOptions());
    this.unsubscribeShow = this.runtime.onAppShow((options) => this.handleShow(options));
    this.unsubscribeHide = this.runtime.onAppHide(() => this.handleHide());
  }

  async activate(): Promise<boolean> {
    this.start();
    this.active = true;
    if (this.pendingInviteCode) {
      return await this.processPendingInvites();
    }
    this.resumeRoomPolling();
    return false;
  }

  dispose(): void {
    this.unsubscribeShow?.();
    this.unsubscribeHide?.();
    this.unsubscribeShow = null;
    this.unsubscribeHide = null;
    this.started = false;
    this.active = false;
    this.polling.stop();
  }

  private handleShow(options: RuntimeEntryOptions): void {
    this.hidden = false;
    this.captureInvite(options);
    if (!this.active) return;
    if (this.pendingInviteCode) {
      void this.processPendingInvites();
      return;
    }
    this.resumeRoomPolling();
  }

  private handleHide(): void {
    this.hidden = true;
    if (this.polling.isRunning()) {
      this.polling.stop();
    }
  }

  private captureInvite(options: RuntimeEntryOptions): void {
    const query = options.query ?? {};
    const rawCode = query.roomCode ?? query.code;
    if (rawCode == null || String(rawCode).trim() === "") return;
    const roomCode = normalizeRoomCode(String(rawCode));
    if (roomCode === this.roomStore.getState().roomCode) return;
    this.pendingInviteCode = roomCode;
    this.logger.info("invite.received", { roomCode });
  }

  private processPendingInvites(): Promise<boolean> {
    if (this.invitePromise) return this.invitePromise;
    const request = this.consumePendingInvites().finally(() => {
      if (this.invitePromise === request) this.invitePromise = null;
      if (this.hidden && this.polling.isRunning()) this.polling.stop();
    });
    this.invitePromise = request;
    return request;
  }

  private async consumePendingInvites(): Promise<boolean> {
    let joined = false;
    while (this.active && this.pendingInviteCode) {
      const roomCode = this.pendingInviteCode;
      this.pendingInviteCode = "";
      if (!isValidRoomCode(roomCode)) {
        this.runtime.showToast("邀请房间码无效");
        continue;
      }
      if (roomCode === this.roomStore.getState().roomCode) {
        joined = true;
        this.resumeRoomPolling();
        continue;
      }
      if (GAMEPLAY_ROUTES.has(this.gameStore.getState().route)) {
        this.runtime.showToast("游戏中暂不能加入新的邀请");
        this.logger.warn("invite.blocked.playing", { roomCode });
        continue;
      }
      try {
        await this.roomSession.join(roomCode);
        const route = this.gameStore.getState().route;
        if (!GAMEPLAY_ROUTES.has(route) && route !== "result") {
          this.gameStore.setRoute("room");
        }
        joined = true;
        this.logger.info("invite.joined", { roomCode });
      } catch (error) {
        const message = error instanceof Error && error.message
          ? error.message
          : "加入邀请失败";
        this.runtime.showToast(message);
        this.logger.warn("invite.join.fail", {
          roomCode,
          reason: error instanceof Error ? error.name : "unknown"
        });
      }
    }
    return joined;
  }

  private resumeRoomPolling(): void {
    if (this.hidden) return;
    const roomId = this.roomStore.getState().roomId;
    if (!roomId) return;
    if (!this.polling.isRunning()) {
      this.polling.start(roomId, true);
      return;
    }
    void this.polling.refresh().catch(() => undefined);
  }
}
