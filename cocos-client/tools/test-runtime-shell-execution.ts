import {
  Button,
  EditBox,
  Graphics,
  Label,
  Node,
  Sprite,
  UITransform,
  deferMockAssetLoad,
  deferMockBundleLoad,
  director,
  flushStartQueue,
  rejectMockBundleLoad,
  resolveMockAssetLoad,
  resolveMockBundleLoad,
  setMockWindowSize,
  setMockScene
} from "cc";
import "../assets/bundles/mode_pk/scripts/ModePkScreenBuilder";
import "../assets/bundles/mode_spell/scripts/ModeSpellScreenBuilder";
import { HomePlaceholder } from "../assets/scripts/components/HomePlaceholder";
import { GameplayFeedbackPool } from "../assets/bundles/mode_pk/scripts/GameplayFeedbackPool";
import { ThemedWordTargetVisual } from "../assets/bundles/mode_pk/scripts/ThemedWordTargetVisual";
import { RuntimeButtonVisual } from "../assets/scripts/components/ui/RuntimeButtonVisual";
import {
  configurePortraitViewport,
  getPortraitViewportHeight
} from "../assets/scripts/components/ui/RuntimeUi";
import { MemoryRuntimePort } from "../assets/scripts/adapters/RuntimePort";
import { App, app } from "../assets/scripts/core/App";
import { SceneRouter } from "../assets/scripts/core/SceneRouter";
import { PRIVACY_VERSION } from "../assets/scripts/domain/StorageKeys";
import { buildRoomGameOptions } from "../assets/scripts/domain/RoomRules";
import type { MatchRecord, RoomSnapshot } from "../assets/scripts/domain/RoomTypes";
import { isUnlockableWordBankId } from "../assets/scripts/domain/WordBankRules";
import { HomeScene } from "../assets/scripts/scenes/HomeScene";
import { BankScene } from "../assets/scripts/scenes/BankScene";
import { BootScene } from "../assets/scripts/scenes/BootScene";
import { FeedbackScene } from "../assets/scripts/scenes/FeedbackScene";
import { RoomScene } from "../assets/scripts/scenes/RoomScene";
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

function assertVisibleUiContract(root: Node, context: string): void {
  const violations: string[] = [];
  const viewportHeight = getPortraitViewportHeight();
  const visit = (node: Node, parentX: number, parentY: number, parentScaleX: number,
    parentScaleY: number, path: string): void => {
    if (!node.active) return;
    const x = parentX + node.position.x * parentScaleX;
    const y = parentY + node.position.y * parentScaleY;
    const scaleX = parentScaleX * node.scale.x;
    const scaleY = parentScaleY * node.scale.y;
    const nodePath = `${path}/${node.name}`;
    const transform = node.getComponent(UITransform);
    if (transform && transform.width > 0 && transform.height > 0) {
      const left = x - transform.width * scaleX / 2;
      const right = x + transform.width * scaleX / 2;
      const bottom = y - transform.height * scaleY / 2;
      const top = y + transform.height * scaleY / 2;
      if (left < -320 || right > 320 || bottom < -viewportHeight / 2 || top > viewportHeight / 2) {
        violations.push(`${nodePath}=[${left},${bottom}]..[${right},${top}]`);
      }
    }
    const label = node.getComponent(Label);
    if (label && label.overflow !== Label.Overflow.SHRINK) {
      violations.push(`${nodePath} uses non-shrinking Label overflow ${label.overflow}`);
    }
    node.children.forEach((child) => visit(child, x, y, scaleX, scaleY, nodePath));
  };
  visit(root, 0, 0, 1, 1, "");
  assertEqual(violations.length, 0, `${context} violates the fixed runtime UI contract: ${violations.join("; ")}`);
}

function assertPreGameTargetDevices(root: Node): void {
  const buttonHeights: Array<{ name: string; height: number }> = [];
  const collect = (node: Node, visible: boolean): void => {
    const active = visible && node.active;
    if (!active) return;
    const transform = node.getComponent(UITransform);
    if (node.getComponent(Button) && transform) buttonHeights.push({ name: node.name, height: transform.height });
    node.children.forEach((child) => collect(child, active));
  };
  collect(root, true);
  [[360, 800], [393, 852], [430, 932]].forEach(([width, height]) => {
    const scale = width / 640;
    assertOk(960 * scale <= height, `${width}x${height} must contain the fixed portrait design height`);
    buttonHeights.forEach((entry) => {
      assertOk(entry.height * scale >= 44, `${entry.name} touch height is below 44 px at ${width}x${height}`);
    });
  });
}

function assertPreGameIconLayout(root: Node, context: string): void {
  const violations: string[] = [];
  const visit = (node: Node, visible: boolean): void => {
    const active = visible && node.active;
    if (!active) return;
    const transform = node.getComponent(UITransform);
    const parent = node.parent;
    const parentTransform = parent?.getComponent(UITransform);
    if (transform && parent && parentTransform && node.name.endsWith("IconSlot")) {
      const left = node.position.x - transform.width / 2;
      const right = node.position.x + transform.width / 2;
      const bottom = node.position.y - transform.height / 2;
      const top = node.position.y + transform.height / 2;
      if (
        left < -parentTransform.width / 2 || right > parentTransform.width / 2
        || bottom < -parentTransform.height / 2 || top > parentTransform.height / 2
      ) {
        violations.push(`${node.name} leaves ${parent.name}`);
      }
      const maxIconSize = node.name === "HomeAvatarButtonIconSlot" ? 72 : 56;
      if (transform.width > maxIconSize || transform.height > maxIconSize) {
        violations.push(`${node.name} is oversized at ${transform.width}x${transform.height}`);
      }
    }
    if (transform && parent && parentTransform && node.name.endsWith("Skin") && parent.getComponent(Button)) {
      const visibleWidth = transform.width * node.scale.x;
      const visibleHeight = transform.height * node.scale.y;
      if (visibleWidth !== parentTransform.width || visibleHeight !== parentTransform.height) {
        violations.push(
          `${node.name} ${visibleWidth}x${visibleHeight} does not cover ${parent.name} `
          + `${parentTransform.width}x${parentTransform.height}`
        );
      }
    }
    if (
      transform && parent && parentTransform && /^Home.+Slot$/.test(node.name)
      && /Card$/.test(parent.name)
    ) {
      const left = node.position.x - transform.width / 2;
      const right = node.position.x + transform.width / 2;
      const bottom = node.position.y - transform.height / 2;
      const top = node.position.y + transform.height / 2;
      if (
        left < -parentTransform.width / 2 || right > parentTransform.width / 2
        || bottom < -parentTransform.height / 2 || top > parentTransform.height / 2
      ) {
        violations.push(`${node.name} leaves ${parent.name}`);
      }
    }
    node.children.forEach((child) => visit(child, active));
  };
  visit(root, true);
  assertEqual(violations.length, 0, `${context} icon layout violations: ${violations.join("; ")}`);
}

async function flush(): Promise<void> {
  flushStartQueue();
  await Promise.resolve();
  flushStartQueue();
}

async function flushMany(iterations = 8): Promise<void> {
  for (let index = 0; index < iterations; index += 1) await flush();
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

function makeWaitingPkRoom(): RoomSnapshot {
  const room = makeRemoteFinishedRoom("pk");
  return {
    ...room,
    _id: "pending-room",
    roomCode: "WAIT01",
    state: "waiting",
    players: [
      { openid: "player-1", nickName: "ignored-custom-name", score: 0, ready: false }
    ],
    fishes: [],
    currentMeaning: "",
    targetFishId: "",
    winnerOpenid: "",
    startedAt: undefined,
    finishedAt: undefined
  };
}

async function main(): Promise<void> {
  setMockWindowSize(393, 852);
  configurePortraitViewport();
  const appRuntime = app.runtime as MemoryRuntimePort;
  setMockScene(new Node("Boot"));
  const privacyBoot = new Node("PrivacyBoot");
  privacyBoot.addComponent(BootScene);
  await flush();
  const privacyGate = findDeep(privacyBoot, "PrivacyGate");
  assertOk(privacyGate, "first launch must mount the privacy gate");
  assertEqual(privacyGate.layer, 1 << 25, "privacy gate must render on UI_2D");
  assertVisibleUiContract(privacyGate, "privacy gate");
  assertOk(findDeep(privacyBoot, "ContractButton")?.getComponent(Button));
  assertOk(findDeep(privacyBoot, "AcceptButton")?.getComponent(Button));
  assertOk(findDeep(privacyBoot, "DeclineButton")?.getComponent(Button));
  assertEqual(findDeep(privacyBoot, "DeclineButton")?.layer, 1 << 25);

  findDeep(privacyBoot, "DeclineButton")?.emit(Button.EventType.CLICK);
  await flush();
  assertEqual(app.privacy.hasAcceptedCurrentVersion(), false);
  assertEqual(appRuntime.cloudInitCount, 0, "declining privacy must not initialize cloud");
  assertEqual(app.store.getState().route, "boot", "declining privacy must remain on Boot");

  findDeep(privacyBoot, "AcceptButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.privacy.hasAcceptedCurrentVersion(), true);
  assertEqual(app.store.getState().booted, true, "accepting privacy must finish App boot");
  assertEqual(appRuntime.cloudInitCount, 1, "cloud must initialize only after acceptance");
  assertEqual(app.store.getState().route, "home", "accepted privacy must enter Home");
  assertEqual(privacyGate.active, false, "accepted privacy gate must be hidden");
  privacyBoot.destroy();

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
  bootApp.roomPolling.start(remotePk._id || "remote-pk-room", false);
  assertEqual(bootApp.roomPolling.isRunning(), true);
  bootApp.roomStore.enter(remotePk._id || "remote-pk-room", remotePk.roomCode, remotePk);
  assertEqual(bootApp.roomPolling.isRunning(), false, "finished snapshots must stop room polling immediately");
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
  app.performance.reset();
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
  await flushMany();

  assertEqual(titleNode.active, false);
  assertEqual(bodyNode.active, false);
  assertOk(findDeep(canvas, "RuntimeBackground"));
  assertOk(findDeep(canvas, "RuntimeScreens"));
  assertOk(findDeep(canvas, "HomeRuntimeScreen"));
  assertOk(findDeep(canvas, "StudyButton")?.getComponent(Button));
  assertEqual(findDeep(canvas, "HomePlayerName")?.getComponent(Label)?.string, "玩家");
  assertEqual(
    findDeep(canvas, "HomeCoins")?.getComponent(Label)?.string,
    String(app.wordBankStore.getWordCoins()),
    "Home coins must come from WordBankStore"
  );
  assertEqual(findDeep(canvas, "CurrentBankCaption")?.getComponent(Label)?.string, "当前词库");
  assertEqual(findDeep(canvas, "CurrentBankBarTitle")?.getComponent(Label)?.string.startsWith("当前词库："), false,
    "Home Bank title must reserve its width for the real bank name");
  const homeSubtitle = findDeep(canvas, "HomeSubtitleRibbon");
  const currentBankBar = findDeep(canvas, "CurrentBankBar");
  const bankChangeBadge = findDeep(canvas, "CurrentBankChangeBadge");
  const subtitleTransform = homeSubtitle?.getComponent(UITransform);
  const bankTransform = currentBankBar?.getComponent(UITransform);
  assertOk(homeSubtitle && currentBankBar && bankChangeBadge && subtitleTransform && bankTransform);
  assertOk(currentBankBar.getComponent(Button), "the whole Bank strip must remain clickable");
  assertEqual(bankChangeBadge.getComponent(Button), null, "the change badge must not nest another Button");
  assertOk(bankChangeBadge.getComponent(Graphics));
  const subtitleBankGap = homeSubtitle.position.y - subtitleTransform.height / 2
    - (currentBankBar.position.y + bankTransform.height / 2);
  assertOk(subtitleBankGap >= 2, "Home subtitle and bank bar must not overlap");
  assertEqual(
    findDeep(canvas, "HistoryButtonSubtitle")?.getComponent(Label)?.string,
    "暂无战绩，完成比赛后查看"
  );
  [
    "Background", "Logo", "Avatar", "Coin", "Character", "CreateRoom", "JoinRoom", "Practice",
    "WordBank", "Catalog", "History", "Settings", "Privacy", "Feedback"
  ].forEach((stem) => assertOk(findDeep(canvas, `Home${stem}Slot`), `Home ${stem} visual slot is required`));
  assertOk(findDeep(canvas, "ThemeBackground")?.getComponent(Sprite)?.spriteFrame, "shared pre-game background must load");
  assertEqual(findDeep(canvas, "HomeScenery")?.active, false, "formal background must replace programmatic scenery");
  assertOk(findDeep(canvas, "HomeLogoSprite")?.getComponent(Sprite)?.spriteFrame, "formal Home logo must load");
  assertEqual(findDeep(canvas, "HomeAvatarFallback")?.active, false, "formal avatar must replace its fallback");
  assertEqual(
    findDeep(canvas, "HomeAvatarButton")?.getComponent(Graphics)?.enabled,
    false,
    "Home avatar must not keep a white card background"
  );
  assertEqual(
    findDeep(canvas, "SettingsButton")?.getComponent(Graphics)?.enabled,
    false,
    "Home settings must not keep a white card background"
  );
  assertEqual(
    findDeep(canvas, "HomeCoinButton")?.getComponent(Graphics)?.enabled,
    false,
    "Home coin action must not keep a white card background"
  );
  assertOk(findDeep(canvas, "HomePlayerCard")?.getComponent(Graphics), "player name must use a dark utility pill");
  assertOk(findDeep(canvas, "HomeCoinPill")?.getComponent(Graphics), "coin count must use a dark utility pill");
  const homeLogoTransform = findDeep(canvas, "HomeLogoSlot")?.getComponent(UITransform);
  assertEqual(homeLogoTransform?.width, 520);
  assertEqual(homeLogoTransform?.height, 156);
  const createAction = findDeep(canvas, "CreateRoomButton");
  const createTransform = createAction?.getComponent(UITransform);
  const createTitle = findDeep(canvas, "CreateRoomButtonTitle")?.getComponent(Label);
  assertEqual(createTransform?.width, 520);
  assertEqual(createTransform?.height, 146);
  assertEqual(createTitle?.string, "创建房间");
  assertEqual(createTitle?.fontSize, 38);
  assertEqual(createTitle?.enableOutline, true);
  assertEqual(createTitle?.outlineWidth, 3);
  assertEqual(findDeep(canvas, "JoinRoomButton")?.getComponent(UITransform)?.width, 520);
  assertEqual(findDeep(canvas, "JoinRoomButton")?.getComponent(UITransform)?.height, 136);
  ["StudyButton", "BankButton", "HelpButton", "HistoryButton"].forEach((name) => {
    const transform = findDeep(canvas, name)?.getComponent(UITransform);
    assertEqual(transform?.width, 252, `${name} must use the shorter two-column layout`);
    assertEqual(transform?.height, 118, `${name} must use the taller two-column layout`);
    assertEqual(findDeep(canvas, `${name}Title`)?.getComponent(Label)?.fontSize, 31);
    assertEqual(findDeep(canvas, `${name}Subtitle`)?.active, true, `${name} subtitle must remain visible`);
  });
  assertOk(
    (createAction?.position.y || 0) > (findDeep(canvas, "JoinRoomButton")?.position.y || 0)
    && (findDeep(canvas, "JoinRoomButton")?.position.y || 0) > (findDeep(canvas, "StudyButton")?.position.y || 0)
    && (findDeep(canvas, "StudyButton")?.position.y || 0) > (findDeep(canvas, "HelpButton")?.position.y || 0),
    "Home actions must follow create, join, learning, then extension hierarchy"
  );
  const createSkin = findDeep(canvas, "CreateRoomButtonSkin");
  assertEqual(createSkin?.active, true, "formal primary button skin must load");
  assertEqual(createSkin?.getComponent(Sprite)?.type, Sprite.Type.SLICED);
  assertEqual(
    findDeep(canvas, "CreateRoomButton")?.getComponent(Graphics)?.enabled,
    false,
    "formal skin must hide the duplicate programmatic base and shadow"
  );
  assertEqual(findDeep(canvas, "CreateRoomButtonHighlight")?.active, false,
    "formal skin must hide the duplicate programmatic highlight");
  assertEqual(createSkin?.getComponent(UITransform)?.width, 1040,
    "2x formal skin must retain high-density nine-slice geometry");
  assertEqual(createSkin?.getComponent(UITransform)?.height, 292,
    "2x formal skin must retain high-density nine-slice geometry");
  assertEqual(createSkin?.scale.x, 0.5, "2x formal skin must map back to design units");
  assertEqual(createSkin?.scale.y, 0.5, "2x formal skin must map back to design units");
  assertEqual(createSkin?.getComponent(Sprite)?.spriteFrame?.insetTop, 56,
    "2x formal skin must preserve the full source border without consuming 56 design units");
  ["CreateRoomButton", "JoinRoomButton", "StudyButton", "BankButton", "HelpButton", "HistoryButton"].forEach((name) => {
    const action = findDeep(canvas, name);
    const subtitle = findDeep(canvas, `${name}Subtitle`);
    const actionTransform = action?.getComponent(UITransform);
    const subtitleTransform = subtitle?.getComponent(UITransform);
    assertOk(action && subtitle && actionTransform && subtitleTransform);
    const bottomInset = subtitle.position.y - subtitleTransform.height / 2 + actionTransform.height / 2;
    assertOk(bottomInset >= 10, `${name} subtitle must clear the sliced-skin border`);
  });
  [
    "CreateRoomButton", "JoinRoomButton", "StudyButton", "BankButton", "HelpButton",
    "HistoryButton", "HomeAvatarButton", "HomeCoinButton", "SettingsButton", "HomePrivacy", "FeedbackButton"
  ].forEach((name) => assertOk(findDeep(canvas, name)?.getComponent(Button), `${name} must be actionable`));
  [
    "Avatar", "Coin", "Character", "CreateRoom", "JoinRoom", "Practice", "WordBank",
    "Catalog", "History", "Settings", "Privacy", "Feedback"
  ].forEach((stem) => {
    assertOk(findDeep(canvas, `Home${stem}VectorIcon`)?.getComponent(Graphics), `${stem} must have a vector fallback`);
  });
  [0, 1, 2, 3].forEach((index) => assertOk(findDeep(canvas, `HomeLogoCharacter${index}`)?.getComponent(Label)));
  assertEqual(findDeep(canvas, "BestScores"), null, "new Home must not show the old score toolbar");
  assertEqual(findDeep(canvas, "DurationTitle"), null, "new Home must not show duration controls");
  assertEqual("duration" in app.store.getState(), false, "pre-game state must not retain a duration setting");
  assertOk(findDeep(canvas, "HomePrivacy")?.getComponent(Button), "Home privacy entry is required");
  const initialHomeRoot = findDeep(canvas, "HomeRuntimeScreen");
  assertOk(initialHomeRoot);
  assertVisibleUiContract(initialHomeRoot, "home route");
  assertPreGameTargetDevices(initialHomeRoot);
  assertPreGameIconLayout(initialHomeRoot, "home route");

  const playerModal = findDeep(canvas, "HomePlayerModal");
  assertOk(playerModal);
  assertEqual(playerModal?.active, false);
  findDeep(canvas, "HomeAvatarButton")?.emit(Button.EventType.CLICK);
  assertEqual(playerModal?.active, true);
  assertEqual(findDeep(canvas, "HomePlayerDetailName")?.getComponent(Label)?.string, "玩家");
  assertOk(findDeep(playerModal, "HomePlayerIdentity")?.getComponent(Graphics),
    "player identity must use a visible status badge");
  const verticalGap = (upper: Node, lower: Node): number =>
    upper.position.y - upper.getComponent(UITransform)!.height / 2
      - lower.position.y - lower.getComponent(UITransform)!.height / 2;
  assertOk(verticalGap(findDeep(playerModal, "HomeAvatarSlot")!, findDeep(playerModal, "HomePlayerDetailName")!) >= 4);
  assertOk(verticalGap(findDeep(playerModal, "HomePlayerDetailName")!, findDeep(playerModal, "HomePlayerIdentity")!) >= 4);
  assertOk(verticalGap(findDeep(playerModal, "HomePlayerIdentity")!, findDeep(playerModal, "HomePlayerClose")!) >= 4);
  assertVisibleUiContract(playerModal, "Home player modal");
  assertPreGameTargetDevices(playerModal);
  findDeep(canvas, "HomePlayerClose")?.emit(Button.EventType.CLICK);
  assertEqual(playerModal.active, false);

  const settingsModal = findDeep(canvas, "HomeSettingsModal");
  assertEqual(settingsModal?.active, false);
  findDeep(canvas, "SettingsButton")?.emit(Button.EventType.CLICK);
  assertEqual(settingsModal?.active, true);
  assertOk(settingsModal);
  assertVisibleUiContract(settingsModal, "Home settings modal");
  assertPreGameTargetDevices(settingsModal);
  assertOk(findDeep(settingsModal, "HomeSettingsSlot"), "settings modal must retain its semantic icon");
  assertOk(verticalGap(findDeep(settingsModal, "HomeSoundStatus")!, findDeep(settingsModal, "HomeSoundToggle")!) >= 8);
  assertOk(verticalGap(findDeep(settingsModal, "HomeSoundToggle")!, findDeep(settingsModal, "HomeSettingsClose")!) >= 8);
  const mutedBefore = app.settingsStore.isMuted();
  const soundVisual = findDeep(settingsModal, "HomeSoundToggle")?.getComponent(RuntimeButtonVisual);
  assertEqual(soundVisual?.isShowingSelectedState(), !mutedBefore);
  findDeep(canvas, "HomeSoundToggle")?.emit(Button.EventType.CLICK);
  assertEqual(app.settingsStore.isMuted(), !mutedBefore);
  assertEqual(app.audio.isMuted(), !mutedBefore, "settings modal must persist through AudioService");
  assertEqual(
    findDeep(canvas, "HomeSoundStatus")?.getComponent(Label)?.string,
    mutedBefore ? "当前音效：已开启" : "当前音效：已静音"
  );
  assertEqual(soundVisual?.isShowingSelectedState(), mutedBefore,
    "sound selection treatment must follow the persisted audio state");
  findDeep(canvas, "HomeSettingsClose")?.emit(Button.EventType.CLICK);
  assertEqual(settingsModal.active, false);

  findDeep(canvas, "HomeCoinButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "bank", "coin entry must open the existing bank and coin-spend route");
  findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "home");

  for (let index = 0; index < 60; index += 1) shell.update(1 / 60);
  const performanceSnapshot = app.performance.getSnapshot();
  assertEqual(performanceSnapshot.totalFrames, 60);
  assertOk(performanceSnapshot.peakNodeCount > 0, "runtime shell must sample its node peak");

  const privacyOpenCount = appRuntime.privacyContractOpenCount;
  findDeep(canvas, "HomePrivacy")?.emit(Button.EventType.CLICK);
  await flushMany(2);
  assertEqual(appRuntime.privacyContractOpenCount, privacyOpenCount + 1);
  assertEqual(findDeep(canvas, "HomePrivacy")?.getComponent(Button)?.interactable, true);

  const originalNavigate = app.router.navigate.bind(app.router);
  let failNextNavigation = true;
  app.router.navigate = ((route: RouteName) => {
    if (failNextNavigation) {
      failNextNavigation = false;
      throw new Error("simulated navigation failure");
    }
    originalNavigate(route);
  }) as typeof app.router.navigate;
  findDeep(canvas, "HelpButton")?.emit(Button.EventType.CLICK);
  assertEqual(app.store.getState().route, "home");
  assertEqual(appRuntime.toastMessages[appRuntime.toastMessages.length - 1], "页面暂时无法打开，请重试");
  findDeep(canvas, "HelpButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "coopSelect", "failed Home navigation must allow a retry");
  findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  app.router.navigate = originalNavigate;
  assertEqual(app.store.getState().route, "home");

  app.store.setRoute("coopSelect");
  await flushMany();
  assertEqual(app.store.getState().route, "coopSelect");
  assertOk(findDeep(canvas, "CoopSelectRuntimeScreen"));
  assertEqual(findDeep(canvas, "ModeOption0Action")?.getComponent(Button)?.interactable, true);
  assertEqual(findDeep(canvas, "ModeOption1Action")?.getComponent(Button)?.interactable, false);
  findDeep(canvas, "ModeOption0Action")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().selectedMode, "pk");
  assertEqual(app.store.getState().route, "room");
  assertEqual(app.store.getState().roomEntryIntent, "create");
  findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "home");

  let roomNavigationCount = 0;
  let observedRoute = app.store.getState().route;
  const unsubscribeRoomNavigation = app.store.subscribe((state) => {
    if (state.route === "room" && observedRoute !== "room") roomNavigationCount += 1;
    observedRoute = state.route;
  });
  const joinRoom = findDeep(canvas, "JoinRoomButton");
  joinRoom?.emit(Button.EventType.CLICK);
  joinRoom?.emit(Button.EventType.CLICK);
  await flushMany();
  unsubscribeRoomNavigation();
  assertEqual(roomNavigationCount, 1, "rapid Home taps must navigate only once");
  assertEqual(app.store.getState().route, "room");
  assertEqual(app.store.getState().roomEntryIntent, "join");
  assertEqual(findDeep(canvas, "RoomHeaderTitle")?.getComponent(Label)?.string, "加入房间");
  assertEqual(findDeep(canvas, "RoomCreatePanel"), null, "join entry must not build the unused create form");
  assertEqual(findDeep(canvas, "CreateRoom"), null, "join entry must not retain hidden create controls");
  assertEqual(findDeep(canvas, "RoomJoinPanel")?.active, true);
  const initialJoinHint = findDeep(canvas, "JoinCodeHint")?.getComponent(Label)?.string || "";
  assertOk(initialJoinHint.includes("英文字母") && initialJoinHint.includes("数字"),
    `the visible join form must explain the room-code format: ${initialJoinHint}`);
  assertEqual(findDeep(canvas, "JoinCodeCard")?.getComponent(UITransform)?.height, 600);
  assertOk(findDeep(canvas, "JoinCodeCardAccent")?.getComponent(Graphics));
  const entryRoomCodeInput = findDeep(canvas, "RoomCodeInput")?.getComponent(EditBox);
  const entryJoinButton = findDeep(canvas, "JoinRoom")?.getComponent(Button);
  assertOk(entryRoomCodeInput);
  assertOk(entryJoinButton);
  assertEqual(entryJoinButton.interactable, false, "empty room code must keep Join disabled");
  entryRoomCodeInput.string = "ABC";
  entryRoomCodeInput.node.emit("text-changed");
  assertEqual(findDeep(canvas, "RoomCodeInputCount")?.getComponent(Label)?.string, "3/6");
  assertEqual(findDeep(canvas, "JoinCodeHint")?.getComponent(Label)?.string, "还需输入 3 位");
  assertEqual(entryJoinButton.interactable, false, "partial room code must keep Join disabled");
  const callsBeforeEntryInvalidJoin = appRuntime.cloudCalls.length;
  findDeep(canvas, "JoinRoom")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(appRuntime.cloudCalls.length, callsBeforeEntryInvalidJoin, "invalid room input must not call joinRoom");
  entryRoomCodeInput.string = "ABC123";
  entryRoomCodeInput.node.emit("text-changed");
  assertEqual(findDeep(canvas, "JoinCodeHint")?.getComponent(Label)?.string, "房间码已完整，可以加入");
  assertEqual(findDeep(canvas, "JoinRoomSubtitle")?.getComponent(Label)?.string, "房间码已完整，点击加入");
  assertEqual(entryJoinButton.interactable, true, "complete room code must enable Join");
  findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "home");

  findDeep(canvas, "CreateRoomButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "coopSelect", "create entry must open mode selection first");
  assertOk(findDeep(canvas, "ModeOption0"));
  findDeep(canvas, "ModeOption0Action")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "room", "available mode must open room configuration");
  assertEqual(app.store.getState().roomEntryIntent, "create");
  assertEqual(findDeep(canvas, "RoomHeaderTitle")?.getComponent(Label)?.string, "创建房间");
  assertEqual(findDeep(canvas, "RoomJoinPanel"), null, "create entry must not build the unused join form");
  assertEqual(findDeep(canvas, "JoinRoom"), null, "create entry must not retain hidden join controls");
  assertOk(
    findDeep(canvas, "CreateGuidance")?.getComponent(Label)?.string.includes("创建后邀请好友"),
    "create configuration must explain the next step"
  );
  assertEqual(findDeep(canvas, "SelectedModeCard")?.getComponent(UITransform)?.height, 184);
  assertOk(findDeep(canvas, "SelectedModeCardTab")?.getComponent(Graphics));
  const createBankLabel = findDeep(canvas, "CreateBankLabel")!;
  const createBankAction = findDeep(canvas, "ChangeRoomBank")!;
  assertOk(
    createBankLabel.position.x + createBankLabel.getComponent(UITransform)!.width / 2 + 8
      <= createBankAction.position.x - createBankAction.getComponent(UITransform)!.width / 2,
    "Create-room Bank name and change action must not overlap"
  );
  assertEqual(findDeep(canvas, "RoomCreatePanel")?.active, true);
  findDeep(canvas, "AutoReady")?.emit(Button.EventType.CLICK);
  assertEqual(app.store.getState().roomAutoReady, false);
  findDeep(canvas, "ChangeRoomBank")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "bank");
  findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "room", "room bank picker must return to room configuration");
  assertEqual(app.store.getState().roomAutoReady, false, "auto-ready preference must survive bank selection");
  assertEqual(findDeep(canvas, "AutoReadyTitle")?.getComponent(Label)?.string, "创建后手动准备");
  assertOk(findDeep(canvas, "AutoReadyIconSlot"));
  assertEqual(findDeep(canvas, "AutoReady")?.getComponent(RuntimeButtonVisual)?.isShowingSelectedState(), false);
  findDeep(canvas, "AutoReady")?.emit(Button.EventType.CLICK);
  assertEqual(app.store.getState().roomAutoReady, true);
  assertEqual(findDeep(canvas, "AutoReady")?.getComponent(RuntimeButtonVisual)?.isShowingSelectedState(), true);
  setMockWindowSize(640, 960);
  app.store.setRoute("home");
  await flushMany();
  app.store.setRoute("room");
  await flushMany();
  const minimumRoomRoot = findDeep(canvas, "RoomRuntimeScreen")!;
  const minimumRoomSafe = findDeep(minimumRoomRoot, "RoomSafeArea")!;
  const minimumCreatePanel = findDeep(minimumRoomRoot, "RoomCreatePanel")!;
  const createChain = ["SelectedModeCard", "CreateBankCard", "CreateGuidanceCard", "CreateRoom", "AutoReady"]
    .map((name) => findDeep(minimumCreatePanel, name)!);
  for (let gap = 0; gap < createChain.length - 1; gap += 1) {
    assertOk(verticalGap(createChain[gap], createChain[gap + 1]) >= 8,
      `minimum create-room gap ${gap} must remain visible`);
  }
  const minimumAutoReady = createChain[4];
  assertOk(minimumCreatePanel.position.y + minimumAutoReady.position.y
    - minimumAutoReady.getComponent(UITransform)!.height / 2
    >= -minimumRoomSafe.getComponent(UITransform)!.height / 2);
  const originalCreateRoom = app.roomSession.create.bind(app.roomSession);
  const originalToggleReady = app.roomSession.toggleReady.bind(app.roomSession);
  let autoReadyCount = 0;
  app.playerStore.setOpenId("player-1");
  app.roomSession.create = async () => {
    const room = makeWaitingPkRoom();
    app.roomStore.enter("pending-room", room.roomCode, room);
    return room;
  };
  app.roomSession.toggleReady = async () => {
    autoReadyCount += 1;
    const current = app.roomStore.getRoom() || makeWaitingPkRoom();
    const readyRoom = {
      ...current,
      players: current.players.map((player) => player.openid === "player-1" ? { ...player, ready: true } : player)
    };
    app.roomStore.applySnapshot(readyRoom);
    return readyRoom;
  };
  findDeep(canvas, "CreateRoom")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(autoReadyCount, 1, "enabled auto-ready must use the existing ready action once");
  assertEqual(findDeep(canvas, "RoomLobbyPanel")?.active, true);
  assertEqual(findDeep(canvas, "ReadyTitle")?.getComponent(Label)?.string, "已准备，点击取消");
  assertOk(findDeep(canvas, "ReadyIconSlot"));
  assertEqual(findDeep(canvas, "Ready")?.getComponent(RuntimeButtonVisual)?.isShowingSelectedState(), true);
  assertEqual(findDeep(canvas, "RoomPlayerOneReady")?.active, true);
  assertEqual(findDeep(canvas, "RoomPlayerTwoWaiting")?.active, true);
  assertEqual(findDeep(canvas, "RoomMode")?.getComponent(Label)?.string?.includes("秒"), false);
  const minimumLobby = findDeep(minimumRoomRoot, "RoomLobbyPanel")!;
  const lobbyChain = ["RoomCodeCard", "LobbyBankCard", "RoomPlayerOneCard", "RoomStatusCard", "Ready", "StartRoom"]
    .map((name) => findDeep(minimumLobby, name)!);
  for (let gap = 0; gap < lobbyChain.length - 1; gap += 1) {
    assertOk(verticalGap(lobbyChain[gap], lobbyChain[gap + 1]) >= 7,
      `minimum room-lobby gap ${gap} must remain visible`);
  }
  assertEqual(findDeep(minimumLobby, "LeaveRoom"), null, "header Back must remain the single leave action");
  const minimumStart = lobbyChain[5];
  assertOk(minimumLobby.position.y + minimumStart.position.y
    - minimumStart.getComponent(UITransform)!.height / 2
    >= -minimumRoomSafe.getComponent(UITransform)!.height / 2);
  assertVisibleUiContract(minimumRoomRoot, "minimum room route");
  assertPreGameTargetDevices(minimumRoomRoot);
  setMockWindowSize(393, 852);
  app.roomSession.create = originalCreateRoom;
  app.roomSession.toggleReady = originalToggleReady;
  findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "home");

  findDeep(canvas, "StudyButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "study");
  const studyRoot = findDeep(canvas, "StudyRuntimeScreen");
  assertOk(studyRoot);
  assertOk(findDeep(studyRoot, "StudySafeArea"));
  assertOk(findDeep(studyRoot, "StudyHeader"));
  assertPreGameTargetDevices(studyRoot);
  assertOk(findDeep(canvas, "RandomWord"));
  assertOk(findDeep(canvas, "MarkWrong"));
  ["RevealWord", "MarkWrong", "MeaningToggle"].forEach((name) =>
    assertOk(findDeep(canvas, `${name}IconSlot`), `${name} must expose a semantic icon slot`));
  assertEqual(findDeep(canvas, "StudyCard")?.getComponent(UITransform)?.height, 366);
  assertOk(findDeep(canvas, "StudyCardTab")?.getComponent(Graphics));
  assertOk(findDeep(canvas, "StudyProgress")?.getComponent(Graphics));
  assertOk(findDeep(canvas, "StudyProgressFill")?.getComponent(Graphics));
  const studySafe = findDeep(studyRoot, "StudySafeArea")!;
  const studyCard = findDeep(canvas, "StudyCard")!;
  const studyReveal = findDeep(canvas, "RevealWord")!;
  const studyMeaningToggle = findDeep(canvas, "MeaningToggle")!;
  const studyNext = findDeep(canvas, "NextWord")!;
  const studyBankBar = findDeep(canvas, "StudyBankBar");
  const studyBankBadge = findDeep(canvas, "StudyBankChangeBadge");
  assertOk(studyBankBar?.getComponent(Button), "Study bank strip must remain the single route target");
  assertOk(studyBankBadge?.getComponent(Graphics), "Study bank strip must expose a visual change badge");
  assertEqual(studyBankBadge?.getComponent(Button), null, "Study bank change badge must not nest a second Button");
  assertEqual(findDeep(canvas, "ChangeStudyBank"), null, "Study bank strip must not retain a split click target");
  assertEqual(findDeep(canvas, "StudyBottomChangeBank"), null, "Study must not retain an overlapping duplicate Bank route");
  assertEqual(findDeep(canvas, "StudyBankBarTitle")?.getComponent(UITransform)?.width, 350);
  assertOk(verticalGap(studyBankBar!, studyCard) >= 2);
  assertOk(verticalGap(studyCard, studyReveal) >= 2);
  assertOk(verticalGap(studyReveal, studyMeaningToggle) >= 2);
  assertOk(verticalGap(studyMeaningToggle, studyNext) >= 2);
  assertOk(studyNext.position.y - studyNext.getComponent(UITransform)!.height / 2 >= -studySafe.getComponent(UITransform)!.height / 2);
  assertOk(verticalGap(findDeep(studyCard, "StudyWord")!, findDeep(studyCard, "StudyMeaning")!) >= 2);
  assertOk(verticalGap(findDeep(studyCard, "StudyMeaning")!, findDeep(studyCard, "PreviousWord")!) >= 2);
  assertOk(findDeep(canvas, "StudyMeaning")?.getComponent(Label)?.string);
  assertEqual(findDeep(canvas, "MeaningToggle")?.getComponent(RuntimeButtonVisual)?.isShowingSelectedState(), true);
  findDeep(canvas, "MeaningToggle")?.emit(Button.EventType.CLICK);
  assertEqual(findDeep(canvas, "StudyMeaning")?.getComponent(Label)?.string, "");
  assertEqual(findDeep(canvas, "MeaningToggleTitle")?.getComponent(Label)?.string, "显示后续单词中文");
  assertEqual(findDeep(canvas, "MeaningToggle")?.getComponent(RuntimeButtonVisual)?.isShowingSelectedState(), false);
  findDeep(canvas, "NextWord")?.emit(Button.EventType.CLICK);
  assertEqual(findDeep(canvas, "StudyMeaning")?.getComponent(Label)?.string, "");
  findDeep(canvas, "RevealWord")?.emit(Button.EventType.CLICK);
  assertOk(findDeep(canvas, "StudyMeaning")?.getComponent(Label)?.string);
  const wrongWordCount = app.wordBankStore.getWrongWords().length;
  assertEqual(findDeep(canvas, "MarkWrong")?.getComponent(RuntimeButtonVisual)?.isShowingSelectedState(), false);
  findDeep(canvas, "MarkWrong")?.emit(Button.EventType.CLICK);
  assertEqual(app.wordBankStore.getWrongWords().length, wrongWordCount + 1);
  assertEqual(findDeep(canvas, "MarkWrong")?.getComponent(RuntimeButtonVisual)?.isShowingSelectedState(), true);
  assertEqual(findDeep(canvas, "MarkWrongTitle")?.getComponent(Label)?.string, "已在错题库");
  studyBankBar?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "bank");
  findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "study", "bank back must return to its Study source");
  findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "home");

  const selectedBankBeforeHomePicker = app.wordBankStore.getSelectedBankId();
  findDeep(canvas, "CurrentBankBar")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "bank");
  findDeep(canvas, "BankSlot0")?.emit(Button.EventType.CLICK);
  findDeep(canvas, "ConfirmBank")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "home", "Home bank entry must return to Home");
  assertOk(
    findDeep(canvas, "CurrentBankBarTitle")?.getComponent(Label)?.string.includes("错题库"),
    "Home must refresh the selected bank after returning"
  );
  findDeep(canvas, "BankButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "bank", "secondary bank entry must use the same picker");
  findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "home");
  const bankTitle = findDeep(canvas, "CurrentBankBarTitle");
  const bankTitleTransform = bankTitle?.getComponent(UITransform);
  assertOk(bankTitleTransform);
  bankTitle!.getComponent(Label)!.string = "超长词库名称".repeat(12);
  assertEqual(bankTitle!.getComponent(Label)!.overflow, Label.Overflow.SHRINK);
  assertEqual(bankTitleTransform.width, 350, "long bank text must retain space for the change affordance");
  app.wordBankStore.setSelectedBankId(selectedBankBeforeHomePicker);
  app.store.patch({ bankId: selectedBankBeforeHomePicker });

  const progressBeforeLongCoins = app.wordBankStore.getProgressSnapshot();
  app.wordBankStore.restoreProgress(app.wordBankCatalog, {
    wordCoins: 123456789,
    unlockedBankIds: progressBeforeLongCoins.unlockedBankIds
  });
  findDeep(canvas, "HelpButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "coopSelect");
  findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(findDeep(canvas, "HomeCoins")?.getComponent(Label)?.string, "123456789");
  assertEqual(findDeep(canvas, "HomeCoins")?.getComponent(Label)?.overflow, Label.Overflow.SHRINK);
  app.wordBankStore.restoreProgress(app.wordBankCatalog, progressBeforeLongCoins);

  findDeep(canvas, "HistoryButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "history");
  assertEqual(findDeep(canvas, "HistoryEmptyState")?.active, true, "empty history must show a complete empty-state card");
  assertEqual(findDeep(canvas, "HistoryAllSelected")?.active, true, "history must expose the active filter");
  assertEqual(findDeep(canvas, "HistoryPkSelected")?.active, false);
  findDeep(canvas, "HistoryPk")?.emit(Button.EventType.CLICK);
  assertEqual(findDeep(canvas, "HistoryAllSelected")?.active, false);
  assertEqual(findDeep(canvas, "HistoryPkSelected")?.active, true, "history filter marker must follow selection");
  assertEqual(findDeep(canvas, "HistoryAll")?.getComponent(RuntimeButtonVisual)?.isShowingSelectedState(), false);
  assertEqual(findDeep(canvas, "HistoryPk")?.getComponent(RuntimeButtonVisual)?.isShowingSelectedState(), true);
  findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  findDeep(canvas, "FeedbackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "feedback");
  findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
  await flushMany();
  assertEqual(app.store.getState().route, "home");

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
  const unifiedPageContracts: Partial<Record<RouteName, [string, string]>> = {
    bank: ["BankSafeArea", "BankHeader"],
    coopSelect: ["CoopSelectSafeArea", "CoopSelectHeader"],
    room: ["RoomSafeArea", "RoomHeader"],
    result: ["ResultSafeArea", "ResultHeader"],
    history: ["HistorySafeArea", "HistoryHeader"],
    feedback: ["FeedbackSafeArea", "FeedbackHeader"],
    help: ["HelpSafeArea", "HelpHeader"]
  };
  for (let index = 0; index < routes.length; index += 1) {
    const deferredPkPreload = routes[index] === "pkGame";
    const deferredSpellFailure = routes[index] === "coopSpell";
    if (routes[index] === "room") {
      app.roomStore.enter("pending-room", "WAIT01");
    }
    if (routes[index] === "result") {
      const finishedRoom = {
        ...makeRemoteFinishedRoom("pk"),
        _id: "runtime-result-room",
        roomCode: "DONE01"
      };
      app.roomPolling.start("runtime-result-room", false);
      app.roomStore.enter("runtime-result-room", finishedRoom.roomCode, finishedRoom);
      assertEqual(app.roomPolling.isRunning(), false, "Result routing must not retain a polling timer");
      appRuntime.emitAppHide();
      appRuntime.emitAppShow();
      await flushMany();
      assertEqual(app.roomPolling.isRunning(), false, "show must not resume polling for a finished room");
    }
    if (deferredPkPreload) {
      deferMockAssetLoad("theme_island", "textures/gameplay-bg/spriteFrame");
      await app.themes.select("island");
      await flushMany(2);
      const routeLoading = findDeep(canvas, "RouteLoading");
      assertEqual(routeLoading?.active, false, "shared pre-game art must not wait for gameplay backgrounds");
      assertOk(routeLoading);
      assertVisibleUiContract(routeLoading, "route loading overlay");
      assertOk(findDeep(canvas, "RoomRuntimeScreen"), "theme remount must preserve the current room route");
      deferMockBundleLoad("mode_pk");
    }
    if (deferredSpellFailure) deferMockBundleLoad("mode_spell");
    app.store.setRoute(routes[index]);
    await flushMany(2);
    if (deferredPkPreload) {
      assertEqual(findDeep(canvas, "PkRuntimeScreen"), null, "gameplay must not mount before resources load");
      assertOk(findDeep(canvas, "RoomRuntimeScreen"), "old route must survive a pending gameplay preload");
      assertEqual(findDeep(canvas, "RouteLoadingLabel")?.getComponent(Label)?.string, "正在准备玩法资源...");
      resolveMockBundleLoad("mode_pk");
      await flushMany(2);
      assertEqual(findDeep(canvas, "PkRuntimeScreen"), null, "gameplay must wait for its theme assets after bundle load");
      assertOk(findDeep(canvas, "RoomRuntimeScreen"), "old route must survive the full preload chain");
      resolveMockAssetLoad("theme_island", "textures/gameplay-bg/spriteFrame");
      await flushMany();
      assertEqual(findDeep(canvas, "RouteLoading")?.active, false, "loading state must clear after preload");
    } else if (deferredSpellFailure) {
      assertEqual(findDeep(canvas, "SpellRuntimeScreen"), null, "gameplay must not mount before its bundle loads");
      assertOk(findDeep(canvas, "HomeRuntimeScreen"), "bundle loading must retain the current route");
      rejectMockBundleLoad("mode_spell", new Error("玩法资源加载失败，请重试"));
      await flushMany();
      assertEqual(findDeep(canvas, "RouteLoading")?.active, false, "failed bundle loading must clear loading state");
      assertOk(findDeep(canvas, "HomeRuntimeScreen"), "failed bundle loading must retain the current route");
      assertEqual(appRuntime.toastMessages[appRuntime.toastMessages.length - 1], "玩法资源加载失败，请重试");
      app.store.setRoute("home");
      await flushMany();
      app.store.setRoute("coopSpell");
      await flushMany();
    } else {
      await flushMany();
    }
    const routeRoot = findDeep(canvas, expectedRoots[index]);
    assertOk(routeRoot, `${routes[index]} did not mount`);
    assertVisibleUiContract(routeRoot, `${routes[index]} route`);
    assertPreGameIconLayout(routeRoot, `${routes[index]} route`);
    const unifiedContract = unifiedPageContracts[routes[index]];
    if (unifiedContract) {
      assertOk(findDeep(routeRoot, unifiedContract[0]), `${routes[index]} safe area is required`);
      assertOk(findDeep(routeRoot, unifiedContract[1]), `${routes[index]} shared page header is required`);
      assertOk(
        findDeep(routeRoot, `${unifiedContract[1]}Backdrop`)?.getComponent(Graphics),
        `${routes[index]} must use the high-contrast shared header backdrop`
      );
      assertEqual(
        findDeep(routeRoot, "BackButton")?.getComponent(Graphics)?.enabled,
        true,
        `${routes[index]} back action must render as a visible blue button`
      );
      assertPreGameTargetDevices(routeRoot);
    }
    if (routes[index] === "bank") {
      const bankController = routeRoot.getComponent(BankScene);
      assertOk(bankController);
      assertEqual(findDeep(canvas, "BankPage")?.getComponent(Label)?.string, "1/12");
      assertEqual(findDeep(canvas, "PreviousBanks")?.getComponent(Button)?.interactable, false);
      assertEqual(findDeep(canvas, "NextBanks")?.getComponent(Button)?.interactable, true);
      assertEqual(findDeep(canvas, "BankListHeader"), null, "Bank cards carry their own labels");
      assertEqual(findDeep(canvas, "BankFilter0"), null, "non-functional Bank filter placeholders must stay removed");
      assertEqual(findDeep(canvas, "BankSlot0")?.getComponent(UITransform)?.height, 110);
      assertEqual(findDeep(canvas, "BankSlot0")?.getComponent(RuntimeButtonVisual)?.isShowingSelectedState(), true);
      assertOk(!findDeep(canvas, "BankSlot0Title")?.getComponent(Label)?.string.startsWith("✓"),
        "selected Bank title must leave state feedback to the ring and badge");
      assertEqual(findDeep(canvas, "BankSlot0State")?.getComponent(Label)?.string, "已选择");
      const selectedBankId = app.store.getState().bankPickerSelectedBankId;
      const canUnlock = isUnlockableWordBankId(app.wordBankCatalog, selectedBankId)
        && !app.wordBankStore.isUnlocked(app.wordBankCatalog, selectedBankId);
      assertEqual(findDeep(canvas, "UnlockBank")?.getComponent(Button)?.interactable, canUnlock);
      assertEqual(findDeep(canvas, "UnlockBankTitle")?.getComponent(Label)?.string,
        canUnlock ? "解锁所选" : "无需解锁");
      findDeep(canvas, "PreviousBanks")?.emit(Button.EventType.CLICK);
      assertEqual(findDeep(canvas, "BankPage")?.getComponent(Label)?.string, "1/12");
      findDeep(canvas, "NextBanks")?.emit(Button.EventType.CLICK);
      assertEqual(findDeep(canvas, "BankPage")?.getComponent(Label)?.string, "2/12");
      assertEqual(findDeep(canvas, "PreviousBanks")?.getComponent(Button)?.interactable, true);
      findDeep(canvas, "PreviousBanks")?.emit(Button.EventType.CLICK);
      assertEqual(findDeep(canvas, "BankPage")?.getComponent(Label)?.string, "1/12");

      const originalProgress = app.wordBankStore.getProgressSnapshot();
      const originalPersistWordBankProgress = app.persistWordBankProgress;
      bankController.selectBank("jilin-g1a-b1-u1");
      app.persistWordBankProgress = () => false;
      bankController.unlockSelectedBank();
      assertEqual(app.wordBankStore.getWordCoins(), originalProgress.wordCoins);
      assertEqual(
        app.wordBankStore.isUnlocked(app.wordBankCatalog, "jilin-g1a-b1-u1"),
        false,
        "failed persistence must roll back the in-memory unlock"
      );
      assertEqual(
        appRuntime.toastMessages[appRuntime.toastMessages.length - 1],
        "解锁失败，本地保存不可用，金币未扣除"
      );
      app.persistWordBankProgress = originalPersistWordBankProgress;
    }
    if (routes[index] === "coopSelect") {
      const helpButton = findDeep(canvas, "ModeHelpButton");
      const helpTransform = helpButton?.getComponent(UITransform);
      const catalogTitle = findDeep(canvas, "CoopSelectHeaderTitle")?.getComponent(UITransform);
      const catalogSubtitle = findDeep(canvas, "CoopSelectHeaderSubtitle")?.getComponent(UITransform);
      assertOk(helpButton);
      assertOk(helpButton.getComponent(Button) && helpTransform && catalogTitle && catalogSubtitle);
      assertOk(catalogTitle.width / 2 + 62 <= helpButton.position.x - helpTransform.width / 2,
        "catalog title must leave room for the rules action");
      assertOk(catalogSubtitle.width / 2 + 14 <= helpButton.position.x - helpTransform.width / 2,
        "catalog subtitle must leave room for the rules action");
      helpButton.emit(Button.EventType.CLICK);
      await flushMany();
      assertEqual(app.store.getState().route, "help");
      assertEqual(findDeep(canvas, "HelpHeaderTitle")?.getComponent(Label)?.string, "玩法说明");
      findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
      await flushMany();
      assertEqual(app.store.getState().route, "coopSelect", "rules must return to the mode catalog");
      assertEqual(findDeep(canvas, "ModeOption0")?.getComponent(UITransform)?.width, 548);
      assertEqual(findDeep(canvas, "ModeOption0")?.getComponent(UITransform)?.height, 86);
      assertEqual(findDeep(canvas, "ModeOption1")?.getComponent(UITransform)?.width, 548);
      assertEqual(findDeep(canvas, "ModeOption1")?.getComponent(UITransform)?.height, 86);
      assertEqual(findDeep(canvas, "ModeOption7")?.getComponent(UITransform)?.width, 548);
      assertOk(findDeep(canvas, "ModeOption0Players")?.getComponent(Graphics),
        "mode player count must use the shared status badge");
      const modeText = findDeep(canvas, "ModeOption0Subtitle")!;
      const modeBadge = findDeep(canvas, "ModeOption0Players")!;
      assertOk(
        modeText.position.x + modeText.getComponent(UITransform)!.width / 2 + 8
          <= modeBadge.position.x - modeBadge.getComponent(UITransform)!.width / 2,
        "mode copy must reserve space for the player-count badge"
      );
      findDeep(canvas, "ModeOption0Action")?.emit(Button.EventType.CLICK);
      await flushMany();
      assertEqual(app.store.getState().selectedMode, "pk");
      assertEqual(app.store.getState().route, "room");
    }
    if (routes[index] === "room") {
      assertEqual(findDeep(canvas, "RoomCodeInput"), null, "active invitation rooms do not need the join input tree");
      assertEqual(
        findDeep(canvas, "RoomPlayerOne")?.getComponent(Label)?.string,
        "玩家1（你）",
        "player cards must not duplicate the central syncing state"
      );
      assertEqual(findDeep(canvas, "RoomPlayerTwo")?.getComponent(Label)?.string, "等待加入");
      assertEqual(findDeep(canvas, "RoomStatus")?.getComponent(Label)?.string, "正在进入房间...");
      assertEqual(findDeep(canvas, "RoomStatusAttention")?.active, false);
      assertEqual(findDeep(canvas, "RoomHeaderTitle")?.getComponent(Label)?.string, "准备体验模式");
      assertEqual(findDeep(canvas, "CreateRoom"), null);
      assertEqual(findDeep(canvas, "JoinRoom"), null);
      assertEqual(findDeep(canvas, "RoomCreatePanel"), null);
      assertEqual(findDeep(canvas, "RoomJoinPanel"), null);
      assertEqual(findDeep(canvas, "RoomLobbyPanel")?.active, true);
      app.playerStore.setOpenId("player-1");
      const waitingRoom = makeWaitingPkRoom();
      app.roomStore.applySnapshot(waitingRoom);
      assertEqual(
        findDeep(canvas, "RoomPlayerOne")?.getComponent(Label)?.string,
        "玩家1（你）",
        "player cards must leave readiness to the status badge"
      );
      assertEqual(findDeep(canvas, "RoomPlayerOneWaiting")?.active, true);
      assertEqual(findDeep(canvas, "RoomPlayerTwo")?.getComponent(Label)?.string, "等待加入");
      assertEqual(findDeep(canvas, "CopyCode")?.getComponent(Button)?.interactable, true);
      assertEqual(findDeep(canvas, "InviteFriend")?.getComponent(Button)?.interactable, true);
      assertEqual(findDeep(canvas, "RefreshRoom"), null, "room refresh stays in background polling");
      assertEqual(
        findDeep(canvas, "RoomStatus")?.getComponent(Label)?.string,
        "等待第二名玩家加入",
        "a loaded room must show the preparation condition instead of polling activity"
      );
      app.roomStore.setSyncing(true);
      assertEqual(
        findDeep(canvas, "RoomStatus")?.getComponent(Label)?.string,
        "等待第二名玩家加入",
        "background polling must not replace the visible preparation status"
      );
      app.roomStore.setSyncing(false);
      app.roomStore.setSyncError("网络波动");
      assertEqual(findDeep(canvas, "RoomStatusAttention")?.active, true);
      assertEqual(findDeep(canvas, "RoomStatusReady")?.active, false);
      assertOk(findDeep(canvas, "RoomStatus")?.getComponent(Label)?.string.includes("后台将自动重试"));
      app.roomStore.setSyncError("");
      assertEqual(findDeep(canvas, "RoomStatusAttention")?.active, false);

      const twoReadyPlayers: RoomSnapshot = {
        ...waitingRoom,
        players: [
          { ...waitingRoom.players[0], ready: true },
          { openid: "player-2", nickName: "玩家2", score: 0, ready: true }
        ]
      };
      app.roomStore.applySnapshot(twoReadyPlayers);
      const enabledStart = findDeep(canvas, "StartRoom")?.getComponent(Button);
      const enabledStartVisual = findDeep(canvas, "StartRoom")?.getComponent(RuntimeButtonVisual);
      assertEqual(enabledStart?.interactable, true, "two ready human players must enable the start action");
      enabledStartVisual?.refresh();
      assertEqual(enabledStartVisual?.isShowingDisabledState(), false, "enabled start must use the highlighted action color");
      assertEqual(enabledStartVisual?.isShowingSelectedState(), true, "ready room must expose the selected start state");
      assertEqual(findDeep(canvas, "RoomStatusReady")?.active, true);
      app.roomStore.setPendingAction("start");
      assertEqual(findDeep(canvas, "RoomStatusAttention")?.active, true);
      assertEqual(findDeep(canvas, "RoomStatusReady")?.active, false);
      app.roomStore.setPendingAction(null);
      assertEqual(findDeep(canvas, "RoomStatusAttention")?.active, false);
      assertEqual(findDeep(canvas, "RoomStatusReady")?.active, true);
      assertEqual(findDeep(canvas, "RoomPlayerTwoReady")?.active, true);
      assertEqual(
        findDeep(canvas, "StartRoomSubtitle")?.getComponent(Label)?.string,
        "双方已准备，点击开始游戏"
      );
      app.roomStore.applySnapshot(waitingRoom);

      findDeep(canvas, "CopyCode")?.emit(Button.EventType.CLICK);
      await flushMany();
      assertEqual(appRuntime.clipboardText, "WAIT01");
      const shareCount = appRuntime.shareMessages.length;
      findDeep(canvas, "InviteFriend")?.emit(Button.EventType.CLICK);
      await flushMany();
      assertEqual(appRuntime.shareMessages.length, shareCount + 1);
      assertEqual(
        appRuntime.shareMessages[appRuntime.shareMessages.length - 1]?.query,
        "invite=1&roomCode=WAIT01"
      );

      const startVisual = findDeep(canvas, "StartRoom")?.getComponent(RuntimeButtonVisual);
      assertOk(startVisual, "runtime buttons must bind their disabled theme visual");
      startVisual.refresh();
      assertEqual(startVisual.isShowingDisabledState(), true, "blocked start must use the disabled color state");

      app.roomStore.setPendingAction("create");
      [
        "BackButton",
        "Ready",
        "StartRoom",
        "CopyCode",
        "InviteFriend"
      ].forEach((name) => {
        const node = findDeep(canvas, name);
        assertEqual(node?.getComponent(Button)?.interactable, false, `${name} must lock while a room action is pending`);
        const visual = node?.getComponent(RuntimeButtonVisual);
        visual?.refresh();
        assertEqual(visual?.isShowingDisabledState(), true, `${name} must display its disabled color`);
      });
      app.roomStore.setPendingAction(null);
      assertEqual(findDeep(canvas, "BackButton")?.getComponent(Button)?.interactable, true);

      app.store.patch({ selectedMode: "coopSpell" });
      const roomController = findDeep(canvas, "RoomRuntimeScreen")?.getComponent(RoomScene);
      assertOk(roomController, "Room controller must be mounted");
      roomController.toggleAutoReady();
      await roomController.createConfiguredRoom();
      const createCall = appRuntime.cloudCalls[appRuntime.cloudCalls.length - 1] as {
        name: string;
        data: { gameOptions?: { roomSpellQuestions?: Array<{ word: string; mask: string }> } };
      };
      assertEqual(createCall.name, "createRoom");
      assertEqual(createCall.data.gameOptions?.roomSpellQuestions?.length, 42);
      assertEqual(createCall.data.gameOptions?.roomSpellQuestions?.[0]?.word, "exchange");
      assertEqual(createCall.data.gameOptions?.roomSpellQuestions?.[0]?.mask, "e___a_ge");
      app.store.patch({ selectedMode: "pk" });
    }
    if (routes[index] === "pkGame") {
      const target = findDeep(canvas, "WordTarget0");
      assertEqual(target?.getComponent(ThemedWordTargetVisual)?.getStyle(), "fish");
      const feedbackPool = findDeep(canvas, "GameplayFeedback")?.getComponent(GameplayFeedbackPool);
      assertOk(feedbackPool, "PK feedback pool must be mounted");
      assertEqual(feedbackPool.labels.length, 3, "feedback effects must reuse three stable labels");
      app.fishingStore.showBotFeedback(100);
      assertEqual(feedbackPool.labels.filter((label) => label.node.active).length, 1);
      assertEqual(feedbackPool.labels.find((label) => label.node.active)?.string, "机器人 +100");
      feedbackPool.update(1);
      assertEqual(feedbackPool.labels.filter((label) => label.node.active).length, 0);

      await app.themes.select("default");
      await flushMany();
      assertEqual(
        findDeep(canvas, "WordTarget0")?.getComponent(ThemedWordTargetVisual)?.getStyle(),
        "insect",
        "default theme must restore gameplay target geometry after a preloaded island route"
      );
      findDeep(canvas, "LeavePk")?.emit(Button.EventType.CLICK);
      await flushMany();
      assertEqual(app.store.getState().route, "home");
    }
    if (routes[index] === "coopShared") {
      findDeep(canvas, "LeaveShared")?.emit(Button.EventType.CLICK);
      await flushMany();
      assertEqual(app.store.getState().route, "home");
    }
    if (routes[index] === "coopSpell") {
      findDeep(canvas, "LeaveSpell")?.emit(Button.EventType.CLICK);
      await flushMany();
      assertEqual(app.store.getState().route, "home");
    }
    if (routes[index] === "result") {
      assertOk(findDeep(canvas, "ResultTitle")?.getComponent(Label)?.string.length);
      assertEqual(findDeep(canvas, "ResultCard")?.getComponent(UITransform)?.height, 450);
      findDeep(canvas, "ResultHistory")?.emit(Button.EventType.CLICK);
      await flushMany();
      assertEqual(app.store.getState().route, "history");
      assertEqual(app.roomStore.getState().roomId, "", "opening result history must release the finished room");
      assertOk(app.historyStore.getRecords("pk").some((record) => record.id === "pk:runtime-result-room"));
    }
    if (routes[index] === "history") {
      assertOk(findDeep(canvas, "HistoryRecentSummary")?.getComponent(Label)?.string.length);
      assertEqual(findDeep(canvas, "HistoryBestSummary")?.getComponent(Label)?.string, "700 分");
      assertEqual(findDeep(canvas, "HistoryEmptyState")?.active, false, "history records must hide the empty-state card");
      assertOk(findDeep(canvas, "HistoryRecentCardTab")?.getComponent(Graphics));
      const historyRow = findDeep(canvas, "HistoryRow0")!;
      const historyTitle = findDeep(historyRow, "Title")!;
      const historyScore = findDeep(historyRow, "Score")!;
      const historyDetail = findDeep(historyRow, "HistoryRow0Detail")!;
      const rightEdge = (node: Node): number => node.position.x + node.getComponent(UITransform)!.width / 2;
      const leftEdge = (node: Node): number => node.position.x - node.getComponent(UITransform)!.width / 2;
      assertOk(rightEdge(historyTitle) + 8 <= leftEdge(historyScore), "History title and score columns must not overlap");
      assertOk(rightEdge(historyScore) + 8 <= leftEdge(historyDetail), "History score and detail columns must not overlap");
      findDeep(canvas, "HistorySpell")?.emit(Button.EventType.CLICK);
      findDeep(canvas, "HistoryRow0Detail")?.emit(Button.EventType.CLICK);
      const firstBody = findDeep(canvas, "DetailBody")?.getComponent(Label)?.string || "";
      assertOk(firstBody.includes("1. WORD1"), "spell detail first page must start at round 1");
      assertEqual(firstBody.includes("4. WORD4"), false, "spell detail page must be bounded");
      assertEqual(findDeep(canvas, "DetailPage")?.getComponent(Label)?.string, "1/3");
      findDeep(canvas, "DetailNext")?.emit(Button.EventType.CLICK);
      const secondBody = findDeep(canvas, "DetailBody")?.getComponent(Label)?.string || "";
      assertOk(secondBody.includes("4. WORD4"), "spell detail next page must start at round 4");
      assertEqual(findDeep(canvas, "DetailPage")?.getComponent(Label)?.string, "2/3");
      findDeep(canvas, "CloseDetail")?.emit(Button.EventType.CLICK);
      assertEqual(findDeep(canvas, "HistoryList")?.active, true);
      findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
      await flushMany();
      assertEqual(app.store.getState().route, "home");
    }
    if (routes[index] === "feedback") {
      const feedbackController = findDeep(canvas, "FeedbackRuntimeScreen")?.getComponent(FeedbackScene);
      const feedbackInput = findDeep(canvas, "FeedbackContent")?.getComponent(EditBox);
      const feedbackContact = findDeep(canvas, "FeedbackContact")?.getComponent(EditBox);
      const feedbackButton = findDeep(canvas, "SubmitFeedback")?.getComponent(Button);
      assertOk(feedbackController);
      assertOk(feedbackInput);
      assertOk(feedbackContact);
      assertOk(feedbackButton);
      assertEqual(feedbackInput.node.parent?.name, "FeedbackSafeArea", "native EditBox must use safe-area coordinates");
      assertEqual(feedbackContact.node.parent?.name, "FeedbackSafeArea", "native EditBox must use safe-area coordinates");
      assertEqual(findDeep(canvas, "FeedbackFormCard")?.getComponent(UITransform)?.height, 500);
      assertOk(findDeep(canvas, "FeedbackContentCaption"));
      assertOk(findDeep(canvas, "FeedbackContactCaption"));
      assertOk(findDeep(canvas, "FeedbackStatusBand")?.getComponent(Graphics),
        "feedback guidance must stay inside a stable status band");
      const formCard = findDeep(canvas, "FeedbackFormCard")!;
      const screenY = (node: Node): number => node.parent === formCard
        ? formCard.position.y + node.position.y : node.position.y;
      const feedbackGap = (upper: Node, lower: Node): number =>
        screenY(upper) - upper.getComponent(UITransform)!.height / 2
          - screenY(lower) - lower.getComponent(UITransform)!.height / 2;
      const feedbackNodes = ["FeedbackPrompt", "FeedbackPrivacy", "FeedbackContentCaption",
        "FeedbackContent", "FeedbackContactCaption", "FeedbackContact", "FeedbackStatusBand"]
        .map((name) => findDeep(canvas, name)!);
      for (let gap = 0; gap < feedbackNodes.length - 1; gap += 1) {
        assertOk(feedbackGap(feedbackNodes[gap], feedbackNodes[gap + 1]) >= 4,
          `feedback form gap ${gap} must remain visible`);
      }
      assertOk(feedbackGap(feedbackNodes[5], feedbackNodes[6]) >= 8,
        "feedback contact input and status band must not overlap");
      assertEqual(feedbackButton.interactable, false, "empty feedback must keep submit disabled");
      feedbackInput.string = "短";
      feedbackInput.node.emit("text-changed");
      assertEqual(findDeep(canvas, "FeedbackContentCount")?.getComponent(Label)?.string, "1/300");
      assertEqual(feedbackButton.interactable, false, "short feedback must keep submit disabled");
      const cloudCallCount = appRuntime.cloudCalls.length;
      findDeep(canvas, "SubmitFeedback")?.emit(Button.EventType.CLICK);
      assertEqual(appRuntime.cloudCalls.length, cloudCallCount, "invalid feedback must not call cloud functions");
      assertEqual(findDeep(canvas, "FeedbackStatus")?.getComponent(Label)?.string, "反馈内容太短，请多写一点");

      const originalFeedbackSubmit = app.feedback.submit;
      app.feedback.submit = async () => ({ ok: true });
      feedbackInput.string = "切换页面时偶尔会看到状态异常";
      feedbackInput.node.emit("text-changed");
      feedbackContact.string = "contact@example.com";
      assertEqual(feedbackButton.interactable, true, "valid feedback must enable submit");
      assertEqual(findDeep(canvas, "FeedbackStatus")?.getComponent(Label)?.string, "内容已达到提交要求");
      await feedbackController.submit();
      assertEqual(feedbackInput.string, "", "successful feedback must clear its content");
      assertEqual(findDeep(canvas, "FeedbackContentCount")?.getComponent(Label)?.string, "0/300");
      assertEqual(feedbackContact.string, "", "successful feedback must clear its optional contact");
      assertEqual(findDeep(canvas, "FeedbackStatus")?.getComponent(Label)?.string, "反馈已提交，谢谢你的帮助");
      assertEqual(feedbackButton.interactable, false, "cleared feedback must disable submit after success");

      app.feedback.submit = async () => {
        throw new Error("反馈内容不合规");
      };
      feedbackInput.string = "这是一条需要被内容安全拦截的反馈";
      feedbackInput.node.emit("text-changed");
      const activeFailureToastCount = appRuntime.toastMessages.length;
      await feedbackController.submit();
      assertEqual(feedbackInput.string, "这是一条需要被内容安全拦截的反馈");
      assertEqual(findDeep(canvas, "FeedbackStatus")?.getComponent(Label)?.string, "反馈内容不合规");
      assertEqual(appRuntime.toastMessages.length, activeFailureToastCount + 1);
      assertEqual(appRuntime.toastMessages[appRuntime.toastMessages.length - 1], "反馈内容不合规");
      assertEqual(feedbackButton.interactable, true, "feedback submit must unlock after an active failure");

      let resolveLateFeedback: ((value: { ok: true }) => void) | null = null;
      app.feedback.submit = () => new Promise<{ ok: true }>((resolve) => {
        resolveLateFeedback = resolve;
      });
      const abandonedContent = "提交后立即离开反馈页面，结果不应写回";
      feedbackInput.string = abandonedContent;
      const abandonedToastCount = appRuntime.toastMessages.length;
      const abandonedSubmit = feedbackController.submit();
      assertEqual(feedbackButton.interactable, false, "feedback submit must lock while its request is pending");
      findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
      await flushMany();
      assertEqual(app.store.getState().route, "home");
      (resolveLateFeedback as ((value: { ok: true }) => void) | null)?.({ ok: true });
      await abandonedSubmit;
      assertEqual(feedbackInput.string, abandonedContent, "late feedback success must not mutate a destroyed form");
      assertEqual(appRuntime.toastMessages.length, abandonedToastCount, "late feedback completion must stay silent");
      app.feedback.submit = originalFeedbackSubmit;
    }
    if (routes[index] === "help") {
      const helpBody = findDeep(canvas, "HelpBody")?.getComponent(Label)?.string || "";
      assertOk(helpBody.includes("01  背单词\n") && helpBody.includes("06  战绩记录\n"),
        "help copy must expose a numbered title/body hierarchy");
      assertOk(findDeep(canvas, "HelpRulesSummary"));
      assertEqual(findDeep(canvas, "HelpBody")?.getComponent(Label)?.fontSize, 20);
      findDeep(canvas, "BackButton")?.emit(Button.EventType.CLICK);
      await flushMany();
      assertEqual(app.store.getState().route, "coopSelect");
    }
    if (routes[index] === "home") {
      assertEqual(
        findDeep(canvas, "HistoryButtonSubtitle")?.getComponent(Label)?.string,
        "历史最高 700 分",
        "Home must refresh its real history summary after returning"
      );
    }
  }

  assertEqual(findDeep(canvas, "RuntimeScreens")?.children.length, 1, "old route nodes must be destroyed");
  canvas.destroy();
  console.log("Runtime shell execution OK: route interactions, room release, remote settlement, and history paging passed.");
}

void main();
