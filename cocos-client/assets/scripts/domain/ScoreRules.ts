import type { GameModeKey } from "./GameTypes";

export const SCORE_MODE_LABELS: Record<GameModeKey, { label: string; shortLabel: string }> = {
  pk: { label: "双人PK", shortLabel: "PK" },
  coopShared: { label: "默契捕词赛", shortLabel: "捕词" },
  coopSpell: { label: "同舟拼词记", shortLabel: "拼词" }
};

export const NORMAL_HIT_SCORE = 100;
export const NORMAL_MISS_SCORE = -100;
export const COOP_SPELL_ROUND_SCORE = 100;

