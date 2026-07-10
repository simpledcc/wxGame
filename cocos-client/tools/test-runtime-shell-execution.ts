import { Button, Label, Node, director, flushStartQueue, setMockScene } from "cc";
import { HomePlaceholder } from "../assets/scripts/components/HomePlaceholder";
import { MemoryRuntimePort } from "../assets/scripts/adapters/RuntimePort";
import { App, app } from "../assets/scripts/core/App";
import { SceneRouter } from "../assets/scripts/core/SceneRouter";
import { PRIVACY_VERSION } from "../assets/scripts/domain/StorageKeys";
import { buildRoomGameOptions } from "../assets/scripts/domain/RoomRules";
import type { MatchRecord, RoomSnapshot } from "../assets/scripts/domain/RoomTypes";
import { HomeScene } from "../assets/scripts/scenes/HomeScene";
import { GameStore } from "../assets/scripts/store/GameStore";
import type { RouteName } from "../assets/scripts/store/GameStore";

function findDeep(root: Node, name: string): Node | null {
  if (root.name === name) return root;
  for (const child of root.children) {
    const match = findDeep(child, name);
    if (match) return match;
  }
  return null;
}

function assertOk(value: unknown, message = "expected a truthy value"): asserts value {
  if (!value) throw new Error(message);
}

function assertEqual(actual: unknown, expected: unknown, message = "values are not equal"): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, received ${String(actual)}`);
  }
}

async function flush(): Promise<void> {
  flushStartQueue();
  await Promise.resolve();
  flushStartQueue();
}

function makeSpellHistoryRecord(): MatchRecord {
  return {
    id: "history-spell-1",
    modeKey: "coopSpell",
    modeLabel: "同舟拼词记",
    roomCode: "AB12CD",
    finishedAt: 1_700_000_000_000,
    result: "团队完成",
    winnerOpenid: "",
    duration: 120,
    bankLabel: "测试词库",
    score: 700,
    teamScore: 700,
    players: [
      { openid: "player-1", nickName: "玩家1", score: 400 },
      { openid: "player-2", nickName: "玩家2", score: 300 }
    ],
    spellHistory: Array.from({ length: 7 }, (_, index) => ({
      questionId: `question-${index + 1}`,
      word: `word${index + 1}`,
      meaning: `释义${index + 1}`,
      mask: "____",
      reason: "answered" as const,
      correct: true,
      delta: 100,
      teamScore: (index + 1) * 100,
      finishedAt: 1_700_000_000_000 + index,
      players: [
        {
          openid: "player-1",
          nickName: "玩家1",
          slotIndexes: [0, 1],
          expectedLength: 2,
          submitted: true,
          answer: "ab",
          correct: true,
          submittedAt: 1
        },
        {
          openid: "player-2",
          nickName: "玩家2",
          slotIndexes: [2, 3],
          expectedLength: 2,
          submitted: true,
          answer: "cd",
          correct: true,
          submittedAt: 1
        }
      ]
    }))
  };
}

function makeRemoteFinishedRoom(modeKey: "pk" | "coopSpell"): RoomSnapshot {
  const spell = modeKey === "coopSpell";
  return {
    _id: spell ? "remote-spell-room" : "remote-pk-room",
    roomCode: spell ? "SPDONE" : "PKDONE",
    state: "finished",
    ownerOpenid: "player-1",
    players: [
      { openid: "player-1", nickName: "玩家1", score: spell ? 400 : 500, ready: true },
      { openid: "player-2", nickName: "玩家2", score: spell ? 300 : 200, ready: true }
    ],
    fishes: spell
      ? []
      : [{ id: "fish-1", word: "team", meaning: "团队", alive: true, x: 20, vx: 8 }],
    currentMeaning: spell ? "团队" : "单词",
    targetFishId: spell ? "question-1" : "fish-1",
    spellQuestion: null,
    spellSubmissions: {},
    spellHistory: spell ? makeSpellHistoryRecord().spellHistory?.slice(0, 2) : undefined,
    teamScore: spell ? 700 : undefined,
    duration: 60,
    gameOptions: buildRoomGameOptions({
      modeKey,
      duration: 60,
      bankId: "jilin-g1a-b1-welcome",
      wordMode: "regular",
      words: [
        { word: "team", meaning: "团队" },
        { word: "word", meaning: "单词" }
      ],
      wrongWords: []
    }),
    winnerOpenid: spell ? "" : "player-1",
    usedWords: ["team", "word"],
    startedAt: 1_700_000_000_000,
    finishedAt: 1_700_000_060_000,
    updatedAt: 1_700_000_060_000
  };
}

async function main(): Promise<void> {
  const bootRuntime = new MemoryRuntimePort({
    storage: { privacyAcceptedVersion: PRIVACY_VERSION }
  });
  const bootApp = new App(bootRuntime);
  await bootApp.boot();
  assertEqual(bootApp.store.getState().booted, true, "App boot must complete without identity lookup");
  assertEqual(bootRuntime.cloudInitCount, 1, "App boot must initialize cloud once");
  assertEqual(bootRuntime.cloudCalls.length, 0, "App boot must not call getOpenId or any cloud function");

  bootApp.playerStore.setOpenId("player-1");
  const remotePk = makeRemoteFinishedRoom("pk");
  bootApp.roomStore.enter(remotePk._id || "remote-pk-room", remotePk.roomCode, remotePk);
  assertEqual(bootApp.fishingStore.getState().result?.id, "pk:remote-pk-room");
  assertEqual(bootApp.historyStore.getRecords("pk")[0]?.id, "pk:remote-pk-room");
  assertEqual(bootApp.store.getState().route, "result", "remote PK finish must route after result creation");

  bootApp.roomSession.leave();
  const remoteSpell = makeRemoteFinishedRoom("coopSpell");
  bootApp.roomStore.enter(remoteSpell._id || "remote-spell-room", remoteSpell.roomCode, remoteSpell);
  assertEqual(bootApp.coopSpellStore.getState().result?.id, "coopSpell:remote-spell-room");
  assertEqual(bootApp.historyStore.getRecords("coopSpell")[0]?.id, "coopSpell:remote-spell-room");
  assertEqual(bootApp.store.getState().route, "result", "remote spell finish must route after result creation");
  assertEqual(bootRuntime.cloudCalls.length, 0, "remote snapshots must settle without duplicate cloud calls");
  bootApp.lifecycle.dispose();

  const routeStore = new GameStore();
  const routeRouter = new SceneRouter(routeStore);
  setMockScene(new Node("Boot"));
  routeRouter.enterRuntimeShell("room");
  assertEqual(director.getScene().name, "Home", "invited room must enter the persistent Home scene");
  assertEqual(routeStore.getState().route, "room", "runtime shell entry must preserve the invited route");

  app.store.setRoute("room");
  const serializedHomeController = new Node("SerializedHomeController");
  serializedHomeController.addComponent(HomeScene);
  assertEqual(app.store.getState().route, "room", "HomeScene onLoad must not overwrite an invited route");
  serializedHomeController.destroy();

  const canvas = new Node("Home");
  setMockScene(canvas);
  const titleNode = new Node("LegacyTitle");
  const bodyNode = new Node("LegacyBody");
  canvas.addChild(titleNode);
  canvas.addChild(bodyNode);
  const title = titleNode.addComponent(Label);
  const body = bodyNode.addComponent(Label);
  const shell = canvas.addComponent(HomePlaceholder);
  shell.titleLabel = title;
  shell.bodyLabel = body;
  app.store.setRoute("home");
  await flush();

  assertEqual(titleNode.active, false);
  assertEqual(bodyNode.active, false);
  assertOk(findDeep(canvas, "RuntimeBackground"));
  assertOk(findDeep(canvas, "RuntimeScreens"));
  assertOk(findDeep(canvas, "HomeRuntimeScreen"));
  assertOk(findDeep(canvas, "StudyButton")?.getComponent(Button));

  findDeep(canvas, "StudyButton")?.emit(Button.EventType.CLICK);
  await flush();
  assertEqual(app.store.getState().route, "study");
  assertOk(findDeep(canvas, "StudyRuntimeScreen"));
  assertOk(findDeep(canvas, "RandomWord"));
  assertOk(findDeep(canvas, "MarkWrong"));

  app.historyStore.replaceRecords([makeSpellHistoryRecord()]);

  const routes: RouteName[] = [
    "bank",
    "coopSelect",
    "room",
    "pkGame",
    "coopShared",
    "coopSpell",
    "result",
    "history",
    "feedback",
    "help",
    "home"
  ];
  const expectedRoots = [
    "BankRuntimeScreen",
    "CoopSelectRuntimeScreen",
    "RoomRuntimeScreen",
    "PkRuntimeScreen",
    "SharedRuntimeScreen",
    "SpellRuntimeScreen",
    "ResultRuntimeScreen",
    "HistoryRuntimeScreen",
    "FeedbackRuntimeScreen",
    "HelpRuntimeScreen",
    "HomeRuntimeScreen"
  ];
  for (let index = 0; index < routes.length; index += 1) {
    if (routes[index] === "room") {
      app.roomStore.enter("pending-room", "WAIT01");
    }
    app.store.setRoute(routes[index]);
    await flush();
    assertOk(findDeep(canvas, expectedRoots[index]), `${routes[index]} did not mount`);
    if (routes[index] === "room") {
      assertEqual(
        findDeep(canvas, "RoomPlayers")?.getComponent(Label)?.string,
        "正在读取房间信息",
        "accepted joins without a snapshot must show a syncing state"
      );
    }
    if (routes[index] === "history") {
      findDeep(canvas, "HistorySpell")?.emit(Button.EventType.CLICK);
      findDeep(canvas, "HistoryRow0")?.emit(Button.EventType.CLICK);
      const firstBody = findDeep(canvas, "DetailBody")?.getComponent(Label)?.string || "";
      assertOk(firstBody.includes("1. WORD1"), "spell detail first page must start at round 1");
      assertEqual(firstBody.includes("4. WORD4"), false, "spell detail page must be bounded");
      assertEqual(findDeep(canvas, "DetailPage")?.getComponent(Label)?.string, "1/3");
      findDeep(canvas, "DetailNext")?.emit(Button.EventType.CLICK);
      const secondBody = findDeep(canvas, "DetailBody")?.getComponent(Label)?.string || "";
      assertOk(secondBody.includes("4. WORD4"), "spell detail next page must start at round 4");
      assertEqual(findDeep(canvas, "DetailPage")?.getComponent(Label)?.string, "2/3");
    }
  }

  assertEqual(findDeep(canvas, "RuntimeScreens")?.children.length, 1, "old route nodes must be destroyed");
  canvas.destroy();
  console.log("Runtime shell execution OK: remote settlement, history paging, and every route completed without exceptions.");
}

void main();
