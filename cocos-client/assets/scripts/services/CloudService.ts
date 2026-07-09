import type {
  CloudFunctionName,
  CloudFunctionRequestMap,
  CloudFunctionResponseMap
} from "../domain/CloudFunctionTypes";
import type { RuntimePort } from "../adapters/RuntimePort";
import { Logger } from "../core/Logger";

export class CloudService {
  private readonly logger = new Logger("CloudService");

  constructor(private readonly runtime: RuntimePort) {}

  async init(envId: string): Promise<void> {
    await this.runtime.initCloud(envId);
    this.logger.info("cloud.ready", { envId });
  }

  async call<Name extends CloudFunctionName>(
    name: Name,
    data: CloudFunctionRequestMap[Name]
  ): Promise<CloudFunctionResponseMap[Name]> {
    this.logger.info("call.start", { name });
    const result = await this.runtime.callCloudFunction<
      CloudFunctionRequestMap[Name],
      CloudFunctionResponseMap[Name]
    >({ name, data });
    this.logger.info("call.success", { name });
    return result;
  }
}

