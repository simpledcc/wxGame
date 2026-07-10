import { Logger } from "../core/Logger";
import type { CatchFishResponse } from "../domain/CloudFunctionTypes";
import {
  applyCatchResponse,
  evaluateFishingTap,
  getBotDelay,
  isFishingRoom,
  getMatchTimeLeft,
  getStunLeft,
  type FishingTapBlockReason
} from "../domain/FishingRules";
import { createMatchRecord } from "../domain/MatchRecordRules";
import type { FishSnapshot, PlayerSnapshot, PowerUpSnapshot, RoomSnapshot } from "../domain/RoomTypes";
import type { FishingStore } from "../store/FishingStore";
import type { HistoryStore } from "../store/HistoryStore";
import type { PlayerStore } from "../store/PlayerStore";
import type { RoomStore } from "../store/RoomStore";
import type { WordBankStore } from "../store/WordBankStore";
import type { RoomService } from "./RoomService";
import type { RoomSessionService } from "./RoomSessionService";
import type { StorageService } from "./StorageService";

export interface FishingMatchOptions {
  now?: () => number;
  schedule?: (callback: () => void, delayMs: number) => unknown;
  cancel?: (handle: unknown) => void;
  getBankLabel?: (bankId: string) => string;
  logger?: Logger;
}

const TAP_BLOCK_MESSAGES: Record<FishingTapBlockReason, string> = {
  notPlaying: "当前对局还未开始",
  spellMode: "当前模式不能点击单词目标",
  notInRoom: "你不在这个房间中",
  stunned: "被苍蝇拍击中，暂时无法操作",
  missingFish: "目标已更新",
  deadFish: "目标已被捕获",
  missingTarget: "正在同步下一题"
};

export class FishingMatchError extends Error {
  constructor(message: string, readonly silent = false) {
    super(message);
    this.name = "FishingMatchError";
  }
}

export class FishingMatchService {
  private readonly now: () => number;
  private readonly scheduleTimer: (callback: () => void, delayMs: number) => unknown;
  private readonly cancelTimer: (handle: unknown) => void;
  private readonly getBankLabel: (bankId: string) => string;
  private readonly logger: Logger;
  private readonly unsubscribeRoom: () => void;

  private activeRoomId = "";
  private botTimer: unknown = null;
  private botKey = "";
  private finishTimer: unknown = null;
  private finishKey = "";
  private lastFinishAttemptAt = Number.NEGATIVE_INFINITY;
  private readonly persistedRecordIds = new Set<string>();

  constructor(
    private readonly rooms: RoomService,
    private readonly roomSession: RoomSessionService,
    private readonly roomStore: RoomStore,
    private readonly playerStore: PlayerStore,
    private readonly fishingStore: FishingStore,
    private readonly wordBankStore: WordBankStore,
    private readonly historyStore: HistoryStore,
    private readonly storage: StorageService,
    options: FishingMatchOptions = {}
  ) {
    this.now = options.now ?? (() => Date.now());
    this.scheduleTimer = options.schedule ?? ((callback, delayMs) => setTimeout(callback, delayMs));
    this.cancelTimer = options.cancel ?? ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>));
    this.getBankLabel = options.getBankLabel ?? (() => "词库");
    this.logger = options.logger ?? new Logger("FishingMatchService");
    this.unsubscribeRoom = this.roomStore.subscribe((state) => this.handleRoomSnapshot(state.room));
  }

  async catchFish(fishId: string): Promise<CatchFishResponse> {
    const room = this.requireFishingRoom();
    const roomId = this.requireRoomId();
    const sessionVersion = this.roomStore.getSessionVersion();
    if (this.fishingStore.getState().pendingAction) {
      throw new FishingMatchError("操作正在提交，请稍候");
    }
    const evaluation = evaluateFishingTap(
      room,
      this.requireLocalOpenId(),
      fishId,
      this.now()
    );
    if (!evaluation.ok) {
      throw new FishingMatchError(TAP_BLOCK_MESSAGES[evaluation.reason!]);
    }
    this.fishingStore.beginCatch(evaluation);
    try {
      const response = await this.rooms.catchFish({
        roomId,
        fishId
      });
      if (!this.isCurrentRoomSession(roomId, sessionVersion)) return response;
      const currentRoom = this.roomStore.getRoom() || room;
      const applied = applyCatchResponse(currentRoom, response);
      if (applied.hasSnapshot) {
        this.roomStore.applySnapshot(applied.room);
      }
      if (
        response.delta < 0
        && !response.stale
        && !response.stunned
        && evaluation.wrongWord
        && this.wordBankStore.addWrongWord(evaluation.wrongWord)
      ) {
        this.persistWrongWords();
      }
      this.fishingStore.settleCatch(response, evaluation);
      if (!applied.hasSnapshot || response.stale || response.finished) {
        await this.roomSession.refresh().catch(() => undefined);
      }
      return response;
    } catch (error) {
      if (!this.isCurrentRoomSession(roomId, sessionVersion)) {
        throw new FishingMatchError("操作已取消", true);
      }
      const message = error instanceof Error ? error.message : "操作失败，请重试";
      this.fishingStore.failPending(message);
      throw error;
    }
  }

  async usePowerUp(powerUpId?: string): Promise<CatchFishResponse> {
    const room = this.requireFishingRoom();
    const roomId = this.requireRoomId();
    const sessionVersion = this.roomStore.getSessionVersion();
    if (room.gameOptions.matchMode === "coop") {
      throw new FishingMatchError("默契捕词赛不使用道具");
    }
    const localOpenId = this.requireLocalOpenId();
    const localPlayer = room.players.find((player) => player.openid === localOpenId) || null;
    if (getStunLeft(localPlayer, this.now()) > 0) {
      throw new FishingMatchError("被苍蝇拍击中，暂时无法使用道具");
    }
    const powerUps = localPlayer?.powerUps || [];
    const selected = powerUpId
      ? powerUps.find((powerUp) => powerUp.id === powerUpId)
      : powerUps[0];
    if (!selected || !this.fishingStore.beginPowerUp(selected.id)) {
      throw new FishingMatchError(selected ? "操作正在提交，请稍候" : "还没有道具");
    }
    try {
      const response = await this.rooms.catchFish({
        roomId,
        action: "usePowerUp",
        powerUpId: selected.id
      });
      if (!this.isCurrentRoomSession(roomId, sessionVersion)) return response;
      if (response.stunned) {
        throw new FishingMatchError("被苍蝇拍击中，暂时无法使用道具");
      }
      if (response.noPowerUp) {
        throw new FishingMatchError("还没有道具");
      }
      this.applyPowerUpResult(room, localOpenId, selected, response);
      this.fishingStore.settlePowerUp(response);
      await this.roomSession.refresh().catch(() => undefined);
      return response;
    } catch (error) {
      if (!this.isCurrentRoomSession(roomId, sessionVersion)) {
        throw new FishingMatchError("操作已取消", true);
      }
      const message = error instanceof Error ? error.message : "道具使用失败";
      this.fishingStore.failPending(message);
      await this.roomSession.refresh().catch(() => undefined);
      throw error;
    }
  }

  updateClock(now = this.now()): number {
    const room = this.roomStore.getRoom();
    if (!room || room.state !== "playing") {
      return this.fishingStore.getState().timeLeft;
    }
    const timeLeft = getMatchTimeLeft(room, now);
    this.fishingStore.setTimeLeft(timeLeft);
    if (timeLeft <= 0) {
      void this.finishByTimeout();
    }
    return timeLeft;
  }

  reset(): void {
    this.cancelBotTimer();
    this.cancelFinishTimer();
    this.activeRoomId = "";
    this.fishingStore.reset();
  }

  dispose(): void {
    this.reset();
    this.unsubscribeRoom();
  }

  private handleRoomSnapshot(room: RoomSnapshot | null): void {
    if (!room || !isFishingRoom(room)) {
      this.cancelBotTimer();
      this.cancelFinishTimer();
      if (!room || this.activeRoomId) {
        this.activeRoomId = "";
        this.fishingStore.reset();
      }
      return;
    }
    const roomId = String(room._id || this.roomStore.getState().roomId);
    if (roomId && roomId !== this.activeRoomId) {
      this.activeRoomId = roomId;
      this.fishingStore.reset(getMatchTimeLeft(room, this.now()));
    }
    const localPlayer = room.players.find((player) => player.openid === this.playerStore.getLocalPlayer().openid);
    if (localPlayer) {
      this.fishingStore.reconcileAuthoritativeScore(Number(localPlayer.score || 0));
    }
    this.fishingStore.setTimeLeft(getMatchTimeLeft(room, this.now()));
    if (room.state === "playing") {
      if (room.gameOptions.matchMode === "pk") this.scheduleBot(room);
      else this.cancelBotTimer();
      this.scheduleFinish(room);
      return;
    }
    this.cancelBotTimer();
    this.cancelFinishTimer();
    if (room.state === "finished") {
      this.persistResult(room);
    }
  }

  private scheduleBot(room: RoomSnapshot): void {
    const bot = room.players.find((player) => player.isBot || player.openid.startsWith("bot_"));
    const target = room.fishes.find((fish) => fish.id === room.targetFishId && fish.alive);
    if (!bot || !target) {
      this.cancelBotTimer();
      return;
    }
    const delay = getBotDelay(room);
    const roomId = String(room._id || this.roomStore.getState().roomId);
    const key = `${roomId}:${target.id}:${delay}`;
    if (this.botKey === key) return;
    this.cancelBotTimer();
    this.botKey = key;
    this.botTimer = this.scheduleTimer(() => {
      this.botTimer = null;
      void this.runBotCatch(roomId, target.id, key);
    }, delay);
  }

  private async runBotCatch(roomId: string, targetFishId: string, key: string): Promise<void> {
    if (this.botKey !== key || this.roomStore.getState().roomId !== roomId) return;
    const sessionVersion = this.roomStore.getSessionVersion();
    try {
      const response = await this.rooms.catchFish({
        roomId,
        action: "botCatch",
        targetFishId
      });
      if (!this.isCurrentRoomSession(roomId, sessionVersion) || this.botKey !== key) return;
      if (response.bot && response.correct) {
        this.fishingStore.showBotFeedback(response.delta);
      }
      const room = this.roomStore.getRoom();
      if (room) {
        const applied = applyCatchResponse(room, response);
        if (applied.hasSnapshot) this.roomStore.applySnapshot(applied.room);
      }
      await this.roomSession.refresh().catch(() => undefined);
    } catch (error) {
      this.botKey = "";
      this.logger.warn("bot.catch.fail", {
        reason: error instanceof Error ? error.name : "unknown"
      });
      const room = this.roomStore.getRoom();
      if (room?.state === "playing") this.scheduleBot(room);
    }
  }

  private scheduleFinish(room: RoomSnapshot): void {
    const roomId = String(room._id || this.roomStore.getState().roomId);
    const key = `${roomId}:${room.startedAt || 0}:${room.duration}`;
    if (this.finishKey === key) return;
    this.cancelFinishTimer();
    this.finishKey = key;
    const delayMs = Math.max(0, getMatchTimeLeft(room, this.now()) * 1000 + 50);
    this.finishTimer = this.scheduleTimer(() => {
      this.finishTimer = null;
      void this.finishByTimeout();
    }, delayMs);
  }

  private async finishByTimeout(): Promise<void> {
    const room = this.roomStore.getRoom();
    if (!room || room.state !== "playing") return;
    const now = this.now();
    const retryAfter = 1500 - (now - this.lastFinishAttemptAt);
    if (retryAfter > 0) {
      this.scheduleFinishRetry(room, retryAfter);
      return;
    }
    if (!this.fishingStore.beginFinish()) {
      this.scheduleFinishRetry(room, 100);
      return;
    }
    this.lastFinishAttemptAt = now;
    const roomId = this.requireRoomId();
    const sessionVersion = this.roomStore.getSessionVersion();
    try {
      await this.rooms.finishGame(roomId);
      if (!this.isCurrentRoomSession(roomId, sessionVersion)) return;
      await this.roomSession.refresh();
      this.fishingStore.endFinish();
    } catch (error) {
      const message = error instanceof Error ? error.message : "结算失败，请重试";
      this.fishingStore.endFinish(message);
      this.logger.warn("finish.fail", {
        reason: error instanceof Error ? error.name : "unknown"
      });
    } finally {
      const current = this.roomStore.getRoom();
      if (current?.state === "playing") {
        this.finishKey = "";
        this.scheduleFinish(current);
      }
    }
  }

  private scheduleFinishRetry(room: RoomSnapshot, delayMs: number): void {
    if (this.finishTimer != null) return;
    const roomId = String(room._id || this.roomStore.getState().roomId);
    this.finishKey = `retry:${roomId}:${this.lastFinishAttemptAt}`;
    this.finishTimer = this.scheduleTimer(() => {
      this.finishTimer = null;
      this.finishKey = "";
      void this.finishByTimeout();
    }, Math.max(50, Math.ceil(delayMs)));
  }

  private applyPowerUpResult(
    room: RoomSnapshot,
    localOpenId: string,
    selected: PowerUpSnapshot,
    response: CatchFishResponse
  ): void {
    const used = response.usedPowerUp;
    const players = room.players.map((player) => {
      if (player.openid === localOpenId) {
        return {
          ...player,
          score: Number(player.score || 0) + Number(response.delta || 0),
          combo: 0,
          powerUps: (player.powerUps || []).filter((powerUp) => powerUp.id !== selected.id),
          powerUp: null
        };
      }
      if (used?.type === "swatter" && used.targetOpenid === player.openid) {
        return {
          ...player,
          combo: 0,
          stunnedUntil: this.now() + Number(used.stunMs || 0)
        };
      }
      return player;
    });
    this.roomStore.applySnapshot({ ...room, players });
  }

  private persistWrongWords(): void {
    try {
      this.storage.writeWrongWords(this.wordBankStore.getWrongWords());
    } catch (error) {
      this.logger.warn("wrongWords.persist.fail", {
        reason: error instanceof Error ? error.name : "unknown"
      });
    }
  }

  private persistResult(room: RoomSnapshot): void {
    const bankLabel = this.getBankLabel(room.gameOptions.bankId);
    const record = createMatchRecord(
      room,
      this.playerStore.getLocalPlayer().openid,
      bankLabel
    );
    if (!record || this.persistedRecordIds.has(record.id)) return;
    this.persistedRecordIds.add(record.id);
    this.historyStore.addRecord(record);
    this.fishingStore.setResult(record);
    try {
      this.storage.writeMatchProgress(
        this.historyStore.getRecords(),
        this.historyStore.getBestScores()
      );
    } catch (error) {
      this.logger.warn("history.persist.fail", {
        reason: error instanceof Error ? error.name : "unknown"
      });
    }
  }

  private requireFishingRoom(): RoomSnapshot {
    const room = this.roomStore.getRoom();
    if (!room || !isFishingRoom(room)) {
      throw new FishingMatchError("当前没有进行中的捕词对局");
    }
    return room;
  }

  private requireRoomId(): string {
    const roomId = this.roomStore.getState().roomId;
    if (!roomId) throw new FishingMatchError("缺少房间 ID");
    return roomId;
  }

  private requireLocalOpenId(): string {
    const openid = this.playerStore.getLocalPlayer().openid;
    if (!openid) throw new FishingMatchError("你不在这个房间中");
    return openid;
  }

  private isCurrentRoomSession(roomId: string, sessionVersion: number): boolean {
    return this.roomStore.getSessionVersion() === sessionVersion
      && this.roomStore.getState().roomId === roomId;
  }

  private cancelBotTimer(): void {
    if (this.botTimer != null) this.cancelTimer(this.botTimer);
    this.botTimer = null;
    this.botKey = "";
  }

  private cancelFinishTimer(): void {
    if (this.finishTimer != null) this.cancelTimer(this.finishTimer);
    this.finishTimer = null;
    this.finishKey = "";
  }
}
