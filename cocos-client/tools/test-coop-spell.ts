import assert from "node:assert/strict";
import { MemoryRuntimePort } from "../assets/scripts/adapters/RuntimePort";
import type { CatchFishResponse } from "../assets/scripts/domain/CloudFunctionTypes";
import {
  buildSpellCells,
  getActiveSpellSubmissions,
  getSpellSegment
} from "../assets/scripts/domain/CoopSpellRules";
import { buildRoomGameOptions, normalizeRoomSnapshot } from "../assets/scripts/domain/RoomRules";
import type {
  MatchRecord,
  RoomSnapshot,
  SpellQuestion,
  SpellRoundRecord
} from "../assets/scripts/domain/RoomTypes";
import { PRIVACY_VERSION } from "../assets/scripts/domain/StorageKeys";
import { CloudService } from "../assets/scripts/services/CloudService";
import { CoopSpellService } from "../assets/scripts/services/CoopSpellService";
import { PrivacyService } from "../assets/scripts/services/PrivacyService";
import { RoomService } from "../assets/scripts/services/RoomService";
import type { RoomSessionService } from "../assets/scripts/services/RoomSessionService";
import { StorageService } from "../assets/scripts/services/StorageService";
import { CoopSpellStore } from "../assets/scripts/store/CoopSpellStore";
import { HistoryStore } from "../assets/scripts/store/HistoryStore";
import { PlayerStore } from "../assets/scripts/store/PlayerStore";
import { RoomStore } from "../assets/scripts/store/RoomStore";
import { WordBankStore } from "../assets/scripts/store/WordBankStore";

function createQuestion(id: string, word: string, meaning: string): SpellQuestion {
  const letters = Array.from(word.toLowerCase());
  assert.equal(letters.length, 4, "test questions use four-letter words");
  return {
    id,
    key: word.toLowerCase(),
    wordKey: word.toLowerCase(),
    word: word.toLowerCase(),
    meaning,
    mask: "____",
    blankPositions: [0, 1, 2, 3],
    slots: letters.map((answer, index) => ({ index, position: index, answer })),
    mode: "boatLetters",
    segments: [
      {
        openid: "player-1",
        start: 1,
        end: 2,
        length: 2,
        slotIndexes: [0, 1],
        answer: letters.slice(0, 2).join("")
      },
      {
        openid: "player-2",
        start: 3,
        end: 4,
        length: 2,
        slotIndexes: [2, 3],
        answer: letters.slice(2).join("")
      }
    ],
    createdAt: 1
  };
}

function createSpellRoom(question: SpellQuestion): RoomSnapshot {
  return {
    _id: "spell-room",
    roomCode: "SPELL1",
    state: "playing",
    ownerOpenid: "player-1",
    players: [
      { openid: "player-1", nickName: "玩家1", score: 0, ready: true },
      { openid: "player-2", nickName: "玩家2", score: 0, ready: true }
    ],
    fishes: [],
    currentMeaning: question.meaning,
    targetFishId: question.id,
    spellQuestion: question,
    spellSubmissions: { _questionId: question.id, _resetAt: 1 },
    spellHistory: [],
    teamScore: 0,
    duration: 60,
    gameOptions: buildRoomGameOptions({
      modeKey: "coopSpell",
      bankId: "jilin-g1a-b1-welcome",
      wordMode: "regular",
      words: [
        { word: "team", meaning: "团队" },
        { word: "boat", meaning: "小船" },
        { word: "game", meaning: "游戏" },
        { word: "word", meaning: "单词" }
      ],
      wrongWords: []
    }),
    winnerOpenid: "",
    usedWords: [question.word],
    startedAt: 1,
    updatedAt: 1
  };
}

function createRound(
  question: SpellQuestion,
  reason: SpellRoundRecord["reason"],
  delta: number,
  teamScore: number,
  players: SpellRoundRecord["players"]
): SpellRoundRecord {
  return {
    questionId: question.id,
    word: question.word,
    meaning: question.meaning,
    mask: question.mask,
    reason,
    correct: delta > 0,
    delta,
    teamScore,
    finishedAt: 1,
    players
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

  hasActiveDelay(delayMs: number): boolean {
    return this.tasks.some((task) => task.active && task.delayMs === delayMs);
  }

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
  await new Promise<void>((resolve) => setImmediate(resolve));
}

async function testSpellQuestionIsolationAndHistory(): Promise<void> {
  let now = 100_000;
  const q1 = createQuestion("q1", "team", "团队");
  const q2 = createQuestion("q2", "boat", "小船");
  const q3 = createQuestion("q3", "game", "游戏");
  const q4 = createQuestion("q4", "word", "单词");
  const serialized = normalizeRoomSnapshot({
    ...createSpellRoom(q1),
    spellQuestion: JSON.stringify(q1) as unknown as SpellQuestion
  });
  assert.equal(serialized.spellQuestion?.id, "q1");
  assert.equal(serialized.spellQuestion?.segments[0].answer, "te");
  assert.deepEqual(getActiveSpellSubmissions({
    _questionId: "q2",
    "player-1": { status: "submitted", questionId: "q1", answer: "te" }
  }, "q2"), {});

  const documents: Record<string, RoomSnapshot> = {
    "spell-room": cloneRoom(createSpellRoom(q1))
  };
  let resolveQ1: ((response: CatchFishResponse) => void) | null = null;
  let timeoutCalls = 0;
  const wrongRound = createRound(q2, "answered", -100, -100, [
    {
      openid: "player-1",
      nickName: "玩家1",
      slotIndexes: [0, 1],
      expectedLength: 2,
      submitted: true,
      answer: "bo",
      correct: true,
      submittedAt: now
    },
    {
      openid: "player-2",
      nickName: "玩家2",
      slotIndexes: [2, 3],
      expectedLength: 2,
      submitted: true,
      answer: "zz",
      correct: false,
      submittedAt: now
    }
  ]);
  const timeoutRound = createRound(q3, "timeout", 0, -100, [
    {
      openid: "player-1",
      nickName: "玩家1",
      slotIndexes: [0, 1],
      expectedLength: 2,
      submitted: false,
      answer: "",
      correct: false,
      submittedAt: 0
    },
    {
      openid: "player-2",
      nickName: "玩家2",
      slotIndexes: [2, 3],
      expectedLength: 2,
      submitted: true,
      answer: "me",
      correct: true,
      submittedAt: now
    }
  ]);

  const runtime = new MemoryRuntimePort({
    storage: { privacyAcceptedVersion: PRIVACY_VERSION },
    cloudDocuments: { rooms: documents },
    cloudHandlers: {
      catchFish: (data) => {
        const request = data as { action: string; questionId: string; answer?: string };
        if (request.action === "submitCoopSpell" && request.questionId === "q1") {
          return new Promise<CatchFishResponse>((resolve) => {
            resolveQ1 = resolve;
          });
        }
        if (request.action === "submitCoopSpell" && request.questionId === "q2") {
          const room = cloneRoom(documents["spell-room"]);
          room.players = room.players.map((player) => ({ ...player, score: -100 }));
          room.teamScore = -100;
          room.spellQuestion = q3;
          room.spellSubmissions = { _questionId: q3.id, _resetAt: now };
          room.spellHistory = [JSON.stringify(wrongRound)] as unknown as SpellRoundRecord[];
          room.currentMeaning = q3.meaning;
          room.targetFishId = q3.id;
          documents["spell-room"] = room;
          return {
            delta: -100,
            correct: false,
            submitted: true,
            roundComplete: true,
            teamScore: -100,
            roundRecord: wrongRound,
            finished: false
          };
        }
        if (request.action === "timeoutCoopSpell" && request.questionId === "q3") {
          timeoutCalls += 1;
          if (timeoutCalls === 1) {
            return {
              delta: 0,
              correct: false,
              finished: false,
              tooEarly: true,
              retryAfter: 350
            };
          }
          const room = cloneRoom(documents["spell-room"]);
          room.spellQuestion = q4;
          room.spellSubmissions = { _questionId: q4.id, _resetAt: now };
          room.spellHistory = [
            JSON.stringify(wrongRound),
            JSON.stringify(timeoutRound)
          ] as unknown as SpellRoundRecord[];
          room.currentMeaning = q4.meaning;
          room.targetFishId = q4.id;
          documents["spell-room"] = room;
          return {
            delta: 0,
            correct: false,
            skipped: true,
            automatic: true,
            teamScore: -100,
            roundRecord: timeoutRound,
            finished: false
          };
        }
        throw new Error(`unexpected catch action ${request.action}:${request.questionId}`);
      },
      finishGame: () => {
        const room = cloneRoom(documents["spell-room"]);
        const gameOverRound = createRound(q4, "gameOver", 0, -100, []);
        room.state = "finished";
        room.finishedAt = now;
        room.updatedAt = now;
        room.spellHistory = [wrongRound, timeoutRound, gameOverRound];
        documents["spell-room"] = room;
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
  const spellStore = new CoopSpellStore();
  const wordBankStore = new WordBankStore();
  const historyStore = new HistoryStore();
  const scheduler = new ManualScheduler();
  playerStore.setOpenId("player-1");
  const roomSession = {
    refresh: async () => {
      const room = cloneRoom(documents["spell-room"]);
      roomStore.applySnapshot(room);
      return room;
    }
  } as unknown as RoomSessionService;
  const service = new CoopSpellService(
    roomApi,
    roomSession,
    roomStore,
    playerStore,
    spellStore,
    wordBankStore,
    historyStore,
    storage,
    {
      now: () => now,
      schedule: scheduler.schedule,
      cancel: scheduler.cancel,
      getBankLabel: () => "吉林-拼词词库"
    }
  );

  roomStore.enter("spell-room", "SPELL1", documents["spell-room"]);
  assert.equal(spellStore.getState().activeQuestionId, "q1");
  assert.equal(spellStore.getState().totalTimeLeft, 60, "total clock must use a local anchor despite device clock skew");
  assert.equal(scheduler.hasActiveDelay(20_050), true);
  assert.equal(scheduler.hasActiveDelay(60_050), true);
  const q1Segment = getSpellSegment(roomStore.getRoom()!.spellQuestion, roomStore.getRoom()!.players, "player-1");
  assert.equal(q1Segment?.answer, "te");
  assert.equal(service.addLetter("T"), true);
  assert.equal(service.addLetter("e"), true);
  assert.deepEqual(spellStore.getState().draft, ["t", "e"]);
  const cells = buildSpellCells(q1, q1Segment, spellStore.getState().draft, null);
  assert.equal(cells.filter((cell) => cell.local).map((cell) => cell.letter).join(""), "TE");
  assert.equal(cells.filter((cell) => cell.blank && !cell.local).every((cell) => cell.letter === ""), true);

  const lateSubmit = service.submit();
  assert.equal(spellStore.getState().localSubmitted, true);
  assert.ok(resolveQ1);
  const switched = cloneRoom(documents["spell-room"]);
  switched.spellQuestion = q2;
  switched.spellSubmissions = { _questionId: q2.id, _resetAt: now };
  switched.currentMeaning = q2.meaning;
  switched.targetFishId = q2.id;
  documents["spell-room"] = switched;
  roomStore.applySnapshot(switched);
  assert.equal(spellStore.getState().activeQuestionId, "q2");
  assert.deepEqual(spellStore.getState().draft, []);
  assert.equal(spellStore.getState().localSubmitted, false);
  (resolveQ1 as (response: CatchFishResponse) => void)({
    delta: 0,
    correct: true,
    submitted: true,
    waitingPartner: true,
    finished: false
  });
  await lateSubmit;
  assert.equal(spellStore.getState().activeQuestionId, "q2");
  assert.deepEqual(spellStore.getState().draft, [], "late q1 response must not restore q1 input");
  assert.equal(spellStore.getState().localSubmitted, false);

  service.addLetter("b");
  service.addLetter("o");
  await service.submit();
  assert.equal(spellStore.getState().activeQuestionId, "q3");
  assert.deepEqual(spellStore.getState().draft, []);
  assert.deepEqual(wordBankStore.getWrongWords(), [{ word: "boat", meaning: "小船" }]);
  assert.equal(roomStore.getRoom()?.teamScore, -100);

  service.addLetter("g");
  assert.deepEqual(spellStore.getState().draft, ["g"]);
  now += 20_050;
  scheduler.runDelay(20_050);
  await flushAsync();
  assert.equal(timeoutCalls, 1);
  assert.equal(scheduler.hasActiveDelay(350), true, "tooEarly must schedule the server-provided retry delay");
  service.updateClocks(now);
  service.updateClocks(now);
  await flushAsync();
  assert.equal(timeoutCalls, 1, "frame updates must respect the scheduled server retry");
  now += 350;
  scheduler.runDelay(350);
  await flushAsync();
  assert.equal(timeoutCalls, 2);
  assert.equal(spellStore.getState().activeQuestionId, "q4");
  assert.deepEqual(spellStore.getState().draft, [], "timeout question change must clear the old draft");
  assert.deepEqual(wordBankStore.getWrongWords(), [
    { word: "game", meaning: "游戏" },
    { word: "boat", meaning: "小船" }
  ]);

  now = 160_100;
  scheduler.runDelay(60_050);
  await flushAsync();
  assert.equal(roomStore.getRoom()?.state, "finished");
  const record = historyStore.getRecords("coopSpell")[0];
  assert.ok(record);
  assert.equal(record.id, "coopSpell:spell-room");
  assert.equal(record.score, -100);
  assert.equal(record.teamScore, -100);
  assert.equal(record.bankLabel, "吉林-拼词词库");
  assert.deepEqual(record.spellHistory?.map((round) => round.reason), [
    "answered",
    "timeout",
    "gameOver"
  ]);
  assert.equal(record.spellHistory?.[0].players[1].answer, "zz");
  assert.equal(record.spellHistory?.[0].players[1].correct, false);
  assert.equal(record.spellHistory?.[1].players[0].submitted, false);
  assert.equal(spellStore.getState().result?.id, record.id);
  const storedRecords = runtime.getStorage<MatchRecord[]>("matchRecords") || [];
  assert.equal(storedRecords[0].spellHistory?.length, 3);
  assert.equal(runtime.getStorage<Record<string, { score: number }>>("bestScoresByMode")?.coopSpell.score, -100);

  roomStore.enter("pk-room", "PK0001", {
    ...cloneRoom(documents["spell-room"]),
    _id: "pk-room",
    roomCode: "PK0001",
    state: "waiting",
    fishes: [],
    spellQuestion: null,
    spellSubmissions: {},
    spellHistory: [],
    gameOptions: buildRoomGameOptions({
      modeKey: "pk",
      bankId: "jilin-g1a-b1-welcome",
      wordMode: "regular",
      words: [{ word: "team", meaning: "团队" }],
      wrongWords: []
    })
  });
  assert.equal(spellStore.getState().result, null, "entering a non-spell room must clear stale spell results");
  service.dispose();
}

async function testAbandonedSpellResponse(): Promise<void> {
  const question = createQuestion("abandoned", "team", "团队");
  let resolveSubmit: ((response: CatchFishResponse) => void) | null = null;
  let refreshCalls = 0;
  const runtime = new MemoryRuntimePort({
    storage: { privacyAcceptedVersion: PRIVACY_VERSION },
    cloudHandlers: {
      catchFish: () => new Promise<CatchFishResponse>((resolve) => {
        resolveSubmit = resolve;
      })
    }
  });
  const storage = new StorageService(runtime);
  const privacy = new PrivacyService(storage, runtime);
  storage.configurePrivacyGate(() => privacy.hasAcceptedCurrentVersion());
  const cloud = new CloudService(runtime, () => privacy.requireAccepted("room"));
  await cloud.init("env-test");
  const roomStore = new RoomStore();
  const playerStore = new PlayerStore();
  const spellStore = new CoopSpellStore();
  playerStore.setOpenId("player-1");
  const roomSession = {
    refresh: async () => {
      refreshCalls += 1;
      return null;
    }
  } as unknown as RoomSessionService;
  const scheduler = new ManualScheduler();
  const service = new CoopSpellService(
    new RoomService(cloud),
    roomSession,
    roomStore,
    playerStore,
    spellStore,
    new WordBankStore(),
    new HistoryStore(),
    storage,
    { schedule: scheduler.schedule, cancel: scheduler.cancel }
  );
  roomStore.enter("spell-room", "SPELL1", createSpellRoom(question));
  assert.equal(service.addLetter("t"), true);
  assert.equal(service.addLetter("e"), true);
  const pendingSubmit = service.submit();
  assert.ok(resolveSubmit);
  roomStore.leave();
  (resolveSubmit as (response: CatchFishResponse) => void)({
    delta: 0,
    correct: true,
    submitted: true,
    waitingPartner: true,
    finished: false
  });
  await pendingSubmit;
  assert.equal(roomStore.getRoom(), null, "late spell submit must not restore an abandoned room");
  assert.equal(refreshCalls, 0, "late spell submit must not refresh after session replacement");
  assert.deepEqual(spellStore.getState().draft, []);
  assert.equal(spellStore.getState().result, null);
  service.dispose();
}

async function main(): Promise<void> {
  await testSpellQuestionIsolationAndHistory();
  await testAbandonedSpellResponse();
  console.log("Phase 7 co-op spell OK: isolated drafts/sessions, abandoned responses, dual clocks, settlement, and details.");
}

void main();
