const app = getApp();

Page({
  data: {
    playerName: "",
    roomCode: "",
    creating: false,
    joining: false
  },

  onLoad() {
    console.log("[legacy-index] load", {});
    this.setData({ playerName: "玩家" });
    app.globalData.playerName = "玩家";
  },

  onNameInput(event) {
    this.setData({ playerName: "玩家" });
    app.globalData.playerName = "玩家";
  },

  onCodeInput(event) {
    this.setData({ roomCode: event.detail.value.trim().toUpperCase() });
  },

  getPlayerName() {
    app.globalData.playerName = "玩家";
    return "玩家";
  },

  createRoom() {
    if (this.data.creating) {
      console.warn("[legacy-index] create.blocked", {});
      return;
    }
    this.setData({ creating: true });
    app.ensurePrivacyAuthorized().then(() => {
      const started = Date.now();
      console.log("[legacy-index] create.start", {});
      wx.cloud.callFunction({
        name: "createRoom",
        data: { nickName: this.getPlayerName() },
        success: (res) => {
          const { roomId, roomCode } = res.result;
          console.log("[legacy-index] create.success", { elapsed: Date.now() - started, roomId: String(roomId || "").slice(-6), roomCode });
          wx.navigateTo({
            url: `/pages/room/room?roomId=${roomId}&roomCode=${roomCode}`
          });
        },
        fail: (err) => {
          console.error("[legacy-index] create.fail", { elapsed: Date.now() - started, errMsg: err && (err.errMsg || err.message) });
          wx.showToast({ title: err.errMsg || "创建失败", icon: "none" });
        },
        complete: () => this.setData({ creating: false })
      });
    }).catch(() => this.setData({ creating: false }));
  },

  joinRoom() {
    if (this.data.joining) {
      console.warn("[legacy-index] join.blocked", {});
      return;
    }
    const roomCode = this.data.roomCode;
    if (!roomCode || roomCode.length !== 6) {
      wx.showToast({ title: "请输入 6 位房间码", icon: "none" });
      return;
    }

    this.setData({ joining: true });
    app.ensurePrivacyAuthorized().then(() => {
      const started = Date.now();
      console.log("[legacy-index] join.start", { roomCode });
      wx.cloud.callFunction({
        name: "joinRoom",
        data: {
          roomCode,
          nickName: this.getPlayerName()
        },
        success: (res) => {
          const { roomId } = res.result;
          console.log("[legacy-index] join.success", { elapsed: Date.now() - started, roomId: String(roomId || "").slice(-6), roomCode });
          wx.navigateTo({
            url: `/pages/room/room?roomId=${roomId}&roomCode=${roomCode}`
          });
        },
        fail: (err) => {
          console.error("[legacy-index] join.fail", { elapsed: Date.now() - started, roomCode, errMsg: err && (err.errMsg || err.message) });
          wx.showToast({ title: err.errMsg || "加入失败", icon: "none" });
        },
        complete: () => this.setData({ joining: false })
      });
    }).catch(() => this.setData({ joining: false }));
  }
});
