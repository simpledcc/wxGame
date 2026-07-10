import { Logger } from "../core/Logger";
import type { CatchFishResponse } from "../domain/CloudFunctionTypes";
import {
  getQuestionTimeLeft,
  getSpellQuestionId,
  getSpellSegment,
  getSpellSubmission,
  isCoopSpellRoom,
  isSpellSubmissionReady
} from "../domain/CoopSpellRules";
import { createMatchRecord } from "../domain/MatchRecordRules";
import type { RoomSnapshot, SpellQuestion, SpellSegment } from "../domain/RoomTypes";
import type { CoopSpellStore } from "../store/CoopSpellStore";
import type { HistoryStore } from "../store/HistoryStore";
import type { PlayerStore } from "../store/PlayerStore";
import type { RoomStore } from "../store/RoomStore";
import type { WordBankStore } from "../store/WordBankStore";
import type { RoomService } from "./RoomService";
import type { RoomSessionService } from "./RoomSessionService";
import type { StorageService } from "./StorageService";

export interface CoopSpellServiceOptions {
  now?: () => number;
  schedule?: (callback: () => void, delayMs: number) => unknown;
  cancel?: (handle: unknown) => void;
  getBankLabel?: (bankId: string) => string;
  logger?: Logger;
}

export class CoopSpellError extends Error {
  constructor(message: string, readonly silent = false) {
    super(message);
    this.name = "CoopSpellError";
  }
}

export class CoopSpellService {
  private readonly now: () => number;
  private readonly scheduleTimer: (callback: () => void, delayMs: number) => unknown;
  private readonly cancelTimer: (handle: unknown) => void;
  private readonly getBankLabel: (bankId: string) => string;
  private readonly logger: Logger;
  private readonly unsubscribeRoom: () => void;

  private activeRoomId = "";
  private remoteMatchStartedAt = 0;
  private localMatchStartedAt = 0;
  private questionTimer: unknown = null;
  private questionTimerKey = "";
  private totalTimer: unknown = null;
  private totalTimerKey = "";
  private lastFinishAttemptAt = Number.NEGATIVE_INFINITY;
  private readonly persistedRecordIds = new Set<string>();

  constructor(
    private readonly rooms: RoomService,
    private readonly roomSession: RoomSessionService,
    private readonly roomStore: RoomStore,
    private readonly playerStore: PlayerStore,
    private readonly spellStore: CoopSpellStore,
    private readonly wordBankStore: WordBankStore,
    private readonly historyStore: HistoryStore,
    private readonly storage: StorageService,
    options: CoopSpellServiceOptions = {}
  ) {
    this.now = options.now ?? (() => Date.now());
    this.scheduleTimer = options.schedule ?? ((callback, delayMs) => setTimeout(callback, delayMs));
    this.cancelTimer = options.cancel ?? ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>));
    this.getBankLabel = options.getBankLabel ?? (() => "词库");
    this.logger = options.logger ?? new Logger("CoopSpellService");
    this.unsubscribeRoom = this.roomStore.subscribe((state) => this.handleRoomSnapshot(state.room));
  }

  getLocalSegment(): SpellSegment | null {
    const room = this.roomStore.getRoom();
    if (!room || !isCoopSpellRoom(room)) return null;
    return getSpellSegment(
      room.spellQuestion,
      room.players,
      this.playerStore.getLocalPlayer().openid
    );
  }

  addLetter(letter: string): boolean {
    const segment = this.getLocalSegment();
    if (!segment) return false;
    return this.spellStore.addLetter(letter, Number(segment.length || 0));
  }

  backspace(): boolean {
    return this.spellStore.backspace();
  }

  clearDraft(): void {
    this.spellStore.clearDraft();
  }

  async submit(): Promise<CatchFishResponse> {
    const room = this.requireSpellRoom();
    const question = this.requireQuestion(room);
    const localOpenId = this.requireLocalOpenId();
    const roomId = this.requireRoomId();
    const sessionVersion = this.roomStore.getSessionVersion();
    const segment = getSpellSegment(question, room.players, localOpenId);
    if (!segment) throw new CoopSpellError("还没有分配拼词片段");
    const state = this.spellStore.getState();
    const expectedLength = Number(segment.length || 0);
    if (state.localSubmitted) throw new CoopSpellError("你已填写，等待队友");
    if (state.draft.length !== expectedLength) {
      throw new CoopSpellError(`还差 ${Math.max(0, expectedLength - state.draft.length)} 个字母`);
    }
    const optimistic = this.spellStore.beginSubmit(localOpenId, expectedLength, this.now());
    if (!optimistic) throw new CoopSpellError("当前暂时不能提交");
    const questionId = question.id;
    try {
      const response = await this.rooms.catchFish({
        roomId,
        action: "submitCoopSpell",
        questionId,
        answer: optimistic.answer
      });
      if (!this.isCurrentRoomSession(roomId, sessionVersion)) return response;
      if (this.spellStore.getState().activeQuestionId !== questionId) {
        await this.roomSession.refresh().catch(() => undefined);
        return response;
      }
      if (response.stale) {
        this.spellStore.rollbackSubmit(questionId, "题目已更新");
        await this.roomSession.refresh().catch(() => undefined);
        return response;
      }
      if (response.roundComplete) {
        if (!response.correct) this.rememberWrongWord(question);
        this.applyTeamScore(response.teamScore);
        this.spellStore.markAdvancing(
          questionId,
          response.correct ? "+100，正在切换下一词" : "-100，正在切换下一词"
        );
      } else if (response.submitted || response.waitingPartner) {
        this.spellStore.confirmWaiting(questionId);
      }
      await this.roomSession.refresh().catch(() => undefined);
      return response;
    } catch (error) {
      if (!this.isCurrentRoomSession(roomId, sessionVersion)) {
        throw new CoopSpellError("操作已取消", true);
      }
      const message = error instanceof Error ? error.message : "提交失败";
      this.spellStore.rollbackSubmit(questionId, message);
      throw error;
    }
  }

  async skip(manual = true): Promise<CatchFishResponse> {
    return this.skipQuestion(manual, this.spellStore.getState().activeQuestionId);
  }

  updateClocks(now = this.now()): { questionTimeLeft: number; totalTimeLeft: number } {
    const room = this.roomStore.getRoom();
    if (!room || !isCoopSpellRoom(room) || room.state !== "playing") {
      const state = this.spellStore.getState();
      return {
        questionTimeLeft: state.questionTimeLeft,
        totalTimeLeft: state.totalTimeLeft
      };
    }
    const state = this.spellStore.getState();
    const questionTimeLeft = getQuestionTimeLeft(state.localQuestionStartedAt, now);
    const totalTimeLeft = this.getTotalTimeLeft(room, now);
    this.spellStore.setClocks(questionTimeLeft, totalTimeLeft);
    if (
      questionTimeLeft <= 0
      && this.questionTimer == null
      && state.autoTimeoutQuestionId !== state.activeQuestionId
    ) {
      void this.skipQuestion(false, state.activeQuestionId).catch(() => undefined);
    }
    if (totalTimeLeft <= 0) {
      void this.finishByTimeout();
    }
    return { questionTimeLeft, totalTimeLeft };
  }

  reset(): void {
    this.cancelQuestionTimer();
    this.cancelTotalTimer();
    this.activeRoomId = "";
    this.remoteMatchStartedAt = 0;
    this.localMatchStartedAt = 0;
    this.spellStore.reset();
  }

  dispose(): void {
    this.reset();
    this.unsubscribeRoom();
  }

  private handleRoomSnapshot(room: RoomSnapshot | null): void {
    if (!room || !isCoopSpellRoom(room)) {
      this.cancelQuestionTimer();
      this.cancelTotalTimer();
      if (!room || this.activeRoomId) {
        this.activeRoomId = "";
        this.remoteMatchStartedAt = 0;
        this.localMatchStartedAt = 0;
        this.spellStore.reset();
      }
      return;
    }
    const roomId = String(room._id || this.roomStore.getState().roomId);
    if (roomId && roomId !== this.activeRoomId) {
      this.activeRoomId = roomId;
      this.remoteMatchStartedAt = 0;
      this.localMatchStartedAt = 0;
      this.spellStore.reset();
    }
    this.syncMatchClock(room);
    const questionId = getSpellQuestionId(room.spellQuestion);
    const localOpenId = this.playerStore.getLocalPlayer().openid;
    const localSubmission = getSpellSubmission(room.spellSubmissions, questionId, localOpenId);
    this.spellStore.syncQuestion(
      questionId,
      isSpellSubmissionReady(localSubmission),
      this.now()
    );
    const state = this.spellStore.getState();
    this.spellStore.setClocks(
      getQuestionTimeLeft(state.localQuestionStartedAt, this.now()),
      this.getTotalTimeLeft(room, this.now())
    );
    if (room.state === "playing") {
      this.scheduleQuestionTimeout(room);
      this.scheduleTotalTimeout(room);
      return;
    }
    this.cancelQuestionTimer();
    this.cancelTotalTimer();
    if (room.state === "finished") this.persistResult(room);
  }

  private async skipQuestion(manual: boolean, expectedQuestionId: string): Promise<CatchFishResponse> {
    const room = this.requireSpellRoom();
    const question = this.requireQuestion(room);
    const roomId = this.requireRoomId();
    const sessionVersion = this.roomStore.getSessionVersion();
    if (question.id !== expectedQuestionId) {
      throw new CoopSpellError("题目已更新");
    }
    if (!this.spellStore.beginSkip(question.id, !manual)) {
      if (!manual) this.scheduleQuestionRetry(question.id, 100);
      throw new CoopSpellError("当前操作尚未完成");
    }
    try {
      const response = await this.rooms.catchFish({
        roomId,
        action: manual ? "skipCoopSpell" : "timeoutCoopSpell",
        questionId: question.id
      });
      if (!this.isCurrentRoomSession(roomId, sessionVersion)) return response;
      if (this.spellStore.getState().activeQuestionId !== question.id) {
        await this.roomSession.refresh().catch(() => undefined);
        return response;
      }
      if (response.tooEarly) {
        this.spellStore.rollbackSkip(question.id);
        this.scheduleQuestionRetry(question.id, Math.max(50, Number(response.retryAfter || 250)));
        return response;
      }
      if (response.stale) {
        this.spellStore.rollbackSkip(question.id, "题目已更新");
        await this.roomSession.refresh().catch(() => undefined);
        return response;
      }
      this.rememberWrongWord(question);
      this.applyTeamScore(response.teamScore);
      this.spellStore.markAdvancing(
        question.id,
        manual ? "跳过 -100，正在切词" : "时间到，自动换词"
      );
      await this.roomSession.refresh().catch(() => undefined);
      return response;
    } catch (error) {
      if (!this.isCurrentRoomSession(roomId, sessionVersion)) {
        throw new CoopSpellError("操作已取消", true);
      }
      const message = error instanceof Error ? error.message : "无法切换当前单词";
      this.spellStore.rollbackSkip(question.id, message);
      if (!manual) this.scheduleQuestionRetry(question.id, 500);
      throw error;
    }
  }

  private scheduleQuestionTimeout(room: RoomSnapshot): void {
    const state = this.spellStore.getState();
    const questionId = state.activeQuestionId;
    if (!questionId || state.advancingQuestionId === questionId) {
      this.cancelQuestionTimer();
      return;
    }
    const key = `${room._id || this.roomStore.getState().roomId}:${questionId}:${state.localQuestionStartedAt}`;
    if (this.questionTimerKey === key) return;
    this.cancelQuestionTimer();
    this.questionTimerKey = key;
    const delay = Math.max(50, getQuestionTimeLeft(state.localQuestionStartedAt, this.now()) * 1000 + 50);
    this.questionTimer = this.scheduleTimer(() => {
      this.questionTimer = null;
      this.questionTimerKey = "";
      void this.skipQuestion(false, questionId).catch(() => undefined);
    }, delay);
  }

  private scheduleQuestionRetry(questionId: string, delayMs: number): void {
    if (this.questionTimer != null || this.spellStore.getState().activeQuestionId !== questionId) return;
    this.questionTimerKey = `retry:${questionId}:${delayMs}`;
    this.questionTimer = this.scheduleTimer(() => {
      this.questionTimer = null;
      this.questionTimerKey = "";
      void this.skipQuestion(false, questionId).catch(() => undefined);
    }, Math.max(50, Math.ceil(delayMs)));
  }

  private scheduleTotalTimeout(room: RoomSnapshot): void {
    const roomId = String(room._id || this.roomStore.getState().roomId);
    const key = `${roomId}:${room.startedAt || 0}:${room.duration}`;
    if (this.totalTimerKey === key) return;
    this.cancelTotalTimer();
    this.totalTimerKey = key;
    this.totalTimer = this.scheduleTimer(() => {
      this.totalTimer = null;
      void this.finishByTimeout();
    }, Math.max(50, this.getTotalTimeLeft(room, this.now()) * 1000 + 50));
  }

  private async finishByTimeout(): Promise<void> {
    const room = this.roomStore.getRoom();
    if (!room || !isCoopSpellRoom(room) || room.state !== "playing") return;
    const now = this.now();
    const retryAfter = 1500 - (now - this.lastFinishAttemptAt);
    if (retryAfter > 0) {
      this.scheduleTotalRetry(retryAfter);
      return;
    }
    if (!this.spellStore.beginFinish()) {
      this.scheduleTotalRetry(100);
      return;
    }
    this.lastFinishAttemptAt = now;
    const roomId = this.requireRoomId();
    const sessionVersion = this.roomStore.getSessionVersion();
    try {
      await this.rooms.finishGame(roomId);
      if (!this.isCurrentRoomSession(roomId, sessionVersion)) return;
      await this.roomSession.refresh();
      this.spellStore.endFinish();
    } catch (error) {
      const message = error instanceof Error ? error.message : "结算失败，请重试";
      this.spellStore.endFinish(message);
      this.logger.warn("finish.fail", {
        reason: error instanceof Error ? error.name : "unknown"
      });
    } finally {
      const current = this.roomStore.getRoom();
      if (current?.state === "playing" && isCoopSpellRoom(current)) {
        this.totalTimerKey = "";
        this.scheduleTotalTimeout(current);
      }
    }
  }

  private scheduleTotalRetry(delayMs: number): void {
    if (this.totalTimer != null) return;
    this.totalTimerKey = `retry:${this.activeRoomId}:${this.lastFinishAttemptAt}`;
    this.totalTimer = this.scheduleTimer(() => {
      this.totalTimer = null;
      this.totalTimerKey = "";
      void this.finishByTimeout();
    }, Math.max(50, Math.ceil(delayMs)));
  }

  private applyTeamScore(value: number | undefined): void {
    if (!Number.isFinite(Number(value))) return;
    const room = this.roomStore.getRoom();
    if (!room) return;
    const teamScore = Number(value);
    this.roomStore.applySnapshot({
      ...room,
      teamScore,
      players: room.players.map((player) => ({ ...player, score: teamScore }))
    });
  }

  private rememberWrongWord(question: SpellQuestion): void {
    if (!question.word || !question.meaning) return;
    if (!this.wordBankStore.addWrongWord({ word: question.word, meaning: question.meaning })) return;
    try {
      this.storage.writeWrongWords(this.wordBankStore.getWrongWords());
    } catch (error) {
      this.logger.warn("wrongWords.persist.fail", {
        reason: error instanceof Error ? error.name : "unknown"
      });
    }
  }

  private persistResult(room: RoomSnapshot): void {
    const record = createMatchRecord(
      room,
      this.playerStore.getLocalPlayer().openid,
      this.getBankLabel(room.gameOptions.bankId)
    );
    if (!record || this.persistedRecordIds.has(record.id)) return;
    this.persistedRecordIds.add(record.id);
    this.historyStore.addRecord(record);
    this.spellStore.setResult(record);
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

  private requireSpellRoom(): RoomSnapshot {
    const room = this.roomStore.getRoom();
    if (!room || !isCoopSpellRoom(room)) {
      throw new CoopSpellError("当前没有进行中的同舟拼词记");
    }
    return room;
  }

  private requireQuestion(room: RoomSnapshot): SpellQuestion {
    if (!room.spellQuestion?.id) throw new CoopSpellError("正在等待拼词题");
    return room.spellQuestion;
  }

  private requireRoomId(): string {
    const roomId = this.roomStore.getState().roomId;
    if (!roomId) throw new CoopSpellError("缺少房间 ID");
    return roomId;
  }

  private requireLocalOpenId(): string {
    const openid = this.playerStore.getLocalPlayer().openid;
    if (!openid) throw new CoopSpellError("你不在这个房间中");
    return openid;
  }

  private isCurrentRoomSession(roomId: string, sessionVersion: number): boolean {
    return this.roomStore.getSessionVersion() === sessionVersion
      && this.roomStore.getState().roomId === roomId;
  }

  private syncMatchClock(room: RoomSnapshot): void {
    const remoteStartedAt = Number(room.startedAt || 0);
    if (!this.localMatchStartedAt || remoteStartedAt !== this.remoteMatchStartedAt) {
      this.remoteMatchStartedAt = remoteStartedAt;
      this.localMatchStartedAt = this.now();
    }
  }

  private getTotalTimeLeft(room: RoomSnapshot, now: number): number {
    if (!this.localMatchStartedAt) this.syncMatchClock(room);
    const elapsed = Math.max(0, now - this.localMatchStartedAt) / 1000;
    return Math.max(0, Math.ceil(Number(room.duration || 60) - elapsed));
  }

  private cancelQuestionTimer(): void {
    if (this.questionTimer != null) this.cancelTimer(this.questionTimer);
    this.questionTimer = null;
    this.questionTimerKey = "";
  }

  private cancelTotalTimer(): void {
    if (this.totalTimer != null) this.cancelTimer(this.totalTimer);
    this.totalTimer = null;
    this.totalTimerKey = "";
  }
}
