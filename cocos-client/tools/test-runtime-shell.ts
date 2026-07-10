import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function testRouteCoverage(): void {
  const source = read("assets/scripts/components/ui/RuntimeScreenFactory.ts");
  const routeBuilders: Record<string, string> = {
    bank: "buildBank",
    study: "buildStudy",
    coopSelect: "buildCoopSelect",
    room: "buildRoom",
    pkGame: "buildPk",
    coopShared: "buildShared",
    coopSpell: "buildSpell",
    result: "buildResult",
    history: "buildHistory",
    feedback: "buildFeedback",
    help: "buildHelp",
    home: "buildHome"
  };
  Object.entries(routeBuilders).forEach(([route, builder]) => {
    assert.equal(source.includes(`case "${route}":`), true, `route case missing: ${route}`);
    assert.match(source, new RegExp(`\\b${builder}\\(`));
  });
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
    assert.match(source, new RegExp(`addComponent\\(${controller}\\)`));
  });
}

function testExpectedControls(): void {
  const source = read("assets/scripts/components/ui/RuntimeScreenFactory.ts");
  [
    "开始背",
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
    "提交反馈"
  ].forEach((label) => assert.equal(source.includes(label), true, `runtime control missing: ${label}`));
  [
    "randomWord",
    "markCurrentUnfamiliar",
    "openPrivacyContract",
    "createWordTargets",
    "SpellLetterKey",
    "HistoryRecordItem",
    "nextDetailPage"
  ].forEach((binding) => assert.match(source, new RegExp(`\\b${binding}\\b`)));

  const roomController = read("assets/scripts/scenes/RoomScene.ts");
  const explicitLeaves = roomController.match(/app\.roomSession\.leave\(\)/g) || [];
  assert.equal(explicitLeaves.length, 1, "RoomScene may leave only from the explicit back action");
}

function testShellLifecycleAndSceneAttachment(): void {
  const shell = read("assets/scripts/components/HomePlaceholder.ts");
  assert.match(shell, /app\.store\.subscribe/);
  assert.match(shell, /this\.screens\.build/);
  assert.match(shell, /activeScreen\.destroy\(\)/);
  assert.match(shell, /loadSpriteFrame\("homeBackground"\)/);
  assert.match(shell, /backgroundSequence/);
  const homeScene = read("assets/scenes/Home.scene");
  const homePlaceholderMeta = JSON.parse(read("assets/scripts/components/HomePlaceholder.ts.meta"));
  assert.ok(homePlaceholderMeta.uuid);
  assert.equal(homeScene.includes("HomePlaceholder"), false, "Cocos scene stores compressed component IDs");
  assert.match(homeScene, /"titleLabel"/);
  assert.match(homeScene, /"bodyLabel"/);
  const ui = read("assets/scripts/components/ui/RuntimeUi.ts");
  assert.match(ui, /DESIGN_WIDTH = 960/);
  assert.match(ui, /DESIGN_HEIGHT = 640/);
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
  const home = read("assets/scripts/scenes/HomeScene.ts");
  assert.match(home, /route === "boot"/);
}

function main(): void {
  testRouteCoverage();
  testExpectedControls();
  testShellLifecycleAndSceneAttachment();
  testRouterStaysInRuntimeShell();
  testBootEntryRouting();
  console.log("Runtime Cocos shell OK: all routes, controllers, controls, lifecycle, and single-scene routing are wired.");
}

main();
