import type {
  CloudFunctionName,
  CloudFunctionRequestMap,
  CloudFunctionResponseMap
} from "../domain/CloudFunctionTypes";
import type { RuntimePort } from "../adapters/RuntimePort";
import { PrivacyRequiredError } from "../domain/Privacy";
import { Logger } from "../core/Logger";

export interface CloudCallOptions {
  timeoutMs?: number;
  requestId?: string;
}

export type CloudFailureCode =
  | "CLOUD_NOT_READY"
  | "TIMEOUT"
  | "NETWORK"
  | "PERMISSION"
  | "FUNCTION_ERROR";

export class CloudCallError extends Error {
  constructor(
    readonly code: CloudFailureCode,
    readonly functionName: string,
    readonly requestId: string,
    readonly elapsedMs: number,
    readonly retryable: boolean
  ) {
    super(code === "TIMEOUT" ? "云服务响应超时，请重试" : "云服务暂时不可用，请稍后重试");
    this.name = "CloudCallError";
  }
}

let requestSequence = 0;

function createRequestId(): string {
  requestSequence += 1;
  return `cf_${Date.now().toString(36)}_${requestSequence.toString(36)}`;
}

function classifyFailure(error: unknown): CloudFailureCode {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/timeout|timed out|超时/i.test(message)) {
    return "TIMEOUT";
  }
  if (/network|socket|request:fail|connection/i.test(message)) {
    return "NETWORK";
  }
  if (/permission|authorize|forbidden|unauthorized|-502005/i.test(message)) {
    return "PERMISSION";
  }
  return "FUNCTION_ERROR";
}

function isRetryable(code: CloudFailureCode): boolean {
  return code === "TIMEOUT" || code === "NETWORK" || code === "FUNCTION_ERROR";
}

export class CloudService {
  private readonly logger: Logger;
  private initPromise: Promise<void> | null = null;
  private initialized = false;

  constructor(
    private readonly runtime: RuntimePort,
    private readonly assertPrivacyAccepted: () => void = () => {
      throw new PrivacyRequiredError("cloud");
    },
    logger = new Logger("CloudService")
  ) {
    this.logger = logger;
  }

  async init(envId?: string): Promise<void> {
    this.assertPrivacyAccepted();
    if (this.initialized) {
      return;
    }
    if (!this.initPromise) {
      this.initPromise = this.runtime.initCloud(envId)
        .then(() => {
          this.initialized = true;
          this.logger.info("cloud.ready", { envConfigured: !!envId });
        })
        .catch((error) => {
          this.initPromise = null;
          this.logger.error("cloud.init.fail", {
            reason: classifyFailure(error)
          });
          throw error;
        });
    }
    await this.initPromise;
  }

  isReady(): boolean {
    return this.initialized;
  }

  async call<Name extends CloudFunctionName>(
    name: Name,
    data: CloudFunctionRequestMap[Name],
    options: CloudCallOptions = {}
  ): Promise<CloudFunctionResponseMap[Name]> {
    this.assertPrivacyAccepted();
    const requestId = options.requestId ?? createRequestId();
    const startedAt = Date.now();
    if (!this.initialized) {
      const error = new CloudCallError(
        "CLOUD_NOT_READY",
        name,
        requestId,
        0,
        false
      );
      this.logger.warn("call.blocked", { name, requestId, reason: error.code });
      throw error;
    }

    const timeoutMs = Math.max(500, options.timeoutMs ?? 12000);
    this.logger.info("call.start", { name, requestId, timeoutMs });
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    try {
      const timeout = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(
          () => reject(new Error("cloud call timeout")),
          timeoutMs
        );
      });
      const result = await Promise.race([
        this.runtime.callCloudFunction<
          CloudFunctionRequestMap[Name],
          CloudFunctionResponseMap[Name]
        >({ name, data }),
        timeout
      ]);
      const elapsedMs = Date.now() - startedAt;
      this.logger.info("call.success", { name, requestId, elapsedMs });
      return result;
    } catch (error) {
      const elapsedMs = Date.now() - startedAt;
      const code = classifyFailure(error);
      const wrapped = new CloudCallError(
        code,
        name,
        requestId,
        elapsedMs,
        isRetryable(code)
      );
      this.logger.error("call.fail", {
        name,
        requestId,
        elapsedMs,
        reason: code,
        retryable: wrapped.retryable
      });
      throw wrapped;
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  }
}
