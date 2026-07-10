import type {
  AddBotRequest,
  AddBotResponse,
  CatchFishRequest,
  CatchFishResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  FinishGameResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  StartCoopSpellRequest,
  StartCoopSpellResponse,
  StartGameRequest,
  StartGameResponse,
  ToggleReadyResponse
} from "../domain/CloudFunctionTypes";
import type { CloudService } from "./CloudService";
import type { RoomSnapshot } from "../domain/RoomTypes";

export class RoomService {
  constructor(private readonly cloud: CloudService) {}

  createRoom(request: CreateRoomRequest): Promise<CreateRoomResponse> {
    return this.cloud.call("createRoom", request);
  }

  joinRoom(request: JoinRoomRequest): Promise<JoinRoomResponse> {
    return this.cloud.call("joinRoom", request);
  }

  fetch(roomId: string): Promise<RoomSnapshot> {
    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      return Promise.reject(new Error("缺少房间 ID"));
    }
    return this.cloud.getDocument<RoomSnapshot>("rooms", normalizedRoomId);
  }

  toggleReady(roomId: string, ready: boolean): Promise<ToggleReadyResponse> {
    return this.cloud.call("toggleReady", { roomId, ready });
  }

  addBot(request: AddBotRequest): Promise<AddBotResponse> {
    return this.cloud.call("addBot", request);
  }

  startGame(request: StartGameRequest): Promise<StartGameResponse> {
    return this.cloud.call("startGame", request);
  }

  startCoopSpell(request: StartCoopSpellRequest): Promise<StartCoopSpellResponse> {
    return this.cloud.call("startCoopSpell", request);
  }

  catchFish(request: CatchFishRequest): Promise<CatchFishResponse> {
    return this.cloud.call("catchFish", request);
  }

  finishGame(roomId: string): Promise<FinishGameResponse> {
    return this.cloud.call("finishGame", { roomId });
  }
}

