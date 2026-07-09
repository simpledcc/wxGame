export class SettingsStore {
  private muted = true;

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(value: boolean): void {
    this.muted = value;
  }
}

