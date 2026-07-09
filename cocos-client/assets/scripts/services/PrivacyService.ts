import { DEFAULT_PRIVACY_CONTRACT_NAME, PRIVACY_VERSION } from "../domain/StorageKeys";
import type { StorageService } from "./StorageService";

export class PrivacyService {
  readonly contractName = DEFAULT_PRIVACY_CONTRACT_NAME;

  constructor(private readonly storage: StorageService) {}

  hasAcceptedCurrentVersion(): boolean {
    return this.storage.get("privacyAcceptedVersion") === PRIVACY_VERSION;
  }

  acceptCurrentVersion(): void {
    this.storage.set("privacyAcceptedVersion", PRIVACY_VERSION);
  }
}

