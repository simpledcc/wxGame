import { _decorator, Component, Label } from "cc";
import { app } from "../core/App";

const { ccclass, property } = _decorator;

@ccclass("HelpScene")
export class HelpScene extends Component {
  @property(Label)
  bodyLabel: Label | null = null;

  onLoad(): void {
    app.store.setRoute("help");
  }

  start(): void {
    if (!this.bodyLabel) return;
    this.bodyLabel.string = [
      "背单词：浏览当前词库，可隐藏中文或把生词加入错题库。",
      "双人PK：根据中文提示点击正确英文，正确 +100，错误 -100。",
      "默契捕词赛：两名玩家共同作答，双方得分合计为团队成绩。",
      "同舟拼词记：双方各填写两个空位，提交后统一判定；每词 20 秒。",
      "房间：两名玩家加入并准备后，由房主开始。",
      "战绩：三种对战玩法分别保留最近 50 局和历史最佳。"
    ].join("\n\n");
  }

  backHome(): void {
    app.router.navigate("home");
  }
}
