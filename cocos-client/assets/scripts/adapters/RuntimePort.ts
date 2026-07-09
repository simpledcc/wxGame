export interface CloudCallOptions<TData> {
  name: string;
  data: TData;
}

export interface RuntimePort {
  initCloud(envId: string): Promise<void>;
  callCloudFunction<TData, TResult>(options: CloudCallOptions<TData>): Promise<TResult>;
  getStorage<T>(key: string): T | undefined;
  setStorage<T>(key: string, value: T): void;
  removeStorage(key: string): void;
  showToast(message: string): void;
  shareAppMessage(options: ShareMessageOptions): void;
}

export interface ShareMessageOptions {
  title: string;
  query?: string;
  imageUrl?: string;
}

export class MemoryRuntimePort implements RuntimePort {
  private readonly storage = new Map<string, unknown>();

  async initCloud(): Promise<void> {}

  async callCloudFunction<TData, TResult>(options: CloudCallOptions<TData>): Promise<TResult> {
    throw new Error(`Cloud function ${options.name} is unavailable outside WeChat runtime.`);
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
    console.log("[toast]", message);
  }

  shareAppMessage(options: ShareMessageOptions): void {
    console.log("[share]", options);
  }
}

