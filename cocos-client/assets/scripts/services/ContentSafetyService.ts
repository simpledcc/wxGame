import type { CloudService } from "./CloudService";

export class ContentSafetyService {
  constructor(private readonly cloud: CloudService) {}

  async checkText(content: string, label = "内容", scene = 1, maxLength = 300): Promise<void> {
    await this.cloud.call("checkText", { content, label, scene, maxLength });
  }
}

