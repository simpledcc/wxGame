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

function getImageDimensions(filePath) {
  const data = fs.readFileSync(filePath);
  if (data.length >= 24 && data.toString("ascii", 1, 4) === "PNG") {
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }
  if (data.length >= 4 && data[0] === 0xff && data[1] === 0xd8) {
    let offset = 2;
    while (offset + 8 < data.length) {
      if (data[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = data[offset + 1];
      if (marker === 0xd8 || marker === 0xd9) {
        offset += 2;
        continue;
      }
      const length = data.readUInt16BE(offset + 2);
      if (length < 2 || offset + 2 + length > data.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { height: data.readUInt16BE(offset + 5), width: data.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }
  throw new Error(`Unsupported or invalid Home art image: ${filePath}`);
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

function syncHomeArtUpgrade(options = {}) {
  const sourceRoot = path.resolve(options.sourceRoot || SOURCE_ROOT);
  const bundleRoot = path.resolve(options.bundleRoot || BUNDLE_ROOT);
  const targetRoot = path.join(bundleRoot, "textures");
  assertSourceComplete(sourceRoot);

  const requiredMetadata = [
    `${bundleRoot}.meta`,
    ...EXPECTED_DIRECTORIES.map((directory) => `${path.join(bundleRoot, directory)}.meta`),
    ...EXPECTED_FILES.map((file) => `${path.join(targetRoot, file)}.meta`)
  ];
  const missingMetadata = requiredMetadata.filter((file) => !fs.existsSync(file));
  if (missingMetadata.length) {
    throw new Error("home_common must have a complete existing Creator import before a quality upgrade can preserve its UUIDs.");
  }

  const unexpected = listFiles(targetRoot).filter((file) => !file.endsWith(".meta") && !EXPECTED_FILES.includes(file));
  if (unexpected.length) {
    throw new Error(`Refusing to overwrite unexpected home_common files: ${unexpected.join(", ")}`);
  }

  EXPECTED_FILES.forEach((relativePath) => {
    const sourcePath = path.join(sourceRoot, relativePath);
    const targetPath = path.join(targetRoot, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
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
    const spriteFrameMeta = subMetas.find((entry) => entry && entry.importer === "sprite-frame");
    if (!spriteFrameMeta) {
      throw new Error(`${relativePath}.meta does not contain a generated SpriteFrame sub-resource.`);
    }
    const dimensions = getImageDimensions(path.join(targetRoot, relativePath));
    if (spriteFrameMeta.userData?.rawWidth !== dimensions.width || spriteFrameMeta.userData?.rawHeight !== dimensions.height) {
      throw new Error(
        `Creator metadata dimensions are stale for ${relativePath}: image is ${dimensions.width}x${dimensions.height}, `
        + `meta is ${spriteFrameMeta.userData?.rawWidth || "missing"}x${spriteFrameMeta.userData?.rawHeight || "missing"}.`
      );
    }
  });

  return { bundleRoot, files: EXPECTED_FILES.length, metadataFiles: EXPECTED_FILES.length + EXPECTED_DIRECTORIES.length + 1, targetRoot };
}

function getHomeArtImportStatus(options = {}) {
  const sourceRoot = path.resolve(options.sourceRoot || SOURCE_ROOT);
  const bundleRoot = path.resolve(options.bundleRoot || BUNDLE_ROOT);
  const targetRoot = path.join(bundleRoot, "textures");
  try {
    assertSourceComplete(sourceRoot);
  } catch (error) {
    return { state: "invalid-source", reason: error.message };
  }
  if (!fs.existsSync(bundleRoot)) return { state: "source-ready", files: EXPECTED_FILES.length };
  const hasMetadata = fs.existsSync(`${bundleRoot}.meta`)
    || fs.existsSync(`${targetRoot}.meta`)
    || listFiles(targetRoot).some((file) => file.endsWith(".meta"));
  try {
    assertCopiesMatch(sourceRoot, targetRoot);
  } catch (error) {
    const metadataComplete = fs.existsSync(`${bundleRoot}.meta`)
      && EXPECTED_DIRECTORIES.every((directory) => fs.existsSync(`${path.join(bundleRoot, directory)}.meta`))
      && EXPECTED_FILES.every((file) => fs.existsSync(`${path.join(targetRoot, file)}.meta`));
    return metadataComplete
      ? { state: "upgrade-ready", files: EXPECTED_FILES.length, reason: error.message }
      : { state: "invalid", reason: error.message };
  }
  if (!hasMetadata) return { state: "prepared", files: EXPECTED_FILES.length };
  try {
    const result = verifyHomeArtImport({ bundleRoot, sourceRoot });
    return { state: "imported", files: result.files, metadataFiles: result.metadataFiles };
  } catch (error) {
    if (error.message.startsWith("Creator metadata dimensions are stale")) {
      return { state: "reimport-required", files: EXPECTED_FILES.length, reason: error.message };
    }
    return { state: "invalid", reason: error.message };
  }
}

function runCli() {
  try {
    if (process.argv.includes("--status")) {
      const status = getHomeArtImportStatus();
      console.log(JSON.stringify(status, null, 2));
      if (status.state === "invalid" || status.state === "invalid-source") process.exitCode = 1;
      return;
    }
    if (process.argv.includes("--verify")) {
      const result = verifyHomeArtImport();
      console.log(`home_common import verified: ${result.files} images and ${result.metadataFiles} metadata files.`);
      return;
    }
    if (process.argv.includes("--sync-upgrade")) {
      const result = syncHomeArtUpgrade();
      console.log(`Updated ${result.files} Home art images in ${result.targetRoot} while preserving Creator metadata and UUIDs.`);
      console.log("Open this project in Cocos Creator 3.8.8 and wait for all images to reimport, then run npm run home-art:verify-import.");
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
  getHomeArtImportStatus,
  getImageDimensions,
  prepareHomeArt,
  syncHomeArtUpgrade,
  verifyHomeArtImport
};
