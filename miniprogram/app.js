const config = require("./config");

App({
  globalData: {
    openid: "",
    playerName: "玩家",
    cloudReady: false,
    privacyReady: false
  },

  onLaunch() {
    console.log("[legacy-app] launch", { envId: config.envId || "dynamic" });
  },

  initCloudIfNeeded() {
    if (this.globalData.cloudReady) return true;
    if (!wx.cloud) {
      wx.showModal({
        title: "提示",
        content: "当前微信版本不支持云开发，请升级微信或开发者工具。",
        showCancel: false
      });
      return false;
    }
    const cloudOptions = { traceUser: false };
    if (config.envId) cloudOptions.env = config.envId;
    wx.cloud.init(cloudOptions);
    this.globalData.cloudReady = true;
    console.log("[legacy-app] cloud.init", cloudOptions);
    return true;
  },

  ensurePrivacyAuthorized() {
    if (this.globalData.privacyReady) {
      this.initCloudIfNeeded();
      return Promise.resolve();
    }
    if (!wx.requirePrivacyAuthorize) {
      wx.showModal({
        title: "隐私保护提示",
        content: "当前微信版本不支持隐私授权弹窗，请升级微信后继续。",
        showCancel: false
      });
      return Promise.reject(new Error("privacy api unavailable"));
    }
    return new Promise((resolve, reject) => {
      wx.requirePrivacyAuthorize({
        success: () => {
          this.globalData.privacyReady = true;
          this.initCloudIfNeeded();
          resolve();
        },
        fail: (err) => {
          wx.showToast({ title: "请先同意隐私保护指引", icon: "none" });
          reject(err || new Error("privacy permission denied"));
        }
      });
    });
  }
});
