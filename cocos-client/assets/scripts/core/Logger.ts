export type LogLevel = "debug" | "info" | "warn" | "error";

export class Logger {
  constructor(private readonly scope = "app") {}

  debug(event: string, data?: unknown): void {
    this.write("debug", event, data);
  }

  info(event: string, data?: unknown): void {
    this.write("info", event, data);
  }

  warn(event: string, data?: unknown): void {
    this.write("warn", event, data);
  }

  error(event: string, data?: unknown): void {
    this.write("error", event, data);
  }

  private write(level: LogLevel, event: string, data?: unknown): void {
    const payload = data == null ? "" : data;
    const line = `[${this.scope}] ${event}`;
    if (level === "error") {
      console.error(line, payload);
      return;
    }
    if (level === "warn") {
      console.warn(line, payload);
      return;
    }
    console.log(line, payload);
  }
}

