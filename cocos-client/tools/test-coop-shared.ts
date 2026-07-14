import assert from "node:assert/strict";
import { MemoryRuntimePort } from "../assets/scripts/adapters/RuntimePort";
import type { CatchFishResponse } from "../assets/scripts/domain/CloudFunctionTypes";
import { getFishingTeamScore } from "../assets/scripts/domain/FishingRules";
import { buildRoomGameOptions, getRoomActionAvailability, normalizeRoomSnapshot } from "../assets/scripts/domain/RoomRules";
import type { MatchRecord, RoomSnapshot } from "../assets/scripts/domain/RoomTypes";
import { PRIVACY_VERSION } from "../assets/scripts/domain/StorageKeys";
import { CloudService } from "../assets/scripts/services/CloudService";
import { FishingMatchError, FishingMatchService } from "../assets/scripts/services/FishingMatchService";
import { PrivacyService } from "../assets/scripts/services/PrivacyService";
import { RoomService } from "../assets/scripts/services/RoomService";
import type { RoomSessionService } from "../assets/scripts/services/RoomSessionService";
import { StorageService } from "../assets/scripts/services/StorageService";
import { FishingStore } from "../assets/scripts/store/FishingStore";
import { HistoryStore } from "../assets/scripts/store/HistoryStore";
import { PlayerStore } from "../assets/scripts/store/PlayerStore";
import { RoomStore } from "../assets/scripts/store/RoomStore";
import { WordBankStore } from "../assets/scripts/store/WordBankStore";

function createSharedRoom(overrides: Partial<RoomSnapshot> = {}): RoomSnapshot {
  return {
    _id: "shared-room",
    roomCode: "SHARED",
    state: "playing",
    ownerOpenid: "player-1",
    players: [
      {
        openid: "player-1",
        nickName: "玩家1",
        score: 100,
        combo: 1,
        ready: true,
        powerUps: [{ id: "should-not-exist", type: "pesticide" }]
      },
      {
        openid: "player-2",
        nickName: "玩家2",
        score: 200,
        combo: 0,
        ready: true,
        powerUps: []
      }
    ],
    fishes: [
      { id: "target", word: "team", meaning: "团队", alive: true, x: 20, vx: 8 },
      { id: "wrong", word: "solo", meaning: "单独", alive: true, x: 70, vx: -7 }
    ],
    currentMeaning: "团队",
    targetFishId: "target",
    spellQuestion: null,
    spellSubmissions: {},
    duration: 60,
    gameOptions: buildRoomGameOptions({
      modeKey: "coopShared",
      bankId: "jilin-g1a-b1-welcome",
      wordMode: "regular",
      words: [
        { word: "team", meaning: "团队" },
        { word: "solo", meaning: "单独" }
      ],
      wrongWords: []
    }),
    winnerOpenid: "",
    usedWords: ["team", "solo"],
    startedAt: 1000,
    updatedAt: 1000,
    ...overrides
  };
}

interface ScheduledTask {
  delayMs: number;
  active: boolean;
}

class ManualScheduler {
  readonly tasks: ScheduledTask[] = [];

  schedule = (_callback: () => void, delayMs: number): ScheduledTask => {
    const task = { delayMs, active: true };
    this.tasks.push(task);
    return task;
  };

  cancel = (handle: unknown): void => {
    (handle as ScheduledTask).active = false;
  };

  hasActiveDelay(delayMs: number): boolean {
    return this.tasks.some((task) => task.active && task.delayMs === delayMs);
  }
}

function cloneRoom(room: RoomSnapshot): RoomSnapshot {
  return normalizeRoomSnapshot(room, room._id, room.roomCode);
}

async function flushAsync(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(resolve));
  await new Promise<void>((resolve) => setImmediate(resolve));
}

async function testSharedFlow(): Promise<void> {
  let now = 2000;
  const documents: Record<string, RoomSnapshot> = {
    "shared-room": createSharedRoom()
  };
  let resolveCatch: ((response: CatchFishResponse) => void) | null = null;
  let finishCalls = 0;
  const runtime = new MemoryRuntimePort({
    storage: { privacyAcceptedVersion: PRIVACY_VERSION },
    cloudDocuments: { rooms: documents },
    cloudHandlers: {
      catchFish: () => new Promise<CatchFishResponse>((resolve) => {
        resolveCatch = resolve;
      }),
      finishGame: () => {
        finishCalls += 1;
        const room = cloneRoom(documents["shared-room"]);
        room.state = "finished";
        room.winnerOpenid = "";
        room.finishedAt = now;
        room.updatedAt = now;
        documents["shared-room"] = room;
        return { ok: true, winnerOpenid: "" };
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
  const historyStore = new HistoryStore();
  const scheduler = new ManualScheduler();
  playerStore.setOpenId("player-1");
  const roomSession = {
    refresh: async () => {
      const room = cloneRoom(documents["shared-room"]);
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
    new WordBankStore(),
    historyStore,
    storage,
    {
      now: () => now,
      schedule: scheduler.schedule,
      cancel: scheduler.cancel,
      getBankLabel: () => "吉林-合作词库"
    }
  );

  roomStore.enter("shared-room", "SHARED", documents["shared-room"]);
  const initial = roomStore.getRoom()!;
  const waiting = normalizeRoomSnapshot({ ...initial, state: "waiting" });
  assert.equal(getRoomActionAvailability(waiting, "player-1").canStart, true);
  assert.equal(getFishingTeamScore(initial), 300);
  assert.equal(scheduler.hasActiveDelay(1000), false, "shared mode must not schedule a high bot");

  await assert.rejects(
    () => service.usePowerUp("should-not-exist"),
    (error: unknown) => error instanceof FishingMatchError && error.message === "默契捕词赛不使用道具"
  );
  assert.equal(runtime.cloudCalls.filter((call) => call.name === "catchFish").length, 0);

  const pending = service.catchFish("target");
  assert.equal(fishingStore.getState().optimisticScoreDelta, 100);
  assert.equal(getFishingTeamScore(roomStore.getRoom()!, fishingStore.getState().optimisticScoreDelta), 400);
  assert.ok(resolveCatch);
  const localResult = cloneRoom(documents["shared-room"]);
  localResult.players[0].score = 200;
  localResult.players[0].powerUps = [];
  documents["shared-room"] = localResult;
  (resolveCatch as (response: CatchFishResponse) => void)({
    delta: 100,
    correct: true,
    finished: false,
    players: localResult.players,
    fishes: localResult.fishes,
    usedWords: localResult.usedWords,
    currentMeaning: localResult.currentMeaning,
    targetFishId: localResult.targetFishId
  });
  await pending;
  assert.equal(getFishingTeamScore(roomStore.getRoom()!), 400);
  assert.equal(fishingStore.getState().optimisticScoreDelta, 0);

  const partnerResult = cloneRoom(documents["shared-room"]);
  partnerResult.players[1].score = 300;
  documents["shared-room"] = partnerResult;
  roomStore.applySnapshot(partnerResult);
  assert.equal(getFishingTeamScore(roomStore.getRoom()!), 500);

  now = 62_000;
  assert.equal(service.updateClock(), 0);
  await flushAsync();
  assert.equal(finishCalls, 1);
  assert.equal(roomStore.getRoom()?.state, "finished");
  assert.equal(roomStore.getRoom()?.winnerOpenid, "");
  const record = historyStore.getRecords("coopShared")[0];
  assert.ok(record);
  assert.equal(record.id, "coopShared:shared-room");
  assert.equal(record.modeLabel, "默契捕词赛");
  assert.equal(record.result, "默契捕词赛完成");
  assert.equal(record.score, 500);
  assert.equal(record.winnerOpenid, "");
  assert.equal(fishingStore.getState().result?.modeKey, "coopShared");
  assert.equal((runtime.getStorage<MatchRecord[]>("matchRecords") || [])[0].modeKey, "coopShared");
  assert.equal(runtime.getStorage<Record<string, { score: number }>>("bestScoresByMode")?.coopShared.score, 500);
  service.dispose();
}

async function main(): Promise<void> {
  await testSharedFlow();
  console.log("Phase 6 shared co-op OK: two-player team score, no bot/power-up, settlement, and history.");
}

void main();
