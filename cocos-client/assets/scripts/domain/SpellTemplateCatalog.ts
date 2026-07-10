import type { WordItem } from "./GameTypes";
import type { SpellTemplate } from "./RoomTypes";
import type { WordBankDataSource } from "./WordBank";

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function decodeBase64(value: string): number[] {
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of String(value || "")) {
    if (char === "=") break;
    const digit = BASE64_ALPHABET.indexOf(char);
    if (digit < 0) continue;
    buffer = (buffer << 6) | digit;
    bits += 6;
    while (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >>> bits) & 0xff);
      buffer = bits ? buffer & ((1 << bits) - 1) : 0;
    }
  }
  return bytes;
}

function hashSpellTemplateText(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

function nextSpellTemplateSeed(seed: number): number {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}

export function pickStableBlankPositions(word: string, meaning: string, bankId: string): number[] {
  const indexes = Array.from({ length: word.length }, (_, index) => index);
  let seed = hashSpellTemplateText(`${bankId}:${word}:${meaning}`) || 1;
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    seed = nextSpellTemplateSeed(seed);
    const swapIndex = seed % (index + 1);
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes.slice(0, 4).sort((left, right) => left - right);
}

export function createStableSpellTemplate(item: WordItem, bankId: string): SpellTemplate | null {
  const word = String(item?.word || "").trim();
  const meaning = String(item?.meaning || "").trim();
  const key = word.toLowerCase();
  if (!/^[a-zA-Z]{4,18}$/.test(word) || !meaning) return null;
  const letters = Array.from(key);
  const blankPositions = pickStableBlankPositions(key, meaning, bankId);
  const slots = blankPositions.map((position, index) => ({
    index,
    position,
    answer: letters[position]
  }));
  return {
    key,
    word,
    meaning,
    mask: letters.map((letter, index) => blankPositions.includes(index) ? "_" : letter).join(""),
    blankPositions,
    slots
  };
}

function unpackBankTemplates(encoded: string, words: WordItem[]): SpellTemplate[] {
  const bytes = decodeBase64(encoded);
  if (bytes.length % 4 !== 0) return [];
  const templates: SpellTemplate[] = [];
  for (let offset = 0; offset < bytes.length; offset += 4) {
    const packed = (
      ((bytes[offset] << 24) >>> 0)
      | (bytes[offset + 1] << 16)
      | (bytes[offset + 2] << 8)
      | bytes[offset + 3]
    ) >>> 0;
    const wordIndex = packed >>> 20;
    const positions = [
      (packed >>> 15) & 0x1f,
      (packed >>> 10) & 0x1f,
      (packed >>> 5) & 0x1f,
      packed & 0x1f
    ];
    const item = words[wordIndex];
    const word = String(item?.word || "").trim();
    const meaning = String(item?.meaning || "").trim();
    const key = word.toLowerCase();
    const letters = Array.from(key);
    if (!/^[a-zA-Z]{4,18}$/.test(word) || !meaning || positions.some((position) => position >= letters.length)) {
      continue;
    }
    templates.push({
      key,
      word,
      meaning,
      mask: letters.map((letter, index) => positions.includes(index) ? "_" : letter).join(""),
      blankPositions: positions,
      slots: positions.map((position, index) => ({
        index,
        position,
        answer: letters[position]
      }))
    });
  }
  return templates;
}

export function getSpellTemplatesForBank(
  packedData: Readonly<Record<string, string>>,
  catalog: WordBankDataSource,
  bankId: string,
  fallbackWords: WordItem[] = [],
  limit = 240
): SpellTemplate[] {
  const bankWords = catalog.WORD_BANKS[bankId]?.words || [];
  const packed = packedData[bankId];
  const source = packed ? unpackBankTemplates(packed, bankWords) : [];
  if (source.length) return source.slice(0, Math.max(0, limit));

  const seen = new Set<string>();
  return fallbackWords
    .map((item) => createStableSpellTemplate(item, bankId))
    .filter((item): item is SpellTemplate => {
      if (!item || seen.has(item.key)) return false;
      seen.add(item.key);
      return true;
    })
    .slice(0, Math.max(0, limit));
}
