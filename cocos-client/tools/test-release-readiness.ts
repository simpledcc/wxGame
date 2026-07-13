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
const creatorImportMetaAllowlist = new Set([
  "assets/bundles/theme_default/theme.json",
  "assets/bundles/theme_default/textures/gameplay-bg.jpg",
  "assets/bundles/theme_island/theme.json",
  "assets/bundles/theme_island/textures/gameplay-bg.jpg"
]);

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

function listDirectories(directory: string): string[] {
  const result: string[] = [];
  const visit = (current: string): void => {
    fs.readdirSync(current, { withFileTypes: true }).forEach((entry) => {
      if (!entry.isDirectory()) return;
      const fullPath = path.join(current, entry.name);
      result.push(fullPath);
      visit(fullPath);
    });
  };
  visit(directory);
  return result;
}

function relativeAssetPath(filePath: string): string {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function collectUuids(value: unknown, output: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectUuids(item, output));
    return;
  }
  if (!value || typeof value !== "object") return;
  const source = value as Record<string, unknown>;
  if (typeof source.uuid === "string" && source.uuid) output.push(source.uuid);
  Object.values(source).forEach((item) => collectUuids(item, output));
}

function collectSceneReferences(value: unknown, output: number[]): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSceneReferences(item, output));
    return;
  }
  if (!value || typeof value !== "object") return;
  const source = value as Record<string, unknown>;
  if (Number.isInteger(source.__id__)) output.push(Number(source.__id__));
  Object.values(source).forEach((item) => collectSceneReferences(item, output));
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
  const coreControllers = [
    "BootScene",
    "HomeScene",
    "BankScene",
    "StudyScene",
    "CoopSelectScene",
    "RoomScene",
    "ResultScene",
    "HistoryScene",
    "FeedbackScene",
    "HelpScene"
  ];
  coreControllers.forEach((name) => {
    const sourcePath = `assets/scripts/scenes/${name}.ts`;
    assert.equal(fs.existsSync(path.join(root, sourcePath)), true, `${name} controller is required`);
    assert.equal(fs.existsSync(path.join(root, `${sourcePath}.meta`)), true, `${name} meta is required`);
  });
  [
    "assets/bundles/mode_pk/scripts/PkGameScene.ts",
    "assets/bundles/mode_pk/scripts/CoopSharedScene.ts",
    "assets/bundles/mode_spell/scripts/CoopSpellScene.ts"
  ].forEach((sourcePath) => {
    assert.equal(fs.existsSync(path.join(root, sourcePath)), true, `${sourcePath} is required`);
    assert.equal(fs.existsSync(path.join(root, `${sourcePath}.meta`)), true, `${sourcePath}.meta is required`);
  });
  const home = read("assets/scripts/scenes/HomeScene.ts");
  ["openStudy", "openPkRoom", "openJoinRoom", "openBankPicker", "openHistory", "openFeedback", "openHelp", "openPrivacyContract", "toggleMuted"]
    .forEach((handler) => assert.match(home, new RegExp(`\\b${handler}\\b`)));
  assert.doesNotMatch(home, /EditBox|playerName|nickNameInput/);
  assert.match(home, /playerStore\.getLocalPlayer\(\)\.displayName/);
  assert.match(home, /wordBankStore\.getWordCoins\(\)/);
  const boot = read("assets/scripts/scenes/BootScene.ts");
  assert.match(boot, /暂不进入/);
  assert.match(boot, /declineCurrentVersion/);
  assert.match(boot, /UI_LAYER/);
  const room = read("assets/scripts/scenes/RoomScene.ts");
  assert.match(room, /roomCodeInput/);
  assert.match(room, /addLowBot/);
  assert.match(room, /addMediumBot/);
  assert.match(room, /addHighBot/);
  assert.match(room, /botDifficultyButtons/);
  assert.match(room, /setSessionControls/);
  assert.match(room, /getSpellTemplatesForBank/);
  assert.match(room, /roomSpellQuestions/);
  assert.match(room, /backButton\.interactable = !busy/);
  assert.doesNotMatch(room, /playerNameInput|nickNameInput/);
  const shell = read("assets/scripts/components/HomePlaceholder.ts");
  assert.match(shell, /gameplayBundles\.prepare/);
  assert.match(shell, /themes\.preloadAssets/);
  assert.match(shell, /RouteLoading/);
  assert.match(shell, /addComponent\(BlockInputEvents\)/);
  const themeManager = read("assets/scripts/themes/ThemeManager.ts");
  assert.match(themeManager, /preloadAssets/);
  assert.match(themeManager, /资源加载失败，已回退草地主题/);
}

function testComplianceSurface(): void {
  const visibleRoots = [
    path.join(root, "assets", "scripts", "scenes"),
    path.join(root, "assets", "scripts", "components"),
    path.join(root, "assets", "scripts", "themes"),
    path.join(root, "assets", "bundles", "mode_pk", "scripts"),
    path.join(root, "assets", "bundles", "mode_spell", "scripts"),
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
  const scriptFiles = listFiles(path.join(root, "assets"), new Set([".ts"]));
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

function testAssetMetadataAndSceneReferences(): void {
  const assetsRoot = path.join(root, "assets");
  const metaFiles = listFiles(assetsRoot, new Set([".meta"]));
  assert.ok(metaFiles.length >= 108, "committed Cocos asset metadata unexpectedly disappeared");
  const uuidOwners = new Map<string, string>();
  metaFiles.forEach((metaPath) => {
    const parsed = JSON.parse(fs.readFileSync(metaPath, "utf8")) as unknown;
    const uuids: string[] = [];
    collectUuids(parsed, uuids);
    assert.ok(uuids.length > 0, `${relativeAssetPath(metaPath)} has no UUID`);
    uuids.forEach((uuid) => {
      assert.equal(uuidOwners.has(uuid), false, `duplicate Cocos UUID ${uuid} in ${relativeAssetPath(metaPath)}`);
      uuidOwners.set(uuid, relativeAssetPath(metaPath));
    });
  });

  listDirectories(assetsRoot).forEach((directory) => {
    assert.equal(fs.existsSync(`${directory}.meta`), true, `${relativeAssetPath(directory)} has no directory meta`);
  });

  const sourceFiles = listFiles(assetsRoot, new Set([
    ".ts", ".json", ".scene", ".jpg", ".png", ".wav", ".md"
  ]));
  sourceFiles.forEach((sourcePath) => {
    if (fs.existsSync(`${sourcePath}.meta`)) return;
    const relativePath = relativeAssetPath(sourcePath);
    assert.equal(
      creatorImportMetaAllowlist.has(relativePath),
      true,
      `${relativePath} is missing Cocos importer metadata`
    );
  });
  creatorImportMetaAllowlist.forEach((relativePath) => {
    assert.equal(fs.existsSync(path.join(root, relativePath)), true, `${relativePath} allowlist entry is stale`);
  });

  ["Boot", "Home"].forEach((sceneName) => {
    const items = JSON.parse(read(`assets/scenes/${sceneName}.scene`)) as unknown[];
    assert.ok(Array.isArray(items) && items.length > 0, `${sceneName}.scene must contain serialized objects`);
    const references: number[] = [];
    collectSceneReferences(items, references);
    references.forEach((reference) => {
      assert.ok(
        reference >= 0 && reference < items.length,
        `${sceneName}.scene has out-of-range __id__ ${reference}/${items.length}`
      );
    });
  });
}

function testSourceAssetBudget(): void {
  const payloadFiles = listFiles(path.join(root, "assets"), new Set([
    ".ts", ".json", ".scene", ".jpg", ".png", ".wav"
  ]));
  const normalizedTextExtensions = new Set([".ts", ".json", ".scene"]);
  const payloadBytes = payloadFiles.reduce((sum, filePath) => {
    if (!normalizedTextExtensions.has(path.extname(filePath).toLowerCase())) {
      return sum + fs.statSync(filePath).size;
    }
    const normalized = fs.readFileSync(filePath, "utf8").replace(/\r\n?/g, "\n");
    return sum + Buffer.byteLength(normalized, "utf8");
  }, 0);
  const metadataBytes = listFiles(path.join(root, "assets"), new Set([".meta"]))
    .reduce((sum, filePath) => sum + fs.statSync(filePath).size, 0);
  const themeFiles = listFiles(path.join(root, "assets", "bundles"), new Set([
    ".json", ".meta", ".jpg", ".png"
  ]));
  const themeBytes = themeFiles.reduce((sum, filePath) => sum + fs.statSync(filePath).size, 0);
  assert.ok(payloadBytes < 1_500_000, `Cocos source payload exceeds 1.5 MB: ${payloadBytes}`);
  assert.ok(metadataBytes < 50_000, `Cocos source metadata exceeds 50 KB: ${metadataBytes}`);
  assert.ok(themeBytes < 250_000, `theme source assets exceed 250 KB: ${themeBytes}`);
}

function testHomeAssetHandoff(): void {
  const manifest = fs.readFileSync(path.resolve(root, "../COCOS_HOME_ASSET_MANIFEST.md"), "utf8");
  [
    "background", "logo", "avatar", "coin", "character", "createRoom", "joinRoom", "practice",
    "wordBank", "catalog", "history", "settings", "privacy", "feedback"
  ].forEach((key) => assert.ok(manifest.includes(`\`${key}\``), `Home asset manifest omits ${key}`));
  assert.match(manifest, /do not copy it, crop it, or place it under `cocos-client\/assets\/`/);
}

function main(): void {
  testFeedbackRules();
  testSceneCoverage();
  testComplianceSurface();
  testPlatformBoundariesAndUploadRoot();
  testAssetMetadataAndSceneReferences();
  testSourceAssetBudget();
  testHomeAssetHandoff();
  console.log("Release static QA OK: scenes, metadata UUIDs/references, compliance, adapter isolation, and source budgets.");
}

main();
