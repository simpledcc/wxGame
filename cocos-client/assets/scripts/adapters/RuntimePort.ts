export interface RuntimeCloudCallOptions<TData> {
  name: string;
  data: TData;
}

export type RuntimeQueryValue = string | number | boolean | undefined;

export interface RuntimeEntryOptions {
  query?: Record<string, RuntimeQueryValue>;
}

export interface RuntimePort {
  initCloud(envId?: string): Promise<void>;
  callCloudFunction<TData, TResult>(options: RuntimeCloudCallOptions<TData>): Promise<TResult>;
  getCloudDocument<TResult>(collection: string, documentId: string): Promise<TResult>;
  getStorage<T>(key: string): T | undefined;
  setStorage<T>(key: string, value: T): void;
  removeStorage(key: string): void;
  showToast(message: string): void;
  shareAppMessage(options: ShareMessageOptions): Promise<boolean>;
  setClipboardText(text: string): Promise<void>;
  openPrivacyContract(): Promise<boolean>;
  getLaunchOptions(): RuntimeEntryOptions;
  onAppShow(handler: (options: RuntimeEntryOptions) => void): () => void;
  onAppHide(handler: () => void): () => void;
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
  cloudDocuments?: Record<string, Record<string, unknown>>;
  nativePrivacyContract?: boolean;
  shareSupported?: boolean;
  launchOptions?: RuntimeEntryOptions;
}

function cloneEntryOptions(options: RuntimeEntryOptions = {}): RuntimeEntryOptions {
  return options.query ? { query: { ...options.query } } : {};
}

export class MemoryRuntimePort implements RuntimePort {
  private readonly storage = new Map<string, unknown>();
  private readonly cloudHandlers: Record<string, MemoryCloudHandler>;
  private readonly cloudDocuments: Record<string, Record<string, unknown>>;
  private readonly nativePrivacyContract: boolean;
  private readonly shareSupported: boolean;
  private readonly launchOptions: RuntimeEntryOptions;
  private readonly showHandlers = new Set<(options: RuntimeEntryOptions) => void>();
  private readonly hideHandlers = new Set<() => void>();

  readonly cloudCalls: Array<{ name: string; data: unknown }> = [];
  readonly cloudDocumentReads: Array<{ collection: string; documentId: string }> = [];
  readonly shareMessages: ShareMessageOptions[] = [];
  readonly toastMessages: string[] = [];
  cloudInitCount = 0;
  privacyContractOpenCount = 0;
  clipboardText = "";

  constructor(options: MemoryRuntimeOptions = {}) {
    Object.entries(options.storage ?? {}).forEach(([key, value]) => this.storage.set(key, value));
    this.cloudHandlers = { ...(options.cloudHandlers ?? {}) };
    this.cloudDocuments = { ...(options.cloudDocuments ?? {}) };
    this.nativePrivacyContract = options.nativePrivacyContract ?? false;
    this.shareSupported = options.shareSupported ?? true;
    this.launchOptions = cloneEntryOptions(options.launchOptions);
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

  async getCloudDocument<TResult>(collection: string, documentId: string): Promise<TResult> {
    this.cloudDocumentReads.push({ collection, documentId });
    const document = this.cloudDocuments[collection]?.[documentId];
    if (document == null) {
      throw new Error(`Cloud document ${collection}/${documentId} was not found.`);
    }
    return document as TResult;
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

  getLaunchOptions(): RuntimeEntryOptions {
    return cloneEntryOptions(this.launchOptions);
  }

  onAppShow(handler: (options: RuntimeEntryOptions) => void): () => void {
    this.showHandlers.add(handler);
    return () => this.showHandlers.delete(handler);
  }

  onAppHide(handler: () => void): () => void {
    this.hideHandlers.add(handler);
    return () => this.hideHandlers.delete(handler);
  }

  emitAppShow(options: RuntimeEntryOptions = {}): void {
    const snapshot = cloneEntryOptions(options);
    this.showHandlers.forEach((handler) => handler(snapshot));
  }

  emitAppHide(): void {
    this.hideHandlers.forEach((handler) => handler());
  }
}
