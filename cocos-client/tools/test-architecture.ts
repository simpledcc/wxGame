import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const clientRoot = path.resolve(__dirname, "..");
const repositoryRoot = path.resolve(clientRoot, "..");
const scriptsRoot = path.join(clientRoot, "assets", "scripts");

function listTypeScriptFiles(root: string): string[] {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    return entry.isDirectory()
      ? listTypeScriptFiles(fullPath)
      : entry.isFile() && entry.name.endsWith(".ts") ? [fullPath] : [];
  });
}

function source(relativePath: string): string {
  return fs.readFileSync(path.join(clientRoot, relativePath), "utf8");
}

function resolveTypeScriptImport(fromFile: string, specifier: string): string | null {
  if (!specifier.startsWith(".")) return null;
  const target = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [`${target}.ts`, path.join(target, "index.ts")];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function buildImportGraph(files: string[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  const importPattern = /(?:import|export)\s+(?:type\s+)?[\s\S]*?\sfrom\s+["']([^"']+)["']/g;
  files.forEach((filePath) => {
    const dependencies: string[] = [];
    const text = fs.readFileSync(filePath, "utf8");
    for (const match of text.matchAll(importPattern)) {
      const resolved = resolveTypeScriptImport(filePath, match[1]);
      if (resolved) dependencies.push(resolved);
    }
    graph.set(filePath, dependencies);
  });
  return graph;
}

function assertNoImportCycles(graph: Map<string, string[]>): void {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];

  const visit = (filePath: string): void => {
    if (visited.has(filePath)) return;
    if (visiting.has(filePath)) {
      const start = stack.indexOf(filePath);
      const cycle = [...stack.slice(start), filePath]
        .map((item) => path.relative(clientRoot, item).replace(/\\/g, "/"))
        .join(" -> ");
      assert.fail(`static import cycle detected: ${cycle}`);
    }
    visiting.add(filePath);
    stack.push(filePath);
    (graph.get(filePath) || []).forEach(visit);
    stack.pop();
    visiting.delete(filePath);
    visited.add(filePath);
  };

  graph.forEach((_dependencies, filePath) => visit(filePath));
}

function testSingleClientRepository(): void {
  assert.equal(fs.existsSync(path.join(repositoryRoot, "miniprogram")), false,
    "the retired mini-program client must not return");
  const projectConfig = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "project.config.json"), "utf8"));
  assert.equal(projectConfig.miniprogramRoot, "cocos-client/build/wechatgame/");
  assert.equal(projectConfig.cloudfunctionRoot, "cloudfunctions/");
  [
    "source-data/word-banks/wordBankData.js",
    "source-data/word-banks/spellWordBankData.js"
  ].forEach((relativePath) => assert.ok(fs.existsSync(path.join(clientRoot, relativePath)), `${relativePath} missing`));
  const generator = source("tools/generate-word-bank-data.js");
  assert.match(generator, /source-data/);
  assert.doesNotMatch(generator, /miniprogram/);
}

function testModuleBoundaries(): void {
  const files = listTypeScriptFiles(scriptsRoot);
  assertNoImportCycles(buildImportGraph(files));

  ["domain", "store", "services"].forEach((layer) => {
    listTypeScriptFiles(path.join(scriptsRoot, layer)).forEach((filePath) => {
      const text = fs.readFileSync(filePath, "utf8");
      assert.doesNotMatch(text, /from\s+["']cc["']/,
        `${path.relative(clientRoot, filePath)} must stay independent from Cocos nodes`);
      assert.doesNotMatch(text, /components\/|scenes\//,
        `${path.relative(clientRoot, filePath)} must not depend on presentation modules`);
    });
  });
}

function testPresentationModulesStayFocused(): void {
  const factory = source("assets/scripts/components/ui/RuntimeScreenFactory.ts");
  assert.ok(Buffer.byteLength(factory, "utf8") < 5_000, "RuntimeScreenFactory must remain a route facade");
  assert.doesNotMatch(factory, /addComponent\(/);

  const builders = [
    "HomeScreenBuilder.ts",
    "LearningScreenBuilders.ts",
    "RoomScreenBuilders.ts",
    "SupportScreenBuilders.ts"
  ];
  builders.forEach((name) => {
    const text = source(`assets/scripts/components/ui/screens/${name}`);
    assert.ok(Buffer.byteLength(text, "utf8") < 16_000, `${name} is taking on too many page responsibilities`);
  });

  const preGameUi = source("assets/scripts/components/ui/PreGameUi.ts");
  assert.ok(Buffer.byteLength(preGameUi, "utf8") < 35_000, "PreGameUi must keep icon rendering separated");
  assert.match(preGameUi, /PreGameIconRenderer/);

  const themeManager = source("assets/scripts/themes/ThemeManager.ts");
  const homeArtManager = source("assets/scripts/themes/HomeArtManager.ts");
  assert.doesNotMatch(themeManager, /HOME_ART_|HomeArtManager/);
  assert.match(homeArtManager, /HOME_ART_BUNDLE_NAME/);
  assert.match(homeArtManager, /class HomeArtManager/);
}

function main(): void {
  testSingleClientRepository();
  testModuleBoundaries();
  testPresentationModulesStayFocused();
  console.log("Architecture checks OK: single Cocos client, acyclic modules, clean layers, and focused UI/art responsibilities.");
}

main();
