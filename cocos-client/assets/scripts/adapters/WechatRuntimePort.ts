import { MemoryRuntimePort, type CloudCallOptions, type RuntimePort, type ShareMessageOptions } from "./RuntimePort";

type WxLike = {
  cloud?: {
    init?: (options: { env: string; traceUser?: boolean }) => void;
    callFunction?: (options: {
      name: string;
      data?: unknown;
      success?: (res: { result?: unknown }) => void;
      fail?: (err: unknown) => void;
    }) => void;
  };
  getStorageSync?: (key: string) => unknown;
  setStorageSync?: (key: string, value: unknown) => void;
  removeStorageSync?: (key: string) => void;
  showToast?: (options: { title: string; icon?: string; duration?: number }) => void;
  shareAppMessage?: (options: ShareMessageOptions) => void;
};

function getWx(): WxLike | undefined {
  return (globalThis as { wx?: WxLike }).wx;
}

export function createRuntimePort(): RuntimePort {
  return getWx() ? new WechatRuntimePort() : new MemoryRuntimePort();
}

export class WechatRuntimePort implements RuntimePort {
  async initCloud(envId: string): Promise<void> {
    const wx = getWx();
    wx?.cloud?.init?.({ env: envId, traceUser: true });
  }

  async callCloudFunction<TData, TResult>(options: CloudCallOptions<TData>): Promise<TResult> {
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

  getStorage<T>(key: string): T | undefined {
    return getWx()?.getStorageSync?.(key) as T | undefined;
  }

  setStorage<T>(key: string, value: T): void {
    getWx()?.setStorageSync?.(key, value);
  }

  removeStorage(key: string): void {
    getWx()?.removeStorageSync?.(key);
  }

  showToast(message: string): void {
    getWx()?.showToast?.({ title: message, icon: "none", duration: 1200 });
  }

  shareAppMessage(options: ShareMessageOptions): void {
    getWx()?.shareAppMessage?.(options);
  }
}

