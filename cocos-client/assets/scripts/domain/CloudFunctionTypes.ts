import type {
  FishSnapshot,
  GameOptions,
  MatchRecord,
  PlayerSnapshot,
  RoomSnapshot,
  SpellRoundRecord,
  SpellTemplate
} from "./RoomTypes";
import type { WordItem } from "./GameTypes";

export interface GetOpenIdResponse {
  openid: string;
  appid?: string;
  unionid?: string;
}

export interface CheckTextRequest {
  content: string;
  label?: string;
  scene?: number;
  maxLength?: number;
}

export interface CheckTextResponse {
  ok: true;
}

export interface SubmitFeedbackRequest {
  content: string;
  contact?: string;
  playerName?: string;
  context?: FeedbackContext;
}

export interface FeedbackContext {
  scene?: string;
  roomCode?: string;
  roomId?: string;
  clientVersion?: string;
  [key: string]: unknown;
}

export interface SubmitFeedbackResponse {
  ok: true;
  id?: string;
}

export interface CreateRoomRequest {
  nickName?: string;
  gameOptions: GameOptions;
}

export interface CreateRoomResponse {
  roomId: string;
  roomCode: string;
  room: RoomSnapshot;
}

export interface JoinRoomRequest {
  roomCode: string;
  nickName?: string;
}

export interface JoinRoomResponse {
  roomId: string;
  roomCode: string;
  openid: string;
}

export interface ToggleReadyRequest {
  roomId: string;
  ready: boolean;
}

export interface ToggleReadyResponse {
  ok: true;
  players: PlayerSnapshot[];
  room: RoomSnapshot;
}

export interface AddBotRequest {
  roomId: string;
  difficulty?: "low" | "medium" | "high";
  botName?: string;
}

export interface AddBotResponse {
  ok: true;
  players: PlayerSnapshot[];
  gameOptions: GameOptions;
  room: RoomSnapshot;
}

export interface StartGameRequest {
  roomId: string;
  roomWords?: WordItem[];
}

export interface StartGameResponse {
  ok: true;
  room?: RoomSnapshot;
}

export interface StartCoopSpellRequest {
  roomId: string;
  roomWords?: WordItem[];
  roomSpellQuestions?: SpellTemplate[];
}

export interface StartCoopSpellResponse {
  ok: true;
  updateMode?: "single" | "split" | "slim";
  room: RoomSnapshot;
}

export type CatchFishRequest =
  | { roomId: string; fishId: string }
  | { roomId: string; action: "usePowerUp"; powerUpId: string }
  | { roomId: string; action: "botCatch"; targetFishId?: string }
  | { roomId: string; action: "submitCoopSpell"; questionId: string; answer: string }
  | { roomId: string; action: "skipCoopSpell"; questionId: string }
  | { roomId: string; action: "timeoutCoopSpell"; questionId: string }
  | { roomId: string; action: "botCoopSpell"; questionId: string };

export interface CatchFishResponse {
  delta: number;
  correct: boolean;
  finished: boolean;
  players?: PlayerSnapshot[];
  fishes?: FishSnapshot[];
  usedWords?: string[];
  currentMeaning?: string;
  targetFishId?: string;
  submitted?: boolean;
  waitingPartner?: boolean;
  alreadySubmitted?: boolean;
  roundComplete?: boolean;
  teamScore?: number;
  roundRecord?: SpellRoundRecord;
  skipped?: boolean;
  automatic?: boolean;
  stale?: boolean;
  tooEarly?: boolean;
  retryAfter?: number;
  stunned?: boolean;
  stunLeft?: number;
  noBot?: boolean;
  bot?: boolean;
  botOpenid?: string;
  powerUp?: import("./RoomTypes").PowerUpSnapshot;
  usedPowerUp?: import("./RoomTypes").PowerUpSnapshot;
  noPowerUp?: boolean;
  updatedAt?: unknown;
}

export interface FinishGameRequest {
  roomId: string;
}

export type FinishGameResponse =
  | { ok: true; winnerOpenid?: string }
  | { ok: false; reason: "not_timeout" | string };

export interface CloudFunctionRequestMap {
  getOpenId: Record<string, never>;
  checkText: CheckTextRequest;
  submitFeedback: SubmitFeedbackRequest;
  createRoom: CreateRoomRequest;
  joinRoom: JoinRoomRequest;
  toggleReady: ToggleReadyRequest;
  addBot: AddBotRequest;
  startGame: StartGameRequest;
  startCoopSpell: StartCoopSpellRequest;
  catchFish: CatchFishRequest;
  finishGame: FinishGameRequest;
}

export interface CloudFunctionResponseMap {
  getOpenId: GetOpenIdResponse;
  checkText: CheckTextResponse;
  submitFeedback: SubmitFeedbackResponse;
  createRoom: CreateRoomResponse;
  joinRoom: JoinRoomResponse;
  toggleReady: ToggleReadyResponse;
  addBot: AddBotResponse;
  startGame: StartGameResponse;
  startCoopSpell: StartCoopSpellResponse;
  catchFish: CatchFishResponse;
  finishGame: FinishGameResponse;
}

export type CloudFunctionName = keyof CloudFunctionRequestMap;
