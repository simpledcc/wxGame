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
    readonly retryable: boolean,
    publicMessage?: string
  ) {
    super(publicMessage || (code === "TIMEOUT"
      ? "云服务响应超时，请重试"
      : "云服务暂时不可用，请稍后重试"));
    this.name = "CloudCallError";
  }
}

let requestSequence = 0;

function createRequestId(): string {
  requestSequence += 1;
  return `cf_${Date.now().toString(36)}_${requestSequence.toString(36)}`;
}

function getFailureMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object") {
    const source = error as Record<string, unknown>;
    return String(source.errMsg ?? source.message ?? source.errorMessage ?? "");
  }
  return String(error ?? "");
}

function classifyFailure(error: unknown): CloudFailureCode {
  const message = getFailureMessage(error);
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

function getSafePublicMessage(error: unknown, code: CloudFailureCode): string | undefined {
  if (code === "TIMEOUT") {
    return "云服务响应超时，请重试";
  }
  const message = getFailureMessage(error);
  const match = message.match(
    /(房间不存在|房间已满|游戏已经开始|请输入房间码|你不在这个房间中|双人合作需要两名(?:真实)?玩家|同舟拼词记需要两名真实玩家|两名玩家都准备后才能开始|双方准备后才能开始|准备后才能开始|当前房间无法开始|当前词库没有[^，。;；\n]{0,24}|错题库为空[^，。;；\n]{0,24})/
  );
  return match?.[1];
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
        isRetryable(code),
        getSafePublicMessage(error, code)
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

  async getDocument<TResult>(
    collection: string,
    documentId: string,
    options: CloudCallOptions = {}
  ): Promise<TResult> {
    this.assertPrivacyAccepted();
    const operationName = `database.${collection}.get`;
    const requestId = options.requestId ?? createRequestId();
    const startedAt = Date.now();
    if (!this.initialized) {
      const error = new CloudCallError(
        "CLOUD_NOT_READY",
        operationName,
        requestId,
        0,
        false
      );
      this.logger.warn("document.blocked", {
        collection,
        requestId,
        reason: error.code
      });
      throw error;
    }

    const timeoutMs = Math.max(500, options.timeoutMs ?? 12000);
    this.logger.info("document.start", { collection, requestId, timeoutMs });
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    try {
      const timeout = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(
          () => reject(new Error("cloud document timeout")),
          timeoutMs
        );
      });
      const result = await Promise.race([
        this.runtime.getCloudDocument<TResult>(collection, documentId),
        timeout
      ]);
      const elapsedMs = Date.now() - startedAt;
      this.logger.info("document.success", { collection, requestId, elapsedMs });
      return result;
    } catch (error) {
      const elapsedMs = Date.now() - startedAt;
      const code = classifyFailure(error);
      const wrapped = new CloudCallError(
        code,
        operationName,
        requestId,
        elapsedMs,
        isRetryable(code),
        getSafePublicMessage(error, code)
      );
      this.logger.error("document.fail", {
        collection,
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
