import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

interface SourceContract {
  requestFields: string[];
  responseFields: string[];
  clientFacade: string;
}

const contracts: Record<string, SourceContract> = {
  getOpenId: {
    requestFields: [],
    responseFields: ["openid"],
    clientFacade: "CloudService"
  },
  checkText: {
    requestFields: ["content", "label", "scene", "maxLength"],
    responseFields: ["ok"],
    clientFacade: "ContentSafetyService"
  },
  submitFeedback: {
    requestFields: ["content", "contact", "playerName", "context"],
    responseFields: ["ok", "id"],
    clientFacade: "FeedbackService"
  },
  createRoom: {
    requestFields: ["gameOptions"],
    responseFields: ["roomId", "roomCode", "room"],
    clientFacade: "RoomService"
  },
  joinRoom: {
    requestFields: ["roomCode"],
    responseFields: ["roomId", "roomCode", "openid"],
    clientFacade: "RoomService"
  },
  toggleReady: {
    requestFields: ["roomId", "ready"],
    responseFields: ["ok", "players", "room"],
    clientFacade: "RoomService"
  },
  addBot: {
    requestFields: ["roomId", "difficulty", "botName"],
    responseFields: ["ok", "players", "gameOptions", "room"],
    clientFacade: "CloudService"
  },
  startGame: {
    requestFields: ["roomId", "roomWords"],
    responseFields: ["ok", "room"],
    clientFacade: "RoomService"
  },
  startCoopSpell: {
    requestFields: ["roomId", "roomWords", "roomSpellQuestions"],
    responseFields: ["ok", "updateMode", "room"],
    clientFacade: "RoomService"
  },
  catchFish: {
    requestFields: ["roomId", "fishId", "action", "powerUpId", "targetFishId", "questionId", "answer"],
    responseFields: ["delta", "correct", "finished"],
    clientFacade: "RoomService"
  },
  finishGame: {
    requestFields: ["roomId"],
    responseFields: ["ok"],
    clientFacade: "RoomService"
  }
};

const clientRoot = path.resolve(__dirname, "..");
const repositoryRoot = path.resolve(clientRoot, "..");

function read(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function escapePattern(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function consumesEventField(source: string, field: string): boolean {
  const escaped = escapePattern(field);
  return new RegExp(`\\bevent\\s*\\.\\s*${escaped}\\b`).test(source)
    || new RegExp(`\\{[\\s\\S]{0,500}\\b${escaped}\\b[\\s\\S]{0,500}\\}\\s*=\\s*event\\b`).test(source);
}

function returnsField(source: string, field: string): boolean {
  const escaped = escapePattern(field);
  const blocks = Array.from(source.matchAll(/return\s*\{([\s\S]{0,2400}?)\n?\s*\};?/g), (match) => match[1]);
  return blocks.some((block) => new RegExp(`\\b${escaped}\\s*(?::|,)`).test(block));
}

function testProductionSources(): void {
  Object.entries(contracts).forEach(([name, contract]) => {
    const functionRoot = path.join(repositoryRoot, "cloudfunctions", name);
    const sourcePath = path.join(functionRoot, "index.js");
    assert.equal(fs.existsSync(sourcePath), true, `${name} production source is missing`);
    assert.equal(fs.existsSync(path.join(functionRoot, "package.json")), true, `${name} package.json is missing`);
    const source = read(sourcePath);
    assert.match(source, /exports\.main\s*=\s*async/, `${name} must export an async main handler`);
    contract.requestFields.forEach((field) => {
      assert.equal(consumesEventField(source, field), true, `${name} no longer consumes event.${field}`);
    });
    contract.responseFields.forEach((field) => {
      assert.equal(returnsField(source, field), true, `${name} no longer returns ${field}`);
    });
  });
}

function testCocosContractCoverage(): void {
  const types = read(path.join(clientRoot, "assets", "scripts", "domain", "CloudFunctionTypes.ts"));
  const roomService = read(path.join(clientRoot, "assets", "scripts", "services", "RoomService.ts"));
  const contentSafety = read(path.join(clientRoot, "assets", "scripts", "services", "ContentSafetyService.ts"));
  const feedback = read(path.join(clientRoot, "assets", "scripts", "services", "FeedbackService.ts"));
  Object.entries(contracts).forEach(([name, contract]) => {
    const mapEntry = new RegExp(`\\b${escapePattern(name)}\\s*:`);
    assert.match(types, mapEntry, `${name} is missing from the typed cloud maps`);
    if (contract.clientFacade === "RoomService") {
      assert.equal(roomService.includes(`this.cloud.call("${name}"`), true, `${name} is missing from RoomService`);
    } else if (contract.clientFacade === "ContentSafetyService") {
      assert.equal(contentSafety.includes(`this.cloud.call("${name}"`), true, `${name} is missing from ContentSafetyService`);
    } else if (contract.clientFacade === "FeedbackService") {
      assert.equal(feedback.includes(`this.cloud.call("${name}"`), true, `${name} is missing from FeedbackService`);
    }
  });
}

function main(): void {
  testProductionSources();
  testCocosContractCoverage();
  console.log("Production contracts OK: 11 cloud handlers, request/response markers, and typed client coverage agree.");
}

main();
