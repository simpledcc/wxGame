import { _decorator, Component, Label } from "cc";
import type { PreGameProgressRef } from "../components/ui/PreGameUi";
import { RuntimeButtonVisual } from "../components/ui/RuntimeButtonVisual";
import { app } from "../core/App";

const { ccclass } = _decorator;

@ccclass("StudyScene")
export class StudyScene extends Component {
  wordLabel: Label | null = null;
  meaningLabel: Label | null = null;
  statusLabel: Label | null = null;
  meaningToggleLabel: Label | null = null;

  progressView: PreGameProgressRef | null = null;
  meaningToggleVisual: RuntimeButtonVisual | null = null;
  wrongVisual: RuntimeButtonVisual | null = null;

  onLoad(): void {
    app.store.setRoute("study");
  }

  start(): void {
    const words = app.wordBankStore.getSelectedWords(app.wordBankCatalog);
    if (!app.studyStore.getCard(words)) {
      app.studyStore.start(words);
    }
    this.renderCard();
  }

  toggleChinese(): void {
    app.studyStore.setShowMeaning(!app.studyStore.getSession().showMeaning);
    this.renderCard();
  }

  revealCurrentMeaning(): void {
    app.studyStore.revealCurrentMeaning();
    this.renderCard();
  }

  nextWord(): void {
    const words = app.wordBankStore.getSelectedWords(app.wordBankCatalog);
    app.studyStore.next(words);
    this.renderCard();
  }

  previousWord(): void {
    const words = app.wordBankStore.getSelectedWords(app.wordBankCatalog);
    app.studyStore.previous(words);
    this.renderCard();
  }

  randomWord(): void {
    const words = app.wordBankStore.getSelectedWords(app.wordBankCatalog);
    app.studyStore.shuffle(words);
    this.renderCard();
  }

  markCurrentUnfamiliar(): void {
    const words = app.wordBankStore.getSelectedWords(app.wordBankCatalog);
    const card = app.studyStore.getCard(words);
    if (!card) {
      app.runtime.showToast("当前没有可加入的单词");
      return;
    }
    const added = app.wordBankStore.addWrongWord({ word: card.word, meaning: card.meaning });
    if (!added) {
      app.runtime.showToast("这个单词已在错题库中");
      return;
    }
    try {
      app.storage.writeWrongWords(app.wordBankStore.getWrongWords());
      app.runtime.showToast("已加入错题库");
    } catch {
      app.runtime.showToast("已加入错题库，但本地保存失败");
    }
    this.renderCard();
  }

  changeBank(): void {
    app.router.openBankPicker("study");
  }

  backHome(): void {
    app.router.navigate("home");
  }

  private renderCard(): void {
    const words = app.wordBankStore.getSelectedWords(app.wordBankCatalog);
    const card = app.studyStore.getCard(words);
    if (!card) {
      if (this.wordLabel) this.wordLabel.string = "暂无单词";
      if (this.meaningLabel) this.meaningLabel.string = "";
      if (this.statusLabel) this.statusLabel.string = "请先选择有单词的词库";
      this.progressView?.setValue(0, 1);
      this.meaningToggleVisual?.setSelected(false);
      this.wrongVisual?.setSelected(false);
      return;
    }
    if (this.wordLabel) {
      this.wordLabel.string = card.word;
    }
    if (this.meaningLabel) {
      this.meaningLabel.string = card.meaningVisible ? card.meaning : "";
    }
    if (this.statusLabel) {
      this.statusLabel.string = `${card.index + 1}/${card.total}`;
    }
    this.progressView?.setValue(card.index + 1, card.total);
    this.meaningToggleVisual?.setSelected(app.studyStore.getSession().showMeaning);
    const marked = app.wordBankStore.getWrongWords().some((item) => item.word === card.word);
    this.wrongVisual?.setSelected(marked);
    const markLabel = this.wrongVisual?.node.getChildByName("MarkWrongTitle")?.getComponent(Label);
    if (markLabel) markLabel.string = marked ? "已在错题库" : "标记错词";
    if (this.meaningToggleLabel) {
      this.meaningToggleLabel.string = app.studyStore.getSession().showMeaning
        ? "隐藏后续单词中文"
        : "显示后续单词中文";
    }
  }
}
