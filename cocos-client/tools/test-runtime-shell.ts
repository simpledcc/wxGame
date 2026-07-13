import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function testRouteCoverage(): void {
  const source = read("assets/scripts/components/ui/RuntimeScreenFactory.ts");
  const modePk = read("assets/bundles/mode_pk/scripts/ModePkScreenBuilder.ts");
  const modeSpell = read("assets/bundles/mode_spell/scripts/ModeSpellScreenBuilder.ts");
  const coreRouteBuilders: Record<string, string> = {
    bank: "buildBank",
    study: "buildStudy",
    coopSelect: "buildCoopSelect",
    room: "buildRoom",
    result: "buildResult",
    history: "buildHistory",
    feedback: "buildFeedback",
    help: "buildHelp",
    home: "buildHome"
  };
  Object.entries(coreRouteBuilders).forEach(([route, builder]) => {
    assert.equal(source.includes(`case "${route}":`), true, `route case missing: ${route}`);
    assert.match(source, new RegExp(`\\b${builder}\\(`));
  });
  ["pkGame", "coopShared", "coopSpell"].forEach((route) => {
    assert.equal(source.includes(`case "${route}":`), true, `gameplay route case missing: ${route}`);
  });
  assert.match(modePk, /register\("pkGame"/);
  assert.match(modePk, /register\("coopShared"/);
  assert.match(modeSpell, /register\("coopSpell"/);
  const allBuilders = `${source}\n${modePk}\n${modeSpell}`;
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
  assert.doesNotMatch(source, /PkGameScene|CoopSharedScene|CoopSpellScene|SpellLetterKey|PkWordTarget/);
  assert.match(source, /gameplayScreens\.build/);
}

function testExpectedControls(): void {
  const source = read("assets/scripts/components/ui/RuntimeScreenFactory.ts");
  const gameplay = [
    read("assets/bundles/mode_pk/scripts/ModePkScreenBuilder.ts"),
    read("assets/bundles/mode_spell/scripts/ModeSpellScreenBuilder.ts")
  ].join("\n");
  const visibleBuilders = `${source}\n${gameplay}`;
  [
    "赛前练习",
    "选择词库",
    "玩法目录",
    "加入房间",
    "双人PK",
    "双人合作",
    "换词库",
    "战绩记录",
    "问题反馈",
    "玩法说明",
    "创建房间",
    "加入",
    "准备 / 取消",
    "开始游戏",
    "使用道具",
    "提交",
    "跳过",
    "提交反馈",
    "隐私保护指引",
    "开启音效",
    "关闭",
    "机器人难度"
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
    "GameplayFeedbackPool",
    "addLowBot",
    "addMediumBot",
    "addHighBot"
  ].forEach((binding) => assert.match(visibleBuilders, new RegExp(`\\b${binding}\\b`)));

  const roomController = read("assets/scripts/scenes/RoomScene.ts");
  const explicitLeaves = roomController.match(/app\.roomSession\.leave\(\)/g) || [];
  assert.equal(explicitLeaves.length, 1, "RoomScene may leave only from the explicit back action");
  assert.match(roomController, /botDifficultyButtons/);
  ["createButton", "joinButton", "copyButton", "inviteButton", "refreshButton", "backButton"]
    .forEach((binding) => assert.match(roomController, new RegExp(`\\b${binding}\\b`)));
  assert.match(roomController, /setSessionControls/);
  assert.match(roomController, /getSpellTemplatesForBank/);
  assert.match(roomController, /app\.spellTemplateData/);
  assert.match(roomController, /roomSpellQuestions/);
  assert.match(roomController, /机器人 \$\{player\.nickName/);
  const homeController = read("assets/scripts/scenes/HomeScene.ts");
  assert.match(homeController, /openPrivacyContract/);
  assert.match(homeController, /refreshDisplay/);
  assert.match(homeController, /navigateOnce/);
  assert.match(homeController, /toggleMuted/);
  assert.match(homeController, /audio\.setMuted/);
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
  ["visualSlot", "setVisualAsset", "safeArea", "topBar", "card", "actionButton", "iconButton", "modal", "drawProgrammaticIcon", "drawProgrammaticLogo"]
    .forEach((method) => assert.match(source, new RegExp(`\\b${method}\\(`)));
  ["coin", "createRoom", "joinRoom", "practice", "wordBank", "catalog", "history", "settings", "privacy", "feedback"]
    .forEach((icon) => assert.match(source, new RegExp(`key === \\"${icon}\\"`)));
  assert.match(source, /DESIGN_WIDTH/);
  assert.match(source, /DESIGN_HEIGHT/);
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
