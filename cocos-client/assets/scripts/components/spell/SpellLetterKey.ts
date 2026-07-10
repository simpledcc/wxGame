import { _decorator, Button, Component, Label } from "cc";

const { ccclass, property } = _decorator;

@ccclass("SpellLetterKey")
export class SpellLetterKey extends Component {
  @property(Label)
  letterLabel: Label | null = null;

  @property(Button)
  keyButton: Button | null = null;

  private letter = "";
  private tapHandler: ((letter: string) => void) | null = null;

  bind(letter: string, tapHandler: (letter: string) => void): void {
    this.letter = String(letter || "").slice(0, 1).toUpperCase();
    this.tapHandler = tapHandler;
    this.node.active = !!this.letter;
    if (this.letterLabel) this.letterLabel.string = this.letter;
  }

  setInteractable(interactable: boolean): void {
    if (this.keyButton) this.keyButton.interactable = interactable && !!this.letter;
  }

  clear(): void {
    this.letter = "";
    this.tapHandler = null;
    this.node.active = false;
  }

  tap(): void {
    if (this.letter && this.node.active) this.tapHandler?.(this.letter);
  }
}
