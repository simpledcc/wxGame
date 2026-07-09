import { _decorator, Component, Label } from "cc";
import { app } from "../core/App";

const { ccclass, property } = _decorator;

@ccclass("BootScene")
export class BootScene extends Component {
  @property(Label)
  statusLabel: Label | null = null;

  async start(): Promise<void> {
    this.setStatus("正在初始化...");
    await app.boot();
    this.setStatus("初始化完成");
    app.router.navigate("home");
  }

  private setStatus(message: string): void {
    if (this.statusLabel) {
      this.statusLabel.string = message;
    }
  }
}

