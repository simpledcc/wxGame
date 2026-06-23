const config = require("./config");

App({
  globalData: {
    openid: "",
    playerName: ""
  },

  onLaunch() {
    console.log("[legacy-app] launch", { envId: config.envId || "dynamic" });
    if (!wx.cloud) {
      console.error("[legacy-app] cloud.unavailable", {});
      wx.showModal({
        title: "提示",
        content: "当前微信版本不支持云开发，请升级微信或开发者工具。",
        showCancel: false
      });
      return;
    }

    const cloudOptions = { traceUser: true };
    if (config.envId) {
      cloudOptions.env = config.envId;
    }
    wx.cloud.init(cloudOptions);
    console.log("[legacy-app] cloud.init", cloudOptions);

    const started = Date.now();
    console.log("[legacy-app] getOpenId.start", {});
    wx.cloud.callFunction({
      name: "getOpenId",
      success: (res) => {
        this.globalData.openid = res.result.openid;
        console.log("[legacy-app] getOpenId.success", { elapsed: Date.now() - started, hasOpenid: !!this.globalData.openid });
      },
      fail: (err) => {
        console.error("[legacy-app] getOpenId.fail", { elapsed: Date.now() - started, errMsg: err && (err.errMsg || err.message) });
      }
    });
  }
});
