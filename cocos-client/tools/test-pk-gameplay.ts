import assert from "node:assert/strict";
import { MemoryRuntimePort } from "../assets/scripts/adapters/RuntimePort";
import type { CatchFishResponse } from "../assets/scripts/domain/CloudFunctionTypes";
import {
  evaluateFishingTap,
  getMatchTimeLeft
} from "../assets/scripts/domain/FishingRules";
import { buildRoomGameOptions, normalizeRoomSnapshot } from "../assets/scripts/domain/RoomRules";
import type { MatchRecord, RoomSnapshot } from "../assets/scripts/domain/RoomTypes";
import { PRIVACY_VERSION } from "../assets/scripts/domain/StorageKeys";
import { CloudService } from "../assets/scripts/services/CloudService";
import { FishingMatchService } from "../assets/scripts/services/FishingMatchService";
import { PrivacyService } from "../assets/scripts/services/PrivacyService";
import { RoomService } from "../assets/scripts/services/RoomService";
import type { RoomSessionService } from "../assets/scripts/services/RoomSessionService";
import { StorageService } from "../assets/scripts/services/StorageService";
import { FishingStore } from "../assets/scripts/store/FishingStore";
import { HistoryStore } from "../assets/scripts/store/HistoryStore";
import { PlayerStore } from "../assets/scripts/store/PlayerStore";
import { RoomStore } from "../assets/scripts/store/RoomStore";
import { WordBankStore } from "../assets/scripts/store/WordBankStore";

function createPkRoom(overrides: Partial<RoomSnapshot> = {}): RoomSnapshot {
  return {
    _id: "room-1",
    roomCode: "AB12CD",
    state: "playing",
    ownerOpenid: "player-1",
    players: [
      {
        openid: "player-1",
        nickName: "玩家1",
        score: 0,
        combo: 0,
        ready: true,
        powerUps: [{ id: "power-1", type: "pesticide", playerOpenid: "player-1" }]
      },
      {
        openid: "bot_AB12CD",
        nickName: "Emma",
        score: 0,
        combo: 0,
        ready: true,
        isBot: true,
        botDifficulty: "high",
        powerUps: []
      }
    ],
    fishes: [
      { id: "fish-target", word: "apple", correctWord: "apple", meaning: "苹果", alive: true, lane: 0, x: 20, vx: 8 },
      { id: "fish-wrong", word: "banana", correctWord: "banana", meaning: "香蕉", alive: true, lane: 1, x: 45, vx: -7 },
      { id: "fish-alias", word: "apple", correctWord: "apple", meaning: "苹果", alive: true, lane: 2, x: 70, vx: 6 }
    ],
    currentMeaning: "苹果",
    targetFishId: "fish-target",
    spellQuestion: null,
    spellSubmissions: {},
    duration: 60,
    gameOptions: buildRoomGameOptions({
      modeKey: "pk",
      bankId: "jilin-g1a-b1-welcome",
      wordMode: "regular",
      words: [
        { word: "apple", meaning: "苹果" },
        { word: "banana", meaning: "香蕉" }
      ],
      wrongWords: []
    }),
    winnerOpenid: "",
    usedWords: ["apple", "banana"],
    startedAt: 1000,
    updatedAt: 1000,
    ...overrides
  };
}

interface ScheduledTask {
  callback: () => void;
  delayMs: number;
  active: boolean;
}

class ManualScheduler {
  readonly tasks: ScheduledTask[] = [];

  schedule = (callback: () => void, delayMs: number): ScheduledTask => {
    const task = { callback, delayMs, active: true };
    this.tasks.push(task);
    return task;
  };

  cancel = (handle: unknown): void => {
    (handle as ScheduledTask).active = false;
  };

  runDelay(delayMs: number): void {
    const task = this.tasks.find((item) => item.active && item.delayMs === delayMs);
    assert.ok(task, `expected active task at ${delayMs}ms`);
    task.active = false;
    task.callback();
  }
}

function cloneRoom(room: RoomSnapshot): RoomSnapshot {
  return normalizeRoomSnapshot(room, room._id, room.roomCode);
}

async function flushAsync(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(resolve));
  await new Promise<void>((resolve) => setImmediate(resolve));
}

function testFishingRules(): void {
  const room = createPkRoom();
  const correct = evaluateFishingTap(room, "player-1", "fish-alias", 2000);
  assert.equal(correct.ok, true);
  assert.equal(correct.correct, true);
  assert.equal(correct.delta, 100);

  const wrong = evaluateFishingTap(room, "player-1", "fish-wrong", 2000);
  assert.equal(wrong.correct, false);
  assert.equal(wrong.delta, -100);
  assert.deepEqual(wrong.wrongWord, { word: "apple", meaning: "苹果" });

  room.players[0].stunnedUntil = 5000;
  assert.equal(evaluateFishingTap(room, "player-1", "fish-target", 3000).reason, "stunned");
  assert.equal(getMatchTimeLeft(createPkRoom(), 31_400), 30);

  const spellHistoryRoom = normalizeRoomSnapshot({
    ...createPkRoom(),
    spellHistory: [JSON.stringify({
      questionId: "q1",
      word: "apple",
      meaning: "苹果",
      reason: "answered",
      correct: true,
      delta: 100,
      teamScore: 100,
      finishedAt: 123,
      players: []
    })] as unknown as RoomSnapshot["spellHistory"]
  });
  assert.equal(spellHistoryRoom.spellHistory?.[0].questionId, "q1");
}

async function testOptimisticPkFlow(): Promise<void> {
  let now = 2000;
  const documents: Record<string, RoomSnapshot> = { "room-1": createPkRoom() };
  let resolveCatch: ((response: CatchFishResponse) => void) | null = null;
  let finishCalls = 0;
  const runtime = new MemoryRuntimePort({
    storage: { privacyAcceptedVersion: PRIVACY_VERSION },
    cloudDocuments: { rooms: documents },
    cloudHandlers: {
      catchFish: (data) => {
        const request = data as Record<string, unknown>;
        if (request.action === "botCatch") {
          const room = cloneRoom(documents["room-1"]);
          room.players[1].score += 100;
          room.targetFishId = "fish-alias";
          documents["room-1"] = room;
          return { delta: 100, correct: true, finished: false, bot: true, botOpenid: room.players[1].openid };
        }
        if (request.action === "usePowerUp") {
          const room = cloneRoom(documents["room-1"]);
          room.players[0].score += 300;
          room.players[0].powerUps = [];
          documents["room-1"] = room;
          return {
            delta: 300,
            correct: false,
            finished: false,
            usedPowerUp: {
              id: "power-1",
              type: "pesticide",
              playerOpenid: "player-1",
              bonus: 300
            }
          };
        }
        return new Promise<CatchFishResponse>((resolve) => {
          resolveCatch = resolve;
        });
      },
      finishGame: () => {
        finishCalls += 1;
        if (finishCalls === 1) {
          return { ok: false, reason: "not_timeout" };
        }
        const room = cloneRoom(documents["room-1"]);
        room.state = "finished";
        room.finishedAt = now;
        room.updatedAt = now;
        room.winnerOpenid = room.players[0].score > room.players[1].score ? "player-1" : "bot_AB12CD";
        documents["room-1"] = room;
        return { ok: true, winnerOpenid: room.winnerOpenid };
      }
    }
  });
  const storage = new StorageService(runtime);
  const privacy = new PrivacyService(storage, runtime);
  storage.configurePrivacyGate(() => privacy.hasAcceptedCurrentVersion());
  const cloud = new CloudService(runtime, () => privacy.requireAccepted("room"));
  await cloud.init("env-test");
  const roomApi = new RoomService(cloud);
  const roomStore = new RoomStore();
  const playerStore = new PlayerStore();
  const fishingStore = new FishingStore();
  const wordBankStore = new WordBankStore();
  const historyStore = new HistoryStore();
  const scheduler = new ManualScheduler();
  playerStore.setOpenId("player-1");

  const roomSession = {
    refresh: async () => {
      const room = cloneRoom(documents["room-1"]);
      roomStore.applySnapshot(room);
      return room;
    }
  } as unknown as RoomSessionService;
  const service = new FishingMatchService(
    roomApi,
    roomSession,
    roomStore,
    playerStore,
    fishingStore,
    wordBankStore,
    historyStore,
    storage,
    {
      now: () => now,
      schedule: scheduler.schedule,
      cancel: scheduler.cancel,
      getBankLabel: () => "吉林-一年级上-第一单元"
    }
  );
  roomStore.enter("room-1", "AB12CD", documents["room-1"]);

  const pendingCatch = service.catchFish("fish-wrong");
  assert.equal(fishingStore.getState().pendingAction, "catch");
  assert.equal(fishingStore.getState().optimisticScoreDelta, -100);
  assert.equal(fishingStore.getState().feedback?.type, "miss");
  assert.ok(resolveCatch);
  const wrongRoom = cloneRoom(documents["room-1"]);
  wrongRoom.players[0].score = -100;
  documents["room-1"] = wrongRoom;
  (resolveCatch as (response: CatchFishResponse) => void)({
    delta: -100,
    correct: false,
    finished: false,
    players: wrongRoom.players,
    fishes: wrongRoom.fishes,
    usedWords: wrongRoom.usedWords,
    currentMeaning: wrongRoom.currentMeaning,
    targetFishId: wrongRoom.targetFishId
  });
  await pendingCatch;
  assert.equal(fishingStore.getState().optimisticScoreDelta, 0);
  assert.deepEqual(wordBankStore.getWrongWords(), [{ word: "apple", meaning: "苹果" }]);
  assert.deepEqual(runtime.getStorage("wrongWords"), [{ word: "apple", meaning: "苹果" }]);

  await service.usePowerUp("power-1");
  assert.equal(roomStore.getRoom()?.players[0].score, 200);
  assert.equal(roomStore.getRoom()?.players[0].powerUps?.length, 0);

  resolveCatch = null;
  const abandonedCatch = service.catchFish("fish-target");
  assert.ok(resolveCatch);
  const abandonedRoom = cloneRoom(documents["room-1"]);
  roomStore.leave();
  (resolveCatch as (response: CatchFishResponse) => void)({
    delta: 100,
    correct: true,
    finished: false,
    players: abandonedRoom.players,
    fishes: abandonedRoom.fishes,
    usedWords: abandonedRoom.usedWords,
    currentMeaning: abandonedRoom.currentMeaning,
    targetFishId: abandonedRoom.targetFishId
  });
  await abandonedCatch;
  assert.equal(roomStore.getRoom(), null, "a late catch response must not restore an abandoned room");
  assert.equal(fishingStore.getState().pendingAction, null);
  roomStore.enter("room-1", "AB12CD", documents["room-1"]);

  scheduler.runDelay(1000);
  await flushAsync();
  assert.equal(roomStore.getRoom()?.players[1].score, 100);
  assert.equal(fishingStore.getState().feedback?.type, "bot");

  now = 62_000;
  assert.equal(service.updateClock(), 0);
  await flushAsync();
  assert.equal(finishCalls, 1);
  assert.equal(roomStore.getRoom()?.state, "playing");
  scheduler.runDelay(50);
  await flushAsync();
  now = 63_600;
  scheduler.runDelay(1500);
  await flushAsync();
  assert.equal(finishCalls, 2);
  assert.equal(roomStore.getRoom()?.state, "finished");
  const record = historyStore.getRecords("pk")[0];
  assert.ok(record);
  assert.equal(record.id, "pk:room-1");
  assert.equal(record.score, 200);
  assert.equal(record.result, "胜利");
  assert.equal(record.bankLabel, "吉林-一年级上-第一单元");
  assert.equal(fishingStore.getState().result?.id, record.id);
  assert.equal((runtime.getStorage<MatchRecord[]>("matchRecords") || [])[0].id, record.id);
  assert.equal(runtime.getStorage<Record<string, { score: number }>>("bestScoresByMode")?.pk.score, 200);
  service.dispose();
}

function testHistoryLimitsPerMode(): void {
  const history = new HistoryStore();
  const records: MatchRecord[] = [];
  (["pk", "coopShared"] as const).forEach((mode) => {
    for (let index = 0; index < 55; index += 1) {
      records.push({
        id: `${mode}:${index}`,
        modeKey: mode,
        modeLabel: mode === "pk" ? "双人PK" : "默契捕词赛",
        roomCode: "AB12CD",
        finishedAt: index + 1,
        result: mode === "pk" ? "胜利" : "默契捕词赛完成",
        winnerOpenid: "player-1",
        duration: 60,
        bankLabel: "词库",
        score: index,
        players: [{ openid: "player-1", nickName: "玩家1", score: index }]
      });
    }
  });
  history.replaceRecords(records);
  assert.equal(history.getRecords("pk").length, 50);
  assert.equal(history.getRecords("coopShared").length, 50);
  assert.equal(history.getRecords().length, 100);
  assert.equal(history.getRecords("pk")[0].score, 54);
}

async function main(): Promise<void> {
  testFishingRules();
  testHistoryLimitsPerMode();
  await testOptimisticPkFlow();
  console.log("Phase 5 PK core OK: optimistic input, correction, abandoned-response isolation, bot, timeout, and history.");
}

void main();
