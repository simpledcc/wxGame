import type { GameDuration } from "./GameTypes";

export const GAME_DURATIONS: GameDuration[] = [30, 60, 90, 120];
export const DEFAULT_GAME_DURATION: GameDuration = 60;

export function normalizeDuration(value: number | undefined): GameDuration {
  return GAME_DURATIONS.includes(value as GameDuration) ? value as GameDuration : DEFAULT_GAME_DURATION;
}

