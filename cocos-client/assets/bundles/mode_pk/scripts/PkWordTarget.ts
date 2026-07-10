import { _decorator, Button, Component, Label } from "cc";
import type { FishSnapshot } from "../../../scripts/domain/RoomTypes";

const { ccclass, property } = _decorator;

@ccclass("PkWordTarget")
export class PkWordTarget extends Component {
  @property(Label)
  wordLabel: Label | null = null;

  @property(Button)
  tapButton: Button | null = null;

  @property(Number)
  leftBound = -360;

  @property(Number)
  rightBound = 360;

  private fishId = "";
  private speed = 64;
  private direction = 1;
  private tapHandler: ((fishId: string) => void) | null = null;

  bind(
    fish: FishSnapshot,
    tapHandler: (fishId: string) => void,
    interactable = true
  ): void {
    const changed = fish.id !== this.fishId;
    this.fishId = fish.id;
    this.tapHandler = tapHandler;
    this.node.active = fish.alive;
    if (this.wordLabel) this.wordLabel.string = fish.word;
    if (this.tapButton) this.tapButton.interactable = fish.alive && interactable;
    this.speed = Math.max(24, Math.abs(Number(fish.vx || fish.speed || 8)) * 8);
    this.direction = Number(fish.vx || 1) >= 0 ? 1 : -1;
    if (changed && Number.isFinite(Number(fish.x))) {
      const ratio = Math.max(0, Math.min(100, Number(fish.x))) / 100;
      const x = this.leftBound + (this.rightBound - this.leftBound) * ratio;
      this.node.setPosition(x, this.node.position.y, this.node.position.z);
    }
  }

  clear(): void {
    this.fishId = "";
    this.tapHandler = null;
    this.node.active = false;
  }

  tap(): void {
    if (this.fishId && this.node.active) this.tapHandler?.(this.fishId);
  }

  update(deltaTime: number): void {
    if (!this.node.active || !this.fishId) return;
    let x = this.node.position.x + this.direction * this.speed * Math.max(0, deltaTime);
    if (x >= this.rightBound) {
      x = this.rightBound;
      this.direction = -1;
    } else if (x <= this.leftBound) {
      x = this.leftBound;
      this.direction = 1;
    }
    this.node.setPosition(x, this.node.position.y, this.node.position.z);
  }
}
