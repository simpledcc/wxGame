const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");
const cocosRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(projectRoot, "miniprogram", "wordBankData.js");
const outputDir = path.join(cocosRoot, "assets", "scripts", "data");
const outputPath = path.join(outputDir, "WordBankData.generated.ts");
const dirMetaPath = `${outputDir}.meta`;
const fileMetaPath = `${outputPath}.meta`;

function makeUuid() {
  return crypto.randomUUID();
}

function writeJsonIfMissing(filePath, data) {
  if (fs.existsSync(filePath)) {
    return;
  }
  fs.writeFileSync(`${filePath}`, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function main() {
  delete require.cache[require.resolve(sourcePath)];
  const data = require(sourcePath);
  fs.mkdirSync(outputDir, { recursive: true });
  const text = [
    "import type { WordBankDataSource } from \"../domain/WordBank\";",
    "",
    "// Generated from ../../miniprogram/wordBankData.js. Do not edit by hand.",
    `export const WORD_BANK_DATA: WordBankDataSource = ${JSON.stringify(data, null, 2)};`,
    ""
  ].join("\n");
  fs.writeFileSync(outputPath, text, "utf8");
  writeJsonIfMissing(dirMetaPath, {
    ver: "1.2.0",
    importer: "directory",
    imported: true,
    uuid: makeUuid(),
    files: [],
    subMetas: {},
    userData: {}
  });
  writeJsonIfMissing(fileMetaPath, {
    ver: "4.0.24",
    importer: "typescript",
    imported: true,
    uuid: makeUuid(),
    files: [],
    subMetas: {},
    userData: {}
  });
  console.log(`Generated ${path.relative(cocosRoot, outputPath)}`);
}

main();
