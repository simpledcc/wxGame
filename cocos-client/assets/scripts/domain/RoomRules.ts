import type {
  BotDifficulty,
  GameDuration,
  GameModeKey,
  WordItem,
  WordMode
} from "./GameTypes";
import { normalizeDuration } from "./MatchRules";
import type {
  FishSnapshot,
  GameOptions,
  PlayerSnapshot,
  RoomSnapshot,
  SpellQuestion,
  SpellSubmission,
  SpellTemplate
} from "./RoomTypes";
import { DEFAULT_BANK_ID, WRONG_BANK_ID } from "./WordBank";
import { normalizeSpellRound } from "./MatchRecordRules";

export const ROOM_CODE_LENGTH = 6;
export const ROOM_WORD_LIMIT = 240;
export const ROOM_SPELL_QUESTION_LIMIT = 240;
export const WRONG_WORD_LIMIT = 200;

export interface RoomCreationSettings {
  modeKey: GameModeKey;
  bankId: string;
  wordMode: WordMode;
  words: WordItem[];
  wrongWords: WordItem[];
  roomSpellQuestions?: SpellTemplate[];
}

export type RoomStartBlockReason =
  | "notWaiting"
  | "notInRoom"
  | "waitingForPlayer"
  | "waitingForReady"
  | "humanPlayersRequired";

export interface RoomActionAvailability {
  canToggleReady: boolean;
  canStart: boolean;
  startBlockReason: RoomStartBlockReason | null;
}

export type RoomGameplayRoute = "pkGame" | "coopShared" | "coopSpell";

function normalizeWords(words: WordItem[] | undefined, limit: number): WordItem[] {
  const seen = new Set<string>();
  return (Array.isArray(words) ? words : [])
    .map((item) => ({
      word: String(item?.word ?? "").trim(),
      meaning: String(item?.meaning ?? "").trim()
    }))
    .filter((item) => {
      const key = item.word.toLowerCase();
      if (!item.word || !item.meaning || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function normalizeSpellTemplates(templates: SpellTemplate[] | undefined): SpellTemplate[] {
  return (Array.isArray(templates) ? templates : [])
    .slice(0, ROOM_SPELL_QUESTION_LIMIT)
    .map((template) => ({
      ...template,
      blankPositions: [...(template.blankPositions ?? [])],
      slots: (template.slots ?? []).map((slot) => ({ ...slot }))
    }));
}

export function normalizeRoomCode(value: string): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, ROOM_CODE_LENGTH + 1);
}

export function isValidRoomCode(value: string): boolean {
  return normalizeRoomCode(value).length === ROOM_CODE_LENGTH;
}

export function normalizeGameOptions(
  options: Partial<GameOptions> = {},
  fallbackDuration?: GameDuration
): GameOptions {
  const bankId = String(options.bankId ?? DEFAULT_BANK_ID).trim() || DEFAULT_BANK_ID;
  const mode: WordMode = bankId === WRONG_BANK_ID || options.mode === "mistakes"
    ? "mistakes"
    : "regular";
  const matchMode = options.matchMode === "coop" ? "coop" : "pk";
  const coopMode = options.coopMode === "spell" ? "spell" : "shared";
  const duration = options.duration == null && fallbackDuration == null
    ? undefined
    : normalizeDuration(options.duration ?? fallbackDuration);
  const botDifficulty = ["low", "medium", "high"].includes(String(options.botDifficulty))
    ? options.botDifficulty as BotDifficulty
    : undefined;
  return {
    ...(duration == null ? {} : { duration }),
    bankId: mode === "mistakes" ? WRONG_BANK_ID : bankId,
    mode,
    wrongWords: normalizeWords(options.wrongWords, WRONG_WORD_LIMIT),
    roomWords: normalizeWords(options.roomWords, ROOM_WORD_LIMIT),
    roomSpellQuestions: normalizeSpellTemplates(options.roomSpellQuestions),
    ...(botDifficulty == null ? {} : { botDifficulty }),
    matchMode,
    coopMode
  };
}

export function buildRoomGameOptions(settings: RoomCreationSettings): GameOptions {
  const matchMode = settings.modeKey === "pk" ? "pk" : "coop";
  const coopMode = settings.modeKey === "coopSpell" ? "spell" : "shared";
  return normalizeGameOptions({
    bankId: settings.bankId,
    mode: settings.wordMode,
    wrongWords: settings.wordMode === "mistakes" ? settings.wrongWords : [],
    roomWords: settings.words,
    roomSpellQuestions: settings.modeKey === "coopSpell" ? settings.roomSpellQuestions : [],
    matchMode,
    coopMode
  });
}

function normalizePlayer(player: PlayerSnapshot, index: number): PlayerSnapshot {
  const bot = isBotPlayer(player);
  const powerUps = Array.isArray(player.powerUps)
    ? player.powerUps.map((item) => ({ ...item }))
    : [];
  return {
    ...player,
    openid: String(player.openid ?? ""),
    nickName: bot
      ? (String(player.nickName ?? "机器人").trim().slice(0, 12) || "机器人")
      : `玩家${index + 1}`,
    score: Number.isFinite(Number(player.score)) ? Number(player.score) : 0,
    ready: player.ready === true,
    combo: Number.isFinite(Number(player.combo)) ? Number(player.combo) : 0,
    stunnedUntil: Number.isFinite(Number(player.stunnedUntil)) ? Number(player.stunnedUntil) : 0,
    powerUps,
    powerUp: player.powerUp ? { ...player.powerUp } : null,
    isBot: bot
  };
}

function normalizeFish(fish: FishSnapshot): FishSnapshot {
  return {
    ...fish,
    id: String(fish.id ?? ""),
    word: String(fish.word ?? ""),
    meaning: String(fish.meaning ?? ""),
    alive: fish.alive !== false
  };
}

function normalizeTimestamp(value: unknown): number | undefined {
  if (value instanceof Date) {
    return value.getTime();
  }
  const timestamp = typeof value === "string" ? Date.parse(value) : Number(value);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : undefined;
}

function cloneSubmission(value: SpellSubmission | number | string | undefined): SpellSubmission | number | string | undefined {
  return value && typeof value === "object" ? { ...value } : value;
}

function parseSpellQuestion(value: unknown): SpellQuestion | null {
  let source = value;
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return null;
    }
  }
  if (!source || typeof source !== "object") return null;
  const question = source as Partial<SpellQuestion>;
  if (!question.id || !question.word || !Array.isArray(question.slots) || !Array.isArray(question.segments)) {
    return null;
  }
  return {
    ...question,
    id: String(question.id),
    key: String(question.key || question.wordKey || question.word),
    wordKey: String(question.wordKey || question.key || question.word),
    word: String(question.word),
    meaning: String(question.meaning || ""),
    mask: String(question.mask || ""),
    blankPositions: Array.isArray(question.blankPositions)
      ? question.blankPositions.map(Number).filter(Number.isFinite)
      : [],
    slots: question.slots.map((slot, index) => ({
      index: Number.isFinite(Number(slot.index)) ? Number(slot.index) : index,
      position: Number(slot.position),
      answer: String(slot.answer || "").slice(0, 1).toLowerCase()
    })),
    mode: "boatLetters",
    segments: question.segments.map((segment) => ({
      ...segment,
      openid: segment.openid ? String(segment.openid) : undefined,
      start: Number(segment.start || 0),
      end: Number(segment.end || 0),
      length: Number(segment.length || 0),
      slotIndexes: Array.isArray(segment.slotIndexes)
        ? segment.slotIndexes.map(Number).filter(Number.isFinite)
        : [],
      answer: String(segment.answer || "").toLowerCase()
    })),
    createdAt: normalizeTimestamp(question.createdAt) || Date.now()
  };
}

export function normalizeRoomSnapshot(
  room: RoomSnapshot,
  fallbackRoomId = "",
  fallbackRoomCode = ""
): RoomSnapshot {
  const duration = normalizeDuration(room.duration ?? room.gameOptions?.duration);
  const gameOptions = normalizeGameOptions(room.gameOptions, duration);
  const spellQuestion = parseSpellQuestion(room.spellQuestion as unknown);
  const spellSubmissions = Object.fromEntries(
    Object.entries(room.spellSubmissions ?? {}).map(([key, value]) => [key, cloneSubmission(value)])
  );
  return {
    ...room,
    _id: String(room._id ?? fallbackRoomId) || undefined,
    roomCode: normalizeRoomCode(room.roomCode || fallbackRoomCode),
    state: room.state === "playing" || room.state === "finished" ? room.state : "waiting",
    ownerOpenid: room.ownerOpenid ? String(room.ownerOpenid) : undefined,
    players: (Array.isArray(room.players) ? room.players : [])
      .filter((player) => !!player?.openid)
      .slice(0, 2)
      .map(normalizePlayer),
    fishes: (Array.isArray(room.fishes) ? room.fishes : [])
      .filter((fish) => !!fish?.id)
      .map(normalizeFish),
    currentMeaning: String(room.currentMeaning ?? ""),
    targetFishId: String(room.targetFishId ?? ""),
    spellQuestion,
    spellSubmissions,
    spellHistory: Array.isArray(room.spellHistory)
      ? (room.spellHistory as unknown[])
          .map(normalizeSpellRound)
          .filter((record): record is NonNullable<typeof record> => !!record)
      : [],
    duration,
    gameOptions,
    winnerOpenid: String(room.winnerOpenid ?? ""),
    usedWords: Array.isArray(room.usedWords) ? [...room.usedWords] : [],
    startedAt: normalizeTimestamp(room.startedAt),
    finishedAt: normalizeTimestamp(room.finishedAt),
    createdAt: normalizeTimestamp(room.createdAt),
    updatedAt: normalizeTimestamp(room.updatedAt)
  };
}

export function isBotPlayer(player: PlayerSnapshot): boolean {
  return player.isBot === true || String(player.openid ?? "").startsWith("bot_");
}

export function getRoomModeKey(room: RoomSnapshot): GameModeKey {
  if (room.gameOptions.matchMode !== "coop") {
    return "pk";
  }
  return room.gameOptions.coopMode === "spell" ? "coopSpell" : "coopShared";
}

export function getRoomModeLabel(room: RoomSnapshot): string {
  const mode = getRoomModeKey(room);
  if (mode === "coopShared") return "默契捕词赛";
  if (mode === "coopSpell") return "同舟拼词记";
  return "双人PK";
}

export function getRoomGameplayRoute(room: RoomSnapshot): RoomGameplayRoute {
  const mode = getRoomModeKey(room);
  if (mode === "coopShared") return "coopShared";
  if (mode === "coopSpell") return "coopSpell";
  return "pkGame";
}

export function getLocalRoomPlayer(
  room: RoomSnapshot,
  openid: string
): PlayerSnapshot | null {
  return room.players.find((player) => player.openid === openid) ?? null;
}

export function getRoomActionAvailability(
  room: RoomSnapshot,
  localOpenId: string
): RoomActionAvailability {
  const localPlayer = getLocalRoomPlayer(room, localOpenId);
  const waiting = room.state === "waiting";
  const humanCount = room.players.filter((player) => !isBotPlayer(player)).length;
  let startBlockReason: RoomStartBlockReason | null = null;
  if (!waiting) startBlockReason = "notWaiting";
  else if (!localPlayer) startBlockReason = "notInRoom";
  else if (room.players.length < 2) startBlockReason = "waitingForPlayer";
  else if (humanCount < 2) startBlockReason = "humanPlayersRequired";
  else if (!room.players.every((player) => player.ready === true)) startBlockReason = "waitingForReady";

  return {
    canToggleReady: waiting && !!localPlayer && !isBotPlayer(localPlayer),
    canStart: startBlockReason == null,
    startBlockReason
  };
}

export function getRoomStartStatusText(reason: RoomStartBlockReason | null): string {
  if (reason === "notWaiting") return "游戏已经开始";
  if (reason === "notInRoom") return "你不在这个房间中";
  if (reason === "waitingForPlayer") return "等待第二名玩家加入";
  if (reason === "waitingForReady") return "双方准备后即可开始";
  if (reason === "humanPlayersRequired") return "需要两名真实玩家才能开始";
  return "双方已准备，可以开始";
}
