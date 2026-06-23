const app = getApp();

Page({
  data: {
    roomId: "",
    roomCode: "",
    meOpenid: "",
    players: [],
    fishes: [],
    renderFishes: [],
    currentMeaning: "",
    targetFishId: "",
    startedAt: 0,
    duration: 60,
    timeLeft: 60,
    state: "playing",
    stateFinished: false,
    resultTitle: ""
  },

  onLoad(query) {
    this.setData({
      roomId: query.roomId,
      roomCode: query.roomCode,
      meOpenid: app.globalData.openid
    });
    this.ensureOpenId().then(() => {
      this.watchRoom();
      this.startRenderLoop();
    });
  },

  onUnload() {
    if (this.watcher) this.watcher.close();
    if (this.renderTimer) clearInterval(this.renderTimer);
    if (this.finishTimer) clearInterval(this.finishTimer);
  },

  ensureOpenId() {
    if (app.globalData.openid) {
      this.setData({ meOpenid: app.globalData.openid });
      return Promise.resolve();
    }
    return wx.cloud.callFunction({ name: "getOpenId" }).then((res) => {
      app.globalData.openid = res.result.openid;
      this.setData({ meOpenid: res.result.openid });
    });
  },

  watchRoom() {
    const db = wx.cloud.database();
    this.watcher = db.collection("rooms")
      .where({ _id: this.data.roomId })
      .watch({
        onChange: (snapshot) => {
          const room = snapshot.docs[0];
          if (!room) return;
          const startedAt = room.startedAt ? new Date(room.startedAt).getTime() : Date.now();
          const players = (room.players || []).map((player) => ({
            ...player,
            isMine: player.openid === app.globalData.openid
          }));
          this.setData({
            players,
            fishes: room.fishes || [],
            currentMeaning: room.currentMeaning || "",
            targetFishId: room.targetFishId || "",
            startedAt,
            duration: room.duration || 60,
            state: room.state || "playing",
            stateFinished: room.state === "finished"
          });
          if (room.state === "finished") {
            this.updateResult(room);
          }
        },
        onError: (err) => {
          wx.showToast({ title: err.message || "游戏同步失败", icon: "none" });
        }
      });
  },

  startRenderLoop() {
    this.renderTimer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max(0, (now - this.data.startedAt) / 1000);
      const timeLeft = Math.max(0, Math.ceil(this.data.duration - elapsed));
      const renderFishes = (this.data.fishes || [])
        .filter((fish) => fish.alive)
        .map((fish) => this.toRenderFish(fish, elapsed));
      this.setData({ renderFishes, timeLeft });
      if (timeLeft <= 0 && this.data.state === "playing" && !this.finishing) {
        this.finishing = true;
        wx.cloud.callFunction({
          name: "finishGame",
          data: { roomId: this.data.roomId },
          complete: () => {
            this.finishing = false;
          }
        });
      }
    }, 70);
  },

  toRenderFish(fish, elapsed) {
    const x = this.bounce(fish.x + fish.vx * elapsed, 8, 92);
    const y = this.bounce(fish.y + fish.vy * elapsed, 18, 72);
    return {
      id: fish.id,
      word: fish.word,
      left: x.toFixed(2),
      top: y.toFixed(2)
    };
  },

  bounce(value, min, max) {
    const span = max - min;
    const loop = span * 2;
    let n = (value - min) % loop;
    if (n < 0) n += loop;
    return n <= span ? min + n : max - (n - span);
  },

  onFishTap(event) {
    if (this.data.state !== "playing") return;
    const fishId = event.currentTarget.dataset.id;
    wx.cloud.callFunction({
      name: "catchFish",
      data: {
        roomId: this.data.roomId,
        fishId
      },
      success: (res) => {
        const delta = res.result.delta;
        wx.showToast({
          title: delta > 0 ? "+100" : "-100",
          icon: "none",
          duration: 450
        });
      },
      fail: (err) => wx.showToast({ title: err.errMsg || "捕捉失败", icon: "none" })
    });
  },

  updateResult(room) {
    const players = room.players || [];
    const me = players.find((item) => item.openid === app.globalData.openid);
    if (!room.winnerOpenid) {
      this.setData({ resultTitle: "平局" });
      return;
    }
    this.setData({
      resultTitle: me && me.openid === room.winnerOpenid ? "你赢了" : "你输了"
    });
  },

  backHome() {
    wx.reLaunch({ url: "/pages/index/index" });
  },

  noop() {}
});
