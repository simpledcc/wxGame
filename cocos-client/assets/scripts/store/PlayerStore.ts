export interface LocalPlayerState {
  openid: string;
  displayName: "玩家";
}

export class PlayerStore {
  private localPlayer: LocalPlayerState = {
    openid: "",
    displayName: "玩家"
  };

  getLocalPlayer(): LocalPlayerState {
    return { ...this.localPlayer };
  }

  setOpenId(openid: string): void {
    this.localPlayer = { ...this.localPlayer, openid };
  }
}

