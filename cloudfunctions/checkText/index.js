const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function normalizeText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength || 300);
}

function getErrCode(err) {
  const code = err && (err.errCode || err.errcode || err.code);
  return Number(code || 0);
}

function assertTextSafetyResult(result, label) {
  const errCode = Number((result && (result.errCode || result.errcode)) || 0);
  const suggest = result && result.result && result.result.suggest;
  if (errCode === 87014 || suggest === "risky" || suggest === "review") {
    throw new Error(`${label || "内容"}包含不合规信息，请修改后再试`);
  }
  if (errCode && errCode !== 0) {
    throw new Error("内容安全检测失败，请稍后再试");
  }
}

async function msgSecCheck(content, openid, label, scene) {
  const text = normalizeText(content, 300);
  if (!text) return;
  if (!cloud.openapi || !cloud.openapi.security || !cloud.openapi.security.msgSecCheck) {
    throw new Error("内容安全检测暂不可用，请稍后再试");
  }
  try {
    const result = await cloud.openapi.security.msgSecCheck({
      content: text,
      version: 2,
      scene: scene || 1,
      openid
    });
    assertTextSafetyResult(result, label);
  } catch (err) {
    if (getErrCode(err) === 87014) {
      throw new Error(`${label || "内容"}包含不合规信息，请修改后再试`);
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

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const label = normalizeText(event.label, 20) || "内容";
  const scene = Number(event.scene || 1);
  const content = normalizeText(event.content, Number(event.maxLength || 300));
  await msgSecCheck(content, wxContext.OPENID, label, scene);
  return { ok: true };
};
