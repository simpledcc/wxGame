export const COOP_SPELL_QUESTION_SECONDS = 20;
export const LETTER_KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

export function getExpectedSegmentLength(playerIndex: number): number {
  return playerIndex <= 1 ? 2 : 0;
}

