import { _decorator, Button, Component, EditBox, Label } from "cc";
import { app } from "../core/App";
import { getFeedbackValidationError, normalizeFeedbackDraft } from "../domain/FeedbackRules";

const { ccclass, property } = _decorator;

@ccclass("FeedbackScene")
export class FeedbackScene extends Component {
  @property(EditBox)
  contentInput: EditBox | null = null;

  @property(EditBox)
  contactInput: EditBox | null = null;

  @property(Label)
  statusLabel: Label | null = null;

  @property(Label)
  privacyLabel: Label | null = null;

  @property(Button)
  submitButton: Button | null = null;

  private submitting = false;
  private destroyed = false;
  private submitSequence = 0;

  onLoad(): void {
    app.store.setRoute("feedback");
  }

  start(): void {
    if (this.privacyLabel) {
      this.privacyLabel.string = `提交时会处理反馈内容和可选联系方式，详见${app.privacy.contractName}`;
    }
    this.render();
  }

  onDestroy(): void {
    this.destroyed = true;
    this.submitSequence += 1;
    this.submitting = false;
  }

  async submit(): Promise<void> {
    if (this.destroyed || this.submitting) return;
    const draft = normalizeFeedbackDraft(
      this.contentInput?.string || "",
      this.contactInput?.string || ""
    );
    const validationError = getFeedbackValidationError(draft);
    if (validationError) {
      if (this.statusLabel) this.statusLabel.string = validationError;
      app.runtime.showToast(validationError);
      return;
    }
    const sequence = ++this.submitSequence;
    this.submitting = true;
    this.render("正在检查并提交...");
    const room = app.roomStore.getRoom();
    const state = app.store.getState();
    try {
      await app.feedback.submit(draft.content, draft.contact, {
        scene: "feedback",
        roomId: room?._id || "",
        roomCode: room?.roomCode || "",
        bankId: state.bankId,
        mode: state.selectedMode,
        matchMode: room?.gameOptions.matchMode || "",
        coopMode: room?.gameOptions.coopMode || "",
        clientVersion: "3.8.8"
      });
      if (!this.isCurrentSubmission(sequence)) return;
      if (this.contentInput) this.contentInput.string = "";
      if (this.contactInput) this.contactInput.string = "";
      this.render("反馈已提交，谢谢你的帮助");
    } catch (error) {
      if (!this.isCurrentSubmission(sequence)) return;
      const message = error instanceof Error ? error.message : "提交失败，请稍后再试";
      this.render(message);
      app.runtime.showToast(message);
    } finally {
      if (!this.isCurrentSubmission(sequence)) return;
      this.submitting = false;
      this.render(this.statusLabel?.string || "");
    }
  }

  async openPrivacyContract(): Promise<void> {
    try {
      const opened = await app.privacy.openContract();
      if (!this.destroyed && !opened) {
        app.runtime.showToast("暂时无法打开隐私保护指引");
      }
    } catch {
      if (!this.destroyed) {
        app.runtime.showToast("隐私保护指引暂时无法打开，请稍后重试");
      }
    }
  }

  backHome(): void {
    app.router.navigate("home");
  }

  private render(message = "请描述遇到的问题或建议"): void {
    if (this.destroyed) return;
    if (this.statusLabel) this.statusLabel.string = message;
    if (this.submitButton) this.submitButton.interactable = !this.submitting;
  }

  private isCurrentSubmission(sequence: number): boolean {
    return !this.destroyed && sequence === this.submitSequence;
  }
}
