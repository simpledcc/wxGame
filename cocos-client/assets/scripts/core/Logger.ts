export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogSink {
  debug?: (line: string, data?: unknown) => void;
  info?: (line: string, data?: unknown) => void;
  warn?: (line: string, data?: unknown) => void;
  error?: (line: string, data?: unknown) => void;
}

const SENSITIVE_KEY_PATTERN =
  /openid|unionid|answer|content|contact|phone|email|meaning|spellSubmissions|roomWords/i;
const MAX_STRING_LENGTH = 160;
const MAX_ARRAY_LENGTH = 8;
const MAX_DEPTH = 4;

function truncateString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }
  return `${value.slice(0, MAX_STRING_LENGTH)}...`;
}

function sanitize(value: unknown, key = "", depth = 0): unknown {
  if (SENSITIVE_KEY_PATTERN.test(key)) {
    return "[redacted]";
  }
  if (value == null || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return truncateString(value);
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: "operation failed"
    };
  }
  if (depth >= MAX_DEPTH) {
    return "[truncated]";
  }
  if (Array.isArray(value)) {
    const items = value
      .slice(0, MAX_ARRAY_LENGTH)
      .map((item) => sanitize(item, key, depth + 1));
    if (value.length > MAX_ARRAY_LENGTH) {
      items.push(`[${value.length - MAX_ARRAY_LENGTH} more]`);
    }
    return items;
  }
  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([entryKey, entryValue]) => {
      output[entryKey] = sanitize(entryValue, entryKey, depth + 1);
    });
    return output;
  }
  return String(value);
}

export function sanitizeLogData(data: unknown): unknown {
  return sanitize(data);
}

export class Logger {
  constructor(
    private readonly scope = "app",
    private readonly sink: LogSink = console
  ) {}

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

  child(scope: string): Logger {
    return new Logger(`${this.scope}:${scope}`, this.sink);
  }

  private write(level: LogLevel, event: string, data?: unknown): void {
    const line = `[${this.scope}] ${event}`;
    const payload = data == null ? undefined : sanitizeLogData(data);
    const writer = this.sink[level] ?? this.sink.info ?? console.log;
    writer.call(this.sink, line, payload);
  }
}
