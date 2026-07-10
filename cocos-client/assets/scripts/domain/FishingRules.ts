import type { CatchFishResponse } from "./CloudFunctionTypes";
import type { BotDifficulty, WordItem } from "./GameTypes";
import type { FishSnapshot, PlayerSnapshot, RoomSnapshot } from "./RoomTypes";
import { NORMAL_HIT_SCORE, NORMAL_MISS_SCORE } from "./ScoreRules";

export const POWER_UP_COMBO = 3;
export const SWATTER_STUN_MS = 5000;
export const BOT_DELAYS_MS: Record<BotDifficulty, number> = {
  low: 5000,
  medium: 3000,
  high: 1000
};

export type FishingTapBlockReason =
  | "notPlaying"
  | "spellMode"
  | "notInRoom"
  | "stunned"
  | "missingFish"
  | "deadFish"
  | "missingTarget";

export interface FishingTapEvaluation {
  ok: boolean;
  fishId: string;
  correct: boolean;
  delta: number;
  baselineScore: number;
  baselineCombo: number;
  wrongWord?: WordItem;
  reason?: FishingTapBlockReason;
}

function getFishWord(fish: FishSnapshot): string {
  return String(fish.correctWord || fish.word || "");
}

export function getStunLeft(player: PlayerSnapshot | null, now = Date.now()): number {
  return Math.max(0, Number(player?.stunnedUntil || 0) - now);
}

export function evaluateFishingTap(
  room: RoomSnapshot,
  localOpenId: string,
  fishId: string,
  now = Date.now()
): FishingTapEvaluation {
  const player = room.players.find((item) => item.openid === localOpenId) ?? null;
  const blocked = (reason: FishingTapBlockReason): FishingTapEvaluation => ({
    ok: false,
    fishId,
    correct: false,
    delta: 0,
    baselineScore: Number(player?.score || 0),
    baselineCombo: Number(player?.combo || 0),
    reason
  });
  if (room.state !== "playing") return blocked("notPlaying");
  if (room.gameOptions.matchMode === "coop" && room.gameOptions.coopMode === "spell") {
    return blocked("spellMode");
  }
  if (!player) return blocked("notInRoom");
  if (getStunLeft(player, now) > 0) return blocked("stunned");
  const fish = room.fishes.find((item) => item.id === fishId);
  if (!fish) return blocked("missingFish");
  if (!fish.alive) return blocked("deadFish");
  const target = room.fishes.find((item) => item.id === room.targetFishId && item.alive);
  if (!target) return blocked("missingTarget");
  const correct = fish.id === target.id || (!fish.isFake && getFishWord(fish) === getFishWord(target));
  return {
    ok: true,
    fishId,
    correct,
    delta: correct ? NORMAL_HIT_SCORE : NORMAL_MISS_SCORE,
    baselineScore: Number(player.score || 0),
    baselineCombo: Number(player.combo || 0),
    wrongWord: correct || target.isFake ? undefined : {
      word: getFishWord(target),
      meaning: String(target.meaning || room.currentMeaning || "")
    }
  };
}

export function applyCatchResponse(
  room: RoomSnapshot,
  response: CatchFishResponse
): { room: RoomSnapshot; hasSnapshot: boolean } {
  const hasPlayers = Array.isArray(response.players);
  const hasFishes = Array.isArray(response.fishes);
  const next: RoomSnapshot = {
    ...room,
    players: hasPlayers ? response.players! : room.players,
    fishes: hasFishes ? response.fishes! : room.fishes,
    usedWords: Array.isArray(response.usedWords) ? response.usedWords : room.usedWords,
    currentMeaning: typeof response.currentMeaning === "string"
      ? response.currentMeaning
      : room.currentMeaning,
    targetFishId: typeof response.targetFishId === "string"
      ? response.targetFishId
      : room.targetFishId,
    teamScore: Number.isFinite(Number(response.teamScore))
      ? Number(response.teamScore)
      : room.teamScore
  };
  return {
    room: next,
    hasSnapshot: hasPlayers && hasFishes
  };
}

export function getMatchTimeLeft(room: RoomSnapshot, now = Date.now()): number {
  const duration = Number(room.duration || room.gameOptions.duration || 60);
  const startedAt = Number(room.startedAt || 0);
  if (!startedAt) {
    return Math.max(0, Math.ceil(duration));
  }
  return Math.max(0, Math.ceil(duration - Math.max(0, now - startedAt) / 1000));
}

export function getBotDelay(room: RoomSnapshot): number {
  const bot = room.players.find((player) => player.isBot || player.openid.startsWith("bot_"));
  const difficulty = bot?.botDifficulty || room.gameOptions.botDifficulty || "medium";
  return BOT_DELAYS_MS[difficulty];
}

export function isFishingRoom(room: RoomSnapshot): boolean {
  return room.gameOptions.matchMode === "pk"
    || (room.gameOptions.matchMode === "coop" && room.gameOptions.coopMode === "shared");
}

export function getFishingTeamScore(
  room: RoomSnapshot,
  optimisticLocalDelta = 0
): number {
  return room.players.reduce((sum, player) => sum + Number(player.score || 0), 0)
    + Number(optimisticLocalDelta || 0);
}

export function getVisibleFishes(room: RoomSnapshot): FishSnapshot[] {
  return room.fishes.filter((fish) => fish.alive);
}
