import type { FeedbackContext } from "../domain/CloudFunctionTypes";
import type { CloudService } from "./CloudService";

export class FeedbackService {
  constructor(private readonly cloud: CloudService) {}

  submit(content: string, contact = "", context: FeedbackContext = {}) {
    return this.cloud.call("submitFeedback", {
      content,
      contact,
      playerName: "玩家",
      context
    });
  }
}

