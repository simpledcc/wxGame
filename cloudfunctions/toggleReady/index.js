const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const started = Date.now();
  const { OPENID } = cloud.getWXContext();
  const roomId = event.roomId;
  console.log("[toggleReady] start", {
    roomId: String(roomId || "").slice(-6),
    ready: !!event.ready
  });
  if (!roomId) throw new Error("缺少房间 ID");

  const snapshot = await db.collection("rooms").doc(roomId).get();
  const room = snapshot.data;
  if (!room) throw new Error("房间不存在");
  if (room.state !== "waiting") throw new Error("游戏已经开始");

  const players = (room.players || []).map((player) => {
    if (player.openid !== OPENID) return player;
    return {
      ...player,
      ready: !!event.ready
    };
  });

  if (!players.some((player) => player.openid === OPENID)) {
    throw new Error("你不在这个房间中");
  }

  await db.collection("rooms").doc(roomId).update({
    data: {
      players,
      updatedAt: db.serverDate()
    }
  });

  console.log("[toggleReady] success", {
    elapsed: Date.now() - started,
    roomId: String(roomId || "").slice(-6),
    ready: !!event.ready,
    playerCount: players.length,
    readyCount: players.filter((player) => player.ready).length
  });

  return {
    ok: true,
    players,
    room: {
      ...room,
      players,
      updatedAt: Date.now()
    }
  };
};
