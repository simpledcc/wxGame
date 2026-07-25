import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readCoreScreenBuilders(): string {
  return [
    "assets/scripts/components/ui/screens/HomeScreenBuilder.ts",
    "assets/scripts/components/ui/screens/LearningScreenBuilders.ts",
    "assets/scripts/components/ui/screens/RoomScreenBuilders.ts",
    "assets/scripts/components/ui/screens/SupportScreenBuilders.ts"
  ].map(read).join("\n");
}

function testRouteCoverage(): void {
  const factory = read("assets/scripts/components/ui/RuntimeScreenFactory.ts");
  const source = readCoreScreenBuilders();
  const modePk = read("assets/bundles/mode_pk/scripts/ModePkScreenBuilder.ts");
  const modeSpell = read("assets/bundles/mode_spell/scripts/ModeSpellScreenBuilder.ts");
  const coreRouteBuilders: Record<string, string> = {
    bank: "buildBankScreen",
    study: "buildStudyScreen",
    coopSelect: "buildModeCatalogScreen",
    room: "buildRoomScreen",
    result: "buildResultScreen",
    history: "buildHistoryScreen",
    feedback: "buildFeedbackScreen",
    help: "buildHelpScreen",
    home: "buildHomeScreen"
  };
  Object.entries(coreRouteBuilders).forEach(([route, builder]) => {
    assert.match(factory, new RegExp(`\\b${route}:\\s*${builder}\\b`), `route builder missing: ${route}`);
    assert.match(source, new RegExp(`\\b${builder}\\(`));
  });
  ["pkGame", "coopShared", "coopSpell"].forEach((route) => {
    assert.equal(factory.includes(`"${route}"`), true, `gameplay route missing: ${route}`);
  });
  assert.match(modePk, /register\("pkGame"/);
  assert.match(modePk, /register\("coopShared"/);
  assert.match(modeSpell, /register\("coopSpell"/);
  const allBuilders = `${factory}\n${source}\n${modePk}\n${modeSpell}`;
  [
    "HomeScene",
    "BankScene",
    "StudyScene",
    "CoopSelectScene",
    "RoomScene",
    "PkGameScene",
    "CoopSharedScene",
    "CoopSpellScene",
    "ResultScene",
    "HistoryScene",
    "FeedbackScene",
    "HelpScene"
  ].forEach((controller) => {
    assert.match(allBuilders, new RegExp(`addComponent\\(${controller}\\)`));
  });
  assert.doesNotMatch(factory, /PkGameScene|CoopSharedScene|CoopSpellScene|SpellLetterKey|PkWordTarget/);
  assert.match(factory, /gameplayScreens\.build/);
}

function testExpectedControls(): void {
  const source = readCoreScreenBuilders();
  const gameplay = [
    read("assets/bundles/mode_pk/scripts/ModePkScreenBuilder.ts"),
    read("assets/bundles/mode_spell/scripts/ModeSpellScreenBuilder.ts")
  ].join("\n");
  const visibleBuilders = `${source}\n${gameplay}`;
  [
    "赛前练习",
    "选择词库",
    "选择玩法",
    "加入房间",
    "好友房间体验",
    "玩法介绍",
    "换词库",
    "战绩记录",
    "问题反馈",
    "玩法介绍",
    "创建房间",
    "加入",
    "我准备好了",
    "开始游戏",
    "使用道具",
    "提交",
    "跳过",
    "提交反馈",
    "隐私保护指引",
    "开启音效",
    "关闭"
  ].forEach((label) => assert.equal(visibleBuilders.includes(label), true, `runtime control missing: ${label}`));
  [
    "randomWord",
    "markCurrentUnfamiliar",
    "openPrivacyContract",
    "createWordTargets",
    "SpellLetterKey",
    "HistoryRecordItem",
    "nextDetailPage",
    "ThemedWordTargetVisual",
    "GameplayFeedbackPool"
  ].forEach((binding) => assert.match(visibleBuilders, new RegExp(`\\b${binding}\\b`)));

  const roomController = read("assets/scripts/scenes/RoomScene.ts");
  const explicitLeaves = roomController.match(/app\.roomSession\.leave\(\)/g) || [];
  assert.equal(explicitLeaves.length, 1, "RoomScene may leave only from the explicit back action");
  assert.doesNotMatch(roomController, /addBotButton|botDifficultyButtons|botDifficultyLabels|refreshButton|refreshRoom|isBotPlayer|机器人|state\.duration|room\.duration/);
  ["createButton", "joinButton", "copyButton", "inviteButton", "backButton"]
    .forEach((binding) => assert.match(roomController, new RegExp(`\\b${binding}\\b`)));
  assert.match(roomController, /setSessionControls/);
  assert.match(roomController, /setLobbyButtons/);
  assert.doesNotMatch(roomController, /state\.syncing/);
  assert.match(roomController, /双方已准备，点击开始游戏/);
  assert.match(roomController, /releaseEntryPanels/);
  assert.doesNotMatch(roomController, /getEntryGuidance/);
  assert.match(roomController, /createPanel/);
  assert.match(roomController, /joinPanel/);
  assert.match(roomController, /lobbyPanel/);
  assert.match(roomController, /toggleAutoReady/);
  assert.match(roomController, /getSpellTemplatesForBank/);
  assert.match(roomController, /app\.spellTemplateData/);
  assert.match(roomController, /roomSpellQuestions/);
  assert.doesNotMatch(roomController, /createSelectedRoom|async startGame\(/);
  assert.match(roomController, /createConfiguredRoom|async startSelectedMode\(/);
  const roomSession = read("assets/scripts/services/RoomSessionService.ts");
  assert.doesNotMatch(roomSession, /\baddBot\b|BOT_NAMES|runAction\("bot"/);
  assert.doesNotMatch(roomSession, /async startGame\(/);
  assert.match(roomSession, /async startPreparedMode\(/);
  const roomService = read("assets/scripts/services/RoomService.ts");
  assert.doesNotMatch(roomService, /\baddBot\b/);
  const roomRules = read("assets/scripts/domain/RoomRules.ts");
  assert.doesNotMatch(roomRules, /\bcanAddBot\b/);
  assert.match(roomRules, /humanCount < 2/);
  const gameStore = read("assets/scripts/store/GameStore.ts");
  assert.doesNotMatch(gameStore, /GameDuration|\bduration\s*:/);
  const coopSelectController = read("assets/scripts/scenes/CoopSelectScene.ts");
  assert.doesNotMatch(coopSelectController, /openSharedRoom|openSpellRoom|openTrialRoom|changeBank|statusLabel/);
  assert.match(coopSelectController, /openModeSetup/);
  const homeController = read("assets/scripts/scenes/HomeScene.ts");
  assert.doesNotMatch(homeController, /RoomEntryIntent|\bopenRoom\b/);
  assert.match(homeController, /openPrivacyContract/);
  assert.match(homeController, /refreshDisplay/);
  assert.match(homeController, /navigateOnce/);
  assert.match(homeController, /toggleMuted/);
  assert.match(homeController, /audio\.setMuted/);
  const studyController = read("assets/scripts/scenes/StudyScene.ts");
  assert.doesNotMatch(studyController, /\bhideChinese\b|\bshowChinese\b/);
  [
    "HomeTopBar", "HomePlayerName", "HomeCoins", "SettingsButton", "CurrentBankBar",
    "CreateRoomButton", "JoinRoomButton", "StudyButton", "BankButton", "HelpButton",
    "HistoryButton", "HomePrivacy", "FeedbackButton", "HomeSettingsModal"
  ].forEach((name) => assert.equal(source.includes(`\"${name}\"`), true, `modern Home node missing: ${name}`));
  assert.doesNotMatch(source, /BestScores|DurationTitle|ThemeDevTitle|DEV THEME/);
  assert.doesNotMatch(source, /Lv\.12|1200/);
  const bootController = read("assets/scripts/scenes/BootScene.ts");
  assert.match(bootController, /error instanceof CloudCallError/);
  assert.match(bootController, /error\.message/);
}

function testGameplayBundleBoundary(): void {
  const manager = read("assets/scripts/core/GameplayBundles.ts");
  assert.match(manager, /pkGame: "mode_pk"/);
  assert.match(manager, /coopShared: "mode_pk"/);
  assert.match(manager, /coopSpell: "mode_spell"/);
  assert.match(manager, /assetManager\.loadBundle/);
  assert.match(manager, /gameplayScreens\.has/);
  ["mode_pk", "mode_spell"].forEach((name) => {
    const meta = JSON.parse(read(`assets/bundles/${name}.meta`));
    assert.equal(meta.userData.isBundle, true);
    assert.equal(meta.userData.bundleName, name);
    assert.equal(meta.userData.compressionType.wechatgame, "subpackage");
    assert.equal(meta.userData.isRemoteBundle, false);
  });
}

function testShellLifecycleAndSceneAttachment(): void {
  const shell = read("assets/scripts/components/HomePlaceholder.ts");
  assert.match(shell, /app\.store\.subscribe/);
  assert.match(shell, /this\.screens\.build/);
  assert.match(shell, /activeScreen\.destroy\(\)/);
  assert.match(shell, /getRouteBackgroundAssetKey\(route\)/);
  assert.match(shell, /themes\.preloadAssets/);
  assert.match(shell, /routeLoadSequence/);
  assert.match(shell, /pendingRoute/);
  assert.match(shell, /RouteLoading/);
  assert.match(shell, /addComponent\(BlockInputEvents\)/);
  assert.match(shell, /backgroundSequence/);
  assert.match(shell, /performance\.recordFrame/);
  assert.match(shell, /performance\.recordNodeCount/);
  const homeScene = read("assets/scenes/Home.scene");
  const homePlaceholderMeta = JSON.parse(read("assets/scripts/components/HomePlaceholder.ts.meta"));
  assert.ok(homePlaceholderMeta.uuid);
  assert.equal(homeScene.includes("HomePlaceholder"), false, "Cocos scene stores compressed component IDs");
  assert.match(homeScene, /"titleLabel"/);
  assert.match(homeScene, /"bodyLabel"/);
  const ui = read("assets/scripts/components/ui/RuntimeUi.ts");
  assert.match(ui, /DESIGN_WIDTH = 640/);
  assert.match(ui, /DESIGN_HEIGHT = 960/);
  assert.match(ui, /RuntimeButtonVisual/);
  assert.match(ui, /this\.color\("disabled"\)/);
  assert.match(ui, /this\.color\("primaryPressed"\)/);
  const buttonVisual = read("assets/scripts/components/ui/RuntimeButtonVisual.ts");
  assert.match(buttonVisual, /isShowingDisabledState/);
  assert.match(buttonVisual, /getVisualGeometry/);
  assert.match(ui, /backgroundNode = this\.panel/);
}

function testPreGameUiFoundation(): void {
  const source = read("assets/scripts/components/ui/PreGameUi.ts");
  const iconSource = read("assets/scripts/components/ui/PreGameIconRenderer.ts");
  ["visualSlot", "setVisualAsset", "safeArea", "topBar", "pageHeader", "group", "card", "button", "edit", "actionButton", "iconButton", "modal", "drawProgrammaticIcon", "drawProgrammaticLogo"]
    .forEach((method) => assert.match(source, new RegExp(`\\b${method}\\(`)));
  ["coin", "createRoom", "joinRoom", "practice", "wordBank", "catalog", "history", "settings", "privacy", "feedback"]
    .forEach((icon) => assert.match(iconSource, new RegExp(`key === \\"${icon}\\"`)));
  assert.match(source, /PreGameIconRenderer/);
  assert.ok(Buffer.byteLength(source, "utf8") < 35_000, "PreGameUi must stay below 35 KB");
  const factory = read("assets/scripts/components/ui/RuntimeScreenFactory.ts");
  assert.ok(Buffer.byteLength(factory, "utf8") < 5_000, "RuntimeScreenFactory must remain a small route facade");
  assert.doesNotMatch(factory, /addComponent\(/);
  assert.match(source, /DESIGN_WIDTH/);
  assert.match(source, /getPortraitViewportHeight/);
  assert.doesNotMatch(source, /DESIGN_HEIGHT/);
  assert.match(source, /addComponent\(BlockInputEvents\)/);
  assert.match(source, /RuntimeButtonVisual/);
  assert.doesNotMatch(source, /mode_pk|mode_spell|wx\.|cloudfunctions/);
}

interface SerializedSceneItem {
  __type__?: string;
  _name?: string;
  _lpos?: { x?: number; y?: number };
  _components?: Array<{ __id__?: number }>;
  _contentSize?: { width?: number; height?: number };
  _alignFlags?: number;
  _left?: number;
  _right?: number;
  _top?: number;
  _bottom?: number;
  _overflow?: number;
}

function testSceneCanvasContract(): void {
  ["Boot", "Home"].forEach((sceneName) => {
    const items = JSON.parse(read(`assets/scenes/${sceneName}.scene`)) as SerializedSceneItem[];
    const canvasNode = items.find((item) => item.__type__ === "cc.Node" && item._name === "Canvas");
    assert.ok(canvasNode, `${sceneName} must serialize a Canvas node`);
    assert.deepEqual(canvasNode._lpos, { __type__: "cc.Vec3", x: 320, y: 480, z: 0 });
    const components = (canvasNode._components || []).map((reference) => items[Number(reference.__id__)]);
    const transform = components.find((item) => item?.__type__ === "cc.UITransform");
    assert.deepEqual(transform?._contentSize, { __type__: "cc.Size", width: 640, height: 960 });
    const widget = components.find((item) => item?.__type__ === "cc.Widget");
    assert.ok(widget, `${sceneName} Canvas must stay aligned to the viewport`);
    assert.equal(widget._alignFlags, 45);
    assert.deepEqual(
      [widget._left, widget._right, widget._top, widget._bottom],
      [0, 0, 0, 0],
      `${sceneName} Canvas must not carry editor viewport offsets`
    );
    items
      .filter((item) => item.__type__ === "cc.Label")
      .forEach((label) => assert.equal(label._overflow, 2, `${sceneName} labels must shrink inside serialized bounds`));
  });
}

function testRouterStaysInRuntimeShell(): void {
  const router = read("assets/scripts/core/SceneRouter.ts");
  assert.match(router, /home: \{ route: "home", cocosScene: "Home" \}/);
  ["bank", "study", "coopSelect", "room", "pkGame", "coopShared", "coopSpell", "result", "history", "feedback", "help"]
    .forEach((route) => {
      assert.equal(router.includes(`${route}: { route: "${route}" }`), true, `runtime route missing: ${route}`);
    });
  assert.match(router, /director\.getScene\(\)\?\.name === config\.cocosScene/);
  assert.match(router, /enterRuntimeShell/);
  assert.match(router, /cocosScene: "Home"/);
}

function testBootEntryRouting(): void {
  const boot = read("assets/scripts/scenes/BootScene.ts");
  assert.match(boot, /app\.lifecycle\.activate\(\)/);
  assert.match(boot, /joinedInvite \? app\.store\.getState\(\)\.route : "home"/);
  assert.match(boot, /app\.router\.enterRuntimeShell\(targetRoute\)/);
  assert.match(boot, /DeclineButton/);
  assert.match(boot, /declineCurrentVersion\(\)/);
  assert.match(boot, /UI_LAYER = 1 << 25/);
  const home = read("assets/scripts/scenes/HomeScene.ts");
  assert.match(home, /route === "boot"/);
}

function main(): void {
  testRouteCoverage();
  testExpectedControls();
  testShellLifecycleAndSceneAttachment();
  testSceneCanvasContract();
  testRouterStaysInRuntimeShell();
  testBootEntryRouting();
  testGameplayBundleBoundary();
  testPreGameUiFoundation();
  console.log("Runtime Cocos shell OK: all routes, controllers, controls, lifecycle, and single-scene routing are wired.");
}

main();
