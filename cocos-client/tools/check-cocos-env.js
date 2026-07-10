const { findCocosCreator } = require("./cocos-cli");

const found = findCocosCreator();

if (!found) {
  console.error("Cocos Creator command was not found.");
  console.error("Install Cocos Creator 3.x, then set COCOS_CREATOR or COCOS_CREATOR_PATH to the executable path.");
  process.exit(1);
}

console.log(`Cocos Creator candidate found: ${found}`);
