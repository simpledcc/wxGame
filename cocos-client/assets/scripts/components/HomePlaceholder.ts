import { _decorator, Component, Label } from "cc";
import { SCORE_MODE_LABELS } from "../domain/ScoreRules";

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
      this.bodyLabel.string = [
        "Cocos 迁移骨架已启动",
        `模式：${SCORE_MODE_LABELS.pk.label} / ${SCORE_MODE_LABELS.coopShared.label} / ${SCORE_MODE_LABELS.coopSpell.label}`,
        "当前阶段只提供首页占位和服务适配雏形"
      ].join("\n");
    }
  }
}

