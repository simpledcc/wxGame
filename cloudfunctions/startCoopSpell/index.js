const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const VALID_DURATIONS = [30, 60, 90, 120];
let importedSpellWordBanks = null;

function getImportedSpellWordBanks() {
  if (!importedSpellWordBanks) {
    importedSpellWordBanks = (require("./spellWordBankData").SPELL_WORD_BANKS || {});
  }
  return importedSpellWordBanks;
}

function normalizeWords(words) {
  if (!Array.isArray(words)) return [];
  const seen = new Set();
  return words
    .map((item) => ({
      word: String(item && item.word ? item.word : "").trim(),
      meaning: String(item && item.meaning ? item.meaning : "").trim()
    }))
    .filter((item) => {
      const key = item.word.toLowerCase();
      if (!/^[a-zA-Z]{4,18}$/.test(item.word) || !item.meaning || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 240);
}

function isBotPlayer(player) {
  return !!(player && (player.isBot || String(player.openid || "").indexOf("bot_") === 0));
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

function hashSpellTemplateText(text) {
  let hash = 2166136261;
  const value = String(text || "");
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

function nextSpellTemplateSeed(seed) {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}

function pickStableBlankPositions(word, meaning, bankId) {
  const indexes = Array.from({ length: word.length }, (_, index) => index);
  let seed = hashSpellTemplateText(`${bankId || ""}:${word}:${meaning || ""}`) || 1;
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    seed = nextSpellTemplateSeed(seed);
    const swapIndex = seed % (index + 1);
    const value = indexes[index];
    indexes[index] = indexes[swapIndex];
    indexes[swapIndex] = value;
  }
  return indexes.slice(0, 4).sort((a, b) => a - b);
}

function makeSpellTemplateFromWord(item, bankId) {
  const word = String(item && item.word ? item.word : "").trim();
  const meaning = String(item && item.meaning ? item.meaning : "").trim();
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
    mask: letters.map((letter, index) => (blankPositions.includes(index) ? "_" : letter)).join(""),
    blankPositions,
    slots
  };
}

function makeSpellQuestion(players, templates) {
  const item = templates[Math.floor(Math.random() * templates.length)];
  if (!item) return null;
  const slots = (Array.isArray(item.slots) ? item.slots : []).map((slot, index) => ({
    index,
    position: Number(slot.position),
    answer: String(slot.answer || "").slice(0, 1).toLowerCase()
  }));
  if (slots.length !== 4) return null;
  const createdAt = Date.now();
  return {
    id: `spell_${createdAt}_${Math.floor(Math.random() * 100000)}`,
    wordKey: item.key,
    word: item.word,
    meaning: item.meaning,
    mask: item.mask,
    blankPositions: item.blankPositions,
    slots,
    mode: "boatLetters",
    segments: [
      {
        openid: players[0].openid,
        start: 1,
        end: 2,
        length: 2,
        slotIndexes: [0, 1],
        answer: slots.slice(0, 2).map((slot) => slot.answer).join("")
      },
      {
        openid: players[1].openid,
        start: 3,
        end: 4,
        length: 2,
        slotIndexes: [2, 3],
        answer: slots.slice(2, 4).map((slot) => slot.answer).join("")
      }
    ],
    createdAt
  };
}

function serializeSpellQuestion(question) {
  return question ? JSON.stringify(question) : "";
}

function parseSpellQuestion(value) {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (err) {
      return null;
    }
  }
  return typeof value === "object" ? value : null;
}

function makeSafePlayer(player) {
  const safe = {
    openid: String(player.openid || ""),
    nickName: String(player.nickName || player.nickname || "玩家").slice(0, 12),
    score: 0,
    ready: true,
    combo: 0,
    stunnedUntil: 0,
    powerUps: []
  };
  if (player.avatarUrl) safe.avatarUrl = String(player.avatarUrl).slice(0, 300);
  if (player.isBot) safe.isBot = true;
  if (player.botDifficulty) safe.botDifficulty = String(player.botDifficulty).slice(0, 20);
  return safe;
}

async function applyStartUpdate(roomRef, fullData, coreData, stateData, context) {
  try {
    await roomRef.update({ data: fullData });
    return "single";
  } catch (err) {
    console.error("[startCoopSpell] update.single.fail", {
      ...context,
      errMsg: err && (err.errMsg || err.message),
      updateKeys: Object.keys(fullData)
    });
  }

  try {
    await roomRef.update({ data: coreData });
    await roomRef.update({ data: stateData });
    return "split";
  } catch (err) {
    console.error("[startCoopSpell] update.split.fail", {
      ...context,
      errMsg: err && (err.errMsg || err.message),
      coreKeys: Object.keys(coreData),
      stateKeys: Object.keys(stateData)
    });
  }

  const slimCoreData = { ...coreData };
  delete slimCoreData.players;
  delete slimCoreData.spellSubmissions;
  try {
    await roomRef.update({ data: slimCoreData });
    await roomRef.update({ data: stateData });
    return "slim";
  } catch (err) {
    console.error("[startCoopSpell] update.slim.fail", {
      ...context,
      errMsg: err && (err.errMsg || err.message),
      coreKeys: Object.keys(slimCoreData),
      stateKeys: Object.keys(stateData)
    });
    throw new Error(`startCoopSpell update.slim.fail: ${err && (err.errMsg || err.message)}`);
  }
}

exports.main = async (event) => {
  const started = Date.now();
  const roomId = String(event.roomId || "").trim();
  console.log("[startCoopSpell] start", {
    roomId: String(roomId || "").slice(-6),
    eventRoomWordCount: Array.isArray(event.roomWords) ? event.roomWords.length : 0,
    eventRoomSpellQuestionCount: Array.isArray(event.roomSpellQuestions) ? event.roomSpellQuestions.length : 0
  });
  if (!roomId) throw new Error("缺少房间 ID");

  const roomRef = db.collection("rooms").doc(roomId);
  const snapshot = await roomRef.get();
  const room = snapshot.data;
  if (!room) throw new Error("房间不存在，请重新创建房间");

  const options = room.gameOptions || {};
  if (options.matchMode !== "coop" || options.coopMode !== "spell") {
    throw new Error("当前房间不是同舟拼词记模式");
  }
  if (room.state === "playing" && room.spellQuestion) {
    return {
      ok: true,
      room: {
        ...room,
        spellQuestion: parseSpellQuestion(room.spellQuestion)
      }
    };
  }
  if (room.state !== "waiting") throw new Error("当前房间无法开始，请重新创建房间");

  const players = (room.players || []).filter((player) => player && player.openid).slice(0, 2);
  const humanPlayers = players.filter((player) => !isBotPlayer(player));
  if (humanPlayers.length < 2) throw new Error("同舟拼词记需要两名真实玩家");
  if (!players.every((player) => player.ready === true)) throw new Error("两名玩家都准备后才能开始");

  const storedWords = normalizeWords(options.roomWords);
  const eventWords = normalizeWords(event.roomWords);
  const roomWords = storedWords.length ? storedWords : eventWords;
  const storedQuestions = normalizeSpellQuestions(options.roomSpellQuestions);
  const eventQuestions = normalizeSpellQuestions(event.roomSpellQuestions);
  const importedQuestions = normalizeSpellQuestions((getImportedSpellWordBanks()[options.bankId] || []));
  const fallbackQuestions = roomWords.map((item) => makeSpellTemplateFromWord(item, options.bankId)).filter(Boolean);
  const roomQuestions = storedQuestions.length
    ? storedQuestions
    : (eventQuestions.length ? eventQuestions : (importedQuestions.length ? importedQuestions : fallbackQuestions));
  if (!roomQuestions.length) throw new Error("当前词库没有长度不少于4的拼词单词");

  const resetPlayers = players.map(makeSafePlayer);
  const spellQuestion = makeSpellQuestion(resetPlayers, roomQuestions);
  if (!spellQuestion) throw new Error("拼词题生成失败，请重新开始");

  const duration = VALID_DURATIONS.includes(Number(options.duration)) ? Number(options.duration) : 60;
  const now = Date.now();
  const serializedQuestion = serializeSpellQuestion(spellQuestion);
  const coreData = {
    players: resetPlayers,
    teamScore: 0,
    currentMeaning: spellQuestion.meaning,
    targetFishId: spellQuestion.id,
    spellQuestion: serializedQuestion,
    spellSubmissions: { _resetAt: now, _questionId: spellQuestion.id },
    winnerOpenid: "",
    duration,
    usedWords: [spellQuestion.wordKey || spellQuestion.word],
    startedAt: now,
    updatedAt: now
  };
  const stateData = {
    state: "playing",
    updatedAt: now
  };
  const updateData = {
    ...coreData,
    ...stateData
  };

  console.log("[startCoopSpell] starting", {
    roomId,
    elapsed: Date.now() - started,
    playerCount: resetPlayers.length,
    readyCount: resetPlayers.filter((player) => player.ready).length,
    roomWordCount: roomWords.length,
    roomSpellQuestionCount: roomQuestions.length,
    duration,
    minimalUpdate: true
  });

  const updateMode = await applyStartUpdate(roomRef, updateData, coreData, stateData, {
    roomId,
    elapsed: Date.now() - started,
    playerCount: resetPlayers.length,
    roomWordCount: roomWords.length,
    roomSpellQuestionCount: roomQuestions.length,
    questionChars: serializedQuestion.length
  });

  return {
    ok: true,
    updateMode,
    room: {
      ...room,
      ...updateData,
      spellQuestion,
      gameOptions: {
        ...options,
        duration,
        matchMode: "coop",
        coopMode: "spell"
      },
      startedAt: now,
      updatedAt: now
    }
  };
};
