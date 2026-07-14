const fs = require("fs");
const path = require("path");

const DEFAULT_BUNDLES = ["home_common", "mode_pk", "mode_spell"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function assertInside(root, candidate) {
  const rootPath = path.resolve(root);
  const candidatePath = path.resolve(candidate);
  const prefix = `${rootPath}${path.sep}`;
  if (candidatePath !== rootPath && !candidatePath.startsWith(prefix)) {
    throw new Error(`Unsafe WeChat package path: ${candidatePath}`);
  }
  return candidatePath;
}

function findSettingsFile(buildRoot) {
  const sourceRoot = assertInside(buildRoot, path.join(buildRoot, "src"));
  const files = fs.readdirSync(sourceRoot)
    .filter((fileName) => /^settings\.[^./]+\.json$/.test(fileName));
  if (files.length !== 1) {
    throw new Error(`Expected one Cocos settings file, found ${files.length}.`);
  }
  return path.join(sourceRoot, files[0]);
}

function ensureGameSubpackages(gameJsonPath, bundleNames) {
  const gameJson = readJson(gameJsonPath);
  const subpackages = Array.isArray(gameJson.subpackages) ? gameJson.subpackages : [];
  const names = new Set(subpackages.map((item) => item && item.name));
  for (const bundleName of bundleNames) {
    if (!names.has(bundleName)) {
      subpackages.push({
        name: bundleName,
        root: `subpackages/${bundleName}/`
      });
    }
  }
  gameJson.subpackages = subpackages;
  writeJson(gameJsonPath, gameJson);
}

function ensureSettingsSubpackages(settingsPath, bundleNames) {
  const settings = readJson(settingsPath);
  settings.assets = settings.assets || {};
  const subpackages = Array.isArray(settings.assets.subpackages)
    ? settings.assets.subpackages
    : [];
  for (const bundleName of bundleNames) {
    if (!subpackages.includes(bundleName)) {
      subpackages.push(bundleName);
    }
  }
  settings.assets.subpackages = subpackages;
  writeJson(settingsPath, settings);
}

function moveBundle(buildRoot, bundleName) {
  const assetPath = assertInside(buildRoot, path.join(buildRoot, "assets", bundleName));
  const subpackagePath = assertInside(buildRoot, path.join(buildRoot, "subpackages", bundleName));
  if (!fs.existsSync(assetPath)) {
    throw new Error(`Cocos did not generate required Asset Bundle: ${bundleName}`);
  }
  if (fs.existsSync(subpackagePath)) {
    throw new Error(`Target subpackage already exists before normalization: ${bundleName}`);
  }
  fs.mkdirSync(path.dirname(subpackagePath), { recursive: true });
  fs.renameSync(assetPath, subpackagePath);
}

function ensureSubpackageGameScript(buildRoot, bundleName) {
  const subpackagePath = assertInside(buildRoot, path.join(buildRoot, "subpackages", bundleName));
  const files = fs.readdirSync(subpackagePath)
    .filter((fileName) => /^index\.[^./]+\.js$/.test(fileName));
  if (files.length !== 1) {
    throw new Error(`Expected one generated Bundle entry script for ${bundleName}, found ${files.length}.`);
  }
  fs.copyFileSync(path.join(subpackagePath, files[0]), path.join(subpackagePath, "game.js"));
}

function normalizeWechatSubpackages(buildRoot, bundleNames = DEFAULT_BUNDLES) {
  const resolvedRoot = path.resolve(buildRoot);
  const names = [...new Set(bundleNames)];
  if (!fs.existsSync(resolvedRoot)) {
    throw new Error(`WeChat build output does not exist: ${resolvedRoot}`);
  }
  for (const bundleName of names) {
    if (!/^[a-z][a-z0-9_-]*$/.test(bundleName)) {
      throw new Error(`Invalid subpackage bundle name: ${bundleName}`);
    }
    moveBundle(resolvedRoot, bundleName);
    ensureSubpackageGameScript(resolvedRoot, bundleName);
  }
  ensureGameSubpackages(path.join(resolvedRoot, "game.json"), names);
  ensureSettingsSubpackages(findSettingsFile(resolvedRoot), names);
  return {
    buildRoot: resolvedRoot,
    subpackages: names.map((name) => path.join("subpackages", name))
  };
}

if (require.main === module) {
  const buildRoot = process.argv[2];
  if (!buildRoot) {
    throw new Error("Usage: node normalize-wechat-subpackages.js <build-root>");
  }
  console.log(JSON.stringify(normalizeWechatSubpackages(buildRoot), null, 2));
}

module.exports = { normalizeWechatSubpackages };
