import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  FEEDBACK_CONTACT_MAX_LENGTH,
  FEEDBACK_MAX_LENGTH,
  getFeedbackValidationError,
  normalizeFeedbackDraft
} from "../assets/scripts/domain/FeedbackRules";

const root = path.resolve(__dirname, "..");
const repositoryRoot = path.resolve(root, "..");

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function listFiles(directory: string, extensions: Set<string>): string[] {
  const result: string[] = [];
  const visit = (current: string): void => {
    fs.readdirSync(current, { withFileTypes: true }).forEach((entry) => {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (extensions.has(path.extname(entry.name))) result.push(fullPath);
    });
  };
  visit(directory);
  return result;
}

function testFeedbackRules(): void {
  const empty = normalizeFeedbackDraft("  a  ", "  123  ");
  assert.equal(getFeedbackValidationError(empty), "反馈内容太短，请多写一点");
  const normalized = normalizeFeedbackDraft(" x".repeat(400), "1".repeat(120));
  assert.equal(normalized.content.length, FEEDBACK_MAX_LENGTH);
  assert.equal(normalized.contact.length, FEEDBACK_CONTACT_MAX_LENGTH);
  assert.equal(getFeedbackValidationError(normalized), "");
}

function testSceneCoverage(): void {
  const controllers = [
    "BootScene",
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
  ];
  controllers.forEach((name) => {
    const sourcePath = `assets/scripts/scenes/${name}.ts`;
    assert.equal(fs.existsSync(path.join(root, sourcePath)), true, `${name} controller is required`);
    assert.equal(fs.existsSync(path.join(root, `${sourcePath}.meta`)), true, `${name} meta is required`);
  });
  const home = read("assets/scripts/scenes/HomeScene.ts");
  ["openStudy", "openPkRoom", "openCoopSelect", "openBankPicker", "openHistory", "openFeedback", "openHelp"]
    .forEach((handler) => assert.match(home, new RegExp(`\\b${handler}\\b`)));
  assert.doesNotMatch(home, /EditBox|playerName|nickNameInput/);
  const room = read("assets/scripts/scenes/RoomScene.ts");
  assert.match(room, /roomCodeInput/);
  assert.doesNotMatch(room, /playerNameInput|nickNameInput/);
}

function testComplianceSurface(): void {
  const visibleRoots = [
    path.join(root, "assets", "scripts", "scenes"),
    path.join(root, "assets", "scripts", "components"),
    path.join(root, "assets", "scripts", "themes"),
    path.join(root, "assets", "scenes")
  ];
  const visibleSource = visibleRoots
    .flatMap((directory) => listFiles(directory, new Set([".ts", ".json", ".scene"])))
    .map((filePath) => fs.readFileSync(filePath, "utf8"))
    .join("\n");
  ["充值", "虚拟支付", "会员", "VIP", "红包", "聊天室", "签名", "留言"]
    .forEach((term) => assert.equal(visibleSource.includes(term), false, `visible surface contains ${term}`));
  ["首页占位", "迁移进行中", "迁移骨架", "未实现"]
    .forEach((term) => assert.equal(visibleSource.includes(term), false, `visible placeholder contains ${term}`));

  const feedback = read("assets/scripts/scenes/FeedbackScene.ts");
  assert.match(feedback, /app\.feedback\.submit/);
  assert.match(feedback, /privacy\.contractName/);
  const roomRules = read("assets/scripts/domain/RoomRules.ts");
  assert.match(roomRules, /`玩家\$\{index \+ 1\}`/);
  const storage = read("assets/scripts/services/StorageService.ts");
  assert.match(storage, /clearLegacyPlayerName/);
  const databaseRules = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "database.rules.json"), "utf8"));
  assert.equal(databaseRules.write, false);
}

function testPlatformBoundariesAndUploadRoot(): void {
  const scriptFiles = listFiles(path.join(root, "assets", "scripts"), new Set([".ts"]));
  const directWxUsers = scriptFiles
    .filter((filePath) => /\bwx\./.test(fs.readFileSync(filePath, "utf8")))
    .map((filePath) => path.relative(root, filePath).replace(/\\/g, "/"));
  assert.deepEqual(directWxUsers, ["assets/scripts/adapters/WechatRuntimePort.ts"]);
  const projectConfig = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "project.config.json"), "utf8"));
  assert.equal(projectConfig.miniprogramRoot, "miniprogram/");
  assert.equal(projectConfig.cloudfunctionRoot, "cloudfunctions/");
  assert.equal(projectConfig.setting.uploadWithSourceMap, false);

  const appSource = read("assets/scripts/core/App.ts");
  assert.doesNotMatch(appSource, /cloud\.call\(["']getOpenId["']/, "boot must not request identity");
  assert.match(appSource, /new LifecycleService/);
  const lifecycleSource = read("assets/scripts/services/LifecycleService.ts");
  assert.match(lifecycleSource, /getLaunchOptions\(\)/);
  assert.match(lifecycleSource, /onAppShow/);
  assert.match(lifecycleSource, /onAppHide/);
  assert.match(lifecycleSource, /polling\.stop\(\)/);
  assert.match(lifecycleSource, /roomSession\.join\(roomCode\)/);
}

function testSourceAssetBudget(): void {
  const files = listFiles(path.join(root, "assets"), new Set([
    ".ts", ".json", ".scene", ".meta", ".jpg", ".png", ".wav", ".md"
  ]));
  const totalBytes = files.reduce((sum, filePath) => sum + fs.statSync(filePath).size, 0);
  const themeFiles = listFiles(path.join(root, "assets", "bundles"), new Set([
    ".json", ".meta", ".jpg", ".png"
  ]));
  const themeBytes = themeFiles.reduce((sum, filePath) => sum + fs.statSync(filePath).size, 0);
  assert.ok(totalBytes < 1_500_000, `Cocos source assets exceed 1.5 MB: ${totalBytes}`);
  assert.ok(themeBytes < 250_000, `theme source assets exceed 250 KB: ${themeBytes}`);
}

function main(): void {
  testFeedbackRules();
  testSceneCoverage();
  testComplianceSurface();
  testPlatformBoundariesAndUploadRoot();
  testSourceAssetBudget();
  console.log("Release static QA OK: scene coverage, private feedback, no public UGC/commercial copy, adapter isolation, and source budgets.");
}

main();
