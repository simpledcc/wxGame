const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function maskLogId(value) {
  const text = String(value || "");
  return text.length > 6 ? `...${text.slice(-6)}` : text;
}

function summarizeLogPlayers(players) {
  if (!Array.isArray(players)) return { count: 0 };
  return {
    count: players.length,
    readyCount: players.filter((player) => player && player.ready).length,
    botCount: players.filter((player) => player && (player.isBot || String(player.openid || "").indexOf("bot_") === 0)).length,
    scores: players.map((player) => Number((player && player.score) || 0))
  };
}

function summarizeLogRoom(room) {
  if (!room || typeof room !== "object") return room;
  const options = room.gameOptions || {};
  return {
    id: maskLogId(room._id || room.roomId),
    roomCode: maskLogId(room.roomCode),
    state: room.state || "",
    mode: options.matchMode || "",
    coopMode: options.coopMode || "",
    duration: room.duration || options.duration || 0,
    players: summarizeLogPlayers(room.players),
    fishCount: Array.isArray(room.fishes) ? room.fishes.length : 0,
    hasSpellQuestion: !!room.spellQuestion
  };
}

function sanitizeLogValue(value, key, depth) {
  const currentKey = String(key || "");
  const currentDepth = depth || 0;
  if (value == null) return value;
  if (/openid/i.test(currentKey)) return "[redacted]";
  if (/answer/i.test(currentKey) || currentKey === "word" || currentKey === "meaning") return `[redacted:${String(value).length}]`;
  if (/roomId|_id|id$/i.test(currentKey) && typeof value === "string") return maskLogId(value);
  if (typeof value === "string") return value.length > 80 ? `${value.slice(0, 80)}...` : value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    if (currentKey === "players") return summarizeLogPlayers(value);
    return { type: "array", count: value.length };
  }
  if (typeof value === "object") {
    if (currentKey === "room") return summarizeLogRoom(value);
    if (currentDepth >= 2) return { type: "object", keys: Object.keys(value).slice(0, 8) };
    const result = {};
    Object.keys(value).slice(0, 24).forEach((itemKey) => {
      result[itemKey] = sanitizeLogValue(value[itemKey], itemKey, currentDepth + 1);
    });
    return result;
  }
  return String(value);
}

function writeServerLog(level, fn, phase, started, payload) {
  const elapsed = started ? Date.now() - started : 0;
  const writer = console[level] || console.log;
  writer(`[${fn}] ${phase}`, {
    at: Date.now(),
    elapsed,
    data: sanitizeLogValue(payload || {}, "", 0)
  });
}

async function withServerLog(fn, event, handler) {
  const started = Date.now();
  writeServerLog("log", fn, "start", started, { event });
  try {
    const result = await handler();
    writeServerLog("log", fn, "success", started, { result });
    return result;
  } catch (err) {
    writeServerLog("error", fn, "fail", started, {
      errMsg: err && (err.errMsg || err.message),
      stack: err && err.stack
    });
    throw err;
  }
}

const DEFAULT_BANK_ID = "jilin-g1a-b1-welcome";
const WRONG_BANK_ID = "wrong";

const DEFAULT_GAME_OPTIONS = {
  duration: 60,
  bankId: DEFAULT_BANK_ID,
  mode: "regular",
  wrongWords: [],
  botDifficulty: "medium",
  matchMode: "pk",
  coopMode: "shared"
};

const VALID_OPTIONS = {
  durations: [30, 60, 90, 120],
  modes: ["regular", "mistakes"],
  botDifficulties: ["low", "medium", "high"],
  matchModes: ["pk", "coop"],
  coopModes: ["shared", "spell"]
};

function isValidBankId(bankId) {
  const value = String(bankId || "");
  return value === WRONG_BANK_ID || /^[a-z0-9_-]{1,80}$/.test(value);
}

function normalizeName(name) {
  const text = String(name || "").trim();
  return text ? text.slice(0, 12) : "玩家";
}

function getErrCode(err) {
  const code = err && (err.errCode || err.errcode || err.code);
  return Number(code || 0);
}

function assertTextSafetyResult(result) {
  const errCode = Number((result && (result.errCode || result.errcode)) || 0);
  const suggest = result && result.result && result.result.suggest;
  if (errCode === 87014 || suggest === "risky" || suggest === "review") {
    throw new Error("昵称包含不合规内容，请修改后再试");
  }
  if (errCode && errCode !== 0) {
    throw new Error("内容安全检测失败，请稍后再试");
  }
}

async function checkTextSafety(content, openid) {
  const text = String(content || "").trim();
  if (!text || text === "玩家" || text === "鐜╁") return;
  if (!cloud.openapi || !cloud.openapi.security || !cloud.openapi.security.msgSecCheck) {
    throw new Error("内容安全检测暂不可用，请稍后再试");
  }
  try {
    const result = await cloud.openapi.security.msgSecCheck({
      content: text,
      version: 2,
      scene: 1,
      openid
    });
    assertTextSafetyResult(result);
  } catch (err) {
    if (getErrCode(err) === 87014) {
      throw new Error("昵称包含不合规内容，请修改后再试");
    }
    const message = String((err && (err.errMsg || err.message)) || "");
    if (/invalid|argument|param|openid|version|scene/i.test(message)) {
      const fallback = await cloud.openapi.security.msgSecCheck({ content: text });
      assertTextSafetyResult(fallback);
      return;
    }
    throw err;
  }
}

function normalizeGameOptions(options) {
  const source = options || {};
  const duration = VALID_OPTIONS.durations.includes(source.duration) ? source.duration : DEFAULT_GAME_OPTIONS.duration;
  let bankId = isValidBankId(source.bankId) ? String(source.bankId) : DEFAULT_GAME_OPTIONS.bankId;
  if (source.mode === "mistakes") bankId = WRONG_BANK_ID;
  const mode = bankId === WRONG_BANK_ID ? "mistakes" : "regular";
  const botDifficulty = VALID_OPTIONS.botDifficulties.includes(source.botDifficulty) ? source.botDifficulty : DEFAULT_GAME_OPTIONS.botDifficulty;
  const matchMode = VALID_OPTIONS.matchModes.includes(source.matchMode) ? source.matchMode : DEFAULT_GAME_OPTIONS.matchMode;
  const coopMode = VALID_OPTIONS.coopModes.includes(source.coopMode) ? source.coopMode : DEFAULT_GAME_OPTIONS.coopMode;
  const wrongWords = normalizeWrongWords(source.wrongWords);
  const roomWords = normalizeRoomWords(source.roomWords);
  const roomSpellQuestions = normalizeSpellQuestions(source.roomSpellQuestions);
  return { duration, bankId, mode, wrongWords, roomWords, roomSpellQuestions, botDifficulty, matchMode, coopMode };
}

function normalizeWrongWords(words) {
  if (!Array.isArray(words)) return [];
  const seen = new Set();
  return words
    .map((item) => ({
      word: String(item && item.word ? item.word : "").trim(),
      meaning: String(item && item.meaning ? item.meaning : "").trim()
    }))
    .filter((item) => {
      if (!item.word || !item.meaning || seen.has(item.word)) return false;
      seen.add(item.word);
      return true;
    })
    .slice(0, 200);
}

function normalizeRoomWords(words) {
  return normalizeWrongWords(words).slice(0, 240);
}

function normalizeSpellQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  const seen = new Set();
  return questions
    .map((item) => {
      const word = String(item && item.word ? item.word : "").trim();
      const meaning = String(item && item.meaning ? item.meaning : "").trim();
      const key = String((item && item.key) || word).trim().toLowerCase();
      const slots = Array.isArray(item && item.slots) ? item.slots.map((slot, index) => ({
        index,
        position: Number(slot.position),
        answer: String(slot.answer || "").slice(0, 1).toLowerCase()
      })).filter((slot) => Number.isFinite(slot.position) && slot.answer) : [];
      if (!/^[a-zA-Z]{4,18}$/.test(word) || !meaning || !key || slots.length !== 4 || seen.has(key)) return null;
      seen.add(key);
      return {
        key,
        word,
        meaning,
        mask: String(item.mask || ""),
        blankPositions: Array.isArray(item.blankPositions) ? item.blankPositions.slice(0, 4).map(Number) : slots.map((slot) => slot.position),
        slots
      };
    })
    .filter(Boolean)
    .slice(0, 240);
}

function makeRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function createUniqueCode() {
  for (let i = 0; i < 8; i += 1) {
    const code = makeRoomCode();
    const existed = await db.collection("rooms").where({ roomCode: code }).count();
    if (existed.total === 0) return code;
  }
  throw new Error("房间码生成失败，请重试");
}

exports.main = async (event) => withServerLog("createRoom", event, async () => {
  const { OPENID } = cloud.getWXContext();
  const roomCode = await createUniqueCode();
  const gameOptions = normalizeGameOptions(event.gameOptions);
  const nickName = normalizeName(event.nickName);
  await checkTextSafety(nickName, OPENID);
  const player = {
    openid: OPENID,
    nickName,
    score: 0,
    ready: false,
    combo: 0,
    stunnedUntil: 0,
    powerUps: []
  };

  const roomData = {
    roomCode,
    state: "waiting",
    ownerOpenid: OPENID,
    players: [player],
    fishes: [],
    currentMeaning: "",
    targetFishId: "",
    spellQuestion: null,
    spellSubmissions: {},
    duration: gameOptions.duration,
    gameOptions,
    winnerOpenid: "",
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  const result = await db.collection("rooms").add({ data: roomData });

  return {
    roomId: result._id,
    roomCode,
    room: {
      ...roomData,
      _id: result._id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  };
});
