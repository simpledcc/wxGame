const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const candidates = [
  process.env.COCOS_CREATOR,
  process.env.COCOS_CREATOR_PATH,
  "CocosCreator",
  "CocosCreator.exe",
  "C:\\Cocos\\Creator\\3.8.8\\CocosCreator.exe",
  "C:\\Program Files\\CocosCreator\\CocosCreator.exe",
  "C:\\Program Files\\Cocos\\CocosCreator\\CocosCreator.exe",
  "C:\\Program Files (x86)\\CocosCreator\\CocosCreator.exe",
  "C:\\Program Files (x86)\\Cocos\\CocosCreator\\CocosCreator.exe"
].filter(Boolean);

function canRun(command) {
  try {
    execFileSync(command, ["--version"], { stdio: "pipe", timeout: 10000 });
    return true;
  } catch (err) {
    return false;
  }
}

function exists(command) {
  return path.isAbsolute(command) && fs.existsSync(command);
}

const found = candidates.find((candidate) => exists(candidate) || canRun(candidate));

if (!found) {
  console.error("Cocos Creator command was not found.");
  console.error("Install Cocos Creator 3.x, then set COCOS_CREATOR or COCOS_CREATOR_PATH to the executable path.");
  process.exit(1);
}

console.log(`Cocos Creator candidate found: ${found}`);
