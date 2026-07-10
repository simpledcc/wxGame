const fs = require("fs");
const path = require("path");
const {
  MAIN_PACKAGE_LIMIT_BYTES,
  assertSafeBuildRoot,
  loadBuildContract,
  readJson
} = require("./wechat-build-contract");

const REQUIRED_FILES = ["game.js", "game.json", "project.config.json"];
const FORBIDDEN_SEGMENTS = new Set(["cloudfunctions", "miniprogram", "node_modules"]);

function normalizePackageRoot(value) {
  const raw = String(value || "").replace(/\\/g, "/");
  if (raw.startsWith("/") || /^[A-Za-z]:\//.test(raw)) {
    throw new Error(`Invalid subpackage root: ${value}`);
  }

  const normalized = raw
    .replace(/^\.\//, "")
    .replace(/^\/+|\/+$/g, "");

  const segments = normalized.split("/");
  if (!normalized || segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error(`Invalid subpackage root: ${value}`);
  }
  return normalized;
}

function walkFiles(root) {
  const files = [];

  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Generated build must not contain symbolic links: ${absolute}`);
      }
      if (entry.isDirectory()) {
        visit(absolute);
      } else if (entry.isFile()) {
        files.push({
          bytes: fs.statSync(absolute).size,
          path: path.relative(root, absolute).replace(/\\/g, "/")
        });
      }
    }
  }

  visit(root);
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

function packageDefinitions(gameConfig) {
  const raw = gameConfig.subpackages || gameConfig.subPackages || [];
  if (!Array.isArray(raw)) {
    throw new Error("game.json subpackages must be an array when present.");
  }

  const roots = new Set();
  return raw.map((item, index) => {
    const root = normalizePackageRoot(item && item.root);
    if (roots.has(root)) {
      throw new Error(`Duplicate subpackage root: ${root}`);
    }
    roots.add(root);
    return {
      name: String((item && item.name) || `subpackage-${index + 1}`),
      root
    };
  });
}

function classifyFiles(files, definitions) {
  const ordered = [...definitions].sort((left, right) => right.root.length - left.root.length);
  const main = { bytes: 0, fileCount: 0 };
  const subpackages = new Map(definitions.map((item) => [item.root, { ...item, bytes: 0, fileCount: 0 }]));

  for (const file of files) {
    const owner = ordered.find((item) => file.path === item.root || file.path.startsWith(`${item.root}/`));
    const bucket = owner ? subpackages.get(owner.root) : main;
    bucket.bytes += file.bytes;
    bucket.fileCount += 1;
  }

  return { main, subpackages: [...subpackages.values()] };
}

function inspectWechatBuild(buildRoot, options = {}) {
  const projectRoot = options.projectRoot || path.resolve(__dirname, "..");
  if (!options.allowExternalBuildRoot) {
    assertSafeBuildRoot(projectRoot, buildRoot);
  }
  if (!fs.existsSync(buildRoot) || !fs.statSync(buildRoot).isDirectory()) {
    throw new Error(`WeChat build directory does not exist: ${buildRoot}`);
  }

  for (const required of REQUIRED_FILES) {
    if (!fs.existsSync(path.join(buildRoot, required))) {
      throw new Error(`Missing required WeChat build file: ${required}`);
    }
  }

  const gameConfig = readJson(path.join(buildRoot, "game.json"));
  const projectConfig = readJson(path.join(buildRoot, "project.config.json"));
  const expectedAppid = options.expectedAppid;
  const expectedOrientation = options.expectedOrientation;

  if (projectConfig.compileType !== "game") {
    throw new Error("Generated project.config.json compileType must be game.");
  }
  if (expectedAppid && projectConfig.appid !== expectedAppid) {
    throw new Error(`Generated appid mismatch: expected ${expectedAppid}, got ${projectConfig.appid || "<empty>"}`);
  }
  if (projectConfig.setting && projectConfig.setting.uploadWithSourceMap === true) {
    throw new Error("Generated project enables source-map upload; release output must disable it.");
  }

  const orientation = gameConfig.deviceOrientation || gameConfig.orientation;
  if (expectedOrientation && orientation !== expectedOrientation) {
    throw new Error(`Generated orientation mismatch: expected ${expectedOrientation}, got ${orientation || "<empty>"}`);
  }

  const files = walkFiles(buildRoot);
  const sourceMaps = files.filter((file) => file.path.endsWith(".map"));
  if (sourceMaps.length) {
    throw new Error(`Release build contains source maps: ${sourceMaps.map((file) => file.path).join(", ")}`);
  }

  const forbidden = files.filter((file) => file.path.split("/").some((segment) => FORBIDDEN_SEGMENTS.has(segment)));
  if (forbidden.length) {
    throw new Error(`Release build contains forbidden paths: ${forbidden.map((file) => file.path).join(", ")}`);
  }

  const definitions = packageDefinitions(gameConfig);
  const packages = classifyFiles(files, definitions);
  const limit = options.mainPackageLimitBytes || MAIN_PACKAGE_LIMIT_BYTES;
  if (packages.main.bytes > limit) {
    throw new Error(`Main package is ${packages.main.bytes} bytes; limit is ${limit} bytes.`);
  }

  return {
    appid: projectConfig.appid,
    buildRoot: path.resolve(buildRoot),
    checkedAt: new Date().toISOString(),
    fileCount: files.length,
    mainPackage: { ...packages.main, limitBytes: limit },
    orientation,
    subpackages: packages.subpackages,
    totalBytes: files.reduce((total, file) => total + file.bytes, 0)
  };
}

function formatBytes(bytes) {
  return `${bytes.toLocaleString("en-US")} bytes (${(bytes / 1024 / 1024).toFixed(2)} MiB)`;
}

function printReport(report) {
  console.log(`WeChat build OK: ${report.buildRoot}`);
  console.log(`Files: ${report.fileCount}; total: ${formatBytes(report.totalBytes)}`);
  console.log(`Main package: ${formatBytes(report.mainPackage.bytes)} / ${formatBytes(report.mainPackage.limitBytes)}`);
  for (const item of report.subpackages) {
    console.log(`Subpackage ${item.name} (${item.root}): ${formatBytes(item.bytes)}`);
  }
}

function runCli() {
  try {
    const contract = loadBuildContract();
    const buildRoot = process.argv[2] ? path.resolve(process.argv[2]) : contract.buildRoot;
    const report = inspectWechatBuild(buildRoot, {
      expectedAppid: contract.appid,
      expectedOrientation: contract.orientation,
      projectRoot: contract.projectRoot
    });
    const reportPath = path.join(contract.projectRoot, "build", "wechatgame-report.json");
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    printReport(report);
    console.log(`Report: ${reportPath}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = {
  classifyFiles,
  inspectWechatBuild,
  normalizePackageRoot,
  packageDefinitions,
  walkFiles
};
