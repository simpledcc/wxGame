import { _decorator, Component, Label } from "cc";
import { app } from "../core/App";
import {
  getWordBank,
  getWordBankLabel,
  resolveBankSelection
} from "../domain/WordBankRules";

const { ccclass, property } = _decorator;

@ccclass("BankScene")
export class BankScene extends Component {
  @property(Label)
  statusLabel: Label | null = null;

  onLoad(): void {
    app.store.setRoute("bank");
  }

  start(): void {
    this.renderStatus();
  }

  selectBank(bankId: string): void {
    if (!getWordBank(app.wordBankCatalog, bankId)) {
      app.runtime.showToast("词库不存在");
      return;
    }
    app.store.setBankPickerSelectedBankId(bankId);
    this.renderStatus();
  }

  unlockSelectedBank(): void {
    const bankId = app.store.getState().bankPickerSelectedBankId;
    const previousProgress = app.wordBankStore.getProgressSnapshot();
    const result = app.wordBankStore.unlockBank(app.wordBankCatalog, bankId);
    if (!result.ok) {
      app.runtime.showToast(this.getUnlockErrorText(result.reason));
      this.renderStatus();
      return;
    }
    if (!app.persistWordBankProgress()) {
      app.wordBankStore.restoreProgress(app.wordBankCatalog, previousProgress);
      app.runtime.showToast("解锁失败，本地保存不可用，金币未扣除");
      this.renderStatus();
      return;
    }
    app.runtime.showToast("词库已解锁");
    this.renderStatus();
  }

  confirmSelection(): void {
    const state = app.store.getState();
    const bankId = state.bankPickerSelectedBankId;
    const result = resolveBankSelection(
      app.wordBankCatalog,
      app.wordBankStore.getUnlockedBankIds(),
      bankId,
      app.wordBankStore.getWrongWords()
    );
    if (!result.ok) {
      app.runtime.showToast(this.getSelectionErrorText(result.reason));
      return;
    }
    app.wordBankStore.selectBank(app.wordBankCatalog, bankId);
    const target = app.store.confirmBankSelection(bankId, result.mode);
    if (target === "study") {
      const showMeaning = app.studyStore.getSession().showMeaning;
      app.studyStore.start(app.wordBankStore.getSelectedWords(app.wordBankCatalog), { showMeaning });
    }
    app.router.navigate(target);
  }

  back(): void {
    app.router.returnFromBankPicker();
  }

  private renderStatus(): void {
    if (!this.statusLabel) {
      return;
    }
    const state = app.store.getState();
    const bank = getWordBank(app.wordBankCatalog, state.bankPickerSelectedBankId);
    const unlocked = app.wordBankStore.isUnlocked(app.wordBankCatalog, state.bankPickerSelectedBankId);
    this.statusLabel.string = [
      "选择词库",
      `当前：${getWordBankLabel(bank, false)}`,
      unlocked ? "状态：已解锁" : "状态：未解锁",
      `金币：${app.wordBankStore.getWordCoins()}`
    ].join("\n");
  }

  private getUnlockErrorText(reason: string): string {
    if (reason === "insufficientCoins") {
      return "金币不足，暂时无法解锁";
    }
    if (reason === "alreadyUnlocked") {
      return "词库已经解锁";
    }
    if (reason === "notUnlockable") {
      return "该词库无需解锁";
    }
    return "词库无法解锁";
  }

  private getSelectionErrorText(reason?: string): string {
    if (reason === "locked") {
      return "先解锁这个词库";
    }
    if (reason === "emptyWrongWords") {
      return "错题库为空，先去普通单元练习";
    }
    return "请先选择词库";
  }
}
