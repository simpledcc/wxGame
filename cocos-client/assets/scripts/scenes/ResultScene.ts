import { _decorator, Component, Label } from "cc";
import { app } from "../core/App";

const { ccclass, property } = _decorator;

@ccclass("ResultScene")
export class ResultScene extends Component {
  @property(Label)
  titleLabel: Label | null = null;

  @property(Label)
  scoreLabel: Label | null = null;

  @property(Label)
  playersLabel: Label | null = null;

  private unsubscribe: (() => void) | null = null;
  private unsubscribeSpell: (() => void) | null = null;

  onLoad(): void {
    app.store.setRoute("result");
    this.unsubscribe = app.fishingStore.subscribe(() => this.render());
    this.unsubscribeSpell = app.coopSpellStore.subscribe(() => this.render());
  }

  start(): void {
    this.render();
  }

  onDestroy(): void {
    this.unsubscribe?.();
    this.unsubscribeSpell?.();
    this.unsubscribe = null;
    this.unsubscribeSpell = null;
  }

  backHome(): void {
    app.roomSession.leave();
    app.fishingMatch.reset();
    app.coopSpell.reset();
    app.router.navigate("home");
  }

  openHistory(): void {
    app.router.navigate("history");
  }

  private render(): void {
    const record = app.coopSpellStore.getState().result || app.fishingStore.getState().result;
    if (!record) {
      if (this.titleLabel) this.titleLabel.string = "正在同步结算";
      if (this.scoreLabel) this.scoreLabel.string = "";
      if (this.playersLabel) this.playersLabel.string = "";
      return;
    }
    if (this.titleLabel) this.titleLabel.string = record.result;
    if (this.scoreLabel) this.scoreLabel.string = `${record.score} 分`;
    if (this.playersLabel) {
      this.playersLabel.string = record.players
        .map((player) => `${player.nickName} ${player.score} 分`)
        .join("\n");
    }
  }
}
