import { _decorator, Component, Label } from "cc";
import { app } from "../core/App";
import { getWordBank, getWordBankLabel } from "../domain/WordBankRules";

const { ccclass, property } = _decorator;

@ccclass("HomeScene")
export class HomeScene extends Component {
  @property(Label)
  statusLabel: Label | null = null;

  onLoad(): void {
    if (app.store.getState().route === "boot") {
      app.store.setRoute("home");
    }
  }

  start(): void {
    const state = app.store.getState();
    const bank = getWordBank(app.wordBankCatalog, app.wordBankStore.getSelectedBankId());
    if (this.statusLabel) {
      this.statusLabel.string = [
        `${state.cloudReady ? "云环境已连接" : "正在连接云环境"} · 系统玩家：${app.playerStore.getLocalPlayer().displayName} · 金币：${app.wordBankStore.getWordCoins()}`,
        `当前词库：${getWordBankLabel(bank, true)}`
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
    app.roomSession.leave();
    app.store.patch({ selectedMode: "pk" });
    app.router.navigate("room");
  }

  openCoopSelect(): void {
    app.roomSession.leave();
    app.router.navigate("coopSelect");
  }

  openHistory(): void {
    app.router.navigate("history");
  }

  openFeedback(): void {
    app.router.navigate("feedback");
  }

  openHelp(): void {
    app.router.navigate("help");
  }

  async openPrivacyContract(): Promise<void> {
    try {
      const opened = await app.privacy.openContract();
      if (!opened) app.runtime.showToast("暂时无法打开隐私保护指引");
    } catch {
      app.runtime.showToast("隐私保护指引暂时无法打开，请稍后重试");
    }
  }

  async copyPerformanceReport(): Promise<void> {
    try {
      await app.runtime.setClipboardText(app.performance.serializeSnapshot());
      app.runtime.showToast("性能报告已复制");
    } catch {
      app.runtime.showToast("性能报告复制失败");
    }
  }
}
