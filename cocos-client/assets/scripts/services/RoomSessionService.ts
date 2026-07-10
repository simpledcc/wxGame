import type { BotDifficulty } from "../domain/GameTypes";
import {
  getLocalRoomPlayer,
  getRoomActionAvailability,
  getRoomModeLabel,
  isValidRoomCode,
  normalizeRoomCode
} from "../domain/RoomRules";
import type { GameOptions, RoomSnapshot } from "../domain/RoomTypes";
import type { PlayerStore } from "../store/PlayerStore";
import type { RoomPendingAction, RoomStore } from "../store/RoomStore";
import type { RoomPollingService } from "./RoomPollingService";
import type { RoomService } from "./RoomService";
import type { ShareRoomResult, ShareService } from "./ShareService";

export type RoomSessionErrorCode =
  | "BUSY"
  | "INVALID_ROOM_CODE"
  | "NO_ACTIVE_ROOM"
  | "NOT_IN_ROOM"
  | "ACTION_NOT_ALLOWED"
  | "START_BLOCKED";

const ERROR_MESSAGES: Record<RoomSessionErrorCode, string> = {
  BUSY: "房间操作正在进行，请稍候",
  INVALID_ROOM_CODE: "请输入 6 位房间码",
  NO_ACTIVE_ROOM: "请先创建或加入房间",
  NOT_IN_ROOM: "你不在这个房间中",
  ACTION_NOT_ALLOWED: "当前房间不能执行这个操作",
  START_BLOCKED: "双方准备后才能开始"
};

export class RoomSessionError extends Error {
  constructor(readonly code: RoomSessionErrorCode, message = ERROR_MESSAGES[code]) {
    super(message);
    this.name = "RoomSessionError";
  }
}

const BOT_NAMES: Record<BotDifficulty, string> = {
  high: "Emma",
  medium: "Jack",
  low: "Lily"
};

export class RoomSessionService {
  constructor(
    private readonly rooms: RoomService,
    private readonly share: ShareService,
    private readonly roomStore: RoomStore,
    private readonly playerStore: PlayerStore,
    private readonly polling: RoomPollingService
  ) {}

  async create(gameOptions: GameOptions): Promise<RoomSnapshot> {
    return this.runAction("create", async () => {
      const response = await this.rooms.createRoom({ gameOptions });
      const localOpenId = response.room.players[0]?.openid || response.room.ownerOpenid || "";
      if (localOpenId) {
        this.playerStore.setOpenId(localOpenId);
      }
      this.roomStore.enter(response.roomId, response.roomCode, response.room);
      this.polling.start(response.roomId, false);
      return this.requireRoom();
    });
  }

  async join(roomCode: string): Promise<RoomSnapshot | null> {
    const normalizedCode = normalizeRoomCode(roomCode);
    if (!isValidRoomCode(normalizedCode)) {
      throw new RoomSessionError("INVALID_ROOM_CODE");
    }
    return this.runAction("join", async () => {
      const response = await this.rooms.joinRoom({ roomCode: normalizedCode });
      this.playerStore.setOpenId(response.openid);
      this.roomStore.enter(response.roomId, response.roomCode || normalizedCode);
      this.polling.start(response.roomId, false);
      await this.polling.refresh().catch(() => null);
      return this.roomStore.getRoom();
    });
  }

  async resume(roomId: string, roomCode: string, room: RoomSnapshot | null = null): Promise<void> {
    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new RoomSessionError("NO_ACTIVE_ROOM");
    }
    this.roomStore.enter(normalizedRoomId, roomCode, room);
    this.polling.start(normalizedRoomId, !room);
  }

  async refresh(): Promise<RoomSnapshot | null> {
    return this.polling.refresh();
  }

  async toggleReady(): Promise<RoomSnapshot> {
    return this.runAction("ready", async () => {
      const room = this.requireRoom();
      const localOpenId = this.requireLocalOpenId();
      const localPlayer = getLocalRoomPlayer(room, localOpenId);
      const availability = getRoomActionAvailability(room, localOpenId);
      if (!localPlayer) {
        throw new RoomSessionError("NOT_IN_ROOM");
      }
      if (!availability.canToggleReady) {
        throw new RoomSessionError("ACTION_NOT_ALLOWED");
      }
      const ready = !localPlayer.ready;
      this.roomStore.applySnapshot({
        ...room,
        players: room.players.map((player) => player.openid === localOpenId
          ? { ...player, ready }
          : player)
      });
      try {
        const response = await this.rooms.toggleReady(this.requireRoomId(), ready);
        this.roomStore.applySnapshot(response.room);
        return this.requireRoom();
      } catch (error) {
        await this.polling.refresh().catch(() => undefined);
        throw error;
      }
    });
  }

  async addBot(difficulty: BotDifficulty = "medium"): Promise<RoomSnapshot> {
    return this.runAction("bot", async () => {
      const room = this.requireRoom();
      const availability = getRoomActionAvailability(room, this.requireLocalOpenId());
      if (!availability.canAddBot) {
        throw new RoomSessionError("ACTION_NOT_ALLOWED",
          room.gameOptions.matchMode === "coop"
            ? "双人合作需要两名真实玩家，不能加入机器人"
            : undefined);
      }
      const response = await this.rooms.addBot({
        roomId: this.requireRoomId(),
        difficulty,
        botName: BOT_NAMES[difficulty]
      });
      this.roomStore.applySnapshot(response.room);
      return this.requireRoom();
    });
  }

  async startGame(): Promise<RoomSnapshot> {
    return this.runAction("start", async () => {
      const room = this.requireRoom();
      const availability = getRoomActionAvailability(room, this.requireLocalOpenId());
      if (!availability.canStart) {
        throw new RoomSessionError("START_BLOCKED");
      }
      const roomId = this.requireRoomId();
      if (room.gameOptions.matchMode === "coop" && room.gameOptions.coopMode === "spell") {
        const response = await this.rooms.startCoopSpell({
          roomId,
          roomWords: room.gameOptions.roomWords,
          roomSpellQuestions: room.gameOptions.roomSpellQuestions
        });
        this.roomStore.applySnapshot(response.room);
      } else {
        const response = await this.rooms.startGame({
          roomId,
          roomWords: room.gameOptions.roomWords
        });
        if (response.room) {
          this.roomStore.applySnapshot(response.room);
        } else {
          await this.polling.refresh();
        }
      }
      return this.requireRoom();
    });
  }

  async copyRoomCode(): Promise<void> {
    await this.runAction("copy", async () => {
      await this.share.copyRoomCode(this.requireRoomCode());
    });
  }

  async invite(): Promise<ShareRoomResult> {
    return this.runAction("invite", async () => {
      const room = this.requireRoom();
      return this.share.shareRoom(this.requireRoomCode(), getRoomModeLabel(room));
    });
  }

  leave(): void {
    this.polling.stop();
    this.roomStore.leave();
  }

  private requireRoom(): RoomSnapshot {
    const room = this.roomStore.getRoom();
    if (!room) {
      throw new RoomSessionError("NO_ACTIVE_ROOM");
    }
    return room;
  }

  private requireRoomId(): string {
    const roomId = this.roomStore.getState().roomId;
    if (!roomId) {
      throw new RoomSessionError("NO_ACTIVE_ROOM");
    }
    return roomId;
  }

  private requireRoomCode(): string {
    const roomCode = this.roomStore.getState().roomCode;
    if (!roomCode) {
      throw new RoomSessionError("NO_ACTIVE_ROOM");
    }
    return roomCode;
  }

  private requireLocalOpenId(): string {
    const openid = this.playerStore.getLocalPlayer().openid;
    if (!openid) {
      throw new RoomSessionError("NOT_IN_ROOM");
    }
    return openid;
  }

  private async runAction<T>(
    action: RoomPendingAction,
    operation: () => Promise<T>
  ): Promise<T> {
    if (this.roomStore.getState().pendingAction) {
      throw new RoomSessionError("BUSY");
    }
    this.roomStore.setPendingAction(action);
    try {
      return await operation();
    } finally {
      if (this.roomStore.getState().pendingAction === action) {
        this.roomStore.setPendingAction(null);
      }
    }
  }
}
