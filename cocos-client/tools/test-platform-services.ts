import assert from "node:assert/strict";
import { MemoryRuntimePort } from "../assets/scripts/adapters/RuntimePort";
import { Logger, type LogSink } from "../assets/scripts/core/Logger";
import { PrivacyRequiredError } from "../assets/scripts/domain/Privacy";
import { PRIVACY_VERSION } from "../assets/scripts/domain/StorageKeys";
import {
  CloudCallError,
  CloudService
} from "../assets/scripts/services/CloudService";
import { PrivacyService } from "../assets/scripts/services/PrivacyService";
import { ShareService } from "../assets/scripts/services/ShareService";
import { StorageService } from "../assets/scripts/services/StorageService";

async function testPrivacyAndLegacyStorage(): Promise<void> {
  const records = Array.from({ length: 55 }, (_, index) => ({
    id: `record-${index}`,
    finishedAt: index
  }));
  const runtime = new MemoryRuntimePort({
    storage: {
      wordCoins: 86.9,
      unlockedWordBanks: ["bank-a", "bank-a", "bank-b"],
      matchRecords: records,
      bestScoresByMode: {
        pk: { score: 600, finishedAt: 123 },
        coopShared: 420
      },
      wrongWords: [
        { word: "stable", meaning: "稳定的" },
        { word: "", meaning: "invalid" }
      ],
      soundMuted: false
    }
  });
  const storage = new StorageService(runtime);
  const privacy = new PrivacyService(storage, runtime);
  storage.configurePrivacyGate(() => privacy.hasAcceptedCurrentVersion());
  const cloud = new CloudService(runtime, () => privacy.requireAccepted("cloud"));

  await assert.rejects(() => cloud.init("env-test"), PrivacyRequiredError);
  assert.equal(runtime.cloudInitCount, 0);
  assert.throws(() => storage.get("wordCoins"), PrivacyRequiredError);
  assert.equal(await privacy.openContract(), false);
  assert.equal(runtime.privacyContractOpenCount, 1);

  privacy.acceptCurrentVersion();
  assert.equal(runtime.getStorage("privacyAcceptedVersion"), PRIVACY_VERSION);
  const snapshot = storage.readLegacySnapshot();
  assert.equal(snapshot.wordCoins, 86);
  assert.deepEqual(snapshot.unlockedWordBanks, ["bank-a", "bank-b"]);
  assert.equal(snapshot.matchRecords.length, 50);
  assert.equal(snapshot.matchRecords[0].id, "record-54");
  assert.equal(snapshot.matchRecords[49].id, "record-5");
  assert.deepEqual(snapshot.wrongWords, [{ word: "stable", meaning: "稳定的" }]);
  assert.equal(snapshot.soundMuted, false);
  assert.deepEqual(snapshot.bestScoresByMode.pk, { score: 600, finishedAt: 123 });
  assert.deepEqual(snapshot.bestScoresByMode.coopShared, { score: 420, finishedAt: 0 });

  runtime.setStorage("soundMuted", "1");
  assert.equal(storage.readLegacySnapshot().soundMuted, true);
  runtime.setStorage("soundMuted", "false");
  assert.equal(storage.readLegacySnapshot().soundMuted, false);

  await cloud.init("env-test");
  await cloud.init("env-test");
  assert.equal(runtime.cloudInitCount, 1);
}

async function testCloudCallsAndFailures(): Promise<void> {
  const captured: Array<{ line: string; data: unknown }> = [];
  const sink: LogSink = {
    info: (line, data) => captured.push({ line, data }),
    warn: (line, data) => captured.push({ line, data }),
    error: (line, data) => captured.push({ line, data })
  };
  const runtime = new MemoryRuntimePort({
    storage: {
      privacyAcceptedVersion: PRIVACY_VERSION
    },
    cloudHandlers: {
      getOpenId: () => ({ openid: "private-openid" }),
      checkText: () => {
        throw new Error("document.update:fail -5 openid=private-openid");
      },
      submitFeedback: () => new Promise(() => {})
    }
  });
  const storage = new StorageService(runtime);
  const privacy = new PrivacyService(storage, runtime);
  storage.configurePrivacyGate(() => privacy.hasAcceptedCurrentVersion());
  const cloud = new CloudService(
    runtime,
    () => privacy.requireAccepted("cloud"),
    new Logger("CloudTest", sink)
  );

  await cloud.init("env-test");
  const identity = await cloud.call("getOpenId", {}, { requestId: "req-success" });
  assert.equal(identity.openid, "private-openid");

  await assert.rejects(
    () => cloud.call("checkText", { content: "private feedback" }),
    (error: unknown) => {
      assert.ok(error instanceof CloudCallError);
      assert.equal(error.code, "FUNCTION_ERROR");
      assert.equal(error.retryable, true);
      return true;
    }
  );

  await assert.rejects(
    () => cloud.call(
      "submitFeedback",
      { content: "private feedback" },
      { timeoutMs: 500, requestId: "req-timeout" }
    ),
    (error: unknown) => {
      assert.ok(error instanceof CloudCallError);
      assert.equal(error.code, "TIMEOUT");
      return true;
    }
  );

  const serializedLogs = JSON.stringify(captured);
  assert.equal(serializedLogs.includes("private-openid"), false);
  assert.equal(serializedLogs.includes("private feedback"), false);
  assert.equal(serializedLogs.includes("req-success"), true);
  assert.equal(serializedLogs.includes("req-timeout"), true);
}

async function testLoggerRedaction(): Promise<void> {
  const captured: unknown[] = [];
  const logger = new Logger("RedactionTest", {
    info: (_line, data) => captured.push(data)
  });
  logger.info("payload", {
    openid: "secret-openid",
    contact: "13800000000",
    answer: "secret-answer",
    nested: {
      content: "secret-content",
      safeCount: 2
    }
  });
  const output = JSON.stringify(captured);
  assert.equal(output.includes("secret-openid"), false);
  assert.equal(output.includes("13800000000"), false);
  assert.equal(output.includes("secret-answer"), false);
  assert.equal(output.includes("secret-content"), false);
  assert.equal(output.includes("safeCount"), true);
}

async function testShareFallbackAndGate(): Promise<void> {
  const runtime = new MemoryRuntimePort({
    shareSupported: false
  });
  const storage = new StorageService(runtime);
  const privacy = new PrivacyService(storage, runtime);
  storage.configurePrivacyGate(() => privacy.hasAcceptedCurrentVersion());
  const share = new ShareService(runtime, privacy);

  await assert.rejects(() => share.shareRoom("ab-12cd", "同舟拼词记"), PrivacyRequiredError);
  assert.equal(runtime.clipboardText, "");

  privacy.acceptCurrentVersion();
  const result = await share.shareRoom("ab-12cd", "同舟拼词记");
  assert.equal(result, "copied");
  assert.equal(runtime.clipboardText, "AB12CD");
  assert.deepEqual(runtime.toastMessages, ["房间码已复制"]);
}

async function main(): Promise<void> {
  await testPrivacyAndLegacyStorage();
  await testCloudCallsAndFailures();
  await testLoggerRedaction();
  await testShareFallbackAndGate();
  console.log("Platform services OK: privacy, storage, cloud, logging, and sharing.");
}

void main();
