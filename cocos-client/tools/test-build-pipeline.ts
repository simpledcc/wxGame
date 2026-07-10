import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const { inspectWechatBuild } = require("./inspect-wechat-build");
const { loadBuildContract } = require("./wechat-build-contract");
const { runBuild } = require("./run-wechat-build");

const projectRoot = path.resolve(__dirname, "..");
const contract = loadBuildContract(projectRoot);

assert.equal(contract.config.platform, "wechatgame");
assert.equal(contract.config.taskName, "wechatgame");
assert.equal(contract.config.startScene, "2f311a88-dcfc-4838-938d-0ea546208a74");
assert.equal(contract.config.packages.wechatgame.appid, contract.appid);
assert.equal(contract.config.packages.wechatgame.orientation, "landscape");
assert.equal(runBuild({ projectRoot, dryRun: true }), null);

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "wechat-build-inspection-"));

function writeJson(relativePath: string, value: unknown): void {
  const target = path.join(fixture, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function inspect(overrides: Record<string, unknown> = {}) {
  return inspectWechatBuild(fixture, {
    allowExternalBuildRoot: true,
    expectedAppid: contract.appid,
    expectedOrientation: contract.orientation,
    ...overrides
  });
}

try {
  fs.writeFileSync(path.join(fixture, "game.js"), "require('./src/application.js');\n", "utf8");
  writeJson("game.json", {
    deviceOrientation: "landscape",
    subpackages: [{ name: "theme_island", root: "subpackages/theme_island" }]
  });
  writeJson("project.config.json", {
    appid: contract.appid,
    compileType: "game",
    setting: { uploadWithSourceMap: false }
  });
  fs.mkdirSync(path.join(fixture, "src"), { recursive: true });
  fs.writeFileSync(path.join(fixture, "src", "application.js"), "console.log('fixture');\n", "utf8");
  writeJson("assets/theme_default/config.12345.json", {});
  writeJson("subpackages/theme_island/config.67890.json", {});

  const report = inspect();
  assert.equal(report.subpackages.length, 1);
  assert.equal(report.subpackages[0].fileCount, 1);
  assert.equal(report.fileCount, 6);
  assert.ok(report.mainPackage.bytes < report.totalBytes);
  assert.deepEqual(report.assetBundles.map((bundle: { name: string; packageType: string }) => ({
    name: bundle.name,
    packageType: bundle.packageType
  })), [
    { name: "theme_default", packageType: "main" },
    { name: "theme_island", packageType: "subpackage" }
  ]);
  assert.equal(report.subpackageTotal.bytes, report.subpackages[0].bytes);

  assert.throws(() => inspect({ mainPackageLimitBytes: 1 }), /Main package is/);
  assert.throws(() => inspect({ subpackageTotalLimitBytes: 1 }), /Subpackages total is/);

  fs.rmSync(path.join(fixture, "assets", "theme_default"), { recursive: true });
  assert.throws(() => inspect(), /Missing required Asset Bundle.*theme_default/);
  writeJson("assets/theme_default/config.12345.json", {});

  writeJson("game.json", { deviceOrientation: "landscape", subpackages: [] });
  assert.throws(() => inspect(), /Asset Bundle subpackage is not declared.*theme_island/);

  writeJson("game.json", {
    deviceOrientation: "landscape",
    subpackages: [{ name: "invalid", root: "../outside" }]
  });
  assert.throws(() => inspect(), /Invalid subpackage root/);
  writeJson("game.json", {
    deviceOrientation: "landscape",
    subpackages: [{ name: "theme_island", root: "subpackages/theme_island" }]
  });

  writeJson("game.json", {
    deviceOrientation: "landscape",
    subpackages: [
      { name: "theme_island", root: "subpackages/theme_island" },
      { name: "empty", root: "subpackages/empty" }
    ]
  });
  assert.throws(() => inspect(), /Declared subpackage has no generated files/);
  writeJson("game.json", {
    deviceOrientation: "landscape",
    subpackages: [{ name: "theme_island", root: "subpackages/theme_island" }]
  });

  writeJson("project.config.json", {
    appid: contract.appid,
    compileType: "game",
    setting: { uploadWithSourceMap: true }
  });
  assert.throws(() => inspect(), /enables source-map upload/);
  writeJson("project.config.json", {
    appid: contract.appid,
    compileType: "game",
    setting: { uploadWithSourceMap: false }
  });

  fs.writeFileSync(path.join(fixture, "debug.map"), "{}", "utf8");
  assert.throws(() => inspect(), /contains source maps/);
  fs.rmSync(path.join(fixture, "debug.map"));

  fs.mkdirSync(path.join(fixture, "cloudfunctions"), { recursive: true });
  fs.writeFileSync(path.join(fixture, "cloudfunctions", "index.js"), "", "utf8");
  assert.throws(() => inspect(), /contains forbidden paths/);
  fs.rmSync(path.join(fixture, "cloudfunctions"), { recursive: true });

  fs.rmSync(path.join(fixture, "game.js"));
  assert.throws(() => inspect(), /Missing required WeChat build file: game.js/);
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

console.log("WeChat build pipeline checks passed.");
