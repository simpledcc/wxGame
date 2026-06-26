const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
let importedWordBanks = null;
let importedSpellWordBanks = null;

function getImportedWordBanks() {
  if (!importedWordBanks) {
    importedWordBanks = (require("./wordBankData").WORD_BANKS || {});
  }
  return importedWordBanks;
}

function getImportedSpellWordBanks() {
  if (!importedSpellWordBanks) {
    importedSpellWordBanks = (require("./spellWordBankData").SPELL_WORD_BANKS || {});
  }
  return importedSpellWordBanks;
}

const JILIN_GAOKAO_WORDS = [
  { word: "abandon", meaning: "放弃" },
  { word: "ability", meaning: "能力" },
  { word: "absence", meaning: "缺席" },
  { word: "absorb", meaning: "吸收" },
  { word: "accept", meaning: "接受" },
  { word: "accident", meaning: "事故" },
  { word: "accompany", meaning: "陪伴" },
  { word: "achieve", meaning: "实现" },
  { word: "acquire", meaning: "获得" },
  { word: "adapt", meaning: "适应" },
  { word: "addition", meaning: "增加" },
  { word: "address", meaning: "地址；演讲" },
  { word: "adjust", meaning: "调整" },
  { word: "admit", meaning: "承认" },
  { word: "adopt", meaning: "采用；收养" },
  { word: "advertise", meaning: "做广告" },
  { word: "advice", meaning: "建议" },
  { word: "afford", meaning: "负担得起" },
  { word: "aim", meaning: "目标；旨在" },
  { word: "allow", meaning: "允许" },
  { word: "alternative", meaning: "可替代的" },
  { word: "amount", meaning: "数量" },
  { word: "ancient", meaning: "古代的" },
  { word: "announce", meaning: "宣布" },
  { word: "annual", meaning: "每年的" },
  { word: "anxiety", meaning: "焦虑" },
  { word: "apologize", meaning: "道歉" },
  { word: "appeal", meaning: "呼吁；吸引" },
  { word: "apply", meaning: "申请；应用" },
  { word: "appreciate", meaning: "欣赏；感激" },
  { word: "argue", meaning: "争论" },
  { word: "arrange", meaning: "安排" },
  { word: "aspect", meaning: "方面" },
  { word: "assess", meaning: "评估" },
  { word: "assist", meaning: "帮助" },
  { word: "associate", meaning: "联系" },
  { word: "assume", meaning: "假定" },
  { word: "atmosphere", meaning: "气氛；大气" },
  { word: "attach", meaning: "附上" },
  { word: "attack", meaning: "攻击" },
  { word: "attitude", meaning: "态度" },
  { word: "audience", meaning: "观众" },
  { word: "average", meaning: "平均的" },
  { word: "avoid", meaning: "避免" },
  { word: "aware", meaning: "意识到的" },
  { word: "balance", meaning: "平衡" },
  { word: "barrier", meaning: "障碍" },
  { word: "basic", meaning: "基本的" },
  { word: "behave", meaning: "表现" },
  { word: "belief", meaning: "信念" },
  { word: "beyond", meaning: "超出" },
  { word: "blame", meaning: "责备" },
  { word: "border", meaning: "边界" },
  { word: "branch", meaning: "分支" },
  { word: "breathe", meaning: "呼吸" },
  { word: "brilliant", meaning: "杰出的" },
  { word: "broadcast", meaning: "广播" },
  { word: "budget", meaning: "预算" },
  { word: "cancel", meaning: "取消" },
  { word: "capable", meaning: "有能力的" },
  { word: "capital", meaning: "首都；资本" },
  { word: "career", meaning: "职业" },
  { word: "case", meaning: "情况；案例" },
  { word: "category", meaning: "类别" },
  { word: "celebrate", meaning: "庆祝" },
  { word: "ceremony", meaning: "典礼" },
  { word: "certificate", meaning: "证书" },
  { word: "channel", meaning: "渠道" },
  { word: "character", meaning: "角色；性格" },
  { word: "charge", meaning: "收费；负责" },
  { word: "charity", meaning: "慈善" },
  { word: "choice", meaning: "选择" },
  { word: "circumstance", meaning: "情况" },
  { word: "citizen", meaning: "公民" },
  { word: "clarify", meaning: "澄清" },
  { word: "climate", meaning: "气候" },
  { word: "colleague", meaning: "同事" },
  { word: "combine", meaning: "结合" },
  { word: "comfort", meaning: "安慰" },
  { word: "comment", meaning: "评论" },
  { word: "communication", meaning: "交流" },
  { word: "community", meaning: "社区" },
  { word: "compare", meaning: "比较" },
  { word: "complain", meaning: "抱怨" },
  { word: "complex", meaning: "复杂的" },
  { word: "concentrate", meaning: "集中" },
  { word: "concern", meaning: "关心；担忧" },
  { word: "conclusion", meaning: "结论" },
  { word: "condition", meaning: "条件" },
  { word: "conduct", meaning: "组织；行为" },
  { word: "confident", meaning: "自信的" },
  { word: "conflict", meaning: "冲突" },
  { word: "connect", meaning: "连接" },
  { word: "consequence", meaning: "结果" },
  { word: "consider", meaning: "考虑" },
  { word: "construct", meaning: "建造" },
  { word: "consume", meaning: "消费" },
  { word: "contain", meaning: "包含" },
  { word: "contribute", meaning: "贡献" },
  { word: "cooperate", meaning: "合作" },
  { word: "courage", meaning: "勇气" },
  { word: "creative", meaning: "有创造力的" },
  { word: "culture", meaning: "文化" },
  { word: "curiosity", meaning: "好奇心" },
  { word: "decrease", meaning: "减少" },
  { word: "defend", meaning: "防御" },
  { word: "define", meaning: "定义" },
  { word: "delay", meaning: "推迟" },
  { word: "deliver", meaning: "递送；发表" },
  { word: "demand", meaning: "要求" },
  { word: "depend", meaning: "依靠" },
  { word: "describe", meaning: "描述" },
  { word: "deserve", meaning: "应得" },
  { word: "desire", meaning: "渴望" },
  { word: "determine", meaning: "决定" },
  { word: "develop", meaning: "发展" },
  { word: "device", meaning: "设备" },
  { word: "diet", meaning: "饮食" },
  { word: "direction", meaning: "方向" },
  { word: "discover", meaning: "发现" },
  { word: "discuss", meaning: "讨论" },
  { word: "disease", meaning: "疾病" },
  { word: "display", meaning: "展示" },
  { word: "doubt", meaning: "怀疑" },
  { word: "economy", meaning: "经济" },
  { word: "educate", meaning: "教育" },
  { word: "effective", meaning: "有效的" },
  { word: "element", meaning: "要素" },
  { word: "emergency", meaning: "紧急情况" },
  { word: "emotion", meaning: "情感" },
  { word: "encourage", meaning: "鼓励" },
  { word: "energy", meaning: "能量" },
  { word: "environment", meaning: "环境" },
  { word: "equal", meaning: "平等的" },
  { word: "equipment", meaning: "设备" },
  { word: "escape", meaning: "逃离" },
  { word: "essential", meaning: "必要的" },
  { word: "exchange", meaning: "交换" },
  { word: "exist", meaning: "存在" },
  { word: "expand", meaning: "扩大" },
  { word: "expect", meaning: "期待" },
  { word: "experience", meaning: "经历；经验" },
  { word: "experiment", meaning: "实验" },
  { word: "explain", meaning: "解释" },
  { word: "explore", meaning: "探索" },
  { word: "express", meaning: "表达" },
  { word: "failure", meaning: "失败" },
  { word: "familiar", meaning: "熟悉的" },
  { word: "feature", meaning: "特征" },
  { word: "figure", meaning: "数字；人物" },
  { word: "predict", meaning: "预测" },
  { word: "prepare", meaning: "准备" },
  { word: "prevent", meaning: "阻止" },
  { word: "privacy", meaning: "隐私" },
  { word: "product", meaning: "产品" },
  { word: "professional", meaning: "专业的" },
  { word: "project", meaning: "项目" },
  { word: "protect", meaning: "保护" },
  { word: "publish", meaning: "出版" },
  { word: "purpose", meaning: "目的" },
  { word: "quality", meaning: "质量" },
  { word: "realize", meaning: "意识到；实现" },
  { word: "reduce", meaning: "减少" },
  { word: "reflect", meaning: "反映" },
  { word: "refuse", meaning: "拒绝" },
  { word: "remind", meaning: "提醒" },
  { word: "remove", meaning: "移除" },
  { word: "represent", meaning: "代表" },
  { word: "require", meaning: "要求" },
  { word: "research", meaning: "研究" },
  { word: "resource", meaning: "资源" },
  { word: "respect", meaning: "尊重" },
  { word: "respond", meaning: "回应" },
  { word: "result", meaning: "结果" },
  { word: "review", meaning: "复习；评论" },
  { word: "reward", meaning: "奖励" },
  { word: "safety", meaning: "安全" },
  { word: "schedule", meaning: "日程" },
  { word: "secure", meaning: "安全的" },
  { word: "select", meaning: "选择" },
  { word: "serious", meaning: "严肃的" },
  { word: "service", meaning: "服务" },
  { word: "signal", meaning: "信号" },
  { word: "similar", meaning: "相似的" },
  { word: "society", meaning: "社会" },
  { word: "solve", meaning: "解决" },
  { word: "standard", meaning: "标准" },
  { word: "stress", meaning: "压力" },
  { word: "structure", meaning: "结构" },
  { word: "succeed", meaning: "成功" },
  { word: "support", meaning: "支持" },
  { word: "suppose", meaning: "假设" },
  { word: "technology", meaning: "技术" },
  { word: "tradition", meaning: "传统" },
  { word: "traffic", meaning: "交通" },
  { word: "value", meaning: "价值" },
  { word: "various", meaning: "各种各样的" },
  { word: "view", meaning: "观点；景色" },
  { word: "willing", meaning: "愿意的" },
  { word: "youth", meaning: "青年" }
];

const WORD_BANKS = {
  grade1: [
    { word: "teenager", meaning: "青少年" },
    { word: "volunteer", meaning: "志愿者" },
    { word: "debate", meaning: "辩论" },
    { word: "prefer", meaning: "更喜欢" },
    { word: "content", meaning: "内容" },
    { word: "movement", meaning: "运动" },
    { word: "suitable", meaning: "合适的" },
    { word: "actually", meaning: "事实上" },
    { word: "challenge", meaning: "挑战" },
    { word: "confusing", meaning: "令人困惑的" },
    { word: "fluent", meaning: "流利的" },
    { word: "graduate", meaning: "毕业" },
    { word: "recommend", meaning: "推荐" },
    { word: "advance", meaning: "进步" },
    { word: "literature", meaning: "文学" },
    { word: "generation", meaning: "一代" },
    { word: "attraction", meaning: "吸引力" },
    { word: "focus", meaning: "集中" },
    { word: "addicted", meaning: "上瘾的" },
    { word: "adventure", meaning: "冒险" },
    { word: "destination", meaning: "目的地" },
    { word: "unique", meaning: "独特的" },
    { word: "admire", meaning: "钦佩" },
    { word: "civilization", meaning: "文明" },
    { word: "architecture", meaning: "建筑" },
    { word: "request", meaning: "请求" },
    { word: "disaster", meaning: "灾难" },
    { word: "rescue", meaning: "营救" },
    { word: "damage", meaning: "损害" },
    { word: "survive", meaning: "幸存" },
    { word: "destroy", meaning: "摧毁" },
    { word: "affect", meaning: "影响" },
    { word: "effort", meaning: "努力" },
    { word: "wisdom", meaning: "智慧" },
    { word: "compete", meaning: "竞争" },
    { word: "host", meaning: "主办" },
    { word: "honour", meaning: "荣誉" },
    { word: "medal", meaning: "奖牌" },
    { word: "fitness", meaning: "健康" },
    { word: "strength", meaning: "力量" }
  ],
  grade2: [
    { word: "heritage", meaning: "遗产" },
    { word: "preserve", meaning: "保护" },
    { word: "promote", meaning: "促进" },
    { word: "proposal", meaning: "提议" },
    { word: "protest", meaning: "抗议" },
    { word: "establish", meaning: "建立" },
    { word: "committee", meaning: "委员会" },
    { word: "document", meaning: "文件" },
    { word: "donate", meaning: "捐赠" },
    { word: "attempt", meaning: "尝试" },
    { word: "worthwhile", meaning: "值得的" },
    { word: "process", meaning: "过程" },
    { word: "overseas", meaning: "海外的" },
    { word: "digital", meaning: "数字的" },
    { word: "application", meaning: "应用" },
    { word: "download", meaning: "下载" },
    { word: "inspire", meaning: "激励" },
    { word: "access", meaning: "入口" },
    { word: "confirm", meaning: "确认" },
    { word: "account", meaning: "账户" },
    { word: "benefit", meaning: "益处" },
    { word: "distance", meaning: "距离" },
    { word: "convenient", meaning: "方便的" },
    { word: "function", meaning: "功能" },
    { word: "battery", meaning: "电池" },
    { word: "pressure", meaning: "压力" },
    { word: "previous", meaning: "先前的" },
    { word: "romantic", meaning: "浪漫的" },
    { word: "performance", meaning: "表演" },
    { word: "ordinary", meaning: "普通的" },
    { word: "enable", meaning: "使能够" },
    { word: "prove", meaning: "证明" },
    { word: "award", meaning: "奖项" },
    { word: "original", meaning: "原创的" },
    { word: "phenomenon", meaning: "现象" },
    { word: "approach", meaning: "方法" },
    { word: "ensure", meaning: "确保" },
    { word: "generous", meaning: "慷慨的" },
    { word: "position", meaning: "位置" },
    { word: "evidence", meaning: "证据" }
  ],
  grade3: [
    { word: "ambition", meaning: "抱负" },
    { word: "appointment", meaning: "约会" },
    { word: "candidate", meaning: "候选人" },
    { word: "consequence", meaning: "结果" },
    { word: "commitment", meaning: "承诺" },
    { word: "circumstance", meaning: "情况" },
    { word: "competence", meaning: "能力" },
    { word: "critical", meaning: "批判性的" },
    { word: "definitely", meaning: "肯定地" },
    { word: "efficient", meaning: "高效的" },
    { word: "evaluate", meaning: "评价" },
    { word: "flexible", meaning: "灵活的" },
    { word: "guarantee", meaning: "保证" },
    { word: "independent", meaning: "独立的" },
    { word: "innovation", meaning: "创新" },
    { word: "interpret", meaning: "解释" },
    { word: "motivation", meaning: "动力" },
    { word: "negotiate", meaning: "协商" },
    { word: "obstacle", meaning: "障碍" },
    { word: "potential", meaning: "潜力" },
    { word: "priority", meaning: "优先事项" },
    { word: "procedure", meaning: "程序" },
    { word: "qualified", meaning: "合格的" },
    { word: "reference", meaning: "参考" },
    { word: "relevant", meaning: "相关的" },
    { word: "reputation", meaning: "名声" },
    { word: "resistance", meaning: "抵抗" },
    { word: "responsibility", meaning: "责任" },
    { word: "significant", meaning: "重要的" },
    { word: "strategy", meaning: "策略" },
    { word: "sufficient", meaning: "足够的" },
    { word: "temporary", meaning: "临时的" },
    { word: "tendency", meaning: "趋势" },
    { word: "therefore", meaning: "因此" },
    { word: "transform", meaning: "转变" },
    { word: "universal", meaning: "普遍的" },
    { word: "vocabulary", meaning: "词汇" },
    { word: "withdraw", meaning: "撤回" },
    { word: "witness", meaning: "见证" },
    { word: "accomplish", meaning: "完成" }
  ],
  gaokao: JILIN_GAOKAO_WORDS
};

const WORD_BANK_TERMS = [
  { id: "jilin-g1a", sourceBankId: "grade1", start: 0, end: 20, unitSize: 10 },
  { id: "jilin-g1b", sourceBankId: "grade1", start: 20, unitSize: 10 },
  { id: "jilin-g2a", sourceBankId: "grade2", start: 0, end: 20, unitSize: 10 },
  { id: "jilin-g2b", sourceBankId: "grade2", start: 20, unitSize: 10 },
  { id: "jilin-g3a", sourceBankId: "grade3", start: 0, end: 20, unitSize: 10 },
  { id: "jilin-g3b", sourceBankId: "grade3", start: 20, unitSize: 10 },
  { id: "jilin-gaokao", sourceBankId: "gaokao", start: 0, unitSize: 20 }
];

const DEFAULT_BANK_ID = "jilin-g1a-b1-welcome";

function addStructuredWordBanks() {
  WORD_BANK_TERMS.forEach((term) => {
    const sourceWords = WORD_BANKS[term.sourceBankId] || [];
    const termWords = sourceWords.slice(term.start || 0, term.end || sourceWords.length);
    const unitSize = term.unitSize || 10;
    for (let start = 0; start < termWords.length; start += unitSize) {
      const words = termWords.slice(start, start + unitSize);
      if (!words.length) continue;
      const unitIndex = Math.floor(start / unitSize) + 1;
      WORD_BANKS[`${term.id}-u${unitIndex}`] = words;
    }
  });
}

addStructuredWordBanks();

const WRONG_BANK_ID = "wrong";

const DEFAULT_GAME_OPTIONS = {
  duration: 60,
  bankId: DEFAULT_BANK_ID,
  mode: "regular",
  wrongWords: [],
  botDifficulty: "medium",
  matchMode: "pk",
  coopMode: "shared"
};

const VALID_DURATIONS = [30, 60, 90, 120];
const VALID_MODES = ["regular", "mistakes"];
const VALID_BOT_DIFFICULTIES = ["low", "medium", "high"];
const VALID_MATCH_MODES = ["pk", "coop"];
const VALID_COOP_MODES = ["shared", "spell"];
const DEFAULT_FISH_COUNT = 6;
const LANE_COUNT = 6;

function normalizeGameOptions(options) {
  const source = options || {};
  const duration = VALID_DURATIONS.includes(source.duration) ? source.duration : DEFAULT_GAME_OPTIONS.duration;
  let bankId = /^[a-z0-9_-]{1,80}$/.test(String(source.bankId || "")) ? String(source.bankId) : DEFAULT_GAME_OPTIONS.bankId;
  if (source.mode === "mistakes") bankId = WRONG_BANK_ID;
  const mode = bankId === WRONG_BANK_ID ? "mistakes" : "regular";
  const botDifficulty = VALID_BOT_DIFFICULTIES.includes(source.botDifficulty) ? source.botDifficulty : DEFAULT_GAME_OPTIONS.botDifficulty;
  const matchMode = VALID_MATCH_MODES.includes(source.matchMode) ? source.matchMode : DEFAULT_GAME_OPTIONS.matchMode;
  const coopMode = VALID_COOP_MODES.includes(source.coopMode) ? source.coopMode : DEFAULT_GAME_OPTIONS.coopMode;
  const wrongWords = normalizeWrongWords(source.wrongWords);
  const roomWords = normalizeRoomWords(source.roomWords);
  const roomSpellQuestions = normalizeSpellQuestions(source.roomSpellQuestions);
  return { duration, bankId, mode, wrongWords, roomWords, roomSpellQuestions, botDifficulty, matchMode, coopMode };
}

function normalizeWrongWords(words) {
  if (!Array.isArray(words)) return [];
  const seen = new Set();
  return words
    .map((item) => ({
      word: String(item && item.word ? item.word : "").trim(),
      meaning: String(item && item.meaning ? item.meaning : "").trim()
    }))
    .filter((item) => {
      if (!item.word || !item.meaning || seen.has(item.word)) return false;
      seen.add(item.word);
      return true;
    })
    .slice(0, 200);
}

function normalizeRoomWords(words) {
  return normalizeWrongWords(words).slice(0, 240);
}

function normalizeSpellQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  const seen = new Set();
  return questions
    .map((item) => {
      const word = String(item && item.word ? item.word : "").trim();
      const meaning = String(item && item.meaning ? item.meaning : "").trim();
      const key = String((item && item.key) || word).trim().toLowerCase();
      const slots = Array.isArray(item && item.slots) ? item.slots.map((slot, index) => ({
        index,
        position: Number(slot.position),
        answer: String(slot.answer || "").slice(0, 1).toLowerCase()
      })).filter((slot) => Number.isFinite(slot.position) && slot.answer) : [];
      if (!/^[a-zA-Z]{4,18}$/.test(word) || !meaning || !key || slots.length !== 4 || seen.has(key)) return null;
      seen.add(key);
      return {
        key,
        word,
        meaning,
        mask: String(item.mask || ""),
        blankPositions: Array.isArray(item.blankPositions) ? item.blankPositions.slice(0, 4).map(Number) : slots.map((slot) => slot.position),
        slots
      };
    })
    .filter(Boolean)
    .slice(0, 240);
}

function getActiveWords(options) {
  if (options.mode === "mistakes" || options.bankId === WRONG_BANK_ID) return options.wrongWords;
  if (Array.isArray(options.roomWords) && options.roomWords.length) return options.roomWords;
  const importedBanks = getImportedWordBanks();
  const bank = WORD_BANKS[options.bankId] || importedBanks[options.bankId] || importedBanks[DEFAULT_GAME_OPTIONS.bankId] || WORD_BANKS.grade1;
  return Array.isArray(bank) ? bank : (bank.words || []);
}

function pickWord(usedWords, options) {
  const words = getActiveWords(options);
  const available = words.filter((item) => !usedWords.has(item.word));
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function makeFish(index, usedWords, options) {
  const item = pickWord(usedWords, options);
  if (!item) return null;
  usedWords.add(item.word);
  const speedX = 5 + Math.random() * 7;
  return {
    id: `fish_${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`,
    word: item.word,
    meaning: item.meaning,
    isFake: false,
    correctWord: item.word,
    lane: index % LANE_COUNT,
    x: 12 + Math.random() * 76,
    y: 0,
    vx: Math.random() > 0.5 ? speedX : -speedX,
    vy: 0,
    alive: true
  };
}

function makeFishes(count, options) {
  const fishes = [];
  const usedWords = new Set();
  for (let i = 0; i < count; i += 1) {
    const fish = makeFish(i, usedWords, options);
    if (fish) fishes.push(fish);
  }
  return {
    fishes,
    usedWords: Array.from(usedWords)
  };
}

function pickTarget(fishes) {
  const alive = fishes.filter((fish) => fish.alive);
  return alive[Math.floor(Math.random() * alive.length)];
}

function hashSpellTemplateText(text) {
  let hash = 2166136261;
  const value = String(text || "");
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

function nextSpellTemplateSeed(seed) {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}

function pickStableBlankPositions(word, meaning, bankId) {
  const indexes = Array.from({ length: word.length }, (_, index) => index);
  let seed = hashSpellTemplateText(`${bankId || ""}:${word}:${meaning || ""}`) || 1;
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    seed = nextSpellTemplateSeed(seed);
    const swapIndex = seed % (index + 1);
    const value = indexes[index];
    indexes[index] = indexes[swapIndex];
    indexes[swapIndex] = value;
  }
  return indexes.slice(0, 4).sort((a, b) => a - b);
}

function makeSpellTemplateFromWord(item, bankId) {
  const word = String(item && item.word ? item.word : "").trim();
  const meaning = String(item && item.meaning ? item.meaning : "").trim();
  const key = word.toLowerCase();
  if (!/^[a-zA-Z]{4,18}$/.test(word) || !meaning) return null;
  const letters = Array.from(key);
  const blankPositions = pickStableBlankPositions(key, meaning, bankId);
  const slots = blankPositions.map((position, index) => ({
    index,
    position,
    answer: letters[position]
  }));
  return {
    key,
    word,
    meaning,
    mask: letters.map((letter, index) => (blankPositions.includes(index) ? "_" : letter)).join(""),
    blankPositions,
    slots
  };
}

function getActiveSpellTemplates(options) {
  if (Array.isArray(options.roomSpellQuestions) && options.roomSpellQuestions.length) return options.roomSpellQuestions;
  const importedSpellBanks = getImportedSpellWordBanks();
  const importedTemplates = importedSpellBanks[options.bankId] || importedSpellBanks[DEFAULT_GAME_OPTIONS.bankId] || [];
  if (Array.isArray(importedTemplates) && importedTemplates.length) return normalizeSpellQuestions(importedTemplates);
  return getActiveWords(options).map((item) => makeSpellTemplateFromWord(item, options.bankId)).filter(Boolean).slice(0, 240);
}

function pickSpellTemplate(usedWords, options) {
  const templates = getActiveSpellTemplates(options);
  const available = templates.filter((item) => {
    const key = String(item.key || item.word || "").trim().toLowerCase();
    const word = String(item.word || "").trim();
    return key && !usedWords.has(key) && !usedWords.has(word);
  });
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function makeSpellQuestion(players, usedWords, options) {
  const template = pickSpellTemplate(usedWords, options);
  if (!template) return null;
  const slots = (Array.isArray(template.slots) ? template.slots : []).map((slot, index) => ({
    index,
    position: Number(slot.position),
    answer: String(slot.answer || "").slice(0, 1).toLowerCase()
  }));
  if (slots.length !== 4) return null;
  const wordKey = String(template.key || template.word || "").trim().toLowerCase();
  usedWords.add(wordKey);
  const now = Date.now();
  const segments = players.length <= 1
    ? [{
      openid: players[0] && players[0].openid,
      start: 1,
      end: 4,
      length: 4,
      slotIndexes: [0, 1, 2, 3],
      answer: slots.map((slot) => slot.answer).join("")
    }]
    : [
      {
        openid: players[0] && players[0].openid,
        start: 1,
        end: 2,
        length: 2,
        slotIndexes: [0, 1],
        answer: slots.slice(0, 2).map((slot) => slot.answer).join("")
      },
      {
        openid: players[1] && players[1].openid,
        start: 3,
        end: 4,
        length: 2,
        slotIndexes: [2, 3],
        answer: slots.slice(2, 4).map((slot) => slot.answer).join("")
      }
    ];
  return {
    id: `spell_${now}_${Math.floor(Math.random() * 100000)}`,
    wordKey,
    word: template.word,
    meaning: template.meaning,
    mask: template.mask,
    blankPositions: template.blankPositions,
    slots,
    mode: "boatLetters",
    segments,
    createdAt: now
  };
}

exports.main = async (event) => {
  const started = Date.now();
  const roomId = event.roomId;
  console.log("[startGame] start", {
    roomId: String(roomId || "").slice(-6),
    eventRoomWordCount: Array.isArray(event.roomWords) ? event.roomWords.length : 0
  });
  if (!roomId) throw new Error("缺少房间 ID");

  const snapshot = await db.collection("rooms").doc(roomId).get();
  const room = snapshot.data;
  if (!room) throw new Error("房间不存在");
  if (room.state !== "waiting") return { ok: true };

  const eventRoomWords = Array.isArray(event.roomWords) && event.roomWords.length ? event.roomWords : null;
  const gameOptions = normalizeGameOptions({
    ...(room.gameOptions || {}),
    roomWords: eventRoomWords || (room.gameOptions && room.gameOptions.roomWords) || []
  });
  const players = room.players || [];
  console.log("[startGame] request", {
    roomId,
    roomState: room.state,
    matchMode: gameOptions.matchMode,
    coopMode: gameOptions.coopMode,
    playerCount: players.length,
    readyCount: players.filter((player) => player.ready).length,
    roomWordCount: gameOptions.roomWords.length
  });
  const minPlayers = 2;
  if (players.length < minPlayers) throw new Error(gameOptions.matchMode === "coop" ? "双人合作需要两名玩家" : "需要两名玩家");
  if (gameOptions.matchMode === "coop") {
    const humanPlayers = players.filter((player) => !player.isBot && String(player.openid || "").indexOf("bot_") !== 0);
    if (humanPlayers.length < 2) throw new Error("双人合作需要两名真实玩家");
  }
  if (!players.every((player) => player.ready)) throw new Error(gameOptions.matchMode === "coop" ? "准备后才能开始" : "双方准备后才能开始");
  if ((gameOptions.mode === "mistakes" || gameOptions.bankId === WRONG_BANK_ID) && !gameOptions.wrongWords.length) {
    throw new Error("错题库为空，请先去普通单元练习");
  }
  const resetPlayers = players.map((player) => ({
    ...player,
    score: 0,
    combo: 0,
    stunnedUntil: 0,
    powerUps: [],
    powerUp: null
  }));

  let fishes = [];
  let usedWords = [];
  let currentMeaning = "";
  let targetFishId = "";
  let spellQuestion = null;
  if (gameOptions.matchMode === "coop" && gameOptions.coopMode === "spell") {
    const usedSet = new Set();
    spellQuestion = makeSpellQuestion(resetPlayers, usedSet, gameOptions);
    if (!spellQuestion) throw new Error("当前词库没有适合拼词的单词");
    usedWords = Array.from(usedSet);
    currentMeaning = spellQuestion.meaning;
    targetFishId = spellQuestion.id;
  } else {
    const generated = makeFishes(DEFAULT_FISH_COUNT, gameOptions);
    fishes = generated.fishes;
    const target = pickTarget(fishes);
    if (!target) throw new Error("当前词库没有可用单词");
    usedWords = generated.usedWords;
    currentMeaning = target.meaning;
    targetFishId = target.id;
  }

  const now = Date.now();
  const updateData = {
    state: "playing",
    players: resetPlayers,
    fishes,
    currentMeaning,
    targetFishId,
    spellQuestion,
    spellSubmissions: spellQuestion ? { _resetAt: now, _questionId: spellQuestion.id } : {},
    winnerOpenid: "",
    duration: gameOptions.duration,
    gameOptions,
    usedWords,
    lastPowerUp: null,
    lastUsedPowerUp: null,
    lastUsedPowerUpId: "",
    lastUsedPowerUpType: "",
    lastUsedPowerUpPlayerOpenid: "",
    lastUsedPowerUpTargetOpenid: "",
    lastUsedPowerUpBonus: 0,
    lastUsedPowerUpStunMs: 0,
    lastUsedPowerUpCreatedAt: 0,
    lastUsedPowerUpAt: 0,
    startedAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  await db.collection("rooms").doc(roomId).update({ data: updateData });

  console.log("[startGame] started", {
    roomId,
    elapsed: Date.now() - started,
    coopMode: gameOptions.coopMode,
    playerCount: resetPlayers.length,
    roomWordCount: gameOptions.roomWords.length,
    hasSpellQuestion: !!spellQuestion
  });

  return {
    ok: true,
    room: {
      ...room,
      ...updateData,
      startedAt: now,
      updatedAt: now
    }
  };
};
