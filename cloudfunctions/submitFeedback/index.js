const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const FEEDBACK_COLLECTION = "feedbacks";

function normalizeText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength || 300);
}

function normalizeContext(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    scene: normalizeText(source.scene, 40),
    roomId: normalizeText(source.roomId, 80),
    roomCode: normalizeText(source.roomCode, 20),
    bankId: normalizeText(source.bankId, 80),
    mode: normalizeText(source.mode, 40),
    matchMode: normalizeText(source.matchMode, 40),
    coopMode: normalizeText(source.coopMode, 40),
    duration: Number(source.duration || 0),
    clientVersion: normalizeText(source.clientVersion, 40),
    system: normalizeText(source.system, 120),
    platform: normalizeText(source.platform, 40)
  };
}

async function ensureCollection() {
  if (!db.createCollection) return;
  try {
    await db.createCollection(FEEDBACK_COLLECTION);
  } catch (err) {
    const message = String((err && (err.errMsg || err.message)) || "");
    if (message.indexOf("already exist") < 0 && message.indexOf("exists") < 0 && message.indexOf("collection exist") < 0) {
      console.warn("[submitFeedback] createCollection.skip", { errMsg: message });
    }
  }
}

exports.main = async (event) => {
  const started = Date.now();
  const wxContext = cloud.getWXContext();
  const content = normalizeText(event.content, 300);
  const contact = normalizeText(event.contact, 80);
  const playerName = normalizeText(event.playerName, 20) || "玩家";
  if (content.length < 4) {
    throw new Error("反馈内容太短，请多写一点");
  }

  await ensureCollection();
  const data = {
    openid: wxContext.OPENID || "",
    appid: wxContext.APPID || "",
    playerName,
    content,
    contact,
    context: normalizeContext(event.context),
    status: "new",
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };
  const result = await db.collection(FEEDBACK_COLLECTION).add({ data });
  console.log("[submitFeedback] success", {
    elapsed: Date.now() - started,
    id: result && result._id,
    contentLength: content.length,
    hasContact: !!contact,
    scene: data.context.scene
  });
  return {
    ok: true,
    id: result && result._id
  };
};
