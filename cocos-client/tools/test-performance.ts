import assert from "node:assert/strict";
import { PerformanceService } from "../assets/scripts/services/PerformanceService";

let now = 1000;
const service = new PerformanceService({
  frameWindowSize: 60,
  slowFrameMs: 50,
  now: () => now
});

service.recordFrame("home", Number.NaN);
service.recordFrame("home", 0);
for (let index = 0; index < 55; index += 1) {
  service.recordFrame("home", 0.01);
}
for (let index = 0; index < 10; index += 1) {
  service.recordFrame("pkGame", 0.1);
}
service.recordNodeCount("home", 48.9);
service.recordNodeCount("pkGame", 92);
service.recordNodeCount("home", 52);
now = 2500;

const snapshot = service.getSnapshot();
assert.equal(snapshot.schemaVersion, 1);
assert.equal(snapshot.sessionMs, 1500);
assert.equal(snapshot.totalFrames, 65);
assert.equal(snapshot.sampledFrames, 60);
assert.equal(snapshot.slowFrames, 10);
assert.equal(snapshot.averageFrameMs, 23.85);
assert.equal(snapshot.p95FrameMs, 100);
assert.equal(snapshot.maxFrameMs, 100);
assert.equal(snapshot.latestNodeCount, 52);
assert.equal(snapshot.peakNodeCount, 92);
assert.equal(snapshot.routes.home?.frames, 55);
assert.equal(snapshot.routes.home?.averageFrameMs, 10);
assert.equal(snapshot.routes.home?.peakNodeCount, 52);
assert.equal(snapshot.routes.pkGame?.frames, 10);
assert.equal(snapshot.routes.pkGame?.slowFrames, 10);
assert.equal(snapshot.routes.pkGame?.peakNodeCount, 92);

const serialized = JSON.parse(service.serializeSnapshot());
assert.equal(serialized.totalFrames, 65);
assert.equal(serialized.routes.pkGame.maxFrameMs, 100);

service.reset();
const reset = service.getSnapshot();
assert.equal(reset.totalFrames, 0);
assert.equal(reset.sampledFrames, 0);
assert.equal(reset.peakNodeCount, 0);
assert.deepEqual(reset.routes, {});

const invalidOptions = new PerformanceService({
  frameWindowSize: Number.NaN,
  slowFrameMs: Number.POSITIVE_INFINITY
});
invalidOptions.recordFrame("home", 0.02);
invalidOptions.recordNodeCount("home", Number.POSITIVE_INFINITY);
assert.equal(invalidOptions.getSnapshot().sampledFrames, 1);
assert.equal(invalidOptions.getSnapshot().latestNodeCount, 0);

console.log("Performance instrumentation OK: bounded frame window, route aggregates, node peaks, serialization, and reset.");
