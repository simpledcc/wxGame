import { _decorator, Component } from "cc";

const { ccclass } = _decorator;

@ccclass("PrimaryButton")
export class PrimaryButton extends Component {
  clickHandler: (() => void) | null = null;

  onClick(): void {
    this.clickHandler?.();
  }
}

