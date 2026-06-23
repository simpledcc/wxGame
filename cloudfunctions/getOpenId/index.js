const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async () => {
  const started = Date.now();
  console.log("[getOpenId] start", {});
  const wxContext = cloud.getWXContext();
  console.log("[getOpenId] success", {
    elapsed: Date.now() - started,
    hasOpenid: !!wxContext.OPENID,
    appid: wxContext.APPID || ""
  });
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID
  };
};
