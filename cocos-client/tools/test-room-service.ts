import assert from "node:assert/strict";
import { MemoryRuntimePort } from "../assets/scripts/adapters/RuntimePort";
import { PRIVACY_VERSION } from "../assets/scripts/domain/StorageKeys";
import type { RoomSnapshot } from "../assets/scripts/domain/RoomTypes";
import { CloudService } from "../assets/scripts/services/CloudService";
import { PrivacyService } from "../assets/scripts/services/PrivacyService";
import { RoomService } from "../assets/scripts/services/RoomService";
import { StorageService } from "../assets/scripts/services/StorageService";

function createMockRoom(): RoomSnapshot {
  return {
    _id: "room-1",
    roomCode: "AB12CD",
    state: "waiting",
    ownerOpenid: "player-1",
    players: [
      {
        openid: "player-1",
        nickName: "玩家1",
        score: 0,
        ready: false,
        combo: 0,
        stunnedUntil: 0,
        powerUps: []
      }
    ],
    fishes: [],
    currentMeaning: "",
    targetFishId: "",
    spellQuestion: null,
    spellSubmissions: {},
    duration: 60,
    gameOptions: {
      duration: 60,
      bankId: "jilin-g1a-b1-welcome",
      mode: "regular",
      wrongWords: [],
      botDifficulty: "medium",
      matchMode: "pk",
      coopMode: "shared"
    },
    winnerOpenid: "",
    createdAt: 1,
    updatedAt: 1
  };
}

async function main(): Promise<void> {
  const room = createMockRoom();
  const runtime = new MemoryRuntimePort({
    storage: {
      privacyAcceptedVersion: PRIVACY_VERSION
    },
    cloudDocuments: {
      rooms: {
        "room-1": room
      }
    },
    cloudHandlers: {
      createRoom: (data) => {
        assert.deepEqual(data, {
          gameOptions: room.gameOptions
        });
        return {
          roomId: room._id,
          roomCode: room.roomCode,
          room
        };
      },
      joinRoom: (data) => {
        assert.deepEqual(data, {
          roomCode: room.roomCode
        });
        return {
          roomId: room._id,
          roomCode: room.roomCode,
          openid: "player-2"
        };
      },
      toggleReady: (data) => {
        assert.deepEqual(data, {
          roomId: room._id,
          ready: true
        });
        const players = room.players.map((player) => ({ ...player, ready: true }));
        return {
          ok: true,
          players,
          room: {
            ...room,
            players
          }
        };
      },
      startGame: (data) => {
        assert.deepEqual(data, {
          roomId: room._id,
          roomWords: [{ word: "exchange", meaning: "交换" }]
        });
        return {
          ok: true,
          room: {
            ...room,
            state: "playing"
          }
        };
      },
      startCoopSpell: (data) => {
        assert.deepEqual(data, {
          roomId: room._id,
          roomSpellQuestions: []
        });
        return {
          ok: true,
          updateMode: "single",
          room: {
            ...room,
            state: "playing"
          }
        };
      },
      catchFish: (data) => {
        assert.deepEqual(data, {
          roomId: room._id,
          fishId: "fish-1"
        });
        return {
          delta: 100,
          correct: true,
          finished: false
        };
      },
      finishGame: (data) => {
        assert.deepEqual(data, {
          roomId: room._id
        });
        return {
          ok: true,
          winnerOpenid: "player-1"
        };
      },
    }
  });
  const storage = new StorageService(runtime);
  const privacy = new PrivacyService(storage, runtime);
  storage.configurePrivacyGate(() => privacy.hasAcceptedCurrentVersion());
  const cloud = new CloudService(runtime, () => privacy.requireAccepted("room"));
  const rooms = new RoomService(cloud);

  await cloud.init("env-test");

  const created = await rooms.createRoom({ gameOptions: room.gameOptions });
  assert.equal(created.roomCode, "AB12CD");
  assert.equal(created.room.players.length, 1);

  const joined = await rooms.joinRoom({ roomCode: "AB12CD" });
  assert.equal(joined.openid, "player-2");

  const fetched = await rooms.fetch("room-1");
  assert.equal(fetched.roomCode, "AB12CD");
  assert.deepEqual(runtime.cloudDocumentReads, [
    { collection: "rooms", documentId: "room-1" }
  ]);

  const ready = await rooms.toggleReady("room-1", true);
  assert.equal(ready.players[0].ready, true);

  const started = await rooms.startGame({
    roomId: "room-1",
    roomWords: [{ word: "exchange", meaning: "交换" }]
  });
  assert.equal(started.room?.state, "playing");

  const spellStarted = await rooms.startCoopSpell({
    roomId: "room-1",
    roomSpellQuestions: []
  });
  assert.equal(spellStarted.updateMode, "single");
  assert.equal(spellStarted.room.state, "playing");

  const caught = await rooms.catchFish({ roomId: "room-1", fishId: "fish-1" });
  assert.equal(caught.delta, 100);
  assert.equal(caught.correct, true);

  const finished = await rooms.finishGame("room-1");
  assert.equal(finished.ok, true);

  assert.deepEqual(runtime.cloudCalls.map((call) => call.name), [
    "createRoom",
    "joinRoom",
    "toggleReady",
    "startGame",
    "startCoopSpell",
    "catchFish",
    "finishGame"
  ]);
  console.log("Room service OK: typed room cloud facade matches current contracts.");
}

void main();
