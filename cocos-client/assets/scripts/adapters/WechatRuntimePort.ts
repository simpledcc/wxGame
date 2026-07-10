import {
  MemoryRuntimePort,
  type RuntimeCloudCallOptions,
  type RuntimeEntryOptions,
  type RuntimePort,
  type ShareMessageOptions
} from "./RuntimePort";

type WxLike = {
  cloud?: {
    init?: (options: { env?: string; traceUser?: boolean }) => void;
    callFunction?: (options: {
      name: string;
      data?: unknown;
      success?: (res: { result?: unknown; requestID?: string }) => void;
      fail?: (err: unknown) => void;
    }) => void;
    database?: () => {
      collection: (name: string) => {
        doc: (documentId: string) => {
          get: () => Promise<{ data?: unknown }>;
        };
      };
    };
  };
  getStorageSync?: (key: string) => unknown;
  setStorageSync?: (key: string, value: unknown) => void;
  removeStorageSync?: (key: string) => void;
  showToast?: (options: { title: string; icon?: string; duration?: number }) => void;
  shareAppMessage?: (options: ShareMessageOptions) => void;
  setClipboardData?: (options: {
    data: string;
    success?: () => void;
    fail?: (err: unknown) => void;
  }) => void;
  openPrivacyContract?: (options: {
    success?: () => void;
    fail?: (err: unknown) => void;
  }) => void;
  getLaunchOptionsSync?: () => RuntimeEntryOptions;
  getLaunchInfoSync?: () => RuntimeEntryOptions;
  onShow?: (handler: (options: RuntimeEntryOptions) => void) => void;
  offShow?: (handler: (options: RuntimeEntryOptions) => void) => void;
  onHide?: (handler: () => void) => void;
  offHide?: (handler: () => void) => void;
};

function getWx(): WxLike | undefined {
  return (globalThis as { wx?: WxLike }).wx;
}

export function createRuntimePort(): RuntimePort {
  return getWx() ? new WechatRuntimePort() : new MemoryRuntimePort();
}

export class WechatRuntimePort implements RuntimePort {
  async initCloud(envId?: string): Promise<void> {
    const wx = getWx();
    if (!wx?.cloud?.init) {
      throw new Error("wx.cloud.init is unavailable.");
    }
    wx.cloud.init({ env: envId, traceUser: true });
  }

  async callCloudFunction<TData, TResult>(
    options: RuntimeCloudCallOptions<TData>
  ): Promise<TResult> {
    const wx = getWx();
    if (!wx?.cloud?.callFunction) {
      throw new Error("wx.cloud.callFunction is unavailable.");
    }
    return new Promise<TResult>((resolve, reject) => {
      wx.cloud?.callFunction?.({
        name: options.name,
        data: options.data,
        success: (res) => resolve(res.result as TResult),
        fail: reject
      });
    });
  }

  async getCloudDocument<TResult>(collection: string, documentId: string): Promise<TResult> {
    const database = getWx()?.cloud?.database?.();
    if (!database) {
      throw new Error("wx.cloud.database is unavailable.");
    }
    const result = await database.collection(collection).doc(documentId).get();
    if (result.data == null) {
      throw new Error(`Cloud document ${collection}/${documentId} was not found.`);
    }
    return result.data as TResult;
  }

  getStorage<T>(key: string): T | undefined {
    const wx = getWx();
    if (!wx?.getStorageSync) {
      return undefined;
    }
    return wx.getStorageSync(key) as T | undefined;
  }

  setStorage<T>(key: string, value: T): void {
    const wx = getWx();
    if (!wx?.setStorageSync) {
      throw new Error("wx.setStorageSync is unavailable.");
    }
    wx.setStorageSync(key, value);
  }

  removeStorage(key: string): void {
    const wx = getWx();
    if (!wx?.removeStorageSync) {
      throw new Error("wx.removeStorageSync is unavailable.");
    }
    wx.removeStorageSync(key);
  }

  showToast(message: string): void {
    getWx()?.showToast?.({ title: message, icon: "none", duration: 1200 });
  }

  async shareAppMessage(options: ShareMessageOptions): Promise<boolean> {
    const wx = getWx();
    if (!wx?.shareAppMessage) {
      return false;
    }
    wx.shareAppMessage(options);
    return true;
  }

  async setClipboardText(text: string): Promise<void> {
    const wx = getWx();
    if (!wx?.setClipboardData) {
      throw new Error("wx.setClipboardData is unavailable.");
    }
    await new Promise<void>((resolve, reject) => {
      wx.setClipboardData?.({
        data: text,
        success: resolve,
        fail: reject
      });
    });
  }

  async openPrivacyContract(): Promise<boolean> {
    const wx = getWx();
    if (!wx?.openPrivacyContract) {
      return false;
    }
    await new Promise<void>((resolve, reject) => {
      wx.openPrivacyContract?.({
        success: resolve,
        fail: reject
      });
    });
    return true;
  }

  getLaunchOptions(): RuntimeEntryOptions {
    const wx = getWx();
    const options = wx?.getLaunchOptionsSync?.() ?? wx?.getLaunchInfoSync?.() ?? {};
    return options.query ? { query: { ...options.query } } : {};
  }

  onAppShow(handler: (options: RuntimeEntryOptions) => void): () => void {
    const wx = getWx();
    if (!wx?.onShow) return () => undefined;
    const wrapped = (options: RuntimeEntryOptions) => {
      handler(options.query ? { query: { ...options.query } } : {});
    };
    wx.onShow(wrapped);
    return () => wx.offShow?.(wrapped);
  }

  onAppHide(handler: () => void): () => void {
    const wx = getWx();
    if (!wx?.onHide) return () => undefined;
    wx.onHide(handler);
    return () => wx.offHide?.(handler);
  }
}
