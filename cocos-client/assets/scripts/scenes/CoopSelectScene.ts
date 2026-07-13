import { _decorator, Component, Label } from "cc";
import { app } from "../core/App";
import { getWordBank, getWordBankLabel } from "../domain/WordBankRules";

const { ccclass, property } = _decorator;

@ccclass("CoopSelectScene")
export class CoopSelectScene extends Component {
  @property(Label)
  statusLabel: Label | null = null;

  onLoad(): void {
    app.store.setRoute("coopSelect");
  }

  start(): void {
    const bank = getWordBank(app.wordBankCatalog, app.wordBankStore.getSelectedBankId());
    if (this.statusLabel) {
      this.statusLabel.string = [
        `当前词库：${getWordBankLabel(bank, true)}`,
        "准备体验模式已开放，更多玩法正在筹备"
      ].join("\n");
    }
  }

  openTrialRoom(): void {
    app.roomSession.leave();
    app.store.patch({ selectedMode: "pk", roomEntryIntent: "create" });
    app.router.navigate("room");
  }

  openSharedRoom(): void {
    app.roomSession.leave();
    app.store.patch({ selectedMode: "coopShared", roomEntryIntent: "neutral" });
    app.router.navigate("room");
  }

  openSpellRoom(): void {
    app.roomSession.leave();
    app.store.patch({ selectedMode: "coopSpell", roomEntryIntent: "neutral" });
    app.router.navigate("room");
  }

  changeBank(): void {
    app.router.openBankPicker("coopSelect");
  }

  backHome(): void {
    app.router.navigate("home");
  }
}
