const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  EXPECTED_DIRECTORIES,
  EXPECTED_FILES,
  getImageDimensions,
  getHomeArtImportStatus,
  prepareHomeArt,
  syncHomeArtUpgrade,
  verifyHomeArtImport
} = require("./home-art-import");

function writeMeta(metaPath, importer, uuid, userData = {}, subMetas = {}) {
  fs.writeFileSync(metaPath, `${JSON.stringify({
    ver: "test",
    importer,
    imported: true,
    uuid,
    files: [],
    subMetas,
    userData
  }, null, 2)}\n`);
}

function writeImageMeta(metaPath, uuid, dimensions) {
  writeMeta(metaPath, "image", uuid, { type: "sprite-frame" }, {
    texture: { importer: "texture", uuid: `${uuid}@texture` },
    spriteFrame: {
      importer: "sprite-frame",
      uuid: `${uuid}@spriteFrame`,
      userData: { rawWidth: dimensions.width, rawHeight: dimensions.height }
    }
  });
}

function writePngHeader(filePath, width, height) {
  const data = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(data, 0);
  data.write("IHDR", 12, "ascii");
  data.writeUInt32BE(width, 16);
  data.writeUInt32BE(height, 20);
  fs.writeFileSync(filePath, data);
}

function main() {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-art-import-"));
  const bundleRoot = path.join(temporaryRoot, "assets", "bundles", "home_common");
  const targetRoot = path.join(bundleRoot, "textures");
  try {
    assert.equal(getHomeArtImportStatus({ bundleRoot }).state, "source-ready");
    const prepared = prepareHomeArt({ bundleRoot });
    assert.equal(prepared.files, 18);
    assert.equal(EXPECTED_FILES.every((file) => fs.existsSync(path.join(targetRoot, file))), true);
    assert.equal(prepareHomeArt({ bundleRoot }).files, 18, "pre-Creator preparation must be idempotent");
    assert.equal(getHomeArtImportStatus({ bundleRoot }).state, "prepared");
    assert.throws(() => verifyHomeArtImport({ bundleRoot }), /metadata is missing/);

    writeMeta(`${bundleRoot}.meta`, "directory", "bundle-uuid", { isBundle: true, bundleName: "home_common" });
    EXPECTED_DIRECTORIES.forEach((directory, index) => {
      writeMeta(`${path.join(bundleRoot, directory)}.meta`, "directory", `directory-${index}`);
    });
    EXPECTED_FILES.forEach((file, index) => {
      writeImageMeta(
        `${path.join(targetRoot, file)}.meta`,
        `image-${index}`,
        getImageDimensions(path.join(targetRoot, file))
      );
    });
    const verified = verifyHomeArtImport({ bundleRoot });
    assert.equal(verified.files, 18);
    assert.equal(verified.metadataFiles, 23);
    assert.equal(getHomeArtImportStatus({ bundleRoot }).state, "imported");
    assert.throws(() => prepareHomeArt({ bundleRoot }), /already contains Creator metadata/);

    const upgradedSourceRoot = path.join(temporaryRoot, "upgraded-source");
    fs.cpSync(path.resolve(__dirname, "../art-source/home-v1/optimized/textures"), upgradedSourceRoot, { recursive: true });
    writePngHeader(path.join(upgradedSourceRoot, "logo.png"), 1279, 399);
    assert.equal(getHomeArtImportStatus({ bundleRoot, sourceRoot: upgradedSourceRoot }).state, "upgrade-ready");
    assert.equal(syncHomeArtUpgrade({ bundleRoot, sourceRoot: upgradedSourceRoot }).files, 18);
    assert.throws(
      () => verifyHomeArtImport({ bundleRoot, sourceRoot: upgradedSourceRoot }),
      /metadata dimensions are stale/
    );
    assert.equal(getHomeArtImportStatus({ bundleRoot, sourceRoot: upgradedSourceRoot }).state, "reimport-required");
    writeImageMeta(`${path.join(targetRoot, "logo.png")}.meta`, "image-0", { width: 1279, height: 399 });
    assert.equal(getHomeArtImportStatus({ bundleRoot, sourceRoot: upgradedSourceRoot }).state, "imported");
    console.log("Home art import workflow OK: preparation, UUID-preserving quality upgrade, reimport gate, hashes, Bundle and SpriteFrame checks passed.");
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

main();
