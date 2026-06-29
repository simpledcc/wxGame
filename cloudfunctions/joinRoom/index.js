const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

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

exports.main = async (event) => {
  const started = Date.now();
  const { OPENID } = cloud.getWXContext();
  const roomCode = String(event.roomCode || "").trim().toUpperCase();
  const nickName = normalizeName(event.nickName);
  await checkTextSafety(nickName, OPENID);
  console.log("[joinRoom] start", { roomCode });
  if (!roomCode) throw new Error("请输入房间码");

  const snapshot = await db.collection("rooms").where({ roomCode }).limit(1).get();
  const room = snapshot.data[0];
  if (!room) throw new Error("房间不存在");
  if (room.state !== "waiting") throw new Error("游戏已经开始");

  const players = room.players || [];
  const index = players.findIndex((item) => item.openid === OPENID);
  if (index >= 0) {
    players[index].nickName = nickName;
  } else {
    const nextPlayer = {
      openid: OPENID,
      nickName,
      score: 0,
      ready: false,
      combo: 0,
      stunnedUntil: 0,
      powerUps: []
    };
    const botIndex = players.findIndex((player) => player.isBot || String(player.openid || "").indexOf("bot_") === 0);
    if (players.length >= 2) {
      if (botIndex < 0) throw new Error("房间已满");
      players[botIndex] = nextPlayer;
    } else {
      players.push(nextPlayer);
    }
  }

  await db.collection("rooms").doc(room._id).update({
    data: {
      players,
      updatedAt: db.serverDate()
    }
  });

  console.log("[joinRoom] success", {
    elapsed: Date.now() - started,
    roomCode,
    roomId: String(room._id || "").slice(-6),
    playerCount: players.length,
    existed: index >= 0
  });

  return {
    roomId: room._id,
    roomCode,
    openid: OPENID
  };
};
