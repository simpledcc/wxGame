const app = getApp();

Page({
  data: {
    roomId: "",
    roomCode: "",
    players: [],
    ready: false,
    canStart: false,
    hint: "双方都准备后即可开始。",
    readyLoading: false,
    starting: false
  },

  onLoad(query) {
    console.log("[legacy-room] load", { roomId: String(query.roomId || "").slice(-6), roomCode: query.roomCode });
    this.setData({
      roomId: query.roomId,
      roomCode: query.roomCode
    });
    this.ensureOpenId().then(() => this.watchRoom());
  },

  onUnload() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  },

  ensureOpenId() {
    if (app.globalData.openid) {
      return Promise.resolve(app.globalData.openid);
    }
    return wx.cloud.callFunction({ name: "getOpenId" }).then((res) => {
      app.globalData.openid = res.result.openid;
      return res.result.openid;
    });
  },

  watchRoom() {
    const db = wx.cloud.database();
    console.log("[legacy-room] watch.start", { roomId: String(this.data.roomId || "").slice(-6) });
    this.watcher = db.collection("rooms")
      .where({ _id: this.data.roomId })
      .watch({
        onChange: (snapshot) => {
          const room = snapshot.docs[0];
          if (!room) return;
          console.log("[legacy-room] watch.change", {
            roomId: String(this.data.roomId || "").slice(-6),
            state: room.state,
            playerCount: (room.players || []).length,
            readyCount: (room.players || []).filter((item) => item.ready).length
          });
          const rawPlayers = room.players || [];
          const me = rawPlayers.find((item) => item.openid === app.globalData.openid);
          const allReady = rawPlayers.length === 2 && rawPlayers.every((item) => item.ready);
          const players = rawPlayers.map((item) => ({
            ...item,
            avatarText: item.nickName ? item.nickName.slice(0, 1) : "玩"
          }));
          this.setData({
            players,
            ready: !!(me && me.ready),
            canStart: allReady,
            hint: allReady ? "准备好了，房主或任意玩家都可以开始。" : "双方都准备后即可开始。"
          });
          if (room.state === "playing") {
            wx.redirectTo({
              url: `/pages/game/game?roomId=${this.data.roomId}&roomCode=${this.data.roomCode}`
            });
          }
        },
        onError: (err) => {
          console.error("[legacy-room] watch.fail", { roomId: String(this.data.roomId || "").slice(-6), errMsg: err && (err.errMsg || err.message) });
          wx.showToast({ title: err.message || "房间监听失败", icon: "none" });
        }
      });
  },

  copyCode() {
    wx.setClipboardData({ data: this.data.roomCode });
  },

  toggleReady() {
    if (this.data.readyLoading) {
      console.warn("[legacy-room] ready.blocked", {});
      return;
    }
    const started = Date.now();
    console.log("[legacy-room] ready.start", { roomId: String(this.data.roomId || "").slice(-6), ready: !this.data.ready });
    this.setData({ readyLoading: true });
    wx.cloud.callFunction({
      name: "toggleReady",
      data: {
        roomId: this.data.roomId,
        ready: !this.data.ready
      },
      fail: (err) => wx.showToast({ title: err.errMsg || "操作失败", icon: "none" }),
      complete: () => this.setData({ readyLoading: false })
    });
  },

  startGame() {
    if (!this.data.canStart || this.data.starting) return;
    this.setData({ starting: true });
    wx.cloud.callFunction({
      name: "startGame",
      data: { roomId: this.data.roomId },
      fail: (err) => wx.showToast({ title: err.errMsg || "无法开始", icon: "none" }),
      complete: () => this.setData({ starting: false })
    });
  }
});
