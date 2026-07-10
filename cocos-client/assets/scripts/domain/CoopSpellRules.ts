import type {
  PlayerSnapshot,
  RoomSnapshot,
  SpellQuestion,
  SpellSegment,
  SpellSubmission,
  SpellSubmissions
} from "./RoomTypes";

export const COOP_SPELL_QUESTION_SECONDS = 20;
export const LETTER_KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

export interface SpellCellView {
  position: number;
  blank: boolean;
  letter: string;
  slotIndex?: number;
  ownerOpenid?: string;
  local: boolean;
}

export function getExpectedSegmentLength(playerIndex: number): number {
  return playerIndex <= 1 ? 2 : 0;
}

export function isCoopSpellRoom(room: RoomSnapshot): boolean {
  return room.gameOptions.matchMode === "coop" && room.gameOptions.coopMode === "spell";
}

export function getSpellQuestionId(question: SpellQuestion | null | undefined): string {
  return String(question?.id || "");
}

export function getSpellSegment(
  question: SpellQuestion | null,
  players: PlayerSnapshot[],
  openid: string
): SpellSegment | null {
  if (!question || !openid) return null;
  const byOpenId = question.segments.find((segment) => segment.openid === openid);
  if (byOpenId) return { ...byOpenId, slotIndexes: [...byOpenId.slotIndexes] };
  const playerIndex = players.findIndex((player) => player.openid === openid);
  const fallback = playerIndex >= 0 ? question.segments[playerIndex] : null;
  return fallback ? { ...fallback, slotIndexes: [...fallback.slotIndexes] } : null;
}

export function getActiveSpellSubmissions(
  submissions: SpellSubmissions | null | undefined,
  questionId: string
): Record<string, SpellSubmission> {
  if (!questionId || !submissions || typeof submissions !== "object") return {};
  const result: Record<string, SpellSubmission> = {};
  Object.entries(submissions).forEach(([openid, value]) => {
    if (!openid || openid.startsWith("_") || !value || typeof value !== "object") return;
    if (String(value.questionId || "") !== questionId) return;
    result[openid] = { ...value };
  });
  return result;
}

export function getSpellSubmission(
  submissions: SpellSubmissions | null | undefined,
  questionId: string,
  openid: string
): SpellSubmission | null {
  return getActiveSpellSubmissions(submissions, questionId)[openid] || null;
}

export function isSpellSubmissionReady(submission: SpellSubmission | null | undefined): boolean {
  return !!submission && ["submitted", "correct", "wrong"].includes(submission.status);
}

export function normalizeSpellLetter(value: string): string {
  const letter = String(value || "").trim().slice(0, 1).toLowerCase();
  return /^[a-z]$/.test(letter) ? letter : "";
}

export function buildSpellCells(
  question: SpellQuestion | null,
  localSegment: SpellSegment | null,
  draft: string[],
  localSubmission: SpellSubmission | null
): SpellCellView[] {
  if (!question) return [];
  const slotByPosition = new Map(question.slots.map((slot) => [slot.position, slot]));
  return Array.from(question.word).map((letter, position) => {
    const slot = slotByPosition.get(position);
    if (!slot) {
      return {
        position,
        blank: false,
        letter: letter.toUpperCase(),
        local: false
      };
    }
    const owner = question.segments.find((segment) => segment.slotIndexes.includes(slot.index));
    const local = !!localSegment && owner?.openid === localSegment.openid;
    const localIndex = localSegment?.slotIndexes.indexOf(slot.index) ?? -1;
    const submittedAnswer = String(localSubmission?.answer || "");
    const value = local && localIndex >= 0
      ? (draft[localIndex] || submittedAnswer.charAt(localIndex) || "")
      : "";
    return {
      position,
      blank: true,
      letter: value.toUpperCase(),
      slotIndex: slot.index,
      ownerOpenid: owner?.openid,
      local
    };
  });
}

export function getQuestionTimeLeft(
  localQuestionStartedAt: number,
  now = Date.now()
): number {
  if (!localQuestionStartedAt) return COOP_SPELL_QUESTION_SECONDS;
  return Math.max(
    0,
    Math.ceil(COOP_SPELL_QUESTION_SECONDS - Math.max(0, now - localQuestionStartedAt) / 1000)
  );
}

