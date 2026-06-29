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

function getErrCode(err) {
  const code = err && (err.errCode || err.errcode || err.code);
  return Number(code || 0);
}

function assertTextSafetyResult(result, label) {
  const errCode = Number((result && (result.errCode || result.errcode)) || 0);
  const suggest = result && result.result && result.result.suggest;
  if (errCode === 87014 || suggest === "risky" || suggest === "review") {
    throw new Error(`${label || "内容"}包含不合规信息，请修改后再提交`);
  }
  if (errCode && errCode !== 0) {
    throw new Error("内容安全检测失败，请稍后再试");
  }
}

async function checkTextSafety(content, openid, label, scene) {
  const text = String(content || "").trim();
  if (!text) return;
  if (!cloud.openapi || !cloud.openapi.security || !cloud.openapi.security.msgSecCheck) {
    throw new Error("内容安全检测暂不可用，请稍后再试");
  }
  try {
    const result = await cloud.openapi.security.msgSecCheck({
      content: text,
      version: 2,
      scene: scene || 2,
      openid
    });
    assertTextSafetyResult(result, label);
  } catch (err) {
    if (getErrCode(err) === 87014) {
      throw new Error(`${label || "内容"}包含不合规信息，请修改后再提交`);
    }
    const message = String((err && (err.errMsg || err.message)) || "");
    if (/invalid|argument|param|openid|version|scene/i.test(message)) {
      const fallback = await cloud.openapi.security.msgSecCheck({ content: text });
      assertTextSafetyResult(fallback, label);
      return;
    }
    throw err;
  }
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

  await checkTextSafety(playerName, wxContext.OPENID, "昵称", 1);
  await checkTextSafety(content, wxContext.OPENID, "反馈内容", 2);
  await checkTextSafety(contact, wxContext.OPENID, "联系方式", 2);
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
