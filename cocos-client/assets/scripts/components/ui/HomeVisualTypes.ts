export const HOME_VISUAL_SLOT_KEYS = [
  "background",
  "logo",
  "avatar",
  "coin",
  "character",
  "createRoom",
  "joinRoom",
  "practice",
  "wordBank",
  "catalog",
  "history",
  "settings",
  "privacy",
  "feedback"
] as const;

export type HomeVisualSlotKey = typeof HOME_VISUAL_SLOT_KEYS[number];
