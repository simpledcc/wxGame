const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function listDashboardInstalls() {
  const roots = [
    process.env.PROGRAMDATA && path.join(process.env.PROGRAMDATA, "cocos", "editors", "Creator"),
    process.env.PROGRAMDATA && path.join(process.env.PROGRAMDATA, "cocos", "editors")
  ].filter(Boolean);

  const commands = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) {
      continue;
    }

    const versions = fs
      .readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((left, right) => right.localeCompare(left, undefined, { numeric: true }));

    for (const version of versions) {
      commands.push(path.join(root, version, "CocosCreator.exe"));
    }
  }

  return commands;
}

function creatorCandidates() {
  return [
    process.env.COCOS_CREATOR,
    process.env.COCOS_CREATOR_PATH,
    ...listDashboardInstalls(),
    "CocosCreator",
    "CocosCreator.exe",
    "C:\\Cocos\\Creator\\3.8.8\\CocosCreator.exe",
    "C:\\Program Files\\CocosCreator\\CocosCreator.exe",
    "C:\\Program Files\\Cocos\\CocosCreator\\CocosCreator.exe",
    "C:\\Program Files (x86)\\CocosCreator\\CocosCreator.exe",
    "C:\\Program Files (x86)\\Cocos\\CocosCreator\\CocosCreator.exe"
  ]
    .filter(Boolean)
    .map((candidate) => String(candidate).replace(/^"|"$/g, ""))
    .filter((candidate, index, items) => items.indexOf(candidate) === index);
}

function canRun(command) {
  const result = spawnSync(command, ["--version"], {
    encoding: "utf8",
    timeout: 10000,
    windowsHide: true
  });

  return !result.error && (result.status === 0 || result.status === 36);
}

function findCocosCreator() {
  for (const candidate of creatorCandidates()) {
    if (path.isAbsolute(candidate) && fs.existsSync(candidate)) {
      return candidate;
    }
    if (!path.isAbsolute(candidate) && canRun(candidate)) {
      return candidate;
    }
  }

  return null;
}

module.exports = {
  creatorCandidates,
  findCocosCreator
};
