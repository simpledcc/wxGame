export type PrivacyCapability =
  | "cloud"
  | "storage"
  | "room"
  | "feedback"
  | "share";

export class PrivacyRequiredError extends Error {
  readonly code = "PRIVACY_REQUIRED";

  constructor(readonly capability: PrivacyCapability) {
    super("请先阅读并同意隐私保护指引");
    this.name = "PrivacyRequiredError";
  }
}
