import type { RoomSnapshot } from "../domain/RoomTypes";

export class RoomStore {
  private room: RoomSnapshot | null = null;

  getRoom(): RoomSnapshot | null {
    return this.room;
  }

  setRoom(room: RoomSnapshot | null): void {
    this.room = room;
  }
}

