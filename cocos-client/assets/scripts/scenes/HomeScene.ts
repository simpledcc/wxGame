import { _decorator, Component, Label } from "cc";
import { app } from "../core/App";
import { getWordBank, getWordBankLabel } from "../domain/WordBankRules";

const { ccclass, property } = _decorator;

@ccclass("HomeScene")
export class HomeScene extends Component {
  @property(Label)
  statusLabel: Label | null = null;

  onLoad(): void {
    app.store.setRoute("home");
  }

  start(): void {
    const state = app.store.getState();
    const bank = getWordBank(app.wordBankCatalog, app.wordBankStore.getSelectedBankId());
    if (this.statusLabel) {
      this.statusLabel.string = [
        state.cloudReady ? "云环境已连接" : "首页占位",
        `词库：${getWordBankLabel(bank, true)}`,
        `金币：${app.wordBankStore.getWordCoins()}`
      ].join("\n");
    }
  }

  openStudy(): void {
    const words = app.wordBankStore.getSelectedWords(app.wordBankCatalog);
    if (!words.length) {
      app.runtime.showToast("当前词库暂无单词");
      return;
    }
    app.studyStore.start(words, { showMeaning: true });
    app.router.navigate("study");
  }

  openBankPicker(): void {
    app.router.openBankPicker("home");
  }

  openPkRoom(): void {
    app.store.patch({ selectedMode: "pk" });
    app.router.navigate("room");
  }

  openCoopSelect(): void {
    app.router.navigate("coopSelect");
  }

  openHistory(): void {
    app.router.navigate("history");
  }
}
