import assert from "node:assert/strict";
import {
  MemoryRuntimePort,
  type RuntimeEntryOptions
} from "../assets/scripts/adapters/RuntimePort";
import { WechatRuntimePort } from "../assets/scripts/adapters/WechatRuntimePort";
import {
  LifecycleService,
  type LifecycleRoomPolling,
  type LifecycleRoomSession
} from "../assets/scripts/services/LifecycleService";
import { GameStore } from "../assets/scripts/store/GameStore";
import { RoomStore } from "../assets/scripts/store/RoomStore";

class FakePolling implements LifecycleRoomPolling {
  running = false;
  stopCount = 0;
  refreshCount = 0;
  readonly starts: Array<{ roomId: string; immediate: boolean }> = [];

  isRunning(): boolean {
    return this.running;
  }

  start(roomId: string, immediate = true): void {
    this.running = true;
    this.starts.push({ roomId, immediate });
  }

  stop(): void {
    this.running = false;
    this.stopCount += 1;
  }

  async refresh(): Promise<unknown> {
    this.refreshCount += 1;
    return null;
  }
}

class FakeRoomSession implements LifecycleRoomSession {
  readonly joins: string[] = [];
  failCode = "";

  constructor(
    private readonly rooms: RoomStore,
    private readonly polling: FakePolling
  ) {}

  async join(roomCode: string): Promise<unknown> {
    this.joins.push(roomCode);
    if (roomCode === this.failCode) throw new Error("房间不存在");
    this.rooms.enter(`room-${roomCode}`, roomCode);
    this.polling.running = true;
    return null;
  }
}

async function flushAsyncHandlers(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

async function testLifecycleCoordinator(): Promise<void> {
  const runtime = new MemoryRuntimePort({
    launchOptions: { query: { invite: "1", roomCode: "ab12cd" } }
  });
  const gameStore = new GameStore();
  const roomStore = new RoomStore();
  const polling = new FakePolling();
  const roomSession = new FakeRoomSession(roomStore, polling);
  const lifecycle = new LifecycleService(runtime, gameStore, roomStore, roomSession, polling);

  lifecycle.start();
  assert.deepEqual(roomSession.joins, [], "launch invite must wait until boot/privacy activation");
  assert.equal(await lifecycle.activate(), true);
  assert.deepEqual(roomSession.joins, ["AB12CD"]);
  assert.equal(roomStore.getState().roomCode, "AB12CD");
  assert.equal(gameStore.getState().route, "room");

  runtime.emitAppHide();
  assert.equal(polling.running, false);
  assert.equal(polling.stopCount, 1);

  runtime.emitAppShow();
  await flushAsyncHandlers();
  assert.deepEqual(polling.starts.at(-1), { roomId: "room-AB12CD", immediate: true });

  gameStore.setRoute("pkGame");
  runtime.emitAppShow({ query: { roomCode: "cd34ef" } });
  await flushAsyncHandlers();
  assert.deepEqual(roomSession.joins, ["AB12CD"]);
  assert.equal(runtime.toastMessages.at(-1), "游戏中暂不能加入新的邀请");

  gameStore.setRoute("home");
  runtime.emitAppShow({ query: { roomCode: "abc" } });
  await flushAsyncHandlers();
  assert.equal(runtime.toastMessages.at(-1), "邀请房间码无效");

  roomSession.failCode = "NO12PE";
  runtime.emitAppShow({ query: { roomCode: "no12pe" } });
  await flushAsyncHandlers();
  assert.equal(runtime.toastMessages.at(-1), "房间不存在");
  assert.equal(roomStore.getState().roomCode, "AB12CD", "failed invite must preserve current room");

  runtime.emitAppShow({ query: { roomCode: "zz99yy" } });
  await flushAsyncHandlers();
  assert.deepEqual(roomSession.joins, ["AB12CD", "NO12PE", "ZZ99YY"]);
  assert.equal(roomStore.getState().roomCode, "ZZ99YY");

  lifecycle.dispose();
  runtime.emitAppShow({ query: { roomCode: "QQ11WW" } });
  await flushAsyncHandlers();
  assert.equal(roomSession.joins.includes("QQ11WW"), false, "disposed lifecycle must unsubscribe");
}

function testWechatLifecycleAdapter(): void {
  const globalWithWx = globalThis as { wx?: Record<string, unknown> };
  const previousWx = globalWithWx.wx;
  let showHandler: ((options: RuntimeEntryOptions) => void) | null = null;
  let hideHandler: (() => void) | null = null;
  let showRemoved = false;
  let hideRemoved = false;
  globalWithWx.wx = {
    getLaunchOptionsSync: () => ({ query: { roomCode: "AB12CD" } }),
    onShow: (handler: (options: RuntimeEntryOptions) => void) => { showHandler = handler; },
    offShow: (handler: (options: RuntimeEntryOptions) => void) => { showRemoved = handler === showHandler; },
    onHide: (handler: () => void) => { hideHandler = handler; },
    offHide: (handler: () => void) => { hideRemoved = handler === hideHandler; }
  };
  try {
    const runtime = new WechatRuntimePort();
    assert.deepEqual(runtime.getLaunchOptions(), { query: { roomCode: "AB12CD" } });
    let shownCode = "";
    let hidden = false;
    const offShow = runtime.onAppShow((options) => {
      shownCode = String(options.query?.roomCode ?? "");
    });
    const offHide = runtime.onAppHide(() => { hidden = true; });
    const emitShow = showHandler as unknown as (options: RuntimeEntryOptions) => void;
    const emitHide = hideHandler as unknown as () => void;
    emitShow({ query: { roomCode: "CD34EF" } });
    emitHide();
    assert.equal(shownCode, "CD34EF");
    assert.equal(hidden, true);
    offShow();
    offHide();
    assert.equal(showRemoved, true);
    assert.equal(hideRemoved, true);
  } finally {
    if (previousWx) globalWithWx.wx = previousWx;
    else delete globalWithWx.wx;
  }
}

async function main(): Promise<void> {
  await testLifecycleCoordinator();
  testWechatLifecycleAdapter();
  console.log("Lifecycle OK: deferred invite join, hide/show polling, gameplay guard, and WeChat hooks.");
}

void main();
