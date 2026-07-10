import { Button, Graphics, type Node } from "cc";
import { gameplayScreens } from "../../../scripts/core/GameplayBundles";
import type { RuntimeUi } from "../../../scripts/components/ui/RuntimeUi";
import { CoopSharedScene } from "./CoopSharedScene";
import { GameplayFeedbackPool } from "./GameplayFeedbackPool";
import { PkGameScene } from "./PkGameScene";
import { PkWordTarget } from "./PkWordTarget";
import { ThemedWordTargetVisual } from "./ThemedWordTargetVisual";

class ModePkScreenBuilder {
  buildPk(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "PkRuntimeScreen");
    const meaning = ui.label(root, "PkMeaning", "", 0, 260, 590, 54, 30);
    const localScore = ui.label(root, "PkLocalScore", "", -285, 205, 220, 40, 21);
    const opponentScore = ui.label(root, "PkOpponentScore", "", 285, 205, 220, 40, 21);
    const timer = ui.label(root, "PkTimer", "", 0, 205, 120, 40, 24, "warning");
    const combo = ui.label(root, "PkCombo", "", 0, 166, 220, 34, 19, "secondary");
    const status = ui.label(root, "PkStatus", "", 0, -220, 700, 40, 18, "textMuted");
    const targets = this.createWordTargets(root, ui, 125);
    const feedbackPool = this.createFeedbackPool(root, ui);
    let controller!: PkGameScene;
    const power = ui.button(root, "PowerUp", "使用道具", 255, -272, 200, 46, () => {
      void controller.useFirstPowerUp();
    }, "secondary", 17);
    ui.button(root, "LeavePk", "←", -420, -272, 62, 46, () => controller.backHome(), "plain", 28);
    controller = root.addComponent(PkGameScene);
    controller.meaningLabel = meaning;
    controller.localScoreLabel = localScore;
    controller.opponentScoreLabel = opponentScore;
    controller.timerLabel = timer;
    controller.comboLabel = combo;
    controller.statusLabel = status;
    controller.powerUpButton = power.button;
    controller.wordTargets = targets;
    controller.feedbackPool = feedbackPool;
    return root;
  }

  buildShared(parent: Node, ui: RuntimeUi): Node {
    const root = ui.root(parent, "SharedRuntimeScreen");
    const meaning = ui.label(root, "SharedMeaning", "", 0, 260, 600, 54, 30);
    const team = ui.label(root, "SharedTeam", "", -250, 205, 260, 40, 22);
    const contribution = ui.label(root, "SharedContribution", "", 80, 205, 300, 40, 20);
    const timer = ui.label(root, "SharedTimer", "", 340, 205, 120, 40, 24, "warning");
    const status = ui.label(root, "SharedStatus", "", 0, -220, 720, 40, 18, "textMuted");
    const targets = this.createWordTargets(root, ui, 125);
    const feedbackPool = this.createFeedbackPool(root, ui);
    let controller!: CoopSharedScene;
    ui.button(root, "LeaveShared", "←", -420, -272, 62, 46, () => controller.backHome(), "plain", 28);
    controller = root.addComponent(CoopSharedScene);
    controller.meaningLabel = meaning;
    controller.teamScoreLabel = team;
    controller.contributionLabel = contribution;
    controller.timerLabel = timer;
    controller.statusLabel = status;
    controller.wordTargets = targets;
    controller.feedbackPool = feedbackPool;
    return root;
  }

  private createWordTargets(parent: Node, ui: RuntimeUi, firstY: number): PkWordTarget[] {
    return Array.from({ length: 6 }, (_, index) => {
      const node = ui.node(parent, `WordTarget${index}`, index % 2 ? 240 : -240,
        firstY - Math.floor(index / 2) * 82, 260, 58);
      const visual = node.addComponent(ThemedWordTargetVisual);
      visual.graphics = node.addComponent(Graphics);
      visual.configure(ui.theme.targetStyle, ui.color("targetFill"), ui.color("targetStroke"));
      const label = ui.label(node, "Word", "", 0, 0, 238, 48, 21, "targetText");
      const button = node.addComponent(Button);
      const target = node.addComponent(PkWordTarget);
      node.on(Button.EventType.CLICK, () => target.tap(), this);
      target.wordLabel = label;
      target.tapButton = button;
      target.leftBound = -340;
      target.rightBound = 340;
      return target;
    });
  }

  private createFeedbackPool(parent: Node, ui: RuntimeUi): GameplayFeedbackPool {
    const host = ui.node(parent, "GameplayFeedback", 0, -92, 460, 70);
    const pool = host.addComponent(GameplayFeedbackPool);
    pool.labels = Array.from({ length: 3 }, (_, index) => {
      const label = ui.label(host, `Feedback${index}`, "", 0, 0, 440, 54, 31, "success");
      label.node.active = false;
      return label;
    });
    pool.configure(ui.color("success"), ui.color("error"), ui.color("warning"));
    return pool;
  }
}

const builder = new ModePkScreenBuilder();
gameplayScreens.register("pkGame", (parent, ui) => builder.buildPk(parent, ui));
gameplayScreens.register("coopShared", (parent, ui) => builder.buildShared(parent, ui));
