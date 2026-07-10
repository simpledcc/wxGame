import assert from "node:assert/strict";
import { MemoryRuntimePort } from "../assets/scripts/adapters/RuntimePort";
import { WORD_BANK_DATA } from "../assets/scripts/data/WordBankData.generated";
import { createStudySession, getStudyCard, moveStudyWord, revealCurrentStudyMeaning, setStudyMeaningVisibility } from "../assets/scripts/domain/StudySession";
import {
  getDefaultBankId,
  getStudyWords,
  getWordBankUnlockCost,
  getWrongBankId,
  normalizeUnlockedBankIds,
  resolveBankSelection
} from "../assets/scripts/domain/WordBankRules";
import { ALL_REVIEW_WORD_BANK_UNLOCK_COST, PRIVACY_VERSION, REVIEW_WORD_BANK_UNLOCK_COST, STORAGE_KEYS, WORD_BANK_UNLOCK_COST } from "../assets/scripts/domain/StorageKeys";
import { PrivacyService } from "../assets/scripts/services/PrivacyService";
import { StorageService } from "../assets/scripts/services/StorageService";
import { GameStore } from "../assets/scripts/store/GameStore";
import { WordBankStore } from "../assets/scripts/store/WordBankStore";

class OneShotStorageFailureRuntime extends MemoryRuntimePort {
  private failCoinsWrite = false;

  failNextCoinsWrite(): void {
    this.failCoinsWrite = true;
  }

  override setStorage<T>(key: string, value: T): void {
    if (key === STORAGE_KEYS.wordCoins && this.failCoinsWrite) {
      this.failCoinsWrite = false;
      throw new Error("simulated second-key write failure");
    }
    super.setStorage(key, value);
  }
}

function testCatalogAndUnlockRules(): void {
  assert.equal(getDefaultBankId(WORD_BANK_DATA), "jilin-g1a-b1-welcome");
  assert.equal(getWrongBankId(WORD_BANK_DATA), "wrong");
  assert.ok(WORD_BANK_DATA.WORD_BANKS["jilin-g1a-b1-welcome"].words.length > 0);
  assert.equal(getWordBankUnlockCost(WORD_BANK_DATA, "jilin-g1a-b1-welcome"), WORD_BANK_UNLOCK_COST);
  assert.equal(getWordBankUnlockCost(WORD_BANK_DATA, "jilin-g3r-b1-review"), REVIEW_WORD_BANK_UNLOCK_COST);
  assert.equal(getWordBankUnlockCost(WORD_BANK_DATA, "jilin-g3r-all-review"), ALL_REVIEW_WORD_BANK_UNLOCK_COST);

  const normalized = normalizeUnlockedBankIds(WORD_BANK_DATA, [
    "missing",
    "jilin-g1a-b1-u1",
    "jilin-g1a-b1-u1"
  ]);
  assert.deepEqual(normalized, ["jilin-g1a-b1-welcome", "jilin-g1a-b1-u1"]);
}

function testWordBankStoreSelection(): void {
  const store = new WordBankStore();
  store.hydrateLegacyState({
    wordCoins: 160,
    unlockedWordBanks: [],
    wrongWords: []
  }, WORD_BANK_DATA);

  assert.equal(store.isUnlocked(WORD_BANK_DATA, "jilin-g1a-b1-welcome"), true);
  assert.equal(store.selectBank(WORD_BANK_DATA, "jilin-g3r-all-review"), false);

  const unlock = store.unlockBank(WORD_BANK_DATA, "jilin-g3r-all-review");
  assert.deepEqual(unlock, {
    ok: true,
    bankId: "jilin-g3r-all-review",
    cost: 150,
    coins: 10
  });
  assert.equal(store.selectBank(WORD_BANK_DATA, "jilin-g3r-all-review"), true);
  assert.equal(store.getSelectedBankId(), "jilin-g3r-all-review");

  assert.deepEqual(
    resolveBankSelection(WORD_BANK_DATA, store.getUnlockedBankIds(), "wrong", []),
    { ok: false, bankId: "wrong", mode: "mistakes", reason: "emptyWrongWords" }
  );
}

function testStudyRevealFlow(): void {
  const words = getStudyWords(WORD_BANK_DATA, "jilin-g1a-b1-welcome", []).slice(0, 3);
  let session = createStudySession(words, { showMeaning: false });
  let card = getStudyCard(words, session);
  assert.equal(card?.word, "exchange");
  assert.equal(card?.meaningVisible, false);

  session = revealCurrentStudyMeaning(session);
  card = getStudyCard(words, session);
  assert.equal(card?.meaningVisible, true);

  session = moveStudyWord(words, session, 1);
  card = getStudyCard(words, session);
  assert.equal(card?.word, "lecture");
  assert.equal(card?.meaningVisible, false);

  session = setStudyMeaningVisibility(session, true);
  session = moveStudyWord(words, session, 1);
  card = getStudyCard(words, session);
  assert.equal(card?.word, "registration");
  assert.equal(card?.meaningVisible, true);
}

function testBankReturnRoute(): void {
  const store = new GameStore();
  store.setRoute("study");
  store.openBankPicker("study");
  assert.equal(store.getState().route, "bank");
  assert.equal(store.getState().bankReturnRoute, "study");
  const target = store.confirmBankSelection("jilin-g1a-b1-welcome", "regular");
  assert.equal(target, "study");
  assert.equal(store.getState().route, "study");
  assert.equal(store.getState().bankId, "jilin-g1a-b1-welcome");
}

async function testWordBankProgressPersistence(): Promise<void> {
  const runtime = new MemoryRuntimePort({
    storage: {
      privacyAcceptedVersion: PRIVACY_VERSION,
      wordCoins: 160,
      unlockedWordBanks: []
    }
  });
  const storage = new StorageService(runtime);
  const privacy = new PrivacyService(storage, runtime);
  storage.configurePrivacyGate(() => privacy.hasAcceptedCurrentVersion());
  const store = new WordBankStore();
  store.hydrateLegacyState(storage.readLegacySnapshot(), WORD_BANK_DATA);
  storage.writeWordBankProgress(store.getWordCoins(), store.getUnlockedBankIds());

  assert.equal(runtime.getStorage("wordCoins"), 160);
  assert.deepEqual(runtime.getStorage("unlockedWordBanks"), ["jilin-g1a-b1-welcome"]);

  const unlock = store.unlockBank(WORD_BANK_DATA, "jilin-g3r-all-review");
  assert.equal(unlock.ok, true);
  storage.writeWordBankProgress(store.getWordCoins(), store.getUnlockedBankIds());
  assert.equal(runtime.getStorage("wordCoins"), 10);
  assert.deepEqual(
    runtime.getStorage("unlockedWordBanks"),
    ["jilin-g3r-all-review", "jilin-g1a-b1-welcome"]
  );
}

function testWordBankProgressWriteCompensation(): void {
  const previousBanks = ["jilin-g1a-b1-welcome"];
  const runtime = new OneShotStorageFailureRuntime({
    storage: {
      privacyAcceptedVersion: PRIVACY_VERSION,
      wordCoins: 50,
      unlockedWordBanks: previousBanks
    }
  });
  const storage = new StorageService(runtime);
  const privacy = new PrivacyService(storage, runtime);
  storage.configurePrivacyGate(() => privacy.hasAcceptedCurrentVersion());
  runtime.failNextCoinsWrite();

  assert.throws(
    () => storage.writeWordBankProgress(40, ["jilin-g1a-b1-u1", ...previousBanks]),
    /simulated second-key write failure/
  );
  assert.equal(runtime.getStorage("wordCoins"), 50, "failed unlock must restore the previous coin value");
  assert.deepEqual(
    runtime.getStorage("unlockedWordBanks"),
    previousBanks,
    "failed unlock must restore the previous bank list"
  );
}

function main(): void {
  testCatalogAndUnlockRules();
  testWordBankStoreSelection();
  testStudyRevealFlow();
  testBankReturnRoute();
  testWordBankProgressWriteCompensation();
}

async function run(): Promise<void> {
  main();
  await testWordBankProgressPersistence();
  console.log("Stage 3 core OK: word bank catalog, atomic unlock persistence, study reveal flow, and picker return route.");
}

void run();
