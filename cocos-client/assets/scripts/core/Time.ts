export class Time {
  now(): number {
    return Date.now();
  }

  secondsBetween(startMs: number, endMs = this.now()): number {
    return Math.max(0, Math.floor((endMs - startMs) / 1000));
  }
}

