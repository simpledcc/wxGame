import type {
  AddBotRequest,
  CatchFishRequest,
  CreateRoomRequest,
  JoinRoomRequest,
  StartCoopSpellRequest,
  StartGameRequest
} from "../domain/CloudFunctionTypes";
import type { CloudService } from "./CloudService";

export class RoomService {
  constructor(private readonly cloud: CloudService) {}

  createRoom(request: CreateRoomRequest) {
    return this.cloud.call("createRoom", request);
  }

  joinRoom(request: JoinRoomRequest) {
    return this.cloud.call("joinRoom", request);
  }

  toggleReady(roomId: string, ready: boolean) {
    return this.cloud.call("toggleReady", { roomId, ready });
  }

  addBot(request: AddBotRequest) {
    return this.cloud.call("addBot", request);
  }

  startGame(request: StartGameRequest) {
    return this.cloud.call("startGame", request);
  }

  startCoopSpell(request: StartCoopSpellRequest) {
    return this.cloud.call("startCoopSpell", request);
  }

  catchFish(request: CatchFishRequest) {
    return this.cloud.call("catchFish", request);
  }

  finishGame(roomId: string) {
    return this.cloud.call("finishGame", { roomId });
  }
}

