const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function getWinnerOpenId(players) {
  if (players.length < 2) return "";
  if (players[0].score === players[1].score) return "";
  return players[0].score > players[1].score ? players[0].openid : players[1].openid;
}

function hasTimedOut(room) {
  if (!room.startedAt) return false;
  const startedAt = new Date(room.startedAt).getTime();
  return Date.now() - startedAt >= (room.duration || 60) * 1000;
}

function isCoopRoom(room) {
  return !!(room && room.gameOptions && room.gameOptions.matchMode === "coop");
}

function isCoopSpellRoom(room) {
  return !!(room && room.gameOptions && room.gameOptions.matchMode === "coop" && room.gameOptions.coopMode === "spell");
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

function getActiveSpellSubmissions(submissions) {
  const source = submissions && typeof submissions === "object" ? submissions : {};
  const result = {};
  Object.keys(source).forEach((openid) => {
    if (openid.charAt(0) === "_") return;
    result[openid] = source[openid];
  });
  return result;
}

function parseSpellRoundRecord(value) {
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

function getSpellHistory(room) {
  const source = Array.isArray(room && room.spellHistory) ? room.spellHistory : [];
  return source.map(parseSpellRoundRecord).filter(Boolean);
}

function serializeSpellHistory(history) {
  return history.slice(-80).map((item) => JSON.stringify(item));
}

function makeIncompleteSpellRecord(room, players, now) {
  const question = parseSpellQuestion(room.spellQuestion);
  if (!question || !question.id) return null;
  const history = getSpellHistory(room);
  if (history.some((item) => item && item.questionId === question.id)) return null;
  const submissions = getActiveSpellSubmissions(room.spellSubmissions);
  const segments = Array.isArray(question.segments) ? question.segments : [];
  const teamScore = Number(room.teamScore || 0);
  return {
    questionId: question.id,
    word: question.word,
    meaning: question.meaning,
    mask: question.mask,
    reason: "gameOver",
    correct: false,
    delta: 0,
    teamScore,
    finishedAt: now,
    players: players.slice(0, 2).map((player, index) => {
      const segment = segments.find((item) => item.openid === player.openid) || segments[index] || {};
      const submission = submissions[player.openid] || {};
      const answer = String(submission.answer || "").trim().toLowerCase();
      const expected = String(segment.answer || "").trim().toLowerCase();
      return {
        openid: player.openid || "",
        nickName: player.nickName || "玩家",
        slotIndexes: Array.isArray(segment.slotIndexes) ? segment.slotIndexes : [],
        expectedLength: expected.length,
        submitted: !!submission.submittedAt,
        answer,
        correct: !!expected && answer === expected,
        submittedAt: submission.submittedAt || 0
      };
    })
  };
}

exports.main = async (event) => {
  const started = Date.now();
  const roomId = event.roomId;
  console.log("[finishGame] start", { roomId: String(roomId || "").slice(-6) });
  if (!roomId) throw new Error("缺少房间 ID");

  try {
  const result = await db.runTransaction(async (transaction) => {
    const roomRef = transaction.collection("rooms").doc(roomId);
    const snapshot = await roomRef.get();
    const room = snapshot.data;
    if (!room) throw new Error("房间不存在");
    if (room.state === "finished") return { ok: true };
    if (room.state !== "playing" || !hasTimedOut(room)) {
      return { ok: false, reason: "not_timeout" };
    }

    const players = room.players || [];
    const winnerOpenid = isCoopRoom(room) ? "" : getWinnerOpenId(players);
    const updateData = {
      state: "finished",
      winnerOpenid,
      finishedAt: db.serverDate(),
      updatedAt: db.serverDate()
    };
    if (isCoopSpellRoom(room)) {
      const record = makeIncompleteSpellRecord(room, players, Date.now());
      if (record) {
        updateData.spellHistory = serializeSpellHistory([...getSpellHistory(room), record]);
      }
    }
    await roomRef.update({
        data: updateData
      });
    return { ok: true, winnerOpenid };
  });
  console.log("[finishGame] success", {
    elapsed: Date.now() - started,
    roomId: String(roomId || "").slice(-6),
    ok: !!(result && result.ok),
    reason: result && result.reason,
    hasWinner: !!(result && result.winnerOpenid)
  });
  return result;
  } catch (err) {
    console.error("[finishGame] fail", {
      elapsed: Date.now() - started,
      roomId: String(roomId || "").slice(-6),
      errMsg: err && (err.errMsg || err.message)
    });
    throw err;
  }
};
