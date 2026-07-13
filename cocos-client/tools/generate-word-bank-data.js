const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");
const cocosRoot = path.resolve(__dirname, "..");
const wordSourcePath = path.join(projectRoot, "miniprogram", "wordBankData.js");
const spellSourcePath = path.join(projectRoot, "miniprogram", "spellWordBankData.js");
const outputDir = path.join(cocosRoot, "assets", "scripts", "data");
const wordOutputPath = path.join(outputDir, "WordBankData.generated.ts");
const spellOutputPath = path.join(outputDir, "SpellTemplateData.generated.ts");
const dirMetaPath = `${outputDir}.meta`;
const wordMetaPath = `${wordOutputPath}.meta`;
const spellMetaPath = `${spellOutputPath}.meta`;

function makeUuid() {
  return crypto.randomUUID();
}

function writeJsonIfMissing(filePath, data) {
  if (fs.existsSync(filePath)) {
    return;
  }
  fs.writeFileSync(`${filePath}`, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function sourceHash(filePath) {
  const source = fs.readFileSync(filePath, "utf8").replace(/\r\n?/g, "\n");
  return crypto.createHash("sha256").update(source, "utf8").digest("hex");
}

function writeGeneratedText(filePath, text) {
  const normalized = text.replace(/\r?\n/g, "\r\n");
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8") === normalized) {
    return;
  }
  fs.writeFileSync(filePath, normalized, "utf8");
}

function packSpellTemplates(wordData, spellData) {
  const packedBanks = {};
  for (const [bankId, templates] of Object.entries(spellData.SPELL_WORD_BANKS || {})) {
    const words = wordData.WORD_BANKS && wordData.WORD_BANKS[bankId]
      ? wordData.WORD_BANKS[bankId].words || []
      : [];
    const records = Buffer.alloc(templates.length * 4);
    templates.forEach((template, templateIndex) => {
      const wordIndex = words.findIndex((item) => (
        String(item.word || "") === String(template.word || "")
        && String(item.meaning || "") === String(template.meaning || "")
      ));
      if (wordIndex < 0 || wordIndex > 0xfff) {
        throw new Error(`${bankId}/${template.key}: source word index is missing or exceeds 12 bits`);
      }
      const slots = Array.isArray(template.slots) ? template.slots : [];
      if (slots.length !== 4) {
        throw new Error(`${bankId}/${template.key}: expected exactly four slots`);
      }
      const positions = slots.map((slot) => Number(slot.position));
      if (positions.some((position) => !Number.isInteger(position) || position < 0 || position > 31)) {
        throw new Error(`${bankId}/${template.key}: slot position exceeds five bits`);
      }
      const letters = Array.from(String(template.word || "").toLowerCase());
      const answersMatch = slots.every((slot, index) => (
        String(slot.answer || "").toLowerCase() === letters[positions[index]]
      ));
      const mask = letters.map((letter, index) => positions.includes(index) ? "_" : letter).join("");
      if (!answersMatch || mask !== template.mask) {
        throw new Error(`${bankId}/${template.key}: compact fields cannot reproduce the legacy template`);
      }
      const packed = (
        (wordIndex << 20)
        | (positions[0] << 15)
        | (positions[1] << 10)
        | (positions[2] << 5)
        | positions[3]
      ) >>> 0;
      records.writeUInt32BE(packed, templateIndex * 4);
    });
    packedBanks[bankId] = records.toString("base64");
  }
  return packedBanks;
}

function main() {
  delete require.cache[require.resolve(wordSourcePath)];
  delete require.cache[require.resolve(spellSourcePath)];
  const wordData = require(wordSourcePath);
  const spellData = require(spellSourcePath);
  const packedSpellData = packSpellTemplates(wordData, spellData);
  fs.mkdirSync(outputDir, { recursive: true });
  const wordText = [
    "import type { WordBankDataSource } from \"../domain/WordBank\";",
    "",
    "// Generated from ../../miniprogram/wordBankData.js. Do not edit by hand.",
    `export const WORD_BANK_DATA: WordBankDataSource = ${JSON.stringify(wordData, null, 2)};`,
    ""
  ].join("\n");
  const spellText = [
    "// Generated from ../../miniprogram/spellWordBankData.js. Do not edit by hand.",
    `export const SPELL_TEMPLATE_SOURCE_SHA256 = \"${sourceHash(spellSourcePath)}\";`,
    `export const SPELL_TEMPLATE_DATA: Readonly<Record<string, string>> = ${JSON.stringify(packedSpellData, null, 2)};`,
    ""
  ].join("\n");
  writeGeneratedText(wordOutputPath, wordText);
  writeGeneratedText(spellOutputPath, spellText);
  writeJsonIfMissing(dirMetaPath, {
    ver: "1.2.0",
    importer: "directory",
    imported: true,
    uuid: makeUuid(),
    files: [],
    subMetas: {},
    userData: {}
  });
  writeJsonIfMissing(wordMetaPath, {
    ver: "4.0.24",
    importer: "typescript",
    imported: true,
    uuid: makeUuid(),
    files: [],
    subMetas: {},
    userData: {}
  });
  writeJsonIfMissing(spellMetaPath, {
    ver: "4.0.24",
    importer: "typescript",
    imported: true,
    uuid: makeUuid(),
    files: [],
    subMetas: {},
    userData: {}
  });
  console.log(`Generated ${path.relative(cocosRoot, wordOutputPath)}`);
  console.log(`Generated ${path.relative(cocosRoot, spellOutputPath)}`);
}

main();
