const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const BOT_NAMES = {
  high: "Emma",
  medium: "Jack",
  low: "Lily"
};

const VALID_DIFFICULTIES = ["low", "medium", "high"];

function normalizeDifficulty(value) {
  return VALID_DIFFICULTIES.includes(value) ? value : "medium";
}

function normalizeBotName(name, difficulty) {
  const text = String(name || BOT_NAMES[difficulty] || "Jack").trim();
  return text ? text.slice(0, 12) : BOT_NAMES[difficulty];
}

function makeBot(room, difficulty, botName) {
  const code = room.roomCode || room._id || Date.now();
  return {
    openid: `bot_${code}`,
    nickName: botName,
    score: 0,
    ready: true,
    isBot: true,
    botDifficulty: difficulty,
    combo: 0,
    stunnedUntil: 0,
    powerUps: [],
    powerUp: null
  };
}

exports.main = async (event) => {
  const started = Date.now();
  const { OPENID } = cloud.getWXContext();
  const roomId = event.roomId;
  console.log("[addBot] start", {
    roomId: String(roomId || "").slice(-6),
    difficulty: event.difficulty,
    botName: event.botName
  });
  if (!roomId) throw new Error("缺少房间 ID");
  const difficulty = normalizeDifficulty(event.difficulty);
  const botName = normalizeBotName(event.botName, difficulty);

  const snapshot = await db.collection("rooms").doc(roomId).get();
  const room = snapshot.data;
  if (!room) throw new Error("房间不存在");
  if (room.state !== "waiting") throw new Error("游戏已经开始");
  if (room.gameOptions && room.gameOptions.matchMode === "coop") {
    throw new Error("双人合作玩法需要两名真实玩家，不能加入机器人");
  }

  const players = room.players || [];
  const requester = players.find((player) => player.openid === OPENID);
  if (!requester) throw new Error("你不在这个房间中");

  const botIndex = players.findIndex((player) => player.isBot || String(player.openid || "").indexOf("bot_") === 0);
  if (botIndex >= 0) {
    players[botIndex] = {
      ...players[botIndex],
      nickName: botName,
      ready: true,
      isBot: true,
      botDifficulty: difficulty,
      combo: 0,
      stunnedUntil: 0,
      powerUps: [],
      powerUp: null
    };
  } else {
    if (players.length >= 2) throw new Error("房间已满");
    players.push(makeBot(room, difficulty, botName));
  }

  const gameOptions = {
    ...(room.gameOptions || {}),
    botDifficulty: difficulty
  };

  await db.collection("rooms").doc(roomId).update({
    data: {
      players,
      gameOptions,
      updatedAt: db.serverDate()
    }
  });

  console.log("[addBot] success", {
    elapsed: Date.now() - started,
    roomId: String(roomId || "").slice(-6),
    difficulty,
    botName,
    playerCount: players.length,
    botCount: players.filter((player) => player.isBot || String(player.openid || "").indexOf("bot_") === 0).length
  });

  return {
    ok: true,
    players,
    gameOptions,
    room: {
      ...room,
      players,
      gameOptions,
      updatedAt: Date.now()
    }
  };
};
