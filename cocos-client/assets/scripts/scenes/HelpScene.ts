import { _decorator, Component } from "cc";
import { app } from "../core/App";

const { ccclass } = _decorator;

export const HELP_RULES = [
  ["背单词", "浏览词库，隐藏中文、收录生词。", "practice"],
  ["双人 PK", "按中文选英文：对 +100，错 -100。", "create"],
  ["默契捕词赛", "两人作答，合计团队成绩。", "join"],
  ["同舟拼词记", "双方各填两空，统一判定；每词 20 秒。", "bank"],
  ["房间准备", "两人准备，房主开始。", "catalog"],
  ["战绩记录", "三种对战保留近 50 局与最佳分。", "history"]
] as const;

@ccclass("HelpScene")
export class HelpScene extends Component {
  onLoad(): void {
    app.store.setRoute("help");
  }

  backCatalog(): void {
    app.router.navigate("coopSelect");
  }
}
