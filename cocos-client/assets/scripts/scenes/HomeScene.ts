import { _decorator, Component, Label } from "cc";
import { app } from "../core/App";

const { ccclass, property } = _decorator;

@ccclass("HomeScene")
export class HomeScene extends Component {
  @property(Label)
  statusLabel: Label | null = null;

  onLoad(): void {
    app.store.setRoute("home");
  }

  start(): void {
    const state = app.store.getState();
    if (this.statusLabel) {
      this.statusLabel.string = state.cloudReady ? "云环境已连接" : "首页占位";
    }
  }

  openStudy(): void {
    app.router.navigate("study");
  }

  openPkRoom(): void {
    app.store.patch({ selectedMode: "pk" });
    app.router.navigate("room");
  }

  openCoopSelect(): void {
    app.router.navigate("coopSelect");
  }

  openHistory(): void {
    app.router.navigate("history");
  }
}

