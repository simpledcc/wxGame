import { _decorator, Color, Component, Label } from "cc";
import type { FishingFeedback } from "../../../scripts/store/FishingStore";

const { ccclass, property } = _decorator;
const FEEDBACK_LIFETIME_SECONDS = 0.85;
const FEEDBACK_RISE_PER_SECOND = 54;

@ccclass("GameplayFeedbackPool")
export class GameplayFeedbackPool extends Component {
  @property([Label])
  labels: Label[] = [];

  private successColor = new Color(22, 133, 72, 255);
  private errorColor = new Color(197, 58, 49, 255);
  private warningColor = new Color(199, 120, 19, 255);
  private readonly remaining = new Map<Label, number>();
  private cursor = 0;
  private lastFeedbackId = 0;

  configure(successColor: Color, errorColor: Color, warningColor: Color): void {
    this.successColor = successColor;
    this.errorColor = errorColor;
    this.warningColor = warningColor;
    this.clear();
  }

  show(feedback: FishingFeedback | null): void {
    if (!feedback || feedback.id === this.lastFeedbackId || this.labels.length === 0) return;
    this.lastFeedbackId = feedback.id;
    const label = this.labels[this.cursor % this.labels.length];
    this.cursor = (this.cursor + 1) % this.labels.length;
    label.string = feedback.text;
    label.color = feedback.type === "correction" || feedback.type === "stunned"
      ? this.warningColor
      : (feedback.delta < 0 || feedback.type === "error" ? this.errorColor : this.successColor);
    label.node.setPosition(0, 0, 0);
    label.node.active = true;
    this.remaining.set(label, FEEDBACK_LIFETIME_SECONDS);
  }

  update(deltaTime: number): void {
    const elapsed = Math.max(0, Number(deltaTime) || 0);
    this.labels.forEach((label) => {
      const left = this.remaining.get(label) || 0;
      if (left <= 0 || !label.node.active) return;
      const next = Math.max(0, left - elapsed);
      label.node.setPosition(
        label.node.position.x,
        label.node.position.y + FEEDBACK_RISE_PER_SECOND * elapsed,
        label.node.position.z
      );
      if (next === 0) label.node.active = false;
      this.remaining.set(label, next);
    });
  }

  clear(): void {
    this.remaining.clear();
    this.labels.forEach((label) => {
      label.string = "";
      label.node.active = false;
      label.node.setPosition(0, 0, 0);
    });
  }

  onDestroy(): void {
    this.clear();
  }
}
