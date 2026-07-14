const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  EXPECTED_DIRECTORIES,
  EXPECTED_FILES,
  getHomeArtImportStatus,
  prepareHomeArt,
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
      writeMeta(`${path.join(targetRoot, file)}.meta`, "image", `image-${index}`, { type: "sprite-frame" }, {
        texture: { importer: "texture", uuid: `image-${index}@texture` },
        spriteFrame: { importer: "sprite-frame", uuid: `image-${index}@spriteFrame` }
      });
    });
    const verified = verifyHomeArtImport({ bundleRoot });
    assert.equal(verified.files, 18);
    assert.equal(verified.metadataFiles, 23);
    assert.equal(getHomeArtImportStatus({ bundleRoot }).state, "imported");
    assert.throws(() => prepareHomeArt({ bundleRoot }), /already contains Creator metadata/);

    fs.writeFileSync(path.join(targetRoot, EXPECTED_FILES[0]), "changed");
    assert.throws(() => verifyHomeArtImport({ bundleRoot }), /differs from the approved optimized source/);
    assert.equal(getHomeArtImportStatus({ bundleRoot }).state, "invalid");
    console.log("Home art import workflow OK: controlled preparation, metadata gate, hashes, Bundle and SpriteFrame checks passed.");
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

main();
