export interface RuntimeCloudCallOptions<TData> {
  name: string;
  data: TData;
}

export interface RuntimePort {
  initCloud(envId?: string): Promise<void>;
  callCloudFunction<TData, TResult>(options: RuntimeCloudCallOptions<TData>): Promise<TResult>;
  getStorage<T>(key: string): T | undefined;
  setStorage<T>(key: string, value: T): void;
  removeStorage(key: string): void;
  showToast(message: string): void;
  shareAppMessage(options: ShareMessageOptions): Promise<boolean>;
  setClipboardText(text: string): Promise<void>;
  openPrivacyContract(): Promise<boolean>;
}

export interface ShareMessageOptions {
  title: string;
  query?: string;
  imageUrl?: string;
}

export type MemoryCloudHandler = (data: unknown) => unknown | Promise<unknown>;

export interface MemoryRuntimeOptions {
  storage?: Record<string, unknown>;
  cloudHandlers?: Record<string, MemoryCloudHandler>;
  nativePrivacyContract?: boolean;
  shareSupported?: boolean;
}

export class MemoryRuntimePort implements RuntimePort {
  private readonly storage = new Map<string, unknown>();
  private readonly cloudHandlers: Record<string, MemoryCloudHandler>;
  private readonly nativePrivacyContract: boolean;
  private readonly shareSupported: boolean;

  readonly cloudCalls: Array<{ name: string; data: unknown }> = [];
  readonly shareMessages: ShareMessageOptions[] = [];
  readonly toastMessages: string[] = [];
  cloudInitCount = 0;
  privacyContractOpenCount = 0;
  clipboardText = "";

  constructor(options: MemoryRuntimeOptions = {}) {
    Object.entries(options.storage ?? {}).forEach(([key, value]) => this.storage.set(key, value));
    this.cloudHandlers = { ...(options.cloudHandlers ?? {}) };
    this.nativePrivacyContract = options.nativePrivacyContract ?? false;
    this.shareSupported = options.shareSupported ?? true;
  }

  async initCloud(): Promise<void> {
    this.cloudInitCount += 1;
  }

  async callCloudFunction<TData, TResult>(
    options: RuntimeCloudCallOptions<TData>
  ): Promise<TResult> {
    this.cloudCalls.push({ name: options.name, data: options.data });
    const handler = this.cloudHandlers[options.name];
    if (!handler) {
      throw new Error(`Cloud function ${options.name} is unavailable outside WeChat runtime.`);
    }
    return await handler(options.data) as TResult;
  }

  getStorage<T>(key: string): T | undefined {
    return this.storage.get(key) as T | undefined;
  }

  setStorage<T>(key: string, value: T): void {
    this.storage.set(key, value);
  }

  removeStorage(key: string): void {
    this.storage.delete(key);
  }

  showToast(message: string): void {
    this.toastMessages.push(message);
    console.log("[toast]", message);
  }

  async shareAppMessage(options: ShareMessageOptions): Promise<boolean> {
    if (!this.shareSupported) {
      return false;
    }
    this.shareMessages.push({ ...options });
    console.log("[share]", options);
    return true;
  }

  async setClipboardText(text: string): Promise<void> {
    this.clipboardText = text;
  }

  async openPrivacyContract(): Promise<boolean> {
    this.privacyContractOpenCount += 1;
    return this.nativePrivacyContract;
  }
}
