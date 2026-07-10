import type { RouteName } from "../store/GameStore";

export const DEFAULT_SLOW_FRAME_MS = 50;
export const DEFAULT_FRAME_WINDOW_SIZE = 1800;

interface MutableAggregate {
  frames: number;
  totalFrameMs: number;
  maxFrameMs: number;
  slowFrames: number;
  latestNodeCount: number;
  peakNodeCount: number;
}

export interface RoutePerformanceSnapshot {
  frames: number;
  averageFrameMs: number;
  maxFrameMs: number;
  slowFrames: number;
  slowFramePercent: number;
  latestNodeCount: number;
  peakNodeCount: number;
}

export interface PerformanceSnapshot {
  schemaVersion: 1;
  capturedAt: number;
  sessionMs: number;
  slowFrameThresholdMs: number;
  totalFrames: number;
  sampledFrames: number;
  averageFrameMs: number;
  p95FrameMs: number;
  maxFrameMs: number;
  slowFrames: number;
  slowFramePercent: number;
  latestNodeCount: number;
  peakNodeCount: number;
  routes: Partial<Record<RouteName, RoutePerformanceSnapshot>>;
}

export interface PerformanceServiceOptions {
  frameWindowSize?: number;
  slowFrameMs?: number;
  now?: () => number;
}

function createAggregate(): MutableAggregate {
  return {
    frames: 0,
    totalFrameMs: 0,
    maxFrameMs: 0,
    slowFrames: 0,
    latestNodeCount: 0,
    peakNodeCount: 0
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function snapshotAggregate(aggregate: MutableAggregate): RoutePerformanceSnapshot {
  return {
    frames: aggregate.frames,
    averageFrameMs: round(aggregate.frames ? aggregate.totalFrameMs / aggregate.frames : 0),
    maxFrameMs: round(aggregate.maxFrameMs),
    slowFrames: aggregate.slowFrames,
    slowFramePercent: round(aggregate.frames ? aggregate.slowFrames / aggregate.frames * 100 : 0),
    latestNodeCount: aggregate.latestNodeCount,
    peakNodeCount: aggregate.peakNodeCount
  };
}

export class PerformanceService {
  private readonly frameWindowSize: number;
  private readonly slowFrameMs: number;
  private readonly now: () => number;
  private startedAt: number;
  private aggregate = createAggregate();
  private routeAggregates: Partial<Record<RouteName, MutableAggregate>> = {};
  private frameWindow: number[] = [];
  private frameWindowCursor = 0;

  constructor(options: PerformanceServiceOptions = {}) {
    const requestedWindowSize = Number(options.frameWindowSize ?? DEFAULT_FRAME_WINDOW_SIZE);
    const requestedSlowFrameMs = Number(options.slowFrameMs ?? DEFAULT_SLOW_FRAME_MS);
    this.frameWindowSize = Number.isFinite(requestedWindowSize)
      ? Math.max(60, Math.floor(requestedWindowSize))
      : DEFAULT_FRAME_WINDOW_SIZE;
    this.slowFrameMs = Number.isFinite(requestedSlowFrameMs)
      ? Math.max(1, requestedSlowFrameMs)
      : DEFAULT_SLOW_FRAME_MS;
    this.now = options.now || Date.now;
    this.startedAt = this.now();
  }

  recordFrame(route: RouteName, deltaSeconds: number): void {
    const rawFrameMs = Number(deltaSeconds) * 1000;
    if (!Number.isFinite(rawFrameMs) || rawFrameMs <= 0) return;
    const frameMs = Math.min(5000, rawFrameMs);
    this.addFrame(this.aggregate, frameMs);
    this.addFrame(this.getRouteAggregate(route), frameMs);

    if (this.frameWindow.length < this.frameWindowSize) {
      this.frameWindow.push(frameMs);
      return;
    }
    this.frameWindow[this.frameWindowCursor] = frameMs;
    this.frameWindowCursor = (this.frameWindowCursor + 1) % this.frameWindowSize;
  }

  recordNodeCount(route: RouteName, nodeCount: number): void {
    const rawNodeCount = Number(nodeCount);
    const normalized = Number.isFinite(rawNodeCount) ? Math.max(0, Math.floor(rawNodeCount)) : 0;
    this.aggregate.latestNodeCount = normalized;
    this.aggregate.peakNodeCount = Math.max(this.aggregate.peakNodeCount, normalized);
    const routeAggregate = this.getRouteAggregate(route);
    routeAggregate.latestNodeCount = normalized;
    routeAggregate.peakNodeCount = Math.max(routeAggregate.peakNodeCount, normalized);
  }

  getSnapshot(): PerformanceSnapshot {
    const capturedAt = this.now();
    const ordered = [...this.frameWindow].sort((left, right) => left - right);
    const p95Index = ordered.length ? Math.max(0, Math.ceil(ordered.length * 0.95) - 1) : 0;
    const routes: Partial<Record<RouteName, RoutePerformanceSnapshot>> = {};
    Object.entries(this.routeAggregates).forEach(([route, aggregate]) => {
      routes[route as RouteName] = snapshotAggregate(aggregate);
    });
    const total = snapshotAggregate(this.aggregate);
    return {
      schemaVersion: 1,
      capturedAt,
      sessionMs: Math.max(0, capturedAt - this.startedAt),
      slowFrameThresholdMs: this.slowFrameMs,
      totalFrames: total.frames,
      sampledFrames: ordered.length,
      averageFrameMs: total.averageFrameMs,
      p95FrameMs: round(ordered[p95Index] || 0),
      maxFrameMs: total.maxFrameMs,
      slowFrames: total.slowFrames,
      slowFramePercent: total.slowFramePercent,
      latestNodeCount: total.latestNodeCount,
      peakNodeCount: total.peakNodeCount,
      routes
    };
  }

  serializeSnapshot(): string {
    return JSON.stringify(this.getSnapshot(), null, 2);
  }

  reset(): void {
    this.startedAt = this.now();
    this.aggregate = createAggregate();
    this.routeAggregates = {};
    this.frameWindow = [];
    this.frameWindowCursor = 0;
  }

  private addFrame(aggregate: MutableAggregate, frameMs: number): void {
    aggregate.frames += 1;
    aggregate.totalFrameMs += frameMs;
    aggregate.maxFrameMs = Math.max(aggregate.maxFrameMs, frameMs);
    if (frameMs >= this.slowFrameMs) aggregate.slowFrames += 1;
  }

  private getRouteAggregate(route: RouteName): MutableAggregate {
    const existing = this.routeAggregates[route];
    if (existing) return existing;
    const aggregate = createAggregate();
    this.routeAggregates[route] = aggregate;
    return aggregate;
  }
}
