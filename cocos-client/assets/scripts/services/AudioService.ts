import type { StorageService } from "./StorageService";

export class AudioService {
  constructor(private readonly storage: StorageService) {}

  isMuted(): boolean {
    return this.storage.get("soundMuted") !== false;
  }

  setMuted(value: boolean): void {
    this.storage.set("soundMuted", value);
  }
}

