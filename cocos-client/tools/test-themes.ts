import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getThemeManifest,
  parseThemeColor,
  THEME_MANIFESTS
} from "../assets/scripts/themes/ThemeCatalog";
import { ThemeManager } from "../assets/scripts/themes/ThemeManager";
import { getRouteBackgroundAssetKey } from "../assets/scripts/themes/ThemeRouteRules";
import type { ThemeBundlePort, ThemeId } from "../assets/scripts/themes/ThemeTypes";

const root = path.resolve(__dirname, "..");

class FakeThemeBundlePort implements ThemeBundlePort<string> {
  readonly loads: string[] = [];
  readonly assetLoads: string[] = [];
  readonly failures = new Set<string>();
  readonly assetFailures = new Set<string>();
  private readonly deferred = new Map<string, {
    promise: Promise<void>;
    resolve: () => void;
    reject: (error: Error) => void;
  }>();

  loadBundle = (bundleName: string): Promise<void> => {
    this.loads.push(bundleName);
    if (this.failures.has(bundleName)) return Promise.reject(new Error(`${bundleName} unavailable`));
    return this.deferred.get(bundleName)?.promise || Promise.resolve();
  };

  loadSpriteFrame = (bundleName: string, assetPath: string): Promise<string> => {
    const key = `${bundleName}:${assetPath}`;
    this.assetLoads.push(key);
    if (this.assetFailures.has(key)) return Promise.reject(new Error(`${key} unavailable`));
    return Promise.resolve(key);
  };

  defer(bundleName: string): void {
    let resolve = () => undefined;
    let reject = (_error: Error) => undefined;
    const promise = new Promise<void>((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });
    this.deferred.set(bundleName, { promise, resolve, reject });
  }

  resolve(bundleName: string): void {
    this.deferred.get(bundleName)?.resolve();
  }
}

function getJpegDimensions(filePath: string): { width: number; height: number } {
  const data = fs.readFileSync(filePath);
  assert.equal(data[0], 0xff);
  assert.equal(data[1], 0xd8);
  let offset = 2;
  while (offset + 8 < data.length) {
    if (data[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = data[offset + 1];
    const length = data.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return {
        height: data.readUInt16BE(offset + 5),
        width: data.readUInt16BE(offset + 7)
      };
    }
    offset += 2 + length;
  }
  throw new Error(`JPEG dimensions not found: ${filePath}`);
}

function testThemeManifestsAndBudget(): void {
  let totalBytes = 0;
  (["default", "island"] as ThemeId[]).forEach((themeId) => {
    const manifest = getThemeManifest(themeId);
    const bundlePath = path.join(root, "assets", "bundles", manifest.bundleName);
    const jsonPath = path.join(bundlePath, "theme.json");
    const diskManifest = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    assert.deepEqual(diskManifest, THEME_MANIFESTS[themeId]);
    Object.values(manifest.colors).forEach((value) => {
      assert.match(value, /^#[0-9A-F]{6}([0-9A-F]{2})?$/);
      assert.equal(parseThemeColor(value).length, 4);
    });
    Object.values(manifest.assets).forEach((assetPath) => {
      const sourcePath = path.join(bundlePath, `${assetPath.replace(/\/spriteFrame$/, "")}.jpg`);
      assert.equal(fs.existsSync(sourcePath), true, `${assetPath} must resolve in ${manifest.bundleName}`);
      const bytes = fs.statSync(sourcePath).size;
      assert.equal(bytes, manifest.sourceBytes);
      assert.ok(bytes <= 150_000, `${manifest.bundleName} background exceeds 150 KB`);
      assert.deepEqual(getJpegDimensions(sourcePath), { width: 960, height: 640 });
      totalBytes += bytes;
    });
    const meta = JSON.parse(fs.readFileSync(`${bundlePath}.meta`, "utf8"));
    assert.equal(meta.userData.isBundle, true);
    assert.equal(meta.userData.bundleName, manifest.bundleName);
  });
  // Three semantic background keys intentionally reuse one compressed image per bundle.
  assert.ok(totalBytes / 3 <= 250_000, "unique theme background payload must stay below 250 KB");
}

function testRouteAssets(): void {
  assert.equal(getRouteBackgroundAssetKey("home"), "homeBackground");
  assert.equal(getRouteBackgroundAssetKey("room"), "homeBackground");
  assert.equal(getRouteBackgroundAssetKey("pkGame"), "gameplayBackground");
  assert.equal(getRouteBackgroundAssetKey("coopShared"), "gameplayBackground");
  assert.equal(getRouteBackgroundAssetKey("coopSpell"), "spellBackground");
}

async function testThemeSelectionAndFallback(): Promise<void> {
  const port = new FakeThemeBundlePort();
  const manager = new ThemeManager(port);
  await manager.initialize();
  assert.equal(manager.getState().currentId, "default");
  assert.deepEqual(port.loads, ["theme_default"]);

  const island = await manager.select("island");
  assert.equal(island.id, "island");
  assert.equal(manager.getState().fallbackUsed, false);
  assert.equal(manager.resolveAsset("gameplayBackground").bundleName, "theme_island");
  assert.equal(
    await manager.loadSpriteFrame("gameplayBackground"),
    "theme_island:textures/gameplay-bg/spriteFrame"
  );
  assert.equal(port.loads.filter((name) => name === "theme_island").length, 1);

  const fallbackPort = new FakeThemeBundlePort();
  fallbackPort.failures.add("theme_island");
  const fallbackManager = new ThemeManager(fallbackPort);
  await fallbackManager.initialize();
  const fallback = await fallbackManager.select("island");
  assert.equal(fallback.id, "default");
  assert.equal(fallbackManager.getState().fallbackUsed, true);
  assert.match(fallbackManager.getState().error, /已回退草地主题/);
  assert.equal(fallbackPort.loads.filter((name) => name === "theme_default").length, 1);
}

async function testLatestSelectionWins(): Promise<void> {
  const port = new FakeThemeBundlePort();
  port.defer("theme_island");
  const manager = new ThemeManager(port);
  await manager.initialize();
  const islandSelection = manager.select("island");
  const defaultSelection = manager.select("default");
  await defaultSelection;
  port.resolve("theme_island");
  await islandSelection;
  assert.equal(manager.getState().currentId, "default");
  assert.equal(manager.getState().requestedId, "default");
  assert.equal(manager.getState().loading, false);
}

async function testAssetLoadDeduplication(): Promise<void> {
  const port = new FakeThemeBundlePort();
  const manager = new ThemeManager(port);
  await manager.initialize();
  const frames = await Promise.all([
    manager.loadSpriteFrame("homeBackground"),
    manager.loadSpriteFrame("homeBackground")
  ]);
  assert.deepEqual(frames, [
    "theme_default:textures/gameplay-bg/spriteFrame",
    "theme_default:textures/gameplay-bg/spriteFrame"
  ]);
  assert.equal(port.assetLoads.length, 1, "concurrent semantic asset loads must share one request");
  await manager.preloadAssets(["homeBackground", "gameplayBackground", "spellBackground"]);
  assert.equal(port.assetLoads.length, 1, "semantic aliases resolving to one asset must reuse the cache");
}

async function testAssetLevelFallback(): Promise<void> {
  const port = new FakeThemeBundlePort();
  const manager = new ThemeManager(port);
  await manager.initialize();
  await manager.select("island");
  port.assetFailures.add("theme_island:textures/gameplay-bg/spriteFrame");
  const frame = await manager.loadSpriteFrame("gameplayBackground");
  assert.equal(frame, "theme_default:textures/gameplay-bg/spriteFrame");
  assert.equal(manager.getState().currentId, "default");
  assert.equal(manager.getState().requestedId, "island");
  assert.equal(manager.getState().fallbackUsed, true);
  assert.match(manager.getState().error, /资源加载失败，已回退草地主题/);
  assert.deepEqual(port.assetLoads, [
    "theme_island:textures/gameplay-bg/spriteFrame",
    "theme_default:textures/gameplay-bg/spriteFrame"
  ]);

  const defaultPort = new FakeThemeBundlePort();
  const defaultManager = new ThemeManager(defaultPort);
  await defaultManager.initialize();
  defaultPort.assetFailures.add("theme_default:textures/gameplay-bg/spriteFrame");
  await assert.rejects(() => defaultManager.preloadAssets(["homeBackground"]));
  assert.equal(defaultManager.getState().currentId, "default");
  assert.equal(defaultManager.getState().fallbackUsed, true);
  assert.match(defaultManager.getState().error, /默认主题资源加载失败/);
}

async function main(): Promise<void> {
  testThemeManifestsAndBudget();
  testRouteAssets();
  await testThemeSelectionAndFallback();
  await testLatestSelectionWins();
  await testAssetLoadDeduplication();
  await testAssetLevelFallback();
  console.log("Phase 8 themes OK: route preloads, compact bundles, request deduplication, switching, race safety, and bundle/asset fallback.");
}

void main();
