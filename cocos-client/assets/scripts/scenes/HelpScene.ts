import { _decorator, Component } from "cc";
import { app } from "../core/App";

const { ccclass } = _decorator;

export const HELP_RULES = [
  ["赛前练习", "背诵词库，查看释义并标记错词。", "practice"],
  ["好友房间体验", "创建或加入房间，体验邀请与准备。", "join"],
  ["双人 PK 竞技", "快速抢答单词，比拼正确率与速度。", "create"],
  ["魔法对战", "答词积累能量，释放技能展开对战。", "catalog"],
  ["抢夺宝物", "完成单词挑战，争夺宝箱奖励。", "history"],
  ["搭桥与造塔", "答题收集材料，比拼建造进度。", "bank"],
  ["合作塔防", "两人共同答题，守护词斗乐园。", "join"],
  ["合作挑战 Boss", "协作完成任务，挑战强大对手。", "catalog"]
] as const;

@ccclass("HelpScene")
export class HelpScene extends Component {
  onLoad(): void {
    app.store.setRoute("help");
  }

  back(): void {
    app.router.navigate(app.store.getState().helpReturnRoute);
  }
}
