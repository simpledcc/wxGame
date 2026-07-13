import type {
  BotDifficulty,
  CoopMode,
  GameDuration,
  MatchMode,
  RoomState,
  WordItem,
  WordMode
} from "./GameTypes";

export interface SpellSlot {
  index: number;
  position: number;
  answer: string;
}

export interface SpellTemplate {
  key: string;
  word: string;
  meaning: string;
  mask: string;
  blankPositions: number[];
  slots: SpellSlot[];
}

export interface SpellSegment {
  openid?: string;
  start: number;
  end: number;
  length: number;
  slotIndexes: number[];
  answer: string;
}

export interface SpellQuestion extends SpellTemplate {
  id: string;
  wordKey: string;
  mode: "boatLetters";
  segments: SpellSegment[];
  createdAt: number;
}

export interface SpellSubmission {
  status: "submitted" | "correct" | string;
  questionId?: string;
  length?: number;
  answer?: string;
  submittedAt?: number;
}

export interface SpellSubmissions {
  _resetAt?: number;
  _questionId?: string;
  [openid: string]: SpellSubmission | number | string | undefined;
}

export interface PlayerSnapshot {
  openid: string;
  nickName: string;
  score: number;
  ready?: boolean;
  combo?: number;
  stunnedUntil?: number;
  powerUps?: PowerUpSnapshot[];
  powerUp?: PowerUpSnapshot | null;
  isBot?: boolean;
  botDifficulty?: BotDifficulty;
}

export interface PowerUpSnapshot {
  id: string;
  type: string;
  ownerOpenid?: string;
  playerOpenid?: string;
  targetOpenid?: string;
  bonus?: number;
  stunMs?: number;
  createdAt?: number;
  usedAt?: number;
}

export interface FishSnapshot {
  id: string;
  word: string;
  correctWord?: string;
  meaning: string;
  alive: boolean;
  isFake?: boolean;
  lane?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  speed?: number;
}

export interface GameOptions {
  duration?: GameDuration;
  bankId: string;
  mode: WordMode;
  wrongWords: WordItem[];
  roomWords?: WordItem[];
  roomSpellQuestions?: SpellTemplate[];
  botDifficulty?: BotDifficulty;
  matchMode: MatchMode;
  coopMode: CoopMode;
}

export interface RoomSnapshot {
  _id?: string;
  roomCode: string;
  state: RoomState;
  ownerOpenid?: string;
  players: PlayerSnapshot[];
  fishes: FishSnapshot[];
  currentMeaning: string;
  targetFishId: string;
  spellQuestion: SpellQuestion | null;
  spellSubmissions: SpellSubmissions;
  spellHistory?: SpellRoundRecord[];
  teamScore?: number;
  duration: GameDuration;
  gameOptions: GameOptions;
  winnerOpenid: string;
  usedWords?: string[];
  startedAt?: number;
  finishedAt?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface SpellRoundPlayerRecord {
  openid: string;
  nickName: string;
  slotIndexes: number[];
  expectedLength: number;
  submitted: boolean;
  answer: string;
  correct: boolean;
  submittedAt: number;
}

export type SpellRoundReason = "answered" | "manualSkip" | "timeout" | "gameOver";

export interface SpellRoundRecord {
  questionId: string;
  word: string;
  meaning: string;
  mask: string;
  reason: SpellRoundReason;
  correct: boolean;
  delta: number;
  teamScore: number;
  finishedAt: number;
  players: SpellRoundPlayerRecord[];
}

export interface MatchRecord {
  id: string;
  modeKey: "pk" | "coopShared" | "coopSpell";
  modeLabel: string;
  roomCode: string;
  finishedAt: number;
  result: string;
  winnerOpenid: string;
  duration: GameDuration;
  bankLabel: string;
  score: number;
  teamScore?: number;
  spellHistory?: SpellRoundRecord[];
  players: Array<{
    openid: string;
    nickName: string;
    score: number;
  }>;
}
