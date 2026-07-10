const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { findCocosCreator } = require("./cocos-cli");
const { inspectWechatBuild } = require("./inspect-wechat-build");
const { loadBuildContract } = require("./wechat-build-contract");
const { normalizeWechatSubpackages } = require("./normalize-wechat-subpackages");

function quote(value) {
  return /\s/.test(value) ? `"${value}"` : value;
}

function printPlan(creator, contract, logPath) {
  const buildArgument = `configPath=${contract.configPath};logDest=${logPath}`;
  console.log(`Project: ${contract.projectRoot}`);
  console.log(`Config: ${contract.configPath}`);
  console.log(`Output: ${contract.buildRoot}`);
  console.log(`Command: ${quote(creator || "<CocosCreator>")} --project ${quote(contract.projectRoot)} --build ${quote(buildArgument)}`);
}

function runBuild(options = {}) {
  const contract = loadBuildContract(options.projectRoot);
  const logPath = path.join(contract.projectRoot, "build", "wechat-build.log");
  const creator = options.creator || findCocosCreator();

  printPlan(creator, contract, logPath);
  if (options.dryRun) {
    console.log("Dry run passed; build contract is valid and no engine process was started.");
    return null;
  }
  if (!creator) {
    throw new Error("Cocos Creator command was not found. Install Cocos Creator 3.8.x or set COCOS_CREATOR_PATH.");
  }

  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  const buildArgument = `configPath=${contract.configPath};logDest=${logPath}`;
  const result = spawnSync(creator, ["--project", contract.projectRoot, "--build", buildArgument], {
    stdio: "inherit",
    windowsHide: false
  });

  if (result.error) {
    throw result.error;
  }
  if (result.signal) {
    throw new Error(`Cocos Creator build stopped by signal ${result.signal}.`);
  }
  if (result.status !== 0 && result.status !== 36) {
    throw new Error(`Cocos Creator build failed with exit code ${result.status}. See ${logPath}`);
  }

  normalizeWechatSubpackages(contract.buildRoot);
  const report = inspectWechatBuild(contract.buildRoot, {
    expectedAppid: contract.appid,
    expectedOrientation: contract.orientation,
    projectRoot: contract.projectRoot
  });
  const reportPath = path.join(contract.projectRoot, "build", "wechatgame-report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Cocos Creator build and package inspection passed. Report: ${reportPath}`);
  return report;
}

function runCli() {
  try {
    runBuild({ dryRun: process.argv.includes("--dry-run") });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { runBuild };
