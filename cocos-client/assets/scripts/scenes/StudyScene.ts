import { _decorator, Component, Label } from "cc";
import { app } from "../core/App";

const { ccclass, property } = _decorator;

@ccclass("StudyScene")
export class StudyScene extends Component {
  @property(Label)
  wordLabel: Label | null = null;

  @property(Label)
  meaningLabel: Label | null = null;

  @property(Label)
  statusLabel: Label | null = null;

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

  hideChinese(): void {
    app.studyStore.setShowMeaning(false);
    this.renderCard();
  }

  showChinese(): void {
    app.studyStore.setShowMeaning(true);
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

  changeBank(): void {
    app.router.openBankPicker("study");
  }

  private renderCard(): void {
    const words = app.wordBankStore.getSelectedWords(app.wordBankCatalog);
    const card = app.studyStore.getCard(words);
    if (!card) {
      if (this.wordLabel) this.wordLabel.string = "暂无单词";
      if (this.meaningLabel) this.meaningLabel.string = "";
      if (this.statusLabel) this.statusLabel.string = "请先选择有单词的词库";
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
  }
}
