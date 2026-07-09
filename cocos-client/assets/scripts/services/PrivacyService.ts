import type { RuntimePort } from "../adapters/RuntimePort";
import {
  PrivacyRequiredError,
  type PrivacyCapability
} from "../domain/Privacy";
import {
  DEFAULT_PRIVACY_CONTRACT_NAME,
  PRIVACY_VERSION
} from "../domain/StorageKeys";
import type { StorageService } from "./StorageService";

export class PrivacyService {
  readonly contractName = DEFAULT_PRIVACY_CONTRACT_NAME;
  readonly version = PRIVACY_VERSION;

  constructor(
    private readonly storage: StorageService,
    private readonly runtime: RuntimePort
  ) {}

  hasAcceptedCurrentVersion(): boolean {
    return this.storage.getPrivacyAcceptedVersion() === this.version;
  }

  acceptCurrentVersion(): void {
    this.storage.setPrivacyAcceptedVersion(this.version);
  }

  declineCurrentVersion(): void {
    this.storage.removePrivacyAcceptedVersion();
  }

  requireAccepted(capability: PrivacyCapability): void {
    if (!this.hasAcceptedCurrentVersion()) {
      throw new PrivacyRequiredError(capability);
    }
  }

  async openContract(): Promise<boolean> {
    return await this.runtime.openPrivacyContract();
  }
}
