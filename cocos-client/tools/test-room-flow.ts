import assert from "node:assert/strict";
import { MemoryRuntimePort } from "../assets/scripts/adapters/RuntimePort";
import {
  buildRoomGameOptions,
  getRoomActionAvailability,
  getRoomGameplayRoute,
  normalizeRoomSnapshot
} from "../assets/scripts/domain/RoomRules";
import type { RoomSnapshot } from "../assets/scripts/domain/RoomTypes";
import { PRIVACY_VERSION } from "../assets/scripts/domain/StorageKeys";
import { CloudService } from "../assets/scripts/services/CloudService";
import { PrivacyService } from "../assets/scripts/services/PrivacyService";
import { RoomPollingService } from "../assets/scripts/services/RoomPollingService";
import { RoomService } from "../assets/scripts/services/RoomService";
import { RoomSessionService, RoomSessionError } from "../assets/scripts/services/RoomSessionService";
import { ShareService } from "../assets/scripts/services/ShareService";
import { StorageService } from "../assets/scripts/services/StorageService";
import { PlayerStore } from "../assets/scripts/store/PlayerStore";
import { RoomStore } from "../assets/scripts/store/RoomStore";

function createRoom(
  overrides: Partial<RoomSnapshot> = {}
): RoomSnapshot {
  const gameOptions = buildRoomGameOptions({
    modeKey: "pk",
    duration: 60,
    bankId: "jilin-g1a-b1-welcome",
    wordMode: "regular",
    words: [{ word: "exchange", meaning: "交换" }],
    wrongWords: []
  });
  return {
    _id: "room-1",
    roomCode: "AB12CD",
    state: "waiting",
    ownerOpenid: "player-1",
    players: [{
      openid: "player-1",
      nickName: "玩家1",
      score: 0,
      ready: false,
      powerUps: []
    }],
    fishes: [],
    currentMeaning: "",
    targetFishId: "",
    spellQuestion: null,
    spellSubmissions: {},
    duration: 60,
    gameOptions,
    winnerOpenid: "",
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

  getNextDelay(): number | null {
    return this.tasks.find((task) => task.active)?.delayMs ?? null;
  }

  runNext(): void {
    const task = this.tasks.find((item) => item.active);
    assert.ok(task, "expected a scheduled polling task");
    task.active = false;
    task.callback();
  }
}

async function testRoomSessionFlow(): Promise<void> {
  const documents: Record<string, RoomSnapshot> = {};
  const initialRoom = createRoom();
  let failCreate = false;
  const runtime = new MemoryRuntimePort({
    storage: { privacyAcceptedVersion: PRIVACY_VERSION },
    shareSupported: false,
    cloudDocuments: { rooms: documents },
    cloudHandlers: {
      createRoom: () => {
        if (failCreate) throw new Error("创建服务暂不可用");
        documents["room-1"] = initialRoom;
        return { roomId: "room-1", roomCode: "AB12CD", room: initialRoom };
      },
      joinRoom: (data) => {
        const request = data as { roomCode: string };
        if (request.roomCode === "FAIL01") throw new Error("加入服务暂不可用");
        if (request.roomCode === "NOSYNC") {
          return {
            roomId: "room-3",
            roomCode: "NOSYNC",
            openid: "player-3"
          };
        }
        return {
          roomId: "room-2",
          roomCode: "ZX98YU",
          openid: "player-2"
        };
      },
      toggleReady: (data) => {
        const request = data as { roomId: string; ready: boolean };
        const room = documents[request.roomId];
        room.players = room.players.map((player) => player.openid === "player-1"
          ? { ...player, ready: request.ready }
          : player);
        return { ok: true, players: room.players, room };
      },
      addBot: (data) => {
        const request = data as { roomId: string; difficulty: "low" | "medium" | "high" };
        const room = documents[request.roomId];
        room.players = [
          room.players[0],
          {
            openid: `bot_${room.roomCode}`,
            nickName: "Emma",
            score: 0,
            ready: true,
            isBot: true,
            botDifficulty: request.difficulty
          }
        ];
        return { ok: true, players: room.players, gameOptions: room.gameOptions, room };
      },
      startGame: (data) => {
        const request = data as { roomId: string };
        const room = documents[request.roomId];
        room.state = "playing";
        return { ok: true, room };
      }
    }
  });
  const storage = new StorageService(runtime);
  const privacy = new PrivacyService(storage, runtime);
  storage.configurePrivacyGate(() => privacy.hasAcceptedCurrentVersion());
  const cloud = new CloudService(runtime, () => privacy.requireAccepted("room"));
  await cloud.init("env-test");
  const roomApi = new RoomService(cloud);
  const store = new RoomStore();
  const playerStore = new PlayerStore();
  const scheduler = new ManualScheduler();
  const polling = new RoomPollingService(roomApi, store, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel
  });
  const session = new RoomSessionService(
    roomApi,
    new ShareService(runtime, privacy),
    store,
    playerStore,
    polling
  );

  const created = await session.create(initialRoom.gameOptions);
  assert.equal(created.roomCode, "AB12CD");
  assert.equal(playerStore.getLocalPlayer().openid, "player-1");
  assert.equal(scheduler.getNextDelay(), 1000);

  await assert.rejects(
    () => session.join("123"),
    (error: unknown) => error instanceof RoomSessionError && error.code === "INVALID_ROOM_CODE"
  );
  assert.equal(store.getState().roomId, "room-1");
  assert.equal(playerStore.getLocalPlayer().openid, "player-1");
  assert.equal(polling.isRunning(), true);

  await assert.rejects(() => session.join("FAIL01"));
  assert.equal(store.getState().roomId, "room-1", "failed join must preserve the active room");
  assert.equal(playerStore.getLocalPlayer().openid, "player-1");
  assert.equal(polling.isRunning(), true);

  failCreate = true;
  await assert.rejects(() => session.create(initialRoom.gameOptions));
  failCreate = false;
  assert.equal(store.getState().roomId, "room-1", "failed create must preserve the active room");
  assert.equal(playerStore.getLocalPlayer().openid, "player-1");
  assert.equal(polling.isRunning(), true);

  const ready = await session.toggleReady();
  assert.equal(ready.players[0].ready, true);

  const withBot = await session.addBot("high");
  assert.equal(withBot.players[1].isBot, true);
  assert.equal(withBot.players[1].botDifficulty, "high");
  assert.equal(getRoomActionAvailability(withBot, "player-1").canStart, true);

  const playing = await session.startGame();
  assert.equal(playing.state, "playing");
  assert.equal(getRoomGameplayRoute(playing), "pkGame");

  const inviteResult = await session.invite();
  assert.equal(inviteResult, "copied");
  assert.equal(runtime.clipboardText, "AB12CD");
  session.leave();
  assert.equal(polling.isRunning(), false);

  const joinedRoom = createRoom({
    _id: "room-2",
    roomCode: "ZX98YU",
    ownerOpenid: "player-1",
    players: [
      { openid: "player-1", nickName: "玩家1", score: 0, ready: false },
      { openid: "player-2", nickName: "玩家2", score: 0, ready: false }
    ]
  });
  documents["room-2"] = joinedRoom;
  const joined = await session.join("zx-98yu");
  assert.ok(joined);
  assert.equal(joined._id, "room-2");
  assert.equal(playerStore.getLocalPlayer().openid, "player-2");
  assert.equal(runtime.cloudDocumentReads.at(-1)?.documentId, "room-2");

  const acceptedWithoutSnapshot = await session.join("NOSYNC");
  assert.equal(acceptedWithoutSnapshot, null);
  assert.equal(store.getState().roomId, "room-3");
  assert.equal(store.getState().roomCode, "NOSYNC");
  assert.equal(playerStore.getLocalPlayer().openid, "player-3");
  assert.equal(polling.isRunning(), true);
  assert.match(store.getState().syncError, /同步房间失败/);
  session.leave();

}

async function testPollingDeduplicatesReads(): Promise<void> {
  const store = new RoomStore();
  const room = createRoom();
  store.enter("room-1", "AB12CD", room);
  let fetchCount = 0;
  let resolveFetch: ((value: RoomSnapshot) => void) | null = null;
  const roomApi = {
    fetch: () => {
      fetchCount += 1;
      return new Promise<RoomSnapshot>((resolve) => {
        resolveFetch = resolve;
      });
    }
  } as unknown as RoomService;
  const scheduler = new ManualScheduler();
  const polling = new RoomPollingService(roomApi, store, {
    schedule: scheduler.schedule,
    cancel: scheduler.cancel
  });
  polling.start("room-1", false);
  const first = polling.refresh();
  const second = polling.refresh();
  assert.equal(fetchCount, 1);
  assert.equal(first, second);
  assert.ok(resolveFetch);
  (resolveFetch as (value: RoomSnapshot) => void)(room);
  await Promise.all([first, second]);
  assert.equal(scheduler.getNextDelay(), 80);
  polling.stop();
}

function testRoomRules(): void {
  const options = buildRoomGameOptions({
    modeKey: "coopSpell",
    duration: 90,
    bankId: "wrong",
    wordMode: "mistakes",
    words: [
      { word: "stable", meaning: "稳定的" },
      { word: "stable", meaning: "重复" }
    ],
    wrongWords: [{ word: "stable", meaning: "稳定的" }]
  });
  assert.equal(options.matchMode, "coop");
  assert.equal(options.coopMode, "spell");
  assert.equal(options.mode, "mistakes");
  assert.equal(options.roomWords?.length, 1);

  const coopRoom = normalizeRoomSnapshot(createRoom({
    state: "waiting",
    gameOptions: options,
    players: [
      { openid: "player-1", nickName: "玩家1", score: 0, ready: true },
      { openid: "bot-room", nickName: "机器人", score: 0, ready: true, isBot: true }
    ],
    createdAt: new Date("2026-01-01T00:00:00Z") as unknown as number
  }));
  const availability = getRoomActionAvailability(coopRoom, "player-1");
  assert.equal(availability.canAddBot, false);
  assert.equal(availability.canStart, false);
  assert.equal(availability.startBlockReason, "humanPlayersRequired");
  assert.equal(coopRoom.createdAt, Date.parse("2026-01-01T00:00:00Z"));
  assert.equal(getRoomGameplayRoute(coopRoom), "coopSpell");

  const sanitized = normalizeRoomSnapshot(createRoom({
    players: [
      { openid: "player-1", nickName: "旧自定义名称", score: 0 },
      { openid: "bot-room", nickName: "Emma", score: 0, isBot: true }
    ]
  }));
  assert.equal(sanitized.players[0].nickName, "玩家1");
  assert.equal(sanitized.players[1].nickName, "Emma");
}

async function main(): Promise<void> {
  testRoomRules();
  await testRoomSessionFlow();
  await testPollingDeduplicatesReads();
  console.log("Phase 4 room flow OK: rules, sessions, polling, sharing, and room routing.");
}

void main();
