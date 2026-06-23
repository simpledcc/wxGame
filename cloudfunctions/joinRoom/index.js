const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function normalizeName(name) {
  const text = String(name || "").trim();
  return text ? text.slice(0, 12) : "玩家";
}

exports.main = async (event) => {
  const started = Date.now();
  const { OPENID } = cloud.getWXContext();
  const roomCode = String(event.roomCode || "").trim().toUpperCase();
  console.log("[joinRoom] start", { roomCode });
  if (!roomCode) throw new Error("请输入房间码");

  const snapshot = await db.collection("rooms").where({ roomCode }).limit(1).get();
  const room = snapshot.data[0];
  if (!room) throw new Error("房间不存在");
  if (room.state !== "waiting") throw new Error("游戏已经开始");

  const players = room.players || [];
  const index = players.findIndex((item) => item.openid === OPENID);
  if (index >= 0) {
    players[index].nickName = normalizeName(event.nickName);
  } else {
    const nextPlayer = {
      openid: OPENID,
      nickName: normalizeName(event.nickName),
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
