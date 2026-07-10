export const FEEDBACK_MIN_LENGTH = 4;
export const FEEDBACK_MAX_LENGTH = 300;
export const FEEDBACK_CONTACT_MAX_LENGTH = 80;

export interface FeedbackDraft {
  content: string;
  contact: string;
}

export function normalizeFeedbackDraft(content: string, contact: string): FeedbackDraft {
  return {
    content: String(content || "").trim().slice(0, FEEDBACK_MAX_LENGTH),
    contact: String(contact || "").trim().slice(0, FEEDBACK_CONTACT_MAX_LENGTH)
  };
}

export function getFeedbackValidationError(draft: FeedbackDraft): string {
  if (draft.content.length < FEEDBACK_MIN_LENGTH) return "反馈内容太短，请多写一点";
  return "";
}
