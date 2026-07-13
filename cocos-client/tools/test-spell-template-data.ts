import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { SPELL_TEMPLATE_DATA, SPELL_TEMPLATE_SOURCE_SHA256 } from "../assets/scripts/data/SpellTemplateData.generated";
import { WORD_BANK_DATA } from "../assets/scripts/data/WordBankData.generated";
import { buildRoomGameOptions, ROOM_SPELL_QUESTION_LIMIT } from "../assets/scripts/domain/RoomRules";
import { getSpellTemplatesForBank } from "../assets/scripts/domain/SpellTemplateCatalog";

const repositoryRoot = path.resolve(__dirname, "..", "..");
const spellSourcePath = path.join(repositoryRoot, "miniprogram", "spellWordBankData.js");
const legacySpellBanks = require(spellSourcePath).SPELL_WORD_BANKS as Record<string, unknown[]>;

function testSourceHashAndExactTemplates(): void {
  const source = fs.readFileSync(spellSourcePath, "utf8").replace(/\r\n?/g, "\n");
  const hash = crypto.createHash("sha256").update(source, "utf8").digest("hex");
  assert.equal(SPELL_TEMPLATE_SOURCE_SHA256, hash, "generated spell data is stale");
  assert.equal(Object.keys(SPELL_TEMPLATE_DATA).length, 44);

  let templateCount = 0;
  Object.entries(legacySpellBanks).forEach(([bankId, legacyTemplates]) => {
    const expanded = getSpellTemplatesForBank(
      SPELL_TEMPLATE_DATA,
      WORD_BANK_DATA,
      bankId,
      [],
      Number.MAX_SAFE_INTEGER
    );
    assert.deepEqual(expanded, legacyTemplates, `${bankId} compact templates drifted from the legacy source`);
    templateCount += expanded.length;
  });
  assert.equal(templateCount, 6351);
}

function testPayloadLimitAndModeIsolation(): void {
  const bankId = "jilin-g3r-all-review";
  const bank = WORD_BANK_DATA.WORD_BANKS[bankId];
  const allTemplates = getSpellTemplatesForBank(
    SPELL_TEMPLATE_DATA,
    WORD_BANK_DATA,
    bankId,
    bank.words,
    Number.MAX_SAFE_INTEGER
  );
  assert.ok(allTemplates.length > ROOM_SPELL_QUESTION_LIMIT);

  const spellOptions = buildRoomGameOptions({
    modeKey: "coopSpell",
    duration: 60,
    bankId,
    wordMode: "regular",
    words: bank.words,
    wrongWords: [],
    roomSpellQuestions: allTemplates
  });
  assert.equal(spellOptions.roomSpellQuestions?.length, ROOM_SPELL_QUESTION_LIMIT);
  assert.deepEqual(spellOptions.roomSpellQuestions, allTemplates.slice(0, ROOM_SPELL_QUESTION_LIMIT));

  const pkOptions = buildRoomGameOptions({
    modeKey: "pk",
    duration: 60,
    bankId,
    wordMode: "regular",
    words: bank.words,
    wrongWords: [],
    roomSpellQuestions: allTemplates
  });
  assert.deepEqual(pkOptions.roomSpellQuestions, []);
}

function testStableFallback(): void {
  const words = [
    { word: "exchange", meaning: "交换；交流；交易所" },
    { word: "cat", meaning: "猫" },
    { word: "exchange", meaning: "重复项" }
  ];
  const first = getSpellTemplatesForBank(SPELL_TEMPLATE_DATA, WORD_BANK_DATA, "future-bank", words);
  const second = getSpellTemplatesForBank(SPELL_TEMPLATE_DATA, WORD_BANK_DATA, "future-bank", words);
  assert.deepEqual(second, first);
  assert.equal(first.length, 1);
  assert.deepEqual(first[0].blankPositions, [0, 2, 4, 5]);
}

function main(): void {
  testSourceHashAndExactTemplates();
  testPayloadLimitAndModeIsolation();
  testStableFallback();
  console.log("Spell template data OK: 44 banks and 6351 legacy templates decode exactly, with deterministic fallback and 240-item payload caps.");
}

main();
