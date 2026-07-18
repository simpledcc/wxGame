import { _decorator, Component, Label } from "cc";
import { app } from "../core/App";
import { getWordBank, getWordBankLabel } from "../domain/WordBankRules";

const { ccclass, property } = _decorator;

@ccclass("HomeScene")
export class HomeScene extends Component {
  @property(Label)
  playerLabel: Label | null = null;

  @property(Label)
  coinLabel: Label | null = null;

  @property(Label)
  bankLabel: Label | null = null;

  @property(Label)
  historySummaryLabel: Label | null = null;

  private active = true;
  private navigating = false;

  onLoad(): void {
    if (app.store.getState().route === "boot") {
      app.store.setRoute("home");
    }
  }

  start(): void {
    this.refreshDisplay();
  }

  onDestroy(): void {
    this.active = false;
  }

  refreshDisplay(): void {
    const bank = getWordBank(app.wordBankCatalog, app.wordBankStore.getSelectedBankId());
    if (this.playerLabel) this.playerLabel.string = app.playerStore.getLocalPlayer().displayName;
    if (this.coinLabel) this.coinLabel.string = String(app.wordBankStore.getWordCoins());
    if (this.bankLabel) this.bankLabel.string = getWordBankLabel(bank, true);
    if (this.historySummaryLabel) {
      const best = app.historyStore.getBestScores();
      const scores = [best.pk?.score, best.coopShared?.score, best.coopSpell?.score]
        .filter((score): score is number => typeof score === "number");
      this.historySummaryLabel.string = scores.length
        ? `历史最高 ${Math.max(...scores)} 分`
        : "暂无战绩，完成比赛后查看";
    }
  }

  openStudy(): void {
    const words = app.wordBankStore.getSelectedWords(app.wordBankCatalog);
    if (!words.length) {
      app.runtime.showToast("当前词库暂无单词");
      return;
    }
    this.navigateOnce(() => {
      app.studyStore.start(words, { showMeaning: true });
      app.router.navigate("study");
    });
  }

  openBankPicker(): void {
    this.navigateOnce(() => app.router.openBankPicker("home"));
  }

  openModeCatalog(): void {
    this.navigateOnce(() => {
      app.roomSession.leave();
      app.router.navigate("coopSelect");
    });
  }

  openJoinRoom(): void {
    this.navigateOnce(() => {
      app.roomSession.leave();
      app.store.patch({ selectedMode: "pk", roomEntryIntent: "join" });
      app.router.navigate("room");
    });
  }

  openHistory(): void {
    this.navigateOnce(() => app.router.navigate("history"));
  }

  openFeedback(): void {
    this.navigateOnce(() => app.router.navigate("feedback"));
  }

  toggleMuted(): boolean {
    const current = app.settingsStore.isMuted();
    const next = !current;
    try {
      app.audio.setMuted(next);
      app.settingsStore.setMuted(next);
      return next;
    } catch {
      if (this.active) app.runtime.showToast("音效设置保存失败，请重试");
      return current;
    }
  }

  async openPrivacyContract(): Promise<void> {
    try {
      const opened = await app.privacy.openContract();
      if (this.active && !opened) app.runtime.showToast("暂时无法打开隐私保护指引");
    } catch {
      if (this.active) app.runtime.showToast("隐私保护指引暂时无法打开，请稍后重试");
    }
  }

  private navigateOnce(action: () => void): void {
    if (!this.active || this.navigating) return;
    this.navigating = true;
    try {
      action();
    } catch {
      this.navigating = false;
      if (this.active) app.runtime.showToast("页面暂时无法打开，请重试");
    }
  }
}
