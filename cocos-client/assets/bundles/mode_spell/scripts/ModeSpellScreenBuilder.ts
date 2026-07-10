import type { Node } from "cc";
import type { RuntimeUi } from "../../../scripts/components/ui/RuntimeUi";
import { gameplayScreens } from "../../../scripts/core/GameplayBundles";
import { CoopSpellScene } from "./CoopSpellScene";
import { SpellLetterKey } from "./SpellLetterKey";

function buildSpell(parent: Node, ui: RuntimeUi): Node {
  const root = ui.root(parent, "SpellRuntimeScreen");
  const meaning = ui.label(root, "SpellMeaning", "", 0, 274, 650, 44, 27);
  const word = ui.label(root, "SpellWord", "", 0, 230, 780, 44, 27);
  const team = ui.label(root, "SpellTeam", "", -270, 188, 230, 34, 19);
  const totalTimer = ui.label(root, "SpellTotal", "", 0, 188, 190, 34, 19, "warning");
  const questionTimer = ui.label(root, "SpellQuestion", "", 270, 188, 190, 34, 19, "warning");
  const localPanel = ui.panel(root, "LocalSpellPanel", 0, 116, 700, 104, "panel", "spellLocal");
  const localTitle = ui.label(localPanel, "LocalSpellTitle", "", -205, 26, 250, 36, 19, "spellLocal", 0);
  const localInput = ui.label(localPanel, "LocalSpellInput", "", 0, -16, 360, 58, 31, "textPrimary");
  const localProgress = ui.label(localPanel, "LocalSpellProgress", "", 245, 26, 150, 34, 17, "textMuted");
  const teammate = ui.label(root, "TeammateSpell", "", 0, 42, 700, 38, 18, "spellPartner");
  const status = ui.label(root, "SpellStatus", "", 0, 4, 760, 34, 17, "textMuted");
  const letterKeys: SpellLetterKey[] = [];
  ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].forEach((letters, row) => {
    const width = letters.length * 62 + (letters.length - 1) * 6;
    Array.from(letters).forEach((letter, column) => {
      let key!: SpellLetterKey;
      const ref = ui.button(root, `Key${letter}`, letter, -width / 2 + 31 + column * 68,
        -51 - row * 51, 62, 43, () => key.tap(), "plain", 18);
      key = ref.node.addComponent(SpellLetterKey);
      key.letterLabel = ref.label;
      key.keyButton = ref.button;
      letterKeys.push(key);
    });
  });
  let controller!: CoopSpellScene;
  const backspace = ui.button(root, "SpellBackspace", "⌫", -300, -213, 90, 44, () => controller.backspace(), "plain", 25);
  const clear = ui.button(root, "SpellClear", "清空", -185, -213, 110, 44, () => controller.clearDraft(), "plain", 17);
  const submit = ui.button(root, "SpellSubmit", "提交", 0, -213, 160, 48, () => void controller.submit());
  const skip = ui.button(root, "SpellSkip", "跳过", 185, -213, 110, 44,
    () => void controller.skip(), "secondary", 17);
  ui.button(root, "LeaveSpell", "←", -420, -274, 62, 46, () => controller.backHome(), "plain", 28);
  controller = root.addComponent(CoopSpellScene);
  controller.meaningLabel = meaning;
  controller.wordLabel = word;
  controller.teamScoreLabel = team;
  controller.totalTimerLabel = totalTimer;
  controller.questionTimerLabel = questionTimer;
  controller.localTitleLabel = localTitle;
  controller.localInputLabel = localInput;
  controller.localProgressLabel = localProgress;
  controller.teammateLabel = teammate;
  controller.statusLabel = status;
  controller.submitButton = submit.button;
  controller.backspaceButton = backspace.button;
  controller.clearButton = clear.button;
  controller.skipButton = skip.button;
  controller.letterKeys = letterKeys;
  return root;
}

gameplayScreens.register("coopSpell", buildSpell);
