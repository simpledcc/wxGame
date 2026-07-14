const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SOURCE_ROOT = path.join(PROJECT_ROOT, "art-source", "home-v1", "optimized", "textures");
const BUNDLE_ROOT = path.join(PROJECT_ROOT, "assets", "bundles", "home_common");
const EXPECTED_FILES = [
  "logo.png",
  "backgrounds/learning-garden.jpg",
  "buttons/primary-blue.png",
  "buttons/primary-green.png",
  "buttons/primary-orange.png",
  "buttons/primary-purple.png",
  "icons/avatar.png",
  "icons/catalog.png",
  "icons/character.png",
  "icons/coin.png",
  "icons/create-room.png",
  "icons/feedback.png",
  "icons/history.png",
  "icons/join-room.png",
  "icons/practice.png",
  "icons/privacy.png",
  "icons/settings.png",
  "icons/word-bank.png"
];
const EXPECTED_DIRECTORIES = ["textures", "textures/backgrounds", "textures/buttons", "textures/icons"];

function normalize(relativePath) {
  return relativePath.replace(/\\/g, "/");
}

function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  const result = [];
  const visit = (directory) => {
    fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolutePath);
      else result.push(normalize(path.relative(root, absolutePath)));
    });
  };
  visit(root);
  return result.sort();
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function assertSourceComplete(sourceRoot = SOURCE_ROOT) {
  const actual = listFiles(sourceRoot);
  const expected = [...EXPECTED_FILES].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Home art source set differs from the 18-file contract.\nExpected: ${expected.join(", ")}\nActual: ${actual.join(", ")}`);
  }
}

function assertCopiesMatch(sourceRoot, targetRoot) {
  EXPECTED_FILES.forEach((relativePath) => {
    const sourcePath = path.join(sourceRoot, relativePath);
    const targetPath = path.join(targetRoot, relativePath);
    if (!fs.existsSync(targetPath)) throw new Error(`Imported image is missing: ${relativePath}`);
    if (sha256(sourcePath) !== sha256(targetPath)) {
      throw new Error(`Imported image differs from the approved optimized source: ${relativePath}`);
    }
  });
}

function prepareHomeArt(options = {}) {
  const sourceRoot = path.resolve(options.sourceRoot || SOURCE_ROOT);
  const bundleRoot = path.resolve(options.bundleRoot || BUNDLE_ROOT);
  const targetRoot = path.join(bundleRoot, "textures");
  assertSourceComplete(sourceRoot);

  const existingMeta = [`${bundleRoot}.meta`, `${targetRoot}.meta`, ...listFiles(targetRoot)
    .filter((file) => file.endsWith(".meta"))
    .map((file) => path.join(targetRoot, file))];
  if (existingMeta.some((file) => fs.existsSync(file))) {
    throw new Error("home_common already contains Creator metadata. Run npm run home-art:verify-import instead of preparing it again.");
  }

  const unexpected = listFiles(targetRoot).filter((file) => !EXPECTED_FILES.includes(file));
  if (unexpected.length) {
    throw new Error(`Refusing to overwrite unexpected home_common files: ${unexpected.join(", ")}`);
  }

  EXPECTED_FILES.forEach((relativePath) => {
    const sourcePath = path.join(sourceRoot, relativePath);
    const targetPath = path.join(targetRoot, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    if (fs.existsSync(targetPath) && sha256(sourcePath) !== sha256(targetPath)) {
      throw new Error(`Refusing to overwrite a different target image: ${relativePath}`);
    }
    fs.copyFileSync(sourcePath, targetPath);
  });
  assertCopiesMatch(sourceRoot, targetRoot);
  return { bundleRoot, files: EXPECTED_FILES.length, sourceRoot, targetRoot };
}

function readMeta(metaPath) {
  if (!fs.existsSync(metaPath)) throw new Error(`Creator metadata is missing: ${normalize(path.relative(PROJECT_ROOT, metaPath))}`);
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  } catch (error) {
    throw new Error(`Creator metadata is invalid JSON: ${metaPath}: ${error.message}`);
  }
  if (!parsed.uuid || !parsed.imported) throw new Error(`Creator metadata is incomplete: ${metaPath}`);
  return parsed;
}

function verifyHomeArtImport(options = {}) {
  const sourceRoot = path.resolve(options.sourceRoot || SOURCE_ROOT);
  const bundleRoot = path.resolve(options.bundleRoot || BUNDLE_ROOT);
  const targetRoot = path.join(bundleRoot, "textures");
  assertSourceComplete(sourceRoot);
  assertCopiesMatch(sourceRoot, targetRoot);

  const bundleMeta = readMeta(`${bundleRoot}.meta`);
  if (bundleMeta.importer !== "directory" || bundleMeta.userData?.isBundle !== true || bundleMeta.userData?.bundleName !== "home_common") {
    throw new Error("home_common directory must be configured as Bundle name home_common in Cocos Creator.");
  }

  const uuids = new Set([bundleMeta.uuid]);
  EXPECTED_DIRECTORIES.forEach((relativePath) => {
    const meta = readMeta(`${path.join(bundleRoot, relativePath)}.meta`);
    if (meta.importer !== "directory") throw new Error(`${relativePath}.meta is not Creator directory metadata.`);
    if (uuids.has(meta.uuid)) throw new Error(`Duplicate Creator UUID: ${meta.uuid}`);
    uuids.add(meta.uuid);
  });

  EXPECTED_FILES.forEach((relativePath) => {
    const meta = readMeta(`${path.join(targetRoot, relativePath)}.meta`);
    if (meta.importer !== "image") throw new Error(`${relativePath}.meta is not Creator image metadata.`);
    if (uuids.has(meta.uuid)) throw new Error(`Duplicate Creator UUID: ${meta.uuid}`);
    uuids.add(meta.uuid);
    if (meta.userData?.type !== "sprite-frame") {
      throw new Error(`${relativePath} must use the sprite-frame image importer type.`);
    }
    const subMetas = Object.values(meta.subMetas || {});
    if (!subMetas.some((entry) => entry && entry.importer === "sprite-frame")) {
      throw new Error(`${relativePath}.meta does not contain a generated SpriteFrame sub-resource.`);
    }
  });

  return { bundleRoot, files: EXPECTED_FILES.length, metadataFiles: EXPECTED_FILES.length + EXPECTED_DIRECTORIES.length + 1, targetRoot };
}

function runCli() {
  try {
    if (process.argv.includes("--verify")) {
      const result = verifyHomeArtImport();
      console.log(`home_common import verified: ${result.files} images and ${result.metadataFiles} metadata files.`);
      return;
    }
    const result = prepareHomeArt();
    console.log(`Prepared ${result.files} Home art files in ${result.targetRoot}.`);
    console.log("Open this project in Cocos Creator 3.8.8, configure home_common as a Bundle, set all images to sprite-frame, then run npm run home-art:verify-import.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) runCli();

module.exports = {
  EXPECTED_DIRECTORIES,
  EXPECTED_FILES,
  assertSourceComplete,
  prepareHomeArt,
  verifyHomeArtImport
};
