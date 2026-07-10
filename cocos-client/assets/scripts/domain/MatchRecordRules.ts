import type { BestScore, GameModeKey } from "./GameTypes";
import { normalizeDuration } from "./MatchRules";
import type {
  MatchRecord,
  PlayerSnapshot,
  RoomSnapshot,
  SpellRoundPlayerRecord,
  SpellRoundReason,
  SpellRoundRecord
} from "./RoomTypes";
import { SCORE_MODE_LABELS } from "./ScoreRules";
import { MATCH_RECORD_LIMIT } from "./StorageKeys";

function toTimestamp(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  if (value instanceof Date) return value.getTime();
  const timestamp = typeof value === "string" ? Date.parse(value) : Number(value);
  return Number.isFinite(timestamp) && timestamp >= 0 ? timestamp : fallback;
}

function getModeKey(value: Record<string, unknown>): GameModeKey {
  if (value.modeKey === "coopShared" || value.modeKey === "coopSpell" || value.modeKey === "pk") {
    return value.modeKey;
  }
  const options = value.gameOptions as Record<string, unknown> | undefined;
  if (options?.matchMode === "coop") {
    return options.coopMode === "spell" ? "coopSpell" : "coopShared";
  }
  const text = [value.id, value.modeLabel, value.result].map(String).join(" ");
  if (/coopSpell|同舟拼词记|小船拼词|合作拼词|双人拼词/.test(text)) return "coopSpell";
  if (/coopShared|默契捕词赛|双人闯关|合作闯关|合作完成/.test(text)) return "coopShared";
  return "pk";
}

function parseSpellPlayer(value: unknown, index: number): SpellRoundPlayerRecord {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    openid: String(source.openid || ""),
    nickName: `玩家${index + 1}`,
    slotIndexes: Array.isArray(source.slotIndexes)
      ? source.slotIndexes.map(Number).filter(Number.isFinite)
      : [],
    expectedLength: Number(source.expectedLength || 0),
    submitted: source.submitted === true,
    answer: String(source.answer || ""),
    correct: source.correct === true,
    submittedAt: Number(source.submittedAt || 0)
  };
}

export function normalizeSpellRound(value: unknown, index = 0): SpellRoundRecord | null {
  let source = value;
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return null;
    }
  }
  if (!source || typeof source !== "object") return null;
  const record = source as Record<string, unknown>;
  const reasonText = String(record.reason || "answered");
  const reason: SpellRoundReason = ["answered", "manualSkip", "timeout", "gameOver"].includes(reasonText)
    ? reasonText as SpellRoundReason
    : "answered";
  return {
    questionId: String(record.questionId || `round_${index}`),
    word: String(record.word || ""),
    meaning: String(record.meaning || ""),
    mask: String(record.mask || ""),
    reason,
    correct: record.correct === true,
    delta: Number(record.delta || 0),
    teamScore: Number(record.teamScore || 0),
    finishedAt: toTimestamp(record.finishedAt, Date.now()),
    players: (Array.isArray(record.players) ? record.players : [])
      .slice(0, 2)
      .map(parseSpellPlayer)
  };
}

function publicPlayerName(player: Partial<PlayerSnapshot>, index: number): string {
  if (player.isBot || String(player.openid || "").startsWith("bot_")) {
    return String(player.nickName || "机器人").slice(0, 12);
  }
  return `玩家${index + 1}`;
}

export function normalizeMatchRecord(value: unknown): MatchRecord | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const playersSource = Array.isArray(source.players) ? source.players : [];
  if (!source.id || !playersSource.length) return null;
  const modeKey = getModeKey(source);
  const players = playersSource.slice(0, 2).map((item, index) => {
    const player = item && typeof item === "object" ? item as Partial<PlayerSnapshot> : {};
    return {
      openid: String(player.openid || ""),
      nickName: publicPlayerName(player, index),
      score: Number(player.score || 0)
    };
  });
  const explicitScore = Number(source.score);
  const teamScore = Number(source.teamScore);
  const score = Number.isFinite(explicitScore)
    ? explicitScore
    : (modeKey === "coopSpell" && Number.isFinite(teamScore)
      ? teamScore
      : (modeKey === "pk" ? Number(players[0]?.score || 0) : players.reduce((sum, player) => sum + player.score, 0)));
  const finishedAt = toTimestamp(source.finishedAt, Date.now());
  return {
    id: String(source.id),
    modeKey,
    modeLabel: SCORE_MODE_LABELS[modeKey].label,
    roomCode: String(source.roomCode || ""),
    finishedAt,
    result: modeKey === "pk"
      ? String(source.result || "平局")
      : `${SCORE_MODE_LABELS[modeKey].label}完成`,
    winnerOpenid: String(source.winnerOpenid || ""),
    duration: normalizeDuration(Number(source.duration) || 60),
    bankLabel: String(source.bankLabel || "词库"),
    score,
    teamScore: modeKey === "coopSpell" ? score : undefined,
    spellHistory: modeKey === "coopSpell"
      ? (Array.isArray(source.spellHistory) ? source.spellHistory : [])
          .map(normalizeSpellRound)
          .filter((item): item is SpellRoundRecord => !!item)
      : [],
    players
  };
}

export function createMatchRecord(
  room: RoomSnapshot,
  localOpenId: string,
  bankLabel: string
): MatchRecord | null {
  const roomId = String(room._id || "");
  if (!roomId || !room.players.length) return null;
  const modeKey: GameModeKey = room.gameOptions.matchMode !== "coop"
    ? "pk"
    : (room.gameOptions.coopMode === "spell" ? "coopSpell" : "coopShared");
  if (modeKey === "pk" && room.players.length < 2) return null;
  const localPlayer = room.players.find((player) => player.openid === localOpenId) || room.players[0];
  const score = modeKey === "pk"
    ? Number(localPlayer?.score || 0)
    : (modeKey === "coopSpell"
      ? Number(room.teamScore || 0)
      : room.players.reduce((sum, player) => sum + Number(player.score || 0), 0));
  const result = modeKey !== "pk"
    ? `${SCORE_MODE_LABELS[modeKey].label}完成`
    : (!room.winnerOpenid ? "平局" : (room.winnerOpenid === localOpenId ? "胜利" : "失败"));
  return normalizeMatchRecord({
    id: `${modeKey}:${roomId}`,
    modeKey,
    roomCode: room.roomCode,
    finishedAt: room.finishedAt || room.updatedAt || Date.now(),
    result,
    winnerOpenid: room.winnerOpenid,
    duration: room.duration,
    bankLabel,
    score,
    teamScore: modeKey === "coopSpell" ? score : undefined,
    spellHistory: room.spellHistory || [],
    players: room.players
  });
}

export function mergeMatchRecords(records: unknown[]): MatchRecord[] {
  const deduplicated = new Map<string, MatchRecord>();
  records.forEach((value) => {
    const record = normalizeMatchRecord(value);
    if (!record) return;
    const existing = deduplicated.get(record.id);
    if (!existing || record.finishedAt >= existing.finishedAt) {
      deduplicated.set(record.id, record);
    }
  });
  const all = [...deduplicated.values()];
  return (["pk", "coopShared", "coopSpell"] as const)
    .flatMap((mode) => all
      .filter((record) => record.modeKey === mode)
      .sort((a, b) => b.finishedAt - a.finishedAt)
      .slice(0, MATCH_RECORD_LIMIT))
    .sort((a, b) => b.finishedAt - a.finishedAt);
}

export function mergeBestScores(
  stored: Partial<Record<GameModeKey, BestScore>>,
  records: MatchRecord[]
): Partial<Record<GameModeKey, BestScore>> {
  const result = { ...stored };
  records.forEach((record) => {
    const current = result[record.modeKey];
    if (!current || record.score > current.score) {
      result[record.modeKey] = {
        score: record.score,
        finishedAt: record.finishedAt
      };
    }
  });
  return result;
}
