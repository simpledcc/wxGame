import type { RuntimePort } from "../adapters/RuntimePort";
import { STORAGE_KEYS, type StorageValueMap } from "../domain/StorageKeys";

export class StorageService {
  constructor(private readonly runtime: RuntimePort) {}

  get<K extends keyof StorageValueMap>(key: K): StorageValueMap[K] | undefined {
    return this.runtime.getStorage<StorageValueMap[K]>(STORAGE_KEYS[key]);
  }

  set<K extends keyof StorageValueMap>(key: K, value: StorageValueMap[K]): void {
    this.runtime.setStorage(STORAGE_KEYS[key], value);
  }

  remove<K extends keyof StorageValueMap>(key: K): void {
    this.runtime.removeStorage(STORAGE_KEYS[key]);
  }
}

