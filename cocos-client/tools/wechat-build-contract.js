const fs = require("fs");
const path = require("path");

const BOOT_SCENE_UUID = "2f311a88-dcfc-4838-938d-0ea546208a74";
const HOME_SCENE_UUID = "87946c61-a2ef-4735-9e40-9dbd2753bf88";
const EXPECTED_ORIENTATION = "portrait";
const MAIN_PACKAGE_LIMIT_BYTES = 4 * 1024 * 1024;
const SUBPACKAGE_TOTAL_LIMIT_BYTES = 30 * 1024 * 1024;
const REQUIRED_ASSET_BUNDLES = ["theme_default", "theme_island", "home_common", "mode_pk", "mode_spell"];
const REQUIRED_SUBPACKAGE_BUNDLES = ["home_common", "mode_pk", "mode_spell"];

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read JSON ${filePath}: ${error.message}`);
  }
}

function isInside(parent, target) {
  const relative = path.relative(path.resolve(parent), path.resolve(target));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function assertSafeBuildRoot(projectRoot, buildRoot) {
  const generatedRoot = path.join(projectRoot, "build");
  const legacyRoot = path.resolve(projectRoot, "..", "miniprogram");

  if (path.resolve(buildRoot) === path.resolve(generatedRoot) || !isInside(generatedRoot, buildRoot)) {
    throw new Error(`Build output must be a child of ${generatedRoot}`);
  }
  if (isInside(legacyRoot, buildRoot) || isInside(buildRoot, legacyRoot)) {
    throw new Error("Build output must not overlap the legacy miniprogram directory.");
  }
}

function loadBuildContract(projectRoot = path.resolve(__dirname, "..")) {
  const configPath = path.join(projectRoot, "tools", "wechat-build-config.json");
  const rootProjectConfigPath = path.resolve(projectRoot, "..", "project.config.json");
  const config = readJson(configPath);
  const rootProjectConfig = readJson(rootProjectConfigPath);
  const errors = [];

  if (config.platform !== "wechatgame") errors.push("platform must be wechatgame");
  if (config.taskName !== "wechatgame") errors.push("taskName must be wechatgame");
  if (config.buildPath !== "project://build") errors.push("buildPath must be project://build");
  if (config.outputName !== "wechatgame") errors.push("outputName must be wechatgame");
  if (config.startScene !== BOOT_SCENE_UUID) errors.push("Boot.scene must be the startScene");
  if (config.debug !== false) errors.push("release build must set debug=false");
  if (config.md5Cache !== true) errors.push("release build must set md5Cache=true");

  const sceneUuids = new Set((config.scenes || []).map((scene) => scene.uuid));
  if (!sceneUuids.has(BOOT_SCENE_UUID)) errors.push("scenes must include Boot.scene");
  if (!sceneUuids.has(HOME_SCENE_UUID)) errors.push("scenes must include Home.scene");

  const wechat = config.packages && config.packages.wechatgame;
  if (!wechat) {
    errors.push("packages.wechatgame is required");
  } else {
    if (wechat.appid !== rootProjectConfig.appid) errors.push("WeChat appid must match root project.config.json");
    if (wechat.orientation !== EXPECTED_ORIENTATION) errors.push(`orientation must be ${EXPECTED_ORIENTATION}`);
    if (wechat.buildOpenDataContextTemplate !== false) errors.push("open-data template must stay disabled");
    if (wechat.separateEngine !== false) errors.push("separate engine must stay disabled until device validation");
  }

  const buildRoot = path.resolve(projectRoot, "build", config.outputName || "");
  try {
    assertSafeBuildRoot(projectRoot, buildRoot);
  } catch (error) {
    errors.push(error.message);
  }

  if (errors.length) {
    throw new Error(`Invalid WeChat build contract:\n- ${errors.join("\n- ")}`);
  }

  return {
    appid: rootProjectConfig.appid,
    buildRoot,
    config,
    configPath,
    orientation: EXPECTED_ORIENTATION,
    projectRoot
  };
}

module.exports = {
  BOOT_SCENE_UUID,
  EXPECTED_ORIENTATION,
  HOME_SCENE_UUID,
  MAIN_PACKAGE_LIMIT_BYTES,
  REQUIRED_ASSET_BUNDLES,
  REQUIRED_SUBPACKAGE_BUNDLES,
  SUBPACKAGE_TOTAL_LIMIT_BYTES,
  assertSafeBuildRoot,
  isInside,
  loadBuildContract,
  readJson
};
