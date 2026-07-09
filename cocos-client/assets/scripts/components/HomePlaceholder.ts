import { _decorator, Component, Label } from "cc";
import { SCORE_MODE_LABELS } from "../domain/ScoreRules";
import { app } from "../core/App";
import { getWordBank, getWordBankLabel } from "../domain/WordBankRules";

const { ccclass, property } = _decorator;

@ccclass("HomePlaceholder")
export class HomePlaceholder extends Component {
  @property(Label)
  titleLabel: Label | null = null;

  @property(Label)
  bodyLabel: Label | null = null;

  start(): void {
    if (this.titleLabel) {
      this.titleLabel.string = "词斗乐园单词比拼";
    }
    if (this.bodyLabel) {
      const bank = getWordBank(app.wordBankCatalog, app.wordBankStore.getSelectedBankId());
      this.bodyLabel.string = [
        "Cocos 迁移进行中",
        `当前词库：${getWordBankLabel(bank, true)} · ${app.wordBankStore.getSelectedWords(app.wordBankCatalog).length}词`,
        `金币：${app.wordBankStore.getWordCoins()}`,
        `模式：${SCORE_MODE_LABELS.pk.label} / ${SCORE_MODE_LABELS.coopShared.label} / ${SCORE_MODE_LABELS.coopSpell.label}`,
        "当前阶段已接入词库和背词核心逻辑"
      ].join("\n");
    }
  }
}
