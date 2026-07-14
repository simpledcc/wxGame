import { _decorator, Component } from "cc";
import { app } from "../core/App";

const { ccclass } = _decorator;

@ccclass("CoopSelectScene")
export class CoopSelectScene extends Component {
  onLoad(): void {
    app.store.setRoute("coopSelect");
  }

  openModeSetup(): void {
    app.store.patch({ selectedMode: "pk", roomEntryIntent: "create" });
    app.router.navigate("room");
  }

  backHome(): void {
    app.router.navigate("home");
  }
}
