const config = require("./config");
const IMPORTED_WORD_BANK_DATA = require("./wordBankData");
const IMPORTED_SPELL_WORD_BANK_DATA = require("./spellWordBankData");

const canvas = wx.createCanvas();
const ctx = canvas.getContext("2d");
const systemInfo = wx.getSystemInfoSync();
const dpr = systemInfo.pixelRatio || 1;
const screen = {
  width: systemInfo.windowWidth,
  height: systemInfo.windowHeight
};
const safeTop = Math.max(
  systemInfo.statusBarHeight || 0,
  systemInfo.safeArea && systemInfo.safeArea.top ? systemInfo.safeArea.top : 0
);
const safeBottom = Math.max(
  0,
  systemInfo.screenHeight && systemInfo.safeArea && systemInfo.safeArea.bottom
    ? systemInfo.screenHeight - systemInfo.safeArea.bottom
    : 0
);

canvas.width = screen.width * dpr;
canvas.height = screen.height * dpr;
ctx.scale(dpr, dpr);

const COLORS = {
  deep: "#155E75",
  ocean: "#0891B2",
  oceanDark: "#164E63",
  cyan: "#67E8F9",
  white: "#FFFFFF",
  paper: "rgba(255,255,255,0.92)",
  text: "#0F172A",
  muted: "#64748B",
  yellow: "#FACC15",
  gold: "#F59E0B",
  red: "#BE123C",
  green: "#047857",
  sand: "#F6D7A7",
  coral: "#F9737F",
  leaf: "#22C55E",
  pink: "#FB7185",
  purple: "#7C3AED",
  aquaSoft: "#CFFAFE"
};

const GAME = {
  HOME: "home",
  ROOM: "room",
  PLAYING: "playing",
  BANKS: "banks",
  STUDY: "study",
  COOP_SELECT: "coopSelect",
  HISTORY: "history",
  HISTORY_DETAIL: "historyDetail",
  HELP: "help",
  FINISHED: "finished"
};

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
  grade1: {
    label: "高一",
    words: [
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
    ]
  },
  grade2: {
    label: "高二",
    words: [
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
    ]
  },
  grade3: {
    label: "高三",
    words: [
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
    ]
  },
  gaokao: {
    label: "吉林高考",
    words: JILIN_GAOKAO_WORDS
  }
};

const WORD_BANK_PROVINCES = [
  { id: "jilin", label: "人教版", caption: "高中英语" },
  { id: "personal", label: "错题词库", caption: "错题复习" }
];

const WORD_BANK_TERMS = [
  { id: "jilin-g1a", provinceId: "jilin", label: "高一上", sourceBankId: "grade1", start: 0, end: 20, unitSize: 10 },
  { id: "jilin-g1b", provinceId: "jilin", label: "高一下", sourceBankId: "grade1", start: 20, unitSize: 10 },
  { id: "jilin-g2a", provinceId: "jilin", label: "高二上", sourceBankId: "grade2", start: 0, end: 20, unitSize: 10 },
  { id: "jilin-g2b", provinceId: "jilin", label: "高二下", sourceBankId: "grade2", start: 20, unitSize: 10 },
  { id: "jilin-g3a", provinceId: "jilin", label: "高三上", sourceBankId: "grade3", start: 0, end: 20, unitSize: 10 },
  { id: "jilin-g3b", provinceId: "jilin", label: "高三下", sourceBankId: "grade3", start: 20, unitSize: 10 },
  { id: "jilin-gaokao", provinceId: "jilin", label: "高考词汇", sourceBankId: "gaokao", start: 0, unitSize: 20, unitPrefix: "专题" }
];

const DEFAULT_BANK_ID = IMPORTED_WORD_BANK_DATA.DEFAULT_BANK_ID || "jilin-g1a-b1-welcome";
const UNIT_NUMBER_LABELS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

function getUnitLabel(index, prefix) {
  const label = UNIT_NUMBER_LABELS[index] || String(index + 1);
  return `${label}${prefix || "单元"}`;
}

function getBankWordsById(bankId) {
  const bank = WORD_BANKS[bankId];
  if (!bank) return [];
  return Array.isArray(bank) ? bank : (bank.words || []);
}

function addStructuredWordBanks() {
  WORD_BANK_TERMS.forEach((term) => {
    const sourceWords = getBankWordsById(term.sourceBankId);
    const termWords = sourceWords.slice(term.start || 0, term.end || sourceWords.length);
    const unitSize = term.unitSize || 10;
    for (let start = 0; start < termWords.length; start += unitSize) {
      const unitIndex = Math.floor(start / unitSize);
      const words = termWords.slice(start, start + unitSize);
      if (!words.length) continue;
      const unitLabel = getUnitLabel(unitIndex, term.unitPrefix);
      const id = `${term.id}-u${unitIndex + 1}`;
      const province = WORD_BANK_PROVINCES.find((item) => item.id === term.provinceId) || WORD_BANK_PROVINCES[0];
      WORD_BANKS[id] = {
        label: `${province.label}-${term.label}-${unitLabel}`,
        shortLabel: `${term.label} ${unitLabel}`,
        words,
        meta: {
          provinceId: province.id,
          provinceLabel: province.label,
          termId: term.id,
          termLabel: term.label,
          unitLabel,
          sourceBankId: term.sourceBankId
        }
      };
    }
  });
}

addStructuredWordBanks();

function applyImportedWordBankData(data) {
  if (!data || !data.WORD_BANKS) return;
  Object.keys(WORD_BANKS).forEach((bankId) => {
    if (WORD_BANKS[bankId] && WORD_BANKS[bankId].meta) delete WORD_BANKS[bankId];
  });
  Object.keys(data.WORD_BANKS).forEach((bankId) => {
    WORD_BANKS[bankId] = data.WORD_BANKS[bankId];
  });
  if (Array.isArray(data.WORD_BANK_PROVINCES)) {
    WORD_BANK_PROVINCES.length = 0;
    data.WORD_BANK_PROVINCES.forEach((province) => WORD_BANK_PROVINCES.push(province));
  }
  if (Array.isArray(data.WORD_BANK_TERMS)) {
    WORD_BANK_TERMS.length = 0;
    data.WORD_BANK_TERMS.forEach((term) => WORD_BANK_TERMS.push(term));
  }
}

applyImportedWordBankData(IMPORTED_WORD_BANK_DATA);

const SPELL_WORD_BANKS = (IMPORTED_SPELL_WORD_BANK_DATA && IMPORTED_SPELL_WORD_BANK_DATA.SPELL_WORD_BANKS) || {};
const WRONG_BANK_ID = IMPORTED_WORD_BANK_DATA.WRONG_BANK_ID || "wrong";

function getSelectableWordBankIds() {
  return Object.keys(WORD_BANKS).filter((bankId) => WORD_BANKS[bankId] && WORD_BANKS[bankId].meta);
}

const OPTION_LISTS = {
  durations: [30, 60, 90, 120],
  banks: getSelectableWordBankIds()
};

const DEFAULT_GAME_OPTIONS = {
  duration: 60,
  bankId: DEFAULT_BANK_ID,
  mode: "regular",
  botDifficulty: "medium",
  matchMode: "pk",
  coopMode: "shared"
};

const BOT_DIFFICULTIES = {
  low: { label: "低难度", shortLabel: "低", delay: 5000 },
  medium: { label: "中难度", shortLabel: "中", delay: 3000 },
  high: { label: "高难度", shortLabel: "高", delay: 1000 }
};

const BOT_PRESETS = [
  { name: "Emma", difficulty: "high" },
  { name: "Jack", difficulty: "medium" },
  { name: "Lily", difficulty: "low" }
];

const LANE_COUNT = 6;
const DEFAULT_FISH_COUNT = 6;
const WRONG_WORDS_KEY = "wrongWords";
const MATCH_RECORDS_KEY = "matchRecords";
const BEST_SCORES_KEY = "bestScoresByMode";
const WORD_COINS_KEY = "wordCoins";
const UNLOCKED_BANKS_KEY = "unlockedWordBanks";
const SOUND_MUTED_KEY = "soundMuted";
const INITIAL_WORD_COINS = 1000;
const WORD_BANK_UNLOCK_COST = 10;
const MATCH_RECORD_LIMIT = 50;
const HISTORY_PAGE_SIZE = 5;
const ROOM_WORD_POOL_LIMIT = 240;
const SCORE_MODES = [
  { id: "pk", label: "双人PK", shortLabel: "PK" },
  { id: "coopShared", label: "默契捕词赛", shortLabel: "捕词" },
  { id: "coopSpell", label: "同舟拼词记", shortLabel: "拼词" }
];
const VISUAL_SKINS = ["ocean", "grass"];
const FORCED_VISUAL_SKIN = "grass";
const BGM_SRC = "assets/bgm.wav";
const BGM_VOLUME = 0.28;
const LETTER_KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row) => row.split(""));
const COOP_SPELL_PLAYER_THEMES = [
  { fill: "#CFFAFE", stroke: "#0891B2", text: "#155E75", badge: "#0E7490" },
  { fill: "#FFE4E6", stroke: "#FB7185", text: "#9F1239", badge: "#E11D48" }
];
const COOP_SPELL_QUESTION_SECONDS = 20;
const COOP_SPELL_ROUND_SCORE = 100;
const PLAYING_RENDER_DELAY = 33;
const ROOM_RENDER_DELAY = 120;
const STATIC_RENDER_DELAY = 80;
const ROOM_POLL_INTERVAL = 1000;
const COOP_SPELL_ROOM_POLL_INTERVAL = 600;
const DEBUG_TOOLS_ENABLED = false;
const DEBUG_LOGS_ENABLED = false;
const DEBUG_LOG_MAX_TEXT = 80;
const DEBUG_LOG_COPY_MAX_CHARS = 4200;
const DEBUG_LOG_COPY_RETRY_CHARS = 1800;
const DEBUG_LOG_COPY_MAX_LOGS = 80;
const DEBUG_LOG_COPY_MIN_LOGS = 12;
const SLOW_FRAME_MS = 70;
const SLOW_RENDER_GAP_MS = 180;
const SLOW_CLOUD_CALL_MS = 900;
const SLOW_ROOM_FETCH_MS = 700;
const SLOW_INPUT_HANDLER_MS = 80;
const EMPTY_TAP_LOG_INTERVAL_MS = 2000;
const TAP_RIPPLE_ENABLED = false;

const BACKGROUND_SCENES = [
  {
    top: "#7DD3FC",
    mid: "#06B6D4",
    bottom: "#0F766E",
    sand: "#F8DCA8",
    plant: "#0F766E",
    accent: "#FB7185",
    ray: "rgba(255,255,255,0.18)"
  },
  {
    top: "#5EEAD4",
    mid: "#0EA5A4",
    bottom: "#155E75",
    sand: "#FACC15",
    plant: "#16A34A",
    accent: "#F97316",
    ray: "rgba(255,255,255,0.14)"
  },
  {
    top: "#38BDF8",
    mid: "#2563EB",
    bottom: "#172554",
    sand: "#93C5FD",
    plant: "#0F766E",
    accent: "#C084FC",
    ray: "rgba(219,234,254,0.13)"
  }
];

const GRASS_BACKGROUND_SCENES = [
  {
    skyTop: "#BAE6FD",
    skyBottom: "#DCFCE7",
    hillBack: "#86EFAC",
    hillFront: "#22C55E",
    ground: "#16A34A",
    grass: "#15803D",
    flower: "#FACC15"
  },
  {
    skyTop: "#FDE68A",
    skyBottom: "#BBF7D0",
    hillBack: "#A7F3D0",
    hillFront: "#4ADE80",
    ground: "#22C55E",
    grass: "#166534",
    flower: "#FB7185"
  }
];

const FISH_PALETTES = [
  ["#FACC15", "#FEF3C7", "#F97316"],
  ["#38BDF8", "#E0F2FE", "#2563EB"],
  ["#FB7185", "#FFE4E6", "#BE123C"],
  ["#34D399", "#DCFCE7", "#047857"],
  ["#A78BFA", "#EDE9FE", "#6D28D9"],
  ["#F59E0B", "#FFEDD5", "#EA580C"]
];

const state = {
  scene: GAME.HOME,
  openid: "",
  playerName: wx.getStorageSync("playerName") || "玩家",
  gameOptions: { ...DEFAULT_GAME_OPTIONS },
  practiceMode: false,
  soloSpellMode: false,
  roomId: "",
  roomCode: "",
  players: [],
  fishes: [],
  renderedFishes: [],
  currentMeaning: "",
  targetFishId: "",
  teamScore: 0,
  spellHistory: [],
  startedAt: 0,
  duration: 60,
  timeLeft: 60,
  resultTitle: "",
  combo: 0,
  feedbacks: [],
  usedWords: [],
  backgroundScene: 0,
  visualSkin: FORCED_VISUAL_SKIN || "ocean",
  busy: false,
  catchPending: false,
  pesticideEffectUntil: 0,
  pesticideHideAt: 0,
  powerUpRefreshTimer: null,
  botCatchTimer: null,
  botCatchKey: "",
  selectedBotIndex: 1,
  inviteJoining: false,
  cloudReady: false,
  pendingInviteCode: "",
  message: "创建房间或输入房间码加入对战",
  startError: "",
  buttons: [],
  finishing: false,
  historyPage: 0,
  historyMode: "pk",
  historyDetailPage: 0,
  historyDetailRecord: null,
  bestScores: {},
  bankPickerProvinceId: "jilin",
  bankPickerPage: 0,
  bankPickerSelectedBankId: DEFAULT_GAME_OPTIONS.bankId,
  bankPickerReturnScene: GAME.HOME,
  studyIndex: 0,
  studyShowMeaning: true,
  studyRevealCurrentMeaning: false,
  coins: getStoredCoinBalance(),
  unlockedBankIds: getStoredUnlockedBankIds(),
  seenPowerUpId: "",
  seenUsedPowerUpId: "",
  coopSpellQuestion: null,
  coopSpellSubmissions: {},
  coopSpellInput: [],
  coopSpellInputQuestionId: "",
  coopSpellAdvancingQuestionId: "",
  coopSpellAutoSkipQuestionId: "",
  coopSpellQuestionTimeLeft: COOP_SPELL_QUESTION_SECONDS,
  coopSpellQuestionLocalId: "",
  coopSpellQuestionLocalStartedAt: 0,
  roomStartedRemoteAt: 0,
  roomStartedLocalAt: 0,
  soloSpellRecordSaved: false,
  soundMuted: getStoredSoundMuted()
};

applyInitialUnlockedBankSelection();
migrateStoredScoreRecords();
state.bestScores = getBestScores();

let pollTimer = null;
let roomPollInterval = 0;
let renderTimer = null;
let frameNow = 0;
let roomFetchPending = false;
let roomFetchQueued = false;
let bgmAudio = null;
let bgmStarted = false;
let bgmPausedByHide = false;
const wordWidthCache = {};
const fishMetricsCache = {};
const cockroachSpriteCache = {};
const uiSpriteCache = {};
let backgroundCache = null;
let logSeq = 0;
let cloudCallSeq = 0;
let lastSlowFrameLogAt = 0;
let lastRenderLoopAt = 0;
let lastEmptyTapLogAt = 0;
let lastLoggedScene = "";
let lastLoggedRoomState = "";
const debugLogBuffer = [];

function trimLogText(value) {
  const text = String(value == null ? "" : value);
  return text.length > DEBUG_LOG_MAX_TEXT ? `${text.slice(0, DEBUG_LOG_MAX_TEXT)}...` : text;
}

function maskLogId(value) {
  const text = String(value || "");
  if (!text) return "";
  if (text.length <= 6) return text;
  return `...${text.slice(-6)}`;
}

function getLogRoomRef() {
  return state.roomCode || maskLogId(state.roomId);
}

function summarizeLogPlayers(players) {
  if (!Array.isArray(players)) return { count: 0 };
  return {
    count: players.length,
    readyCount: players.filter((player) => player && player.ready).length,
    botCount: players.filter((player) => player && (player.isBot || String(player.openid || "").indexOf("bot_") === 0)).length,
    scores: players.map((player) => Number((player && player.score) || 0))
  };
}

function summarizeLogFishes(fishes) {
  if (!Array.isArray(fishes)) return { count: 0, aliveCount: 0 };
  return {
    count: fishes.length,
    aliveCount: fishes.filter((fish) => fish && fish.alive).length
  };
}

function summarizeLogRoom(room) {
  if (!room || typeof room !== "object") return room;
  const options = room.gameOptions || {};
  return {
    id: maskLogId(room._id || room.roomId),
    roomCode: maskLogId(room.roomCode),
    state: room.state || "",
    mode: options.matchMode || "",
    coopMode: options.coopMode || "",
    duration: room.duration || options.duration || 0,
    players: summarizeLogPlayers(room.players),
    fishes: summarizeLogFishes(room.fishes),
    hasSpellQuestion: !!room.spellQuestion,
    usedWordCount: Array.isArray(room.usedWords) ? room.usedWords.length : 0
  };
}

function sanitizeLogValue(value, key, depth) {
  const currentDepth = depth || 0;
  const currentKey = String(key || "");
  if (value == null) return value;
  if (/openid/i.test(currentKey)) return "[redacted]";
  if (/answer/i.test(currentKey) || currentKey === "word" || currentKey === "meaning") {
    return `[redacted:${String(value).length}]`;
  }
  if (/roomId|_id|id$/i.test(currentKey) && typeof value === "string") return maskLogId(value);
  if (typeof value === "string") return trimLogText(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    if (currentKey === "players") return summarizeLogPlayers(value);
    if (currentKey === "fishes") return summarizeLogFishes(value);
    if (currentKey === "roomWords" || currentKey === "wrongWords" || currentDepth >= 1) {
      return { type: "array", count: value.length };
    }
    return {
      type: "array",
      count: value.length,
      sample: value.slice(0, 3).map((item) => sanitizeLogValue(item, currentKey, currentDepth + 1))
    };
  }
  if (typeof value === "object") {
    if (currentKey === "room") return summarizeLogRoom(value);
    if (currentKey === "gameOptions") {
      return {
        duration: value.duration,
        bankId: trimLogText(value.bankId || ""),
        mode: value.mode,
        matchMode: value.matchMode,
        coopMode: value.coopMode,
        botDifficulty: value.botDifficulty,
        roomWordCount: Array.isArray(value.roomWords) ? value.roomWords.length : 0,
        wrongWordCount: Array.isArray(value.wrongWords) ? value.wrongWords.length : 0
      };
    }
    if (currentKey === "spellQuestion") {
      return {
        id: maskLogId(value.id),
        hasQuestion: !!value.id,
        segmentCount: Array.isArray(value.segments) ? value.segments.length : 0,
        slotCount: Array.isArray(value.slots) ? value.slots.length : 0
      };
    }
    if (currentDepth >= 2) {
      return {
        type: "object",
        keys: Object.keys(value).slice(0, 8)
      };
    }
    const result = {};
    Object.keys(value).slice(0, 24).forEach((itemKey) => {
      result[itemKey] = sanitizeLogValue(value[itemKey], itemKey, currentDepth + 1);
    });
    return result;
  }
  return String(value);
}

function writeLog(level, tag, event, payload) {
  if (!DEBUG_LOGS_ENABLED || typeof console === "undefined") return;
  const writer = console[level] || console.log;
  const meta = {
    seq: ++logSeq,
    at: Date.now(),
    scene: state.scene,
    room: getLogRoomRef(),
    event,
    data: sanitizeLogValue(payload || {}, "", 0)
  };
  debugLogBuffer.push(meta);
  if (debugLogBuffer.length > 180) debugLogBuffer.shift();
  try {
    writer.call(console, `[word-game][${tag}] ${event}`, meta);
  } catch (err) {
    try {
      console.log(`[word-game][${tag}] ${event}`, meta);
    } catch (ignored) {}
  }
}

function logInfo(tag, event, payload) {
  writeLog("log", tag, event, payload);
}

function logWarn(tag, event, payload) {
  writeLog("warn", tag, event, payload);
}

function logError(tag, event, payload) {
  writeLog("error", tag, event, payload);
}

function setupBgMusic() {
  if (bgmAudio || !wx.createInnerAudioContext) return bgmAudio;
  try {
    bgmAudio = wx.createInnerAudioContext();
    bgmAudio.src = BGM_SRC;
    bgmAudio.loop = true;
    bgmAudio.volume = BGM_VOLUME;
    bgmAudio.obeyMuteSwitch = false;
    if (bgmAudio.onPlay) {
      bgmAudio.onPlay(() => {
        bgmStarted = true;
        bgmPausedByHide = false;
        logInfo("audio", "bgm.play", { muted: state.soundMuted });
      });
    }
    if (bgmAudio.onError) {
      bgmAudio.onError((err) => {
        bgmStarted = false;
        logWarn("audio", "bgm.error", { errMsg: err && err.errMsg });
      });
    }
  } catch (err) {
    bgmAudio = null;
    bgmStarted = false;
    logWarn("audio", "bgm.setup.fail", { errMsg: err && (err.errMsg || err.message) });
  }
  return bgmAudio;
}

function playBgMusic() {
  if (state.soundMuted) {
    pauseBgMusic(false);
    return;
  }
  const audio = setupBgMusic();
  if (!audio) return;
  try {
    if (audio.play) audio.play();
  } catch (err) {
    bgmStarted = false;
  }
}

function pauseBgMusic(pausedByHide) {
  const nextPausedByHide = !!pausedByHide;
  if (!bgmAudio) {
    bgmStarted = false;
    bgmPausedByHide = nextPausedByHide;
    return;
  }
  try {
    if (bgmAudio.pause) bgmAudio.pause();
    bgmStarted = false;
    bgmPausedByHide = nextPausedByHide;
  } catch (err) {
    bgmStarted = false;
    bgmPausedByHide = false;
  }
}

function getStoredSoundMuted() {
  try {
    const raw = wx.getStorageSync(SOUND_MUTED_KEY);
    if (raw === "" || raw == null) {
      wx.setStorageSync(SOUND_MUTED_KEY, true);
      return true;
    }
    return raw === true || raw === "true" || raw === 1 || raw === "1";
  } catch (err) {
    return true;
  }
}

function saveSoundMuted(value) {
  state.soundMuted = !!value;
  try {
    wx.setStorageSync(SOUND_MUTED_KEY, state.soundMuted);
  } catch (err) {
    // Ignore storage failures; the in-memory toggle still works for this session.
    logWarn("storage", "soundMuted.save.fail", { errMsg: err && (err.errMsg || err.message) });
  }
  logInfo("audio", "soundMuted.change", { soundMuted: state.soundMuted });
  if (state.soundMuted) {
    pauseBgMusic(false);
  } else {
    playBgMusic();
  }
}

function initCloud() {
  if (!wx.cloud) {
    logError("cloud", "init.unavailable", { envId: config.envId || "" });
    state.message = "当前微信版本不支持云开发";
    return;
  }
  const options = { traceUser: true };
  if (config.envId) options.env = config.envId;
  try {
    wx.cloud.init(options);
    state.cloudReady = true;
    logInfo("cloud", "init.success", { envId: config.envId || "dynamic" });
    handlePendingInvite();
  } catch (err) {
    state.cloudReady = false;
    logError("cloud", "init.fail", { envId: config.envId || "", errMsg: err && (err.errMsg || err.message) });
    state.message = "云开发未就绪：请先在开发者工具开通并选择云环境";
  }
}

function rememberLocalOpenId(openid) {
  if (openid && !state.openid) state.openid = openid;
}

function callFunction(name, data) {
  const requestId = `cf_${++cloudCallSeq}`;
  const started = Date.now();
  logInfo("cloud", "call.start", { requestId, name, data: data || {} });
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data: data || {},
      success(res) {
        const elapsed = Date.now() - started;
        const payload = { requestId, name, elapsed, result: res && res.result };
        if (elapsed >= SLOW_CLOUD_CALL_MS) logWarn("cloud", "call.slow", payload);
        else logInfo("cloud", "call.success", payload);
        resolve(res);
      },
      fail(err) {
        const elapsed = Date.now() - started;
        logError("cloud", "call.fail", {
          requestId,
          name,
          elapsed,
          errMsg: err && (err.errMsg || err.message)
        });
        reject(err);
      }
    });
  });
}

function getRoomDoc(roomId) {
  const db = wx.cloud.database();
  return db.collection("rooms").doc(roomId).get();
}

function getNow() {
  return frameNow || Date.now();
}

function createScaledCanvas(width, height) {
  if (!wx.createCanvas) return null;
  const buffer = wx.createCanvas();
  buffer.width = Math.max(1, Math.ceil(width * dpr));
  buffer.height = Math.max(1, Math.ceil(height * dpr));
  const bufferCtx = buffer.getContext("2d");
  if (!bufferCtx) return null;
  bufferCtx.scale(dpr, dpr);
  return { canvas: buffer, ctx: bufferCtx, width, height };
}

function drawRoundedRectOn(targetCtx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  targetCtx.beginPath();
  targetCtx.moveTo(x + radius, y);
  targetCtx.arcTo(x + w, y, x + w, y + h, radius);
  targetCtx.arcTo(x + w, y + h, x, y + h, radius);
  targetCtx.arcTo(x, y + h, x, y, radius);
  targetCtx.arcTo(x, y, x + w, y, radius);
  targetCtx.closePath();
}

function fillRoundedRectOn(targetCtx, x, y, w, h, r, color) {
  drawRoundedRectOn(targetCtx, x, y, w, h, r);
  targetCtx.fillStyle = color;
  targetCtx.fill();
}

function strokeRoundedRectOn(targetCtx, x, y, w, h, r, color, width) {
  drawRoundedRectOn(targetCtx, x, y, w, h, r);
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = width || 1;
  targetCtx.stroke();
}

function drawBubbleOn(targetCtx, x, y, radius, color, alpha) {
  targetCtx.save();
  targetCtx.globalAlpha = alpha == null ? 1 : alpha;
  targetCtx.fillStyle = color || "rgba(255,255,255,0.55)";
  targetCtx.beginPath();
  targetCtx.arc(x, y, radius, 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.fillStyle = "rgba(255,255,255,0.55)";
  targetCtx.beginPath();
  targetCtx.arc(x - radius * 0.28, y - radius * 0.3, Math.max(1.5, radius * 0.24), 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.restore();
}

function drawSparkleOn(targetCtx, x, y, size, color) {
  targetCtx.fillStyle = color || COLORS.yellow;
  targetCtx.beginPath();
  targetCtx.moveTo(x, y - size);
  targetCtx.lineTo(x + size * 0.3, y - size * 0.28);
  targetCtx.lineTo(x + size, y);
  targetCtx.lineTo(x + size * 0.3, y + size * 0.28);
  targetCtx.lineTo(x, y + size);
  targetCtx.lineTo(x - size * 0.3, y + size * 0.28);
  targetCtx.lineTo(x - size, y);
  targetCtx.lineTo(x - size * 0.3, y - size * 0.28);
  targetCtx.closePath();
  targetCtx.fill();
}

function getUiSprite(key, width, height, drawFn) {
  const cacheKey = `${key}:${Math.ceil(width)}x${Math.ceil(height)}:${dpr}`;
  if (uiSpriteCache[cacheKey]) return uiSpriteCache[cacheKey];
  const buffer = createScaledCanvas(width, height);
  if (!buffer) return null;
  drawFn(buffer.ctx, width, height);
  const sprite = { canvas: buffer.canvas, width, height };
  uiSpriteCache[cacheKey] = sprite;
  return sprite;
}

function getLaunchOptions() {
  if (wx.getLaunchOptionsSync) return wx.getLaunchOptionsSync();
  if (wx.getLaunchInfoSync) return wx.getLaunchInfoSync();
  return {};
}

function getInviteCodeFromOptions(options) {
  const query = (options && options.query) || {};
  return String(query.roomCode || query.code || "").trim().toUpperCase();
}

function getSharePayload() {
  const modeLabel = isCoopMode() ? getCoopModeLabel() : "双人PK";
  if (!state.roomCode) {
    return {
      title: getVisualSkin() === "grass" ? "来玩单词捕虫" : "来玩单词捕鱼",
      query: ""
    };
  }
  return {
    title: `${state.playerName || "好友"}邀请你加入${modeLabel} · 房间${state.roomCode}`,
    query: `invite=1&roomCode=${encodeURIComponent(state.roomCode)}`
  };
}

function setupShare() {
  if (wx.showShareMenu) {
    wx.showShareMenu({
      withShareTicket: false,
      menus: ["shareAppMessage"],
      success() {
        logInfo("share", "menu.ready", {});
      },
      fail() {
        logWarn("share", "menu.fail", {});
        state.message = "当前环境未开放微信分享，可使用房间码邀请";
      }
    });
  }
  if (wx.onShareAppMessage) {
    wx.onShareAppMessage(() => getSharePayload());
    logInfo("share", "handler.ready", {});
  }
  if (wx.onShow) {
    wx.onShow((options) => {
      logInfo("lifecycle", "show", { inviteCode: getInviteCodeFromOptions(options) });
      handleInviteOptions(options);
      if (!state.soundMuted && (bgmStarted || bgmPausedByHide)) playBgMusic();
    });
  }
  if (wx.onHide) {
    wx.onHide(() => {
      logInfo("lifecycle", "hide", { scene: state.scene, roomId: state.roomId });
      if (!state.soundMuted) pauseBgMusic(true);
    });
  }
  handleInviteOptions(getLaunchOptions());
}

function handleInviteOptions(options) {
  const code = getInviteCodeFromOptions(options);
  if (!code || code === state.roomCode) return;
  state.pendingInviteCode = code;
  logInfo("share", "invite.received", { roomCode: code, cloudReady: state.cloudReady, inviteJoining: state.inviteJoining });
  state.message = `收到房间邀请：${code}`;
  handlePendingInvite();
}

function handlePendingInvite() {
  const code = state.pendingInviteCode;
  if (!code || state.inviteJoining || !state.cloudReady || !wx.cloud) return;
  if (state.scene === GAME.PLAYING) {
    logWarn("share", "invite.blocked.playing", { roomCode: code });
    state.message = "游戏中暂不能加入新的邀请";
    return;
  }

  state.inviteJoining = true;
  logInfo("share", "invite.join.start", { roomCode: code });
  setBusy(true, "正在加入好友房间...");
  callFunction("joinRoom", { roomCode: code, nickName: state.playerName }).then((res) => {
    rememberLocalOpenId(res.result && res.result.openid);
    state.pendingInviteCode = "";
    enterRoom(res.result.roomId, res.result.roomCode || code);
  }).catch((err) => {
    logError("share", "invite.join.fail", { roomCode: code, errMsg: err && (err.errMsg || err.message) });
    state.message = `加入邀请失败：${code}`;
    toast(err.errMsg || "加入邀请失败");
  }).finally(() => {
    state.inviteJoining = false;
    setBusy(false);
  });
}

function shareRoomInvite() {
  logInfo("share", "invite.open", { roomCode: state.roomCode, payload: getSharePayload() });
  if (!state.roomCode) {
    toast("请先创建或加入房间");
    return;
  }
  const shareToFriend = () => {
    if (wx.shareAppMessage) {
      try {
        logInfo("share", "friend.start", { payload: getSharePayload() });
        wx.shareAppMessage(getSharePayload());
        logInfo("share", "friend.sent", { roomCode: state.roomCode });
        return;
      } catch (err) {
        logWarn("share", "friend.fail", { errMsg: err && (err.errMsg || err.message) });
        state.message = "微信分享不可用，已改为复制房间码";
      }
    }
    copyRoomCode();
  };
  if (wx.showActionSheet) {
    wx.showActionSheet({
      itemList: ["发送给微信好友", "复制房间码"],
      success(result) {
        logInfo("share", "actionSheet.select", { tapIndex: result.tapIndex });
        if (result.tapIndex === 0) {
          shareToFriend();
        } else if (result.tapIndex === 1) {
          copyRoomCode();
        }
      },
      fail(error) {
        const message = String((error && error.errMsg) || "");
        logWarn("share", "actionSheet.fail", { errMsg: message });
        if (message.indexOf("cancel") < 0) copyRoomCode();
      }
    });
    return;
  }
  shareToFriend();
}

function copyRoomCode() {
  logInfo("share", "copy.start", { roomCode: state.roomCode });
  if (!state.roomCode) {
    toast("请先创建或加入房间");
    return;
  }
  wx.setClipboardData({
    data: state.roomCode,
    success() {
      logInfo("share", "copy.success", { roomCode: state.roomCode });
      state.message = `房间码 ${state.roomCode} 已复制，请发送给好友`;
      toast("房间码已复制");
    },
    fail() {
      logWarn("share", "copy.fail", { roomCode: state.roomCode });
      state.message = `请手动告诉好友房间码：${state.roomCode}`;
      toast(`房间码 ${state.roomCode}`);
    }
  });
}

function compactDebugLogEntry(log) {
  return {
    n: log.seq,
    t: log.at,
    s: log.scene,
    r: log.room,
    e: log.event,
    d: log.data
  };
}

function makeDebugSnapshot(maxLogs) {
  const logs = debugLogBuffer.slice(-maxLogs).map(compactDebugLogEntry);
  return {
    v: 2,
    copiedAt: new Date().toISOString(),
    scene: state.scene,
    roomId: maskLogId(state.roomId),
    roomCode: state.roomCode || "",
    cloudReady: state.cloudReady,
    busy: state.busy,
    catchPending: state.catchPending,
    openidKnown: !!state.openid,
    playerCount: state.players.length,
    players: summarizeLogPlayers(state.players),
    gameOptions: sanitizeLogValue(state.gameOptions, "gameOptions", 0),
    startError: state.startError || "",
    message: state.message || "",
    totalLogCount: debugLogBuffer.length,
    logRange: logs.length ? [logs[0].n, logs[logs.length - 1].n] : [],
    logs
  };
}

function buildDebugLogText(maxChars) {
  let maxLogs = DEBUG_LOG_COPY_MAX_LOGS;
  let snapshot = makeDebugSnapshot(maxLogs);
  let text = JSON.stringify(snapshot);
  while (text.length > maxChars && maxLogs > DEBUG_LOG_COPY_MIN_LOGS) {
    maxLogs = Math.max(DEBUG_LOG_COPY_MIN_LOGS, Math.floor(maxLogs * 0.72));
    snapshot = makeDebugSnapshot(maxLogs);
    snapshot.truncated = true;
    text = JSON.stringify(snapshot);
  }
  if (text.length > maxChars) {
    snapshot = makeDebugSnapshot(DEBUG_LOG_COPY_MIN_LOGS);
    snapshot.truncated = true;
    snapshot.logs = snapshot.logs.map((log) => ({ n: log.n, t: log.t, s: log.s, e: log.e }));
    text = JSON.stringify(snapshot);
  }
  if (text.length > maxChars) {
    snapshot = makeDebugSnapshot(0);
    snapshot.truncated = true;
    text = JSON.stringify(snapshot);
  }
  return {
    text,
    logCount: snapshot.logs.length,
    totalLogCount: debugLogBuffer.length,
    truncated: !!snapshot.truncated
  };
}

function showDebugLogFallback(text, reason) {
    try {
      wx.showModal({
        title: "日志复制失败",
        content: `${reason || "请手动复制下方简版日志"}\n${text.slice(0, 1600)}`,
        showCancel: false
      });
    } catch (err) {}
}

function verifyDebugClipboard(expectedText, meta, onMismatch) {
  if (!wx.getClipboardData) {
    toast(meta.truncated ? "简版日志已复制" : "调试日志已复制");
    logInfo("debug", "copyLogs.success", {
      logCount: meta.logCount,
      totalLogCount: meta.totalLogCount,
      chars: expectedText.length,
      truncated: meta.truncated,
      verified: false
    });
    return;
  }
  wx.getClipboardData({
    success(result) {
      const actualText = String((result && result.data) || "");
      if (actualText === expectedText) {
        toast(meta.truncated ? "简版日志已复制" : "调试日志已复制");
        logInfo("debug", "copyLogs.success", {
          logCount: meta.logCount,
          totalLogCount: meta.totalLogCount,
          chars: expectedText.length,
          truncated: meta.truncated,
          verified: true
        });
        return;
      }
      logWarn("debug", "copyLogs.verify.mismatch", {
        expectedChars: expectedText.length,
        actualChars: actualText.length
      });
      onMismatch("剪贴板校验失败，已改用简版日志");
    },
    fail(err) {
      toast(meta.truncated ? "简版日志已复制" : "调试日志已复制");
      logWarn("debug", "copyLogs.verify.fail", {
        errMsg: err && (err.errMsg || err.message),
        chars: expectedText.length
      });
    }
  });
}

function copyDebugLogs() {
  const primary = buildDebugLogText(DEBUG_LOG_COPY_MAX_CHARS);
  const copyFallback = (reason) => {
    const retry = buildDebugLogText(DEBUG_LOG_COPY_RETRY_CHARS);
    if (!wx.setClipboardData) {
      showDebugLogFallback(retry.text, reason);
      return;
    }
    wx.setClipboardData({
      data: retry.text,
      success() {
        verifyDebugClipboard(retry.text, retry, () => {
          showDebugLogFallback(retry.text, "简版日志复制后仍未通过校验，请手动截图或复制");
        });
      },
      fail(err) {
        logWarn("debug", "copyLogs.retry.fail", { errMsg: err && (err.errMsg || err.message) });
        showDebugLogFallback(retry.text, reason || "剪贴板不可用，请手动复制");
      }
    });
  };
  if (!wx.setClipboardData) {
    copyFallback("当前环境不支持剪贴板");
    return;
  }
  wx.setClipboardData({
    data: primary.text,
    success() {
      verifyDebugClipboard(primary.text, primary, copyFallback);
    },
    fail(err) {
      logWarn("debug", "copyLogs.fail", { errMsg: err && (err.errMsg || err.message) });
      copyFallback("日志较长，已尝试复制简版");
    }
  });
}

function setBusy(value, message) {
  state.busy = value;
  if (message) state.message = message;
  logInfo("client", "busy.change", { busy: state.busy, message: message || "" });
}

function toast(title) {
  logInfo("client", "toast", { title });
  wx.showToast({ title, icon: "none", duration: 1200 });
}

function getCloudErrorMessage(error, fallback) {
  const raw = String((error && (error.errMsg || error.message)) || fallback || "操作失败");
  return raw
    .replace(/^cloud\.callFunction:fail\s*/i, "")
    .replace(/^Error:\s*/i, "")
    .trim()
    .slice(0, 80) || fallback || "操作失败";
}

function promptText(title, placeholder, defaultValue, maxLength) {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      editable: true,
      placeholderText: placeholder,
      content: defaultValue || "",
      confirmText: "确定",
      cancelText: "取消",
      success(res) {
        if (!res.confirm) {
          resolve("");
          return;
        }
        resolve(String(res.content || "").trim().slice(0, maxLength || 20));
      },
      fail() {
        resolve("");
      }
    });
  });
}

function addButton(id, text, x, y, w, h, options) {
  const opts = options || {};
  state.buttons.push({ id, text, x, y, w, h, disabled: !!opts.disabled, kind: opts.kind || "primary" });
  drawButton(text, x, y, w, h, opts);
}

function addHitArea(id, x, y, w, h, options) {
  const opts = options || {};
  state.buttons.push({ id, text: "", x, y, w, h, disabled: !!opts.disabled, kind: opts.kind || "hit" });
}

function hitButton(x, y) {
  for (let i = state.buttons.length - 1; i >= 0; i -= 1) {
    const btn = state.buttons[i];
    if (btn.disabled) continue;
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      return btn.id;
    }
  }
  return "";
}

function drawRoundedRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function fillRoundedRect(x, y, w, h, r, color) {
  drawRoundedRect(x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

function strokeRoundedRect(x, y, w, h, r, color, width) {
  drawRoundedRect(x, y, w, h, r);
  ctx.strokeStyle = color;
  ctx.lineWidth = width || 1;
  ctx.stroke();
}

function drawButton(text, x, y, w, h, options) {
  const opts = options || {};
  const disabled = !!opts.disabled;
  const secondary = opts.kind === "secondary";
  const danger = opts.kind === "danger";
  const bg = ctx.createLinearGradient(x, y, x, y + h);
  if (disabled) {
    bg.addColorStop(0, "#E2E8F0");
    bg.addColorStop(1, "#CBD5E1");
  } else if (secondary) {
    bg.addColorStop(0, "#FFFFFF");
    bg.addColorStop(1, COLORS.aquaSoft);
  } else if (danger) {
    bg.addColorStop(0, "#FB7185");
    bg.addColorStop(1, COLORS.red);
  } else {
    bg.addColorStop(0, "#22D3EE");
    bg.addColorStop(0.48, COLORS.ocean);
    bg.addColorStop(1, COLORS.deep);
  }
  const fg = disabled ? "#64748B" : secondary ? COLORS.deep : COLORS.white;
  fillRoundedRect(x + 2, y + 4, w, h, 8, "rgba(15,23,42,0.16)");
  fillRoundedRect(x, y, w, h, 8, bg);
  strokeRoundedRect(x, y, w, h, 8, disabled ? "#CBD5E1" : secondary ? COLORS.cyan : danger ? "#FDA4AF" : "rgba(255,255,255,0.72)", 1.4);
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h * 0.28, w * 0.38, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fg;
  let buttonFontSize = opts.fontSize || 16;
  ctx.font = `700 ${buttonFontSize}px sans-serif`;
  while (buttonFontSize > 12 && ctx.measureText(String(text || "")).width > w - 18) {
    buttonFontSize -= 1;
    ctx.font = `700 ${buttonFontSize}px sans-serif`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2);
}

function drawText(text, x, y, size, color, weight, align) {
  ctx.fillStyle = color || COLORS.text;
  ctx.font = `${weight || 400} ${size}px sans-serif`;
  ctx.textAlign = align || "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
}

function drawFitText(text, x, y, size, color, weight, align, maxWidth) {
  const value = String(text || "");
  let fontSize = size;
  ctx.font = `${weight || 400} ${fontSize}px sans-serif`;
  while (fontSize > 18 && ctx.measureText(value).width > maxWidth) {
    fontSize -= 1;
    ctx.font = `${weight || 400} ${fontSize}px sans-serif`;
  }
  drawText(value, x, y, fontSize, color, weight, align);
}

function wrapTextByWidth(text, maxWidth, fontSize, weight) {
  const value = String(text || "");
  const chars = Array.from(value);
  const lines = [];
  let current = "";
  ctx.font = `${weight || 400} ${fontSize}px sans-serif`;
  chars.forEach((char) => {
    const next = current + char;
    if (current && ctx.measureText(next).width > maxWidth) {
      lines.push(current);
      current = char;
      return;
    }
    current = next;
  });
  if (current) lines.push(current);
  return lines;
}

function trimWrappedLines(lines, maxWidth, maxLines, fontSize, weight) {
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    ctx.font = `${weight || 400} ${fontSize}px sans-serif`;
    while (last.length > 1 && ctx.measureText(`${last}...`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    kept[maxLines - 1] = `${last}...`;
    return kept;
  }
  return lines;
}

function drawWrappedFitText(text, x, y, maxWidth, maxLines, size, lineHeight, color, weight, align) {
  let fontSize = size;
  let lines = wrapTextByWidth(text, maxWidth, fontSize, weight);
  while (fontSize > 23 && lines.length > maxLines) {
    fontSize -= 1;
    lines = wrapTextByWidth(text, maxWidth, fontSize, weight);
  }
  lines = trimWrappedLines(lines, maxWidth, maxLines, fontSize, weight);
  const blockH = (lines.length - 1) * lineHeight;
  lines.forEach((line, index) => {
    drawText(line, x, y - blockH / 2 + index * lineHeight, fontSize, color, weight, align);
  });
}

function getSafeTopY(minY) {
  return Math.max(minY, safeTop + 14);
}

function getSafeBottomPadding() {
  return Math.max(14, safeBottom + 14);
}

function getPlayPromptY() {
  return getSafeTopY(42);
}

function getScoreDockY() {
  return screen.height - getSafeBottomPadding() - 74;
}

function drawCartoonPanel(x, y, w, h, r, color, strokeColor) {
  fillRoundedRect(x + 4, y + 7, w, h, r, "rgba(15,23,42,0.16)");
  fillRoundedRect(x, y, w, h, r, color);
  strokeRoundedRect(x, y, w, h, r, strokeColor || "rgba(255,255,255,0.72)", 2);
}

function drawBubble(x, y, radius, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.fillStyle = color || "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.arc(x - radius * 0.28, y - radius * 0.3, Math.max(1.5, radius * 0.24), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSparkle(x, y, size, color) {
  ctx.fillStyle = color || COLORS.yellow;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.3, y - size * 0.28);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size * 0.3, y + size * 0.28);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size * 0.3, y + size * 0.28);
  ctx.lineTo(x - size, y);
  ctx.lineTo(x - size * 0.3, y - size * 0.28);
  ctx.closePath();
  ctx.fill();
}

function drawCoinIcon(cx, cy, radius) {
  const gradient = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  gradient.addColorStop(0, "#FEF3C7");
  gradient.addColorStop(0.42, "#FACC15");
  gradient.addColorStop(1, "#F59E0B");
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1.2, radius * 0.14);
  ctx.strokeStyle = "#B45309";
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.arc(cx - radius * 0.32, cy - radius * 0.34, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7C2D12";
  ctx.font = `900 ${Math.max(9, radius * 0.95)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("金", cx, cy + radius * 0.04);
  ctx.restore();
}

function drawCoinPill(x, y, w, h) {
  const bg = ctx.createLinearGradient(x, y, x + w, y + h);
  bg.addColorStop(0, "#FFF7ED");
  bg.addColorStop(0.46, "#FEF3C7");
  bg.addColorStop(1, "#FCD34D");
  fillRoundedRect(x + 2, y + 4, w, h, h / 2, "rgba(120,53,15,0.2)");
  fillRoundedRect(x, y, w, h, h / 2, bg);
  strokeRoundedRect(x, y, w, h, h / 2, "#F59E0B", 1.5);
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.ellipse(x + w * 0.42, y + h * 0.25, w * 0.32, h * 0.18, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawCoinIcon(x + h / 2 + 1, y + h / 2, Math.max(10, h * 0.36));
  drawFitText(`金币 ${getWordCoinLabel()}`, x + h + 8, y + h / 2 + 5, 14, "#78350F", 900, "left", w - h - 14);
}

function drawUnlockCostBadge(x, y, w, h) {
  fillRoundedRect(x, y, w, h, h / 2, "rgba(255,247,237,0.94)");
  strokeRoundedRect(x, y, w, h, h / 2, "#F59E0B", 1);
  drawCoinIcon(x + h / 2, y + h / 2, Math.max(6, h * 0.32));
  drawText(String(WORD_BANK_UNLOCK_COST), x + h + 2, y + h / 2 + 4, 11, "#92400E", 900);
}

function drawMascotFish(x, y, scale, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale((flip ? -1 : 1) * scale, scale);
  ctx.fillStyle = "rgba(15,23,42,0.14)";
  ctx.beginPath();
  ctx.ellipse(3, 12, 47, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.coral;
  ctx.strokeStyle = "rgba(15,23,42,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(70, -20);
  ctx.lineTo(66, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const body = ctx.createLinearGradient(-42, -26, 42, 26);
  body.addColorStop(0, "#FEF3C7");
  body.addColorStop(0.5, COLORS.yellow);
  body.addColorStop(1, COLORS.gold);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, 46, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.beginPath();
  ctx.ellipse(-8, 9, 28, 10, -0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.arc(-27, -7, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.text;
  ctx.beginPath();
  ctx.arc(-29, -7, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(15,23,42,0.36)";
  ctx.beginPath();
  ctx.arc(-31, 5, 8, 0.05, 0.78);
  ctx.stroke();
  ctx.restore();
}

function drawMascotCockroach(x, y, scale, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale((flip ? -1 : 1) * scale, scale);
  ctx.strokeStyle = "rgba(68,64,60,0.9)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-24, -18);
  ctx.quadraticCurveTo(-52, -44, -76, -36);
  ctx.moveTo(-18, -21);
  ctx.quadraticCurveTo(-42, -54, -66, -55);
  ctx.stroke();
  ctx.fillStyle = "rgba(15,23,42,0.16)";
  ctx.beginPath();
  ctx.ellipse(4, 15, 42, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  const body = ctx.createLinearGradient(-42, -22, 42, 24);
  body.addColorStop(0, "#92400E");
  body.addColorStop(0.5, "#B45309");
  body.addColorStop(1, "#451A03");
  ctx.fillStyle = body;
  ctx.strokeStyle = "#3F1D08";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#78350F";
  ctx.beginPath();
  ctx.ellipse(-36, 0, 17, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(254,243,199,0.28)";
  ctx.lineWidth = 4;
  for (let xLine = -4; xLine <= 28; xLine += 14) {
    ctx.beginPath();
    ctx.moveTo(xLine, -18);
    ctx.quadraticCurveTo(xLine + 5, 0, xLine, 18);
    ctx.stroke();
  }
  ctx.strokeStyle = "#3F1D08";
  ctx.lineWidth = 3;
  [-26, -8, 12].forEach((legX, index) => {
    const spread = 24 + index * 4;
    ctx.beginPath();
    ctx.moveTo(legX, -10);
    ctx.lineTo(legX - 10, -spread);
    ctx.lineTo(legX - 28, -spread - 6);
    ctx.moveTo(legX, 10);
    ctx.lineTo(legX - 10, spread);
    ctx.lineTo(legX - 28, spread + 6);
    ctx.stroke();
  });
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.arc(-43, -6, 4.8, 0, Math.PI * 2);
  ctx.arc(-43, 6, 4.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.text;
  ctx.beginPath();
  ctx.arc(-45, -6, 1.9, 0, Math.PI * 2);
  ctx.arc(-45, 6, 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function addFeedback(text, x, y, color, options) {
  const opts = options || {};
  state.feedbacks.push({
    type: opts.type || "text",
    text,
    x,
    y,
    color,
    powerUp: opts.powerUp || null,
    createdAt: Date.now()
  });
}

function addShoeSmash(x, y) {
  addFeedback("", x, y, COLORS.text, { type: "shoe" });
}

function clearPowerUpRefreshTimer() {
  if (!state.powerUpRefreshTimer) return;
  clearTimeout(state.powerUpRefreshTimer);
  state.powerUpRefreshTimer = null;
}

function clearBotCatchTimer() {
  if (state.botCatchTimer) {
    clearTimeout(state.botCatchTimer);
    state.botCatchTimer = null;
  }
  state.botCatchKey = "";
}

function getPlayerAvatarPoint(openid) {
  const scoreY = getScoreDockY();
  if (state.practiceMode) {
    return { x: 46, y: scoreY + 32 };
  }
  const index = state.players.findIndex((player) => player.openid === openid);
  if (index === 1) {
    return { x: screen.width / 2 + 49, y: scoreY + 32 };
  }
  return { x: 46, y: scoreY + 32 };
}

function addAvatarBonk(openid) {
  const point = getPlayerAvatarPoint(openid);
  addFeedback("哎呀！", point.x, point.y, COLORS.red, { type: "bonk" });
}

function addPowerUpFeedback(powerUp) {
  if (!powerUp || !powerUp.id || state.seenPowerUpId === powerUp.id) return;
  state.seenPowerUpId = powerUp.id;
  const isMine = powerUp.playerOpenid === state.openid;
  const text = powerUp.type === "pesticide"
    ? `${isMine ? "你" : "对手"}获得杀虫剂`
    : `${isMine ? "你" : "对手"}获得苍蝇拍`;
  const point = isMine ? getPlayerAvatarPoint(state.openid) : { x: screen.width / 2, y: screen.height * 0.42 };
  addFeedback(text, point.x, point.y - 34, powerUp.type === "pesticide" ? COLORS.green : COLORS.red, {
    type: "powerAward",
    powerUp
  });
  toast(powerUp.type === "pesticide" ? "获得杀虫剂！" : "获得苍蝇拍！");
}

function addPowerUpUseFeedback(powerUp) {
  if (!powerUp || !powerUp.type) return;
  if (powerUp.type === "pesticide") {
    addFeedback("", screen.width / 2, screen.height * 0.42, COLORS.green, {
      type: "spray",
      powerUp
    });
    const now = getNow();
    state.pesticideHideAt = now + 850;
    state.pesticideEffectUntil = now + 1900;
  }
}

function addRoomPowerUpUseFeedback(powerUp) {
  if (!powerUp || !powerUp.id || state.seenUsedPowerUpId === powerUp.id) return;
  state.seenUsedPowerUpId = powerUp.id;
  addPowerUpUseFeedback(powerUp);
}

function getRoomPowerUpUseEvent(room) {
  if (!room) return null;
  if (room.lastUsedPowerUpId && room.lastUsedPowerUpType) {
    return {
      id: String(room.lastUsedPowerUpId || ""),
      type: String(room.lastUsedPowerUpType || ""),
      playerOpenid: String(room.lastUsedPowerUpPlayerOpenid || ""),
      targetOpenid: String(room.lastUsedPowerUpTargetOpenid || ""),
      bonus: Number(room.lastUsedPowerUpBonus || 0),
      stunMs: Number(room.lastUsedPowerUpStunMs || 0),
      createdAt: Number(room.lastUsedPowerUpCreatedAt || 0),
      usedAt: Number(room.lastUsedPowerUpAt || 0)
    };
  }
  return null;
}

function drawPowerUpIcon(type, x, y, size, active) {
  const radius = size / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = active ? "#FEF3C7" : "rgba(255,255,255,0.72)";
  ctx.strokeStyle = active ? COLORS.gold : "rgba(255,255,255,0.86)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (type === "pesticide") {
    ctx.fillStyle = "#A7F3D0";
    ctx.strokeStyle = COLORS.green;
    ctx.lineWidth = 2;
    fillRoundedRect(-6, -7, 13, 18, 3, "#A7F3D0");
    strokeRoundedRect(-6, -7, 13, 18, 3, COLORS.green, 1.5);
    fillRoundedRect(-3, -13, 7, 7, 2, COLORS.green);
    ctx.strokeStyle = "rgba(4,120,87,0.72)";
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(5, -8 + i * 4);
      ctx.lineTo(14, -13 + i * 7);
      ctx.stroke();
    }
  } else if (type === "swatter") {
    ctx.fillStyle = "#FDBA74";
    ctx.strokeStyle = "#9A3412";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-3, -5, 8, 10, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#92400E";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(3, 2);
    ctx.lineTo(13, 14);
    ctx.stroke();
  } else {
    drawText("?", 0, 6, 16, COLORS.muted, 900, "center");
  }

  if (active) {
    ctx.strokeStyle = "rgba(250,204,21,0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 4 + Math.sin(getNow() / 180) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawShoeEffect(item, progress) {
  const scale = 1.22 - progress * 0.28;
  ctx.translate(item.x, item.y);
  ctx.rotate(-0.52 + progress * 0.12);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(15,23,42,0.18)";
  ctx.beginPath();
  ctx.ellipse(7, 20, 34, 10, -0.15, 0, Math.PI * 2);
  ctx.fill();
  const shoe = ctx.createLinearGradient(-28, -40, 28, 42);
  shoe.addColorStop(0, "#FDE68A");
  shoe.addColorStop(0.52, "#F59E0B");
  shoe.addColorStop(1, "#92400E");
  ctx.fillStyle = shoe;
  ctx.strokeStyle = "#451A03";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-26, -33);
  ctx.quadraticCurveTo(11, -43, 26, -18);
  ctx.lineTo(35, 22);
  ctx.quadraticCurveTo(4, 42, -26, 31);
  ctx.quadraticCurveTo(-35, 0, -26, -33);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(69,26,3,0.55)";
  ctx.lineWidth = 2;
  [-13, 1, 15].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, -18);
    ctx.lineTo(x + 9, 22);
    ctx.stroke();
  });
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * 2 * i) / 8;
    const r = 45 + progress * 28;
    drawSparkle(Math.cos(angle) * r, Math.sin(angle) * r * 0.65, 5, i % 2 ? COLORS.yellow : COLORS.coral);
  }
}

function drawBonkEffect(item, progress) {
  ctx.translate(item.x, item.y);
  const hit = Math.min(1, progress * 1.45);
  const recoil = Math.max(0, (progress - 0.58) / 0.42);
  const swing = -1.15 + hit * 1.18 - recoil * 0.28;
  const hammerX = 18 - recoil * 8;
  const hammerY = -44 + hit * 18 - recoil * 10;

  ctx.strokeStyle = `rgba(190,18,60,${0.45 * (1 - progress)})`;
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(0, 0, 25 + progress * 26 + i * 8, -0.2, Math.PI * 1.15);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(hammerX, hammerY);
  ctx.rotate(swing);
  ctx.strokeStyle = "#78350F";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-6, 19);
  ctx.lineTo(30, -30);
  ctx.stroke();
  ctx.lineWidth = 2;
  fillRoundedRect(12, -46, 44, 24, 8, "#FDE68A");
  strokeRoundedRect(12, -46, 44, 24, 8, "#9A3412", 2);
  fillRoundedRect(16, -42, 36, 8, 4, "rgba(255,255,255,0.35)");
  ctx.restore();

  ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - progress)})`;
  ctx.beginPath();
  ctx.ellipse(0, -2, 28 + progress * 16, 10 + progress * 5, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 7; i += 1) {
    const angle = progress * Math.PI * 2.2 + i * 0.9;
    const radius = 23 + progress * 34;
    const x = Math.cos(angle) * radius;
    const y = -22 + Math.sin(angle) * 12;
    drawSparkle(x, y, i % 2 ? 5 : 7, i % 2 ? COLORS.coral : COLORS.yellow);
  }
  drawText("咚！", 0, -56 - progress * 18, 21, COLORS.red, 900, "center");
}

function drawPowerAwardEffect(item, progress) {
  const y = item.y - progress * 24;
  drawPowerUpIcon((item.powerUp || {}).type, item.x, y, 32, true);
  drawText(item.text, item.x, y - 26, 17, item.color, 900, "center");
}

function drawPowerUpEffect(item, progress) {
  const powerUp = item.powerUp || {};
  const isSpray = item.type === "spray";
  const y = item.y - progress * 34;
  if (isSpray) {
    const first = progress < 0.48 ? Math.sin((progress / 0.48) * Math.PI) : 0;
    const second = progress >= 0.38 && progress < 0.92 ? Math.sin(((progress - 0.38) / 0.54) * Math.PI) : 0;
    const burst = Math.max(first, second * 0.95);
    if (burst <= 0.03 && progress > 0.92) return;
    const pulseOffset = second > first ? 18 : 0;
    const nozzleX = Math.max(42, item.x - screen.width * 0.34);
    const nozzleY = y + 18 + pulseOffset * 0.12;
    const reach = screen.width * (0.34 + burst * 0.56);

    ctx.save();
    ctx.globalAlpha = 0.86 * burst;
    const mist = ctx.createLinearGradient(nozzleX, nozzleY, nozzleX + reach, nozzleY - 34);
    mist.addColorStop(0, "rgba(167,243,208,0.78)");
    mist.addColorStop(0.45, "rgba(74,222,128,0.34)");
    mist.addColorStop(1, "rgba(236,253,245,0)");
    ctx.fillStyle = mist;
    ctx.beginPath();
    ctx.moveTo(nozzleX + 8, nozzleY - 8);
    ctx.lineTo(nozzleX + reach, nozzleY - 72 - burst * 16);
    ctx.lineTo(nozzleX + reach * 0.96, nozzleY + 58 + burst * 12);
    ctx.closePath();
    ctx.fill();

    for (let i = 0; i < 32; i += 1) {
      const seed = Math.sin(i * 12.989 + 4.321) * 43758.545;
      const random = seed - Math.floor(seed);
      const t = ((i % 11) / 10) * burst;
      const spread = -56 + random * 112;
      const x = nozzleX + 24 + reach * t;
      const wave = Math.sin(progress * 18 + i) * 8;
      const dotY = nozzleY + spread * t + wave;
      const size = 2.2 + (i % 4) * 1.1;
      ctx.fillStyle = i % 3 === 0 ? "rgba(220,252,231,0.9)" : "rgba(34,197,94,0.7)";
      ctx.beginPath();
      ctx.arc(x, dotY, size, 0, Math.PI * 2);
      ctx.fill();
      if (i % 5 === 0) {
        ctx.strokeStyle = "rgba(4,120,87,0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 12, dotY + 2);
        ctx.lineTo(x + 10, dotY - 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    ctx.save();
    ctx.translate(nozzleX - 44, nozzleY + 6);
    ctx.rotate(-0.12 + burst * 0.08 + Math.sin(progress * Math.PI * 4) * 0.03);
    fillRoundedRect(-16, -22, 34, 48, 8, "#BBF7D0");
    strokeRoundedRect(-16, -22, 34, 48, 8, COLORS.green, 2);
    fillRoundedRect(-10, -30, 20, 12, 5, "#4ADE80");
    fillRoundedRect(10, -26, 26, 10, 4, COLORS.green);
    ctx.strokeStyle = "#047857";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(29, -21);
    ctx.lineTo(42, -23);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.ellipse(-4, -4, 7, 18, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    ctx.translate(item.x, y + 2);
    ctx.rotate(-0.5 + progress * 0.35);
    fillRoundedRect(-16, -50, 32, 74, 8, "#FED7AA");
    strokeRoundedRect(-16, -50, 32, 74, 8, "#9A3412", 2);
    fillRoundedRect(-7, 16, 14, 54, 7, "#92400E");
    for (let i = 0; i < 7; i += 1) {
      ctx.strokeStyle = "rgba(154,52,18,0.62)";
      ctx.beginPath();
      ctx.moveTo(-13, -42 + i * 9);
      ctx.lineTo(13, -42 + i * 9);
      ctx.stroke();
    }
    ctx.rotate(0.5 - progress * 0.35);
    ctx.translate(-item.x, -(y + 2));
  }
  if (!isSpray) drawText(item.text, item.x, y - 20, 20, item.color, 900, "center");
}

function drawPesticideFieldEffect(renderedFishes) {
  const left = state.pesticideEffectUntil - getNow();
  if (left <= 0) return;
  const progress = 1 - left / 1900;
  renderedFishes.forEach((fish, index) => {
    const delay = (index % 5) * 0.055;
    const local = Math.max(0, Math.min(1, (progress - delay) / 0.46));
    if (local <= 0) return;
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.globalAlpha = 1 - Math.max(0, local - 0.72) / 0.28;

    ctx.strokeStyle = `rgba(4,120,87,${0.58 * (1 - local)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 2, 28 + local * 42, 17 + local * 20, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(187,247,208,${0.72 * (1 - local * 0.4)})`;
    for (let i = 0; i < 7; i += 1) {
      const angle = i * 0.9 + local * 3.8 + index;
      const r = 13 + local * 38 + (i % 3) * 4;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r * 0.62, 3 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    [-7, 7].forEach((eyeX) => {
      ctx.beginPath();
      ctx.moveTo(eyeX - 4, -8);
      ctx.lineTo(eyeX + 4, 0);
      ctx.moveTo(eyeX + 4, -8);
      ctx.lineTo(eyeX - 4, 0);
      ctx.stroke();
    });
    ctx.restore();
  });
}

function getFeedbackLifetime(item) {
  if (item.type === "tap") return 260;
  if (item.type === "text") return 850;
  if (item.type === "spray") return 1350;
  if (item.type === "bonk") return 1100;
  if (item.type === "powerAward") return 1050;
  return 1250;
}

function drawFeedbacks() {
  const now = getNow();
  state.feedbacks = state.feedbacks.filter((item) => now - item.createdAt < getFeedbackLifetime(item));
  state.feedbacks.forEach((item) => {
    const age = now - item.createdAt;
    const lifetime = getFeedbackLifetime(item);
    const progress = age / lifetime;
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    if (item.type === "tap") {
      ctx.strokeStyle = item.color || COLORS.cyan;
      ctx.lineWidth = Math.max(1, 3 - progress * 2);
      ctx.beginPath();
      ctx.arc(item.x, item.y, 8 + progress * 24, 0, Math.PI * 2);
      ctx.stroke();
    } else if (item.type === "shoe") {
      drawShoeEffect(item, progress);
    } else if (item.type === "bonk") {
      drawBonkEffect(item, progress);
    } else if (item.type === "powerAward") {
      drawPowerAwardEffect(item, progress);
    } else if (item.type === "spray" || item.type === "swatter") {
      drawPowerUpEffect(item, progress);
    } else {
      drawText(item.text, item.x, item.y - progress * 42, 22, item.color, 900, "center");
    }
    ctx.restore();
  });
}

function getScene() {
  return BACKGROUND_SCENES[state.backgroundScene % BACKGROUND_SCENES.length];
}

function getGrassScene() {
  return GRASS_BACKGROUND_SCENES[state.backgroundScene % GRASS_BACKGROUND_SCENES.length];
}

function getVisualSkin() {
  return state.visualSkin || FORCED_VISUAL_SKIN || "ocean";
}

function drawSeaBed(scene, time) {
  const bedY = screen.height - 78;
  ctx.fillStyle = scene.sand;
  ctx.beginPath();
  ctx.moveTo(0, bedY);
  for (let x = 0; x <= screen.width + 40; x += 40) {
    const y = bedY + Math.sin(time * 1.4 + x * 0.03) * 7;
    ctx.quadraticCurveTo(x - 20, y - 5, x, y);
  }
  ctx.lineTo(screen.width, screen.height);
  ctx.lineTo(0, screen.height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(15,23,42,0.12)";
  for (let i = 0; i < 24; i += 1) {
    const x = (i * 47) % screen.width;
    const y = bedY + 18 + (i * 19) % 48;
    ctx.beginPath();
    ctx.arc(x, y, 1.6 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSeaPlants(scene, time) {
  for (let i = 0; i < 10; i += 1) {
    const baseX = 18 + (i * 53) % Math.max(60, screen.width - 24);
    const baseY = screen.height - 18;
    const height = 42 + (i % 4) * 16;
    const sway = Math.sin(time * 1.8 + i) * 8;

    ctx.strokeStyle = i % 3 === 0 ? scene.accent : scene.plant;
    ctx.lineWidth = i % 3 === 0 ? 5 : 4;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.bezierCurveTo(baseX - 10, baseY - height * 0.36, baseX + sway, baseY - height * 0.68, baseX + sway * 0.7, baseY - height);
    ctx.stroke();

    if (i % 3 !== 0) {
      ctx.fillStyle = "rgba(34,197,94,0.7)";
      for (let j = 0; j < 3; j += 1) {
        const leafY = baseY - 18 - j * 16;
        ctx.beginPath();
        ctx.ellipse(baseX + sway * 0.35 + (j % 2 ? -8 : 8), leafY, 12, 5, j % 2 ? -0.7 : 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawBubbles(time) {
  ctx.strokeStyle = "rgba(255,255,255,0.38)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 71 + Math.sin(time + i) * 8) % (screen.width + 40) - 20;
    const y = screen.height - ((time * 34 + i * 83) % (screen.height + 80));
    const r = 3 + (i % 4) * 1.8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawGrassBackgroundTo(targetCtx) {
  const scene = getGrassScene();
  const sky = targetCtx.createLinearGradient(0, 0, 0, screen.height);
  sky.addColorStop(0, scene.skyTop);
  sky.addColorStop(0.54, scene.skyBottom);
  sky.addColorStop(1, "#DCFCE7");
  targetCtx.fillStyle = sky;
  targetCtx.fillRect(0, 0, screen.width, screen.height);

  targetCtx.fillStyle = "rgba(255,255,255,0.78)";
  for (let i = 0; i < 6; i += 1) {
    const baseX = (i * 124 + 34) % (screen.width + 160) - 80;
    const y = 70 + (i % 3) * 36;
    targetCtx.beginPath();
    targetCtx.arc(baseX, y, 14, 0, Math.PI * 2);
    targetCtx.arc(baseX + 18, y - 6, 18, 0, Math.PI * 2);
    targetCtx.arc(baseX + 40, y, 15, 0, Math.PI * 2);
    targetCtx.fill();
  }

  targetCtx.fillStyle = scene.hillBack;
  targetCtx.beginPath();
  targetCtx.moveTo(0, screen.height * 0.56);
  targetCtx.quadraticCurveTo(screen.width * 0.24, screen.height * 0.42, screen.width * 0.52, screen.height * 0.56);
  targetCtx.quadraticCurveTo(screen.width * 0.78, screen.height * 0.7, screen.width, screen.height * 0.5);
  targetCtx.lineTo(screen.width, screen.height);
  targetCtx.lineTo(0, screen.height);
  targetCtx.closePath();
  targetCtx.fill();

  targetCtx.fillStyle = scene.hillFront;
  targetCtx.beginPath();
  targetCtx.moveTo(0, screen.height * 0.68);
  targetCtx.quadraticCurveTo(screen.width * 0.22, screen.height * 0.54, screen.width * 0.48, screen.height * 0.66);
  targetCtx.quadraticCurveTo(screen.width * 0.74, screen.height * 0.8, screen.width, screen.height * 0.62);
  targetCtx.lineTo(screen.width, screen.height);
  targetCtx.lineTo(0, screen.height);
  targetCtx.closePath();
  targetCtx.fill();

  const ground = targetCtx.createLinearGradient(0, screen.height * 0.58, 0, screen.height);
  ground.addColorStop(0, scene.ground);
  ground.addColorStop(1, "#166534");
  targetCtx.fillStyle = ground;
  targetCtx.fillRect(0, screen.height * 0.62, screen.width, screen.height * 0.38);

  targetCtx.strokeStyle = scene.grass;
  targetCtx.lineWidth = 2;
  for (let i = 0; i < 54; i += 1) {
    const x = (i * 31) % (screen.width + 24) - 12;
    const baseY = screen.height * (0.66 + (i % 9) * 0.035);
    const h = 10 + (i % 5) * 4;
    targetCtx.beginPath();
    targetCtx.moveTo(x, baseY);
    targetCtx.quadraticCurveTo(x + (i % 2 ? 7 : -7), baseY - h * 0.55, x + (i % 2 ? 3 : -3), baseY - h);
    targetCtx.stroke();
  }

  for (let i = 0; i < 12; i += 1) {
    const x = (i * 67 + 24) % screen.width;
    const y = screen.height * 0.66 + (i % 7) * 34;
    targetCtx.fillStyle = i % 2 ? scene.flower : COLORS.coral;
    targetCtx.beginPath();
    targetCtx.arc(x, y, 3.2, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillStyle = COLORS.yellow;
    targetCtx.beginPath();
    targetCtx.arc(x, y, 1.2, 0, Math.PI * 2);
    targetCtx.fill();
  }
}

function drawGrassBackground() {
  const key = `grass:${state.backgroundScene}:${screen.width}x${screen.height}:${dpr}`;
  if (!backgroundCache || backgroundCache.key !== key) {
    const buffer = createScaledCanvas(screen.width, screen.height);
    if (!buffer) {
      drawGrassBackgroundTo(ctx);
      return;
    }
    drawGrassBackgroundTo(buffer.ctx);
    backgroundCache = { key, canvas: buffer.canvas };
  }
  try {
    ctx.drawImage(backgroundCache.canvas, 0, 0, screen.width, screen.height);
  } catch (err) {
    drawGrassBackgroundTo(ctx);
  }
}

function drawPromptFrame(x, y, w, h) {
  const sprite = getUiSprite(`prompt:${w}:${h}`, w, h, (targetCtx, width, height) => {
    const promptBg = targetCtx.createLinearGradient(0, 0, width, height);
    promptBg.addColorStop(0, "#FFFFFF");
    promptBg.addColorStop(0.55, "#ECFEFF");
    promptBg.addColorStop(1, "#FEF3C7");
    fillRoundedRectOn(targetCtx, 4, 7, width, height, 14, "rgba(15,23,42,0.16)");
    fillRoundedRectOn(targetCtx, 0, 0, width, height, 14, promptBg);
    strokeRoundedRectOn(targetCtx, 0, 0, width, height, 14, "rgba(255,255,255,0.92)", 2);
    drawBubbleOn(targetCtx, 24, 25, 8, COLORS.aquaSoft, 0.85);
    drawBubbleOn(targetCtx, width - 74, 22, 5, COLORS.aquaSoft, 0.78);
    drawSparkleOn(targetCtx, 44, 66, 6, COLORS.yellow);
    fillRoundedRectOn(targetCtx, width / 2 - 46, 10, 92, 22, 11, COLORS.deep);
    targetCtx.fillStyle = COLORS.white;
    targetCtx.font = "900 12px sans-serif";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "alphabetic";
    targetCtx.fillText("目标中文", width / 2, 26);
  });
  if (sprite) {
    ctx.drawImage(sprite.canvas, x, y, w, h);
    return;
  }
  const promptBg = ctx.createLinearGradient(x, y, x + w, y + h);
  promptBg.addColorStop(0, "#FFFFFF");
  promptBg.addColorStop(0.55, "#ECFEFF");
  promptBg.addColorStop(1, "#FEF3C7");
  drawCartoonPanel(x, y, w, h, 14, promptBg, "rgba(255,255,255,0.92)");
  drawBubble(x + 24, y + 25, 8, COLORS.aquaSoft, 0.85);
  drawBubble(x + w - 74, y + 22, 5, COLORS.aquaSoft, 0.78);
  drawSparkle(x + 44, y + 66, 6, COLORS.yellow);
  fillRoundedRect(x + w / 2 - 46, y + 10, 92, 22, 11, COLORS.deep);
  drawText("目标中文", x + w / 2, y + 26, 12, COLORS.white, 900, "center");
}

function drawTimerBase(x, y) {
  const size = 72;
  const sprite = getUiSprite("timer-base", size, size, (targetCtx, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    targetCtx.fillStyle = "rgba(15,23,42,0.15)";
    targetCtx.beginPath();
    targetCtx.arc(cx + 2, cy + 4, 32, 0, Math.PI * 2);
    targetCtx.fill();
    const timerBg = targetCtx.createLinearGradient(cx - 30, cy - 30, cx + 30, cy + 30);
    timerBg.addColorStop(0, "#FB7185");
    timerBg.addColorStop(1, COLORS.red);
    targetCtx.fillStyle = timerBg;
    targetCtx.beginPath();
    targetCtx.arc(cx, cy, 32, 0, Math.PI * 2);
    targetCtx.fill();
    strokeRoundedRectOn(targetCtx, cx - 21, cy - 19, 42, 38, 12, "rgba(255,255,255,0.28)", 1);
  });
  if (sprite) {
    ctx.drawImage(sprite.canvas, x - size / 2, y - size / 2, size, size);
    return;
  }
  ctx.fillStyle = "rgba(15,23,42,0.15)";
  ctx.beginPath();
  ctx.arc(x + 2, y + 4, 32, 0, Math.PI * 2);
  ctx.fill();
  const timerBg = ctx.createLinearGradient(x - 30, y - 30, x + 30, y + 30);
  timerBg.addColorStop(0, "#FB7185");
  timerBg.addColorStop(1, COLORS.red);
  ctx.fillStyle = timerBg;
  ctx.beginPath();
  ctx.arc(x, y, 32, 0, Math.PI * 2);
  ctx.fill();
  strokeRoundedRect(x - 21, y - 19, 42, 38, 12, "rgba(255,255,255,0.28)", 1);
}

function drawBackground() {
  if (getVisualSkin() === "grass") {
    drawGrassBackground();
    return;
  }
  const scene = getScene();
  const time = getNow() / 1000;
  const gradient = ctx.createLinearGradient(0, 0, 0, screen.height);
  gradient.addColorStop(0, scene.top);
  gradient.addColorStop(0.5, scene.mid);
  gradient.addColorStop(1, scene.bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, screen.width, screen.height);

  ctx.fillStyle = scene.ray;
  for (let i = 0; i < 5; i += 1) {
    const x = -70 + i * (screen.width / 3) + Math.sin(time * 0.25 + i) * 24;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 58, 0);
    ctx.lineTo(x + 190, screen.height);
    ctx.lineTo(x + 76, screen.height);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.16)";
  for (let i = 0; i < 10; i += 1) {
    const x = (i * 89 + time * 16) % (screen.width + 100) - 50;
    const y = 82 + ((i * 131) % Math.max(140, screen.height - 260));
    ctx.beginPath();
    ctx.arc(x, y, 4 + (i % 3) * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBubbles(time);
  drawSeaPlants(scene, time);
  drawSeaBed(scene, time);
}

function normalizeGameOptions(options) {
  const source = options || {};
  const duration = OPTION_LISTS.durations.includes(source.duration) ? source.duration : DEFAULT_GAME_OPTIONS.duration;
  let bankId = WORD_BANKS[source.bankId] ? source.bankId : DEFAULT_GAME_OPTIONS.bankId;
  if (source.mode === "mistakes") bankId = WRONG_BANK_ID;
  const mode = isWrongBankId(bankId) ? "mistakes" : "regular";
  const botDifficulty = BOT_DIFFICULTIES[source.botDifficulty] ? source.botDifficulty : DEFAULT_GAME_OPTIONS.botDifficulty;
  const matchMode = source.matchMode === "coop" ? "coop" : "pk";
  const coopMode = source.coopMode === "spell" ? "spell" : "shared";
  const wrongWords = Array.isArray(source.wrongWords) ? source.wrongWords : [];
  return { duration, bankId, mode, wrongWords, botDifficulty, matchMode, coopMode };
}

function isCoopMode(options) {
  const source = options || state.gameOptions || {};
  return source.matchMode === "coop";
}

function isCoopSharedMode(options) {
  const source = options || state.gameOptions || {};
  return isCoopMode(source) && source.coopMode !== "spell";
}

function isCoopSpellMode(options) {
  const source = options || state.gameOptions || {};
  return isCoopMode(source) && source.coopMode === "spell";
}

function getCoopModeLabel(options) {
  return isCoopSpellMode(options) ? "同舟拼词记" : "默契捕词赛";
}

function getWordBank() {
  return WORD_BANKS[state.gameOptions.bankId] || WORD_BANKS[DEFAULT_GAME_OPTIONS.bankId];
}

function isWrongBankId(bankId) {
  const bank = WORD_BANKS[bankId];
  return bankId === WRONG_BANK_ID || !!(bank && bank.meta && bank.meta.special === "wrong");
}

function getWordBankLabel(bank, compact) {
  const source = bank || getWordBank();
  if (!source) return "词库";
  const meta = source.meta || {};
  if (meta.unitLabel) {
    if (meta.special === "wrong") return meta.unitLabel;
    return compact ? meta.unitLabel : `${meta.provinceLabel || "词库"}-${meta.unitLabel}`;
  }
  if (compact && source.shortLabel) return source.shortLabel;
  return source.label || source.shortLabel || "词库";
}

function getSelectedBankMeta() {
  const bank = getWordBank();
  return (bank && bank.meta) || null;
}

function getBanksForProvince(provinceId) {
  return getSelectableWordBankIds()
    .map((bankId) => ({ id: bankId, bank: WORD_BANKS[bankId] }))
    .filter((item) => item.bank && item.bank.meta && item.bank.meta.provinceId === provinceId);
}

function getFirstBankIdForProvince(provinceId) {
  const banks = getBanksForProvince(provinceId);
  return banks.length ? banks[0].id : "";
}

function syncBankPickerFromSelected() {
  const meta = getSelectedBankMeta();
  state.bankPickerSelectedBankId = state.gameOptions.bankId;
  if (meta) {
    state.bankPickerProvinceId = meta.provinceId;
    state.bankPickerPage = 0;
    return;
  }
  const province = WORD_BANK_PROVINCES[0];
  state.bankPickerProvinceId = province ? province.id : "jilin";
  state.bankPickerPage = 0;
}

function getBotDifficulty() {
  return BOT_DIFFICULTIES[state.gameOptions.botDifficulty] || BOT_DIFFICULTIES[DEFAULT_GAME_OPTIONS.botDifficulty];
}

function getStoredCoinBalance() {
  const raw = wx.getStorageSync(WORD_COINS_KEY);
  if (raw === "" || raw == null) {
    wx.setStorageSync(WORD_COINS_KEY, INITIAL_WORD_COINS);
    return INITIAL_WORD_COINS;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    wx.setStorageSync(WORD_COINS_KEY, INITIAL_WORD_COINS);
    return INITIAL_WORD_COINS;
  }
  return Math.floor(value);
}

function saveCoinBalance(value) {
  const nextValue = Math.max(0, Math.floor(Number(value) || 0));
  state.coins = nextValue;
  wx.setStorageSync(WORD_COINS_KEY, nextValue);
}

function isUnlockableWordBankId(bankId) {
  return !!(WORD_BANKS[bankId] && WORD_BANKS[bankId].meta) && !isWrongBankId(bankId);
}

function getStoredUnlockedBankIds() {
  let raw = [];
  try {
    raw = wx.getStorageSync(UNLOCKED_BANKS_KEY) || [];
  } catch (err) {
    raw = [];
  }
  if (!Array.isArray(raw)) raw = [];
  const seen = {};
  const ids = raw.filter((bankId) => {
    if (!isUnlockableWordBankId(bankId) || seen[bankId]) return false;
    seen[bankId] = true;
    return true;
  });
  if (isUnlockableWordBankId(DEFAULT_BANK_ID) && !seen[DEFAULT_BANK_ID]) {
    ids.unshift(DEFAULT_BANK_ID);
    try {
      wx.setStorageSync(UNLOCKED_BANKS_KEY, ids);
    } catch (err) {
      // Keep the default bank available in memory even if storage is unavailable.
    }
  }
  return ids;
}

function saveUnlockedBankIds(bankIds) {
  const seen = {};
  const nextIds = (Array.isArray(bankIds) ? bankIds : []).filter((bankId) => {
    if (!isUnlockableWordBankId(bankId) || seen[bankId]) return false;
    seen[bankId] = true;
    return true;
  });
  state.unlockedBankIds = nextIds;
  wx.setStorageSync(UNLOCKED_BANKS_KEY, nextIds);
}

function isWordBankUnlocked(bankId) {
  if (!isUnlockableWordBankId(bankId)) return true;
  return state.unlockedBankIds.indexOf(bankId) >= 0;
}

function getFirstUnlockedWordBankId() {
  const ids = getSelectableWordBankIds();
  return ids.find((bankId) => isUnlockableWordBankId(bankId) && isWordBankUnlocked(bankId)) || "";
}

function applyInitialUnlockedBankSelection() {
  if (isWordBankUnlocked(state.gameOptions.bankId)) return;
  const bankId = getFirstUnlockedWordBankId();
  if (!bankId) return;
  state.gameOptions.bankId = bankId;
  state.bankPickerSelectedBankId = bankId;
}

function getWordCoinLabel() {
  return String(Math.max(0, Math.floor(state.coins || 0)));
}

function unlockWordBank(bankId) {
  if (!isUnlockableWordBankId(bankId)) return true;
  if (isWordBankUnlocked(bankId)) return true;
  if (state.coins < WORD_BANK_UNLOCK_COST) {
    toast("金币不足，暂时无法解锁");
    return false;
  }
  saveCoinBalance(state.coins - WORD_BANK_UNLOCK_COST);
  saveUnlockedBankIds([bankId, ...state.unlockedBankIds]);
  toast("词库已解锁");
  return true;
}

function confirmUnlockWordBank(bankId) {
  if (isWordBankUnlocked(bankId)) return Promise.resolve(true);
  const bank = WORD_BANKS[bankId];
  if (!bank) return Promise.resolve(false);
  if (state.coins < WORD_BANK_UNLOCK_COST) {
    toast("金币不足，无法解锁");
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    wx.showModal({
      title: "解锁词库",
      content: `消耗 ${WORD_BANK_UNLOCK_COST} 金币解锁 ${getWordBankLabel(bank, false)}？`,
      confirmText: "解锁",
      cancelText: "再看看",
      success(res) {
        if (!res.confirm) {
          resolve(false);
          return;
        }
        resolve(unlockWordBank(bankId));
      },
      fail() {
        resolve(false);
      }
    });
  });
}

function normalizeWordItem(item) {
  if (!item || !item.word || !item.meaning) return null;
  return {
    word: String(item.word).trim(),
    meaning: String(item.meaning).trim()
  };
}

function getStoredWrongWords() {
  const raw = wx.getStorageSync(WRONG_WORDS_KEY) || [];
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeWordItem).filter(Boolean);
}

function saveWrongWord(item) {
  const normalized = normalizeWordItem(item);
  if (!normalized) return;
  const words = getStoredWrongWords();
  const exists = words.some((word) => word.word === normalized.word);
  const nextWords = exists ? words : [normalized, ...words].slice(0, 120);
  wx.setStorageSync(WRONG_WORDS_KEY, nextWords);
}

function getScoreMode(modeId) {
  return SCORE_MODES.find((mode) => mode.id === modeId) || SCORE_MODES[0];
}

function getScoreModeFromOptions(options) {
  const source = options || {};
  if (source.matchMode !== "coop") return "pk";
  return source.coopMode === "spell" ? "coopSpell" : "coopShared";
}

function getRecordModeKey(record) {
  if (SCORE_MODES.some((mode) => mode.id === record.modeKey)) return record.modeKey;
  if (record.gameOptions && (record.gameOptions.matchMode === "coop" || record.gameOptions.coopMode === "spell")) {
    return record.gameOptions.coopMode === "spell" ? "coopSpell" : "coopShared";
  }
  const legacyText = [record.id, record.modeLabel, record.result].filter(Boolean).join(" ");
  if (/coopSpell|同舟拼词记|小船拼词|合作拼词|双人拼词/.test(legacyText)) return "coopSpell";
  if (/coopShared|默契捕词赛|双人闯关|合作闯关|合作完成/.test(legacyText)) return "coopShared";
  return "pk";
}

function getRecordScore(record, modeKey) {
  const explicitScore = Number(record.score);
  if (Number.isFinite(explicitScore)) return explicitScore;
  const teamScore = Number(record.teamScore);
  if (modeKey === "coopSpell" && Number.isFinite(teamScore)) return teamScore;
  const players = Array.isArray(record.players) ? record.players : [];
  if (modeKey === "pk") {
    const me = players.find((player) => player.openid === state.openid) || players[0];
    return Number((me && me.score) || 0);
  }
  return players.reduce((sum, player) => sum + Number(player.score || 0), 0);
}

function normalizeSpellHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.map((rawItem, index) => {
    let item = rawItem;
    if (typeof rawItem === "string") {
      try {
        item = JSON.parse(rawItem);
      } catch (err) {
        item = null;
      }
    }
    if (!item || typeof item !== "object") return null;
    const players = Array.isArray(item.players) ? item.players : [];
    return {
      questionId: String(item.questionId || `round_${index}`),
      word: String(item.word || ""),
      meaning: String(item.meaning || ""),
      mask: String(item.mask || ""),
      reason: String(item.reason || "answered"),
      correct: !!item.correct,
      delta: Number(item.delta || 0),
      teamScore: Number(item.teamScore || 0),
      finishedAt: getDateTime(item.finishedAt) || Date.now(),
      players: players.slice(0, 2).map((player) => ({
        openid: String(player.openid || ""),
        nickName: String(player.nickName || "玩家"),
        slotIndexes: Array.isArray(player.slotIndexes) ? player.slotIndexes : [],
        expectedLength: Number(player.expectedLength || 0),
        submitted: !!player.submitted,
        answer: String(player.answer || ""),
        correct: !!player.correct,
        submittedAt: Number(player.submittedAt || 0)
      }))
    };
  }).filter((item) => item && (item.questionId || item.word));
}

function normalizeScoreRecord(record) {
  if (!record || !record.id || !Array.isArray(record.players)) return null;
  const modeKey = getRecordModeKey(record);
  const mode = getScoreMode(modeKey);
  return {
    ...record,
    modeKey,
    modeLabel: mode.label,
    result: modeKey === "pk" ? record.result : `${mode.label}完成`,
    score: getRecordScore(record, modeKey),
    teamScore: modeKey === "coopSpell" ? getRecordScore(record, modeKey) : record.teamScore,
    spellHistory: modeKey === "coopSpell" ? normalizeSpellHistory(record.spellHistory) : [],
    finishedAt: getDateTime(record.finishedAt) || Date.now()
  };
}

function migrateStoredScoreRecords() {
  const raw = wx.getStorageSync(MATCH_RECORDS_KEY) || [];
  if (!Array.isArray(raw)) return;
  const normalized = raw.map(normalizeScoreRecord).filter(Boolean);
  if (JSON.stringify(normalized) !== JSON.stringify(raw)) {
    wx.setStorageSync(MATCH_RECORDS_KEY, normalized);
  }
}

function getMatchRecords(modeKey) {
  const raw = wx.getStorageSync(MATCH_RECORDS_KEY) || [];
  if (!Array.isArray(raw)) return [];
  const records = raw.map(normalizeScoreRecord).filter(Boolean);
  if (modeKey) {
    return records
      .filter((record) => record.modeKey === modeKey)
      .sort((a, b) => b.finishedAt - a.finishedAt)
      .slice(0, MATCH_RECORD_LIMIT);
  }
  return SCORE_MODES.reduce((all, mode) => {
    return all.concat(records
      .filter((record) => record.modeKey === mode.id)
      .sort((a, b) => b.finishedAt - a.finishedAt)
      .slice(0, MATCH_RECORD_LIMIT));
  }, []).sort((a, b) => b.finishedAt - a.finishedAt);
}

function getDateTime(value) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") return new Date(value).getTime() || 0;
  return 0;
}

function formatRecordTime(value) {
  const date = new Date(value || Date.now());
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getMatchResultTitle(room) {
  if (room && room.gameOptions && room.gameOptions.matchMode === "coop") {
    return `${getScoreMode(getScoreModeFromOptions(room.gameOptions)).label}完成`;
  }
  const winnerOpenid = room.winnerOpenid || "";
  if (!winnerOpenid) return "平局";
  return winnerOpenid === state.openid ? "胜利" : "失败";
}

function getBestScores() {
  const stored = wx.getStorageSync(BEST_SCORES_KEY) || {};
  const result = {};
  SCORE_MODES.forEach((mode) => {
    const item = stored && stored[mode.id];
    const storedScore = Number(item && typeof item === "object" ? item.score : item);
    if (Number.isFinite(storedScore)) {
      result[mode.id] = {
        score: storedScore,
        finishedAt: Number((item && item.finishedAt) || 0)
      };
    }
  });
  getMatchRecords().forEach((record) => {
    const current = result[record.modeKey];
    if (!current || record.score > current.score) {
      result[record.modeKey] = { score: record.score, finishedAt: record.finishedAt };
    }
  });
  return result;
}

function saveBestScore(modeKey, score, finishedAt) {
  const bestScores = getBestScores();
  const current = bestScores[modeKey];
  if (!current || score > current.score) {
    bestScores[modeKey] = { score, finishedAt };
  }
  wx.setStorageSync(BEST_SCORES_KEY, bestScores);
  state.bestScores = bestScores;
}

function saveScoreRecord(record) {
  const normalized = normalizeScoreRecord(record);
  if (!normalized) return;
  const records = [normalized, ...getMatchRecords().filter((item) => item.id !== normalized.id)];
  const limited = SCORE_MODES.reduce((all, mode) => {
    return all.concat(records
      .filter((item) => item.modeKey === mode.id)
      .sort((a, b) => b.finishedAt - a.finishedAt)
      .slice(0, MATCH_RECORD_LIMIT));
  }, []).sort((a, b) => b.finishedAt - a.finishedAt);
  wx.setStorageSync(MATCH_RECORDS_KEY, limited);
  saveBestScore(normalized.modeKey, normalized.score, normalized.finishedAt);
}

function saveMatchRecord(room) {
  const players = room.players || [];
  if (state.practiceMode || !state.roomId) return;
  const gameOptions = room.gameOptions || state.gameOptions || {};
  const modeKey = getScoreModeFromOptions(gameOptions);
  if (modeKey === "pk" && players.length < 2) return;
  const bank = WORD_BANKS[(room.gameOptions && room.gameOptions.bankId) || state.gameOptions.bankId] || WORD_BANKS[DEFAULT_GAME_OPTIONS.bankId];
  const finishedAt = getDateTime(room.finishedAt) || getDateTime(room.updatedAt) || Date.now();
  const localPlayer = players.find((player) => player.openid === state.openid) || players[0];
  const score = modeKey === "pk"
    ? Number((localPlayer && localPlayer.score) || 0)
    : (modeKey === "coopSpell"
      ? Number(room.teamScore || state.teamScore || 0)
      : players.reduce((sum, player) => sum + Number(player.score || 0), 0));
  const record = {
    id: `${modeKey}:${state.roomId}`,
    modeKey,
    modeLabel: getScoreMode(modeKey).label,
    roomCode: state.roomCode,
    finishedAt,
    result: getMatchResultTitle(room),
    winnerOpenid: room.winnerOpenid || "",
    duration: room.duration || state.duration || DEFAULT_GAME_OPTIONS.duration,
    bankLabel: getWordBankLabel(bank, false),
    score,
    teamScore: modeKey === "coopSpell" ? score : undefined,
    spellHistory: modeKey === "coopSpell" ? normalizeSpellHistory(room.spellHistory || state.spellHistory) : [],
    players: players.slice(0, 2).map((player) => ({
      openid: player.openid || "",
      nickName: player.nickName || "玩家",
      score: player.score || 0
    }))
  };
  saveScoreRecord(record);
}

function saveSoloSpellRecord() {
  if (!state.soloSpellMode || state.soloSpellRecordSaved) return;
  const player = getLocalPlayer() || state.players[0] || {
    openid: state.openid || "solo_spell",
    nickName: state.playerName,
    score: 0
  };
  const bank = getWordBank();
  const finishedAt = Date.now();
  saveScoreRecord({
    id: `coopSpell:${state.startedAt || finishedAt}`,
    modeKey: "coopSpell",
    modeLabel: getScoreMode("coopSpell").label,
    roomCode: "",
    finishedAt,
    result: "本局成绩",
    winnerOpenid: "",
    duration: Number(state.duration || state.gameOptions.duration || DEFAULT_GAME_OPTIONS.duration),
    bankLabel: getWordBankLabel(bank, false),
    score: Number(player.score || 0),
    players: [{
      openid: player.openid || state.openid || "solo_spell",
      nickName: player.nickName || state.playerName || "玩家",
      score: Number(player.score || 0)
    }]
  });
  state.soloSpellRecordSaved = true;
}

function getActiveWords() {
  if (isWrongBankId(state.gameOptions.bankId)) {
    const optionWords = Array.isArray(state.gameOptions.wrongWords) ? state.gameOptions.wrongWords : [];
    const words = optionWords.length ? optionWords : getStoredWrongWords();
    return words.map(normalizeWordItem).filter(Boolean);
  }
  return getWordBank().words;
}

function getStudyWords() {
  const activeWords = getActiveWords();
  const words = Array.isArray(activeWords) ? activeWords : [];
  return words.map(normalizeWordItem).filter(Boolean);
}

function getRoomWordPool() {
  return getStudyWords().slice(0, ROOM_WORD_POOL_LIMIT).map((item) => ({
    word: item.word,
    meaning: item.meaning
  }));
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
  const normalized = normalizeWordItem(item);
  if (!normalized) return null;
  const word = String(normalized.word || "").trim().toLowerCase();
  if (!/^[a-zA-Z]{4,18}$/.test(word)) return null;
  const letters = Array.from(word);
  const blankPositions = pickStableBlankPositions(word, normalized.meaning, bankId);
  const slots = blankPositions.map((position, index) => ({
    index,
    position,
    answer: letters[position]
  }));
  return {
    key: word,
    word: normalized.word,
    meaning: normalized.meaning,
    mask: letters.map((letter, index) => (blankPositions.indexOf(index) >= 0 ? "_" : letter)).join(""),
    blankPositions,
    slots
  };
}

function normalizeSpellTemplate(template) {
  if (!template || !template.word || !template.meaning) return null;
  const word = String(template.word || "").trim();
  const key = String(template.key || word).trim().toLowerCase();
  if (!/^[a-zA-Z]{4,18}$/.test(word) || !key) return null;
  const slots = Array.isArray(template.slots) ? template.slots.map((slot, index) => ({
    index,
    position: Number(slot.position),
    answer: String(slot.answer || "").slice(0, 1).toLowerCase()
  })).filter((slot) => Number.isFinite(slot.position) && slot.answer) : [];
  if (slots.length !== 4) return null;
  return {
    key,
    word,
    meaning: String(template.meaning || "").trim(),
    mask: String(template.mask || ""),
    blankPositions: Array.isArray(template.blankPositions) ? template.blankPositions.slice(0, 4).map(Number) : slots.map((slot) => slot.position),
    slots
  };
}

function getSpellTemplatePoolForBank(bankId) {
  const templates = SPELL_WORD_BANKS[bankId];
  if (Array.isArray(templates) && templates.length) {
    return templates.map(normalizeSpellTemplate).filter(Boolean);
  }
  return [];
}

function getStudySpellTemplates() {
  const bankId = state.gameOptions.bankId;
  let templates = isWrongBankId(bankId) ? [] : getSpellTemplatePoolForBank(bankId);
  if (!templates.length) {
    templates = getStudyWords().map((item) => makeSpellTemplateFromWord(item, bankId)).filter(Boolean);
  }
  if (!templates.length && bankId !== DEFAULT_GAME_OPTIONS.bankId) {
    templates = getSpellTemplatePoolForBank(DEFAULT_GAME_OPTIONS.bankId);
  }
  return templates;
}

function getRoomSpellQuestionPool() {
  return getStudySpellTemplates().slice(0, ROOM_WORD_POOL_LIMIT);
}

function getCurrentStudyWord() {
  const words = getStudyWords();
  if (!words.length) return null;
  state.studyIndex = Math.max(0, Math.min(state.studyIndex, words.length - 1));
  return words[state.studyIndex];
}

function moveStudyWord(delta) {
  const words = getStudyWords();
  if (!words.length) return;
  state.studyIndex = (state.studyIndex + delta + words.length) % words.length;
  state.studyRevealCurrentMeaning = false;
}

function shuffleStudyWord() {
  const words = getStudyWords();
  if (!words.length) return;
  if (words.length === 1) {
    state.studyIndex = 0;
    state.studyRevealCurrentMeaning = false;
    return;
  }
  let nextIndex = state.studyIndex;
  while (nextIndex === state.studyIndex) {
    nextIndex = Math.floor(Math.random() * words.length);
  }
  state.studyIndex = nextIndex;
  state.studyRevealCurrentMeaning = false;
}

function openBankPicker(returnScene) {
  state.bankPickerReturnScene = returnScene || state.scene || GAME.HOME;
  syncBankPickerFromSelected();
  state.scene = GAME.BANKS;
}

function returnFromBankPicker() {
  const targetScene = state.bankPickerReturnScene || GAME.HOME;
  state.scene = targetScene;
  if (targetScene === GAME.STUDY) {
    const words = getStudyWords();
    state.studyIndex = words.length ? Math.min(state.studyIndex, words.length - 1) : 0;
    state.studyRevealCurrentMeaning = false;
  }
}

function enterStudyMode() {
  if (!isWordBankUnlocked(state.gameOptions.bankId)) {
    toast("先解锁当前词库");
    openBankPicker(GAME.STUDY);
    return;
  }
  const words = getStudyWords();
  if (!words.length) {
    toast(isWrongBankId(state.gameOptions.bankId) ? "错题库为空" : "当前词库暂无单词");
    return;
  }
  stopPollingRoom();
  state.studyIndex = Math.max(0, Math.min(state.studyIndex, words.length - 1));
  state.studyShowMeaning = true;
  state.studyRevealCurrentMeaning = false;
  state.scene = GAME.STUDY;
}

function cycleOption(key) {
  if (key === "duration") {
    const list = OPTION_LISTS.durations;
    const index = list.indexOf(state.gameOptions.duration);
    state.gameOptions.duration = list[(index + 1) % list.length];
  }
  if (key === "bankId") {
    const list = OPTION_LISTS.banks;
    const index = list.indexOf(state.gameOptions.bankId);
    state.gameOptions.bankId = list[(index + 1) % list.length];
  }
}

function drawHomeScoreSummary(x, y, w, h) {
  fillRoundedRect(x, y, w, h, 10, "rgba(240,253,250,0.94)");
  strokeRoundedRect(x, y, w, h, 10, "rgba(13,148,136,0.28)", 1.2);
  drawText("历史最佳", x + 14, y + h / 2 + 5, 13, COLORS.deep, 900);
  const summaryX = x + 82;
  const columnW = (w - 92) / SCORE_MODES.length;
  SCORE_MODES.forEach((mode, index) => {
    const cx = summaryX + columnW * index + columnW / 2;
    const best = state.bestScores[mode.id];
    if (index > 0) {
      ctx.strokeStyle = "rgba(100,116,139,0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(summaryX + columnW * index, y + 8);
      ctx.lineTo(summaryX + columnW * index, y + h - 8);
      ctx.stroke();
    }
    drawText(mode.shortLabel, cx, y + 18, 10, COLORS.muted, 800, "center");
    drawText(best ? `${best.score}分` : "--", cx, y + 39, 14, COLORS.text, 900, "center");
    addHitArea(`historyMode:${mode.id}`, summaryX + columnW * index, y, columnW, h);
  });
}

function drawHome() {
  drawBackground();
  state.buttons = [];

  const panelX = 24;
  const compactHome = screen.height < 620;
  const panelH = compactHome ? 454 : 516;
  const panelY = Math.max(
    getSafeTopY(compactHome ? 58 : 98),
    Math.min(
      (screen.height - panelH) / 2 + (compactHome ? 14 : 36),
      screen.height - panelH - getSafeBottomPadding()
    )
  );
  const panelW = screen.width - 48;
  const bank = getWordBank();
  const bankUnlocked = isWordBankUnlocked(state.gameOptions.bankId);
  const bankLabel = `${getWordBankLabel(bank, true)}${bankUnlocked ? "" : " 未解锁"}`;
  const headerY = panelY - 58;
  const setupY = compactHome ? 88 : 98;
  const setupH = compactHome ? 126 : 138;
  const durationY = compactHome ? 132 : 144;
  const bankY = compactHome ? 174 : 188;
  const historyY = compactHome ? 220 : 242;
  const historyH = compactHome ? 48 : 50;
  const studyY = compactHome ? 276 : 300;
  const studyH = compactHome ? 56 : 62;
  const battleY = compactHome ? 342 : 382;
  const joinY = compactHome ? 400 : 448;

  drawBubble(54, headerY + 12, 10, "rgba(255,255,255,0.55)", 0.8);
  drawBubble(screen.width - 62, headerY + 44, 7, "rgba(255,255,255,0.5)", 0.8);
  drawSparkle(118, headerY + 12, 8, COLORS.yellow);
  drawText(getVisualSkin() === "grass" ? "单词捕虫" : "单词捕鱼", 28, headerY + 30, 36, COLORS.white, 900);
  drawText(getVisualSkin() === "grass" ? "看中文，抢拍正确英文" : "看中文，抢选正确英文", 31, headerY + 56, 15, "rgba(255,255,255,0.9)", 700);
  if (getVisualSkin() === "grass") {
    drawMascotCockroach(screen.width - 70, headerY + 36, 0.56, true);
  } else {
    drawMascotFish(screen.width - 70, headerY + 32, 0.56, true);
  }
  if (DEBUG_TOOLS_ENABLED) {
    addButton("debugLogs", "日志", 24, headerY + 62, 64, 36, { kind: "secondary", fontSize: 13 });
  }
  addButton("soundToggle", state.soundMuted ? "已静音" : "声音开", screen.width - 276, headerY + 62, 76, 36, { kind: state.soundMuted ? "secondary" : "primary", fontSize: 14 });
  addButton("help", "玩法", screen.width - 190, headerY + 62, 76, 36, { kind: "secondary" });
  addButton("history", "战绩", screen.width - 104, headerY + 62, 80, 36, { kind: "secondary" });

  drawCartoonPanel(panelX, panelY, panelW, panelH, 12, COLORS.paper, "rgba(255,255,255,0.86)");
  fillRoundedRect(panelX + 16, panelY + 14, panelW - 32, 70, 10, "rgba(207,250,254,0.74)");
  ctx.fillStyle = COLORS.deep;
  ctx.beginPath();
  ctx.arc(panelX + 45, panelY + 50, 25, 0, Math.PI * 2);
  ctx.fill();
  drawText((state.playerName || "玩").slice(0, 1), panelX + 45, panelY + 58, 18, COLORS.white, 900, "center");
  drawText("玩家昵称", panelX + 84, panelY + 40, 13, COLORS.muted, 600);
  drawFitText(state.playerName, panelX + 84, panelY + 66, 20, COLORS.text, 900, "left", panelW - 214);
  addButton("name", "修改", panelX + panelW - 92, panelY + 32, 66, 36, { kind: "secondary" });

  fillRoundedRect(panelX + 18, panelY + setupY, panelW - 36, setupH, 10, "#F8FAFC");
  drawSparkle(panelX + 42, panelY + setupY + 24, 6, COLORS.coral);
  drawText("开局设置", panelX + 56, panelY + setupY + 30, 16, COLORS.text, 900);
  drawCoinPill(panelX + panelW - 158, panelY + setupY + 6, 132, 32);
  addButton("optionDuration", `游戏时间 ${state.gameOptions.duration}秒`, panelX + 18, panelY + durationY, panelW - 36, compactHome ? 36 : 38, { kind: "secondary" });
  addButton("optionBank", `选择词库 ${bankLabel}`, panelX + 18, panelY + bankY, panelW - 36, compactHome ? 36 : 38, { kind: bankUnlocked ? "secondary" : "primary", fontSize: 14 });

  drawHomeScoreSummary(panelX + 18, panelY + historyY, panelW - 36, historyH);

  fillRoundedRect(panelX + 18, panelY + studyY, panelW - 36, studyH, 10, "rgba(255,247,237,0.94)");
  drawText("背单词", panelX + 40, panelY + studyY + (compactHome ? 23 : 25), 17, COLORS.text, 900);
  drawFitText("按当前开放词库学习英文和中文含义", panelX + 40, panelY + studyY + (compactHome ? 42 : 46), 12, COLORS.muted, 700, "left", panelW - 190);
  addButton("study", bankUnlocked ? "开始背" : "先解锁", panelX + panelW - 124, panelY + studyY + (compactHome ? 11 : 14), 92, 34, { kind: bankUnlocked ? "primary" : "secondary", fontSize: 15 });

  const battleGap = 12;
  const battleW = (panelW - 36 - battleGap) / 2;
  addButton("create", state.busy ? "处理中..." : "双人PK", panelX + 18, panelY + battleY, battleW, compactHome ? 48 : 52, { disabled: state.busy });
  addButton("coop", "双人合作", panelX + 18 + battleW + battleGap, panelY + battleY, battleW, compactHome ? 48 : 52, { kind: "secondary", disabled: state.busy });
  addButton("join", "加入房间", panelX + 18, panelY + joinY, panelW - 36, compactHome ? 42 : 44, { kind: "secondary", disabled: state.busy });
}

function drawBankPicker() {
  drawBackground();
  state.buttons = [];

  const x = 24;
  const w = screen.width - 48;
  const topY = getSafeTopY(Math.max(76, screen.height * 0.09));
  const panelY = topY + 58;
  const panelH = Math.max(390, screen.height - panelY - 24);
  const selectedBank = getWordBank();
  const pickedBankId = WORD_BANKS[state.bankPickerSelectedBankId] ? state.bankPickerSelectedBankId : state.gameOptions.bankId;
  const pickedBank = WORD_BANKS[pickedBankId] || selectedBank;
  const pickedUnlocked = isWordBankUnlocked(pickedBankId);
  const banks = getBanksForProvince(state.bankPickerProvinceId);

  drawText("选择词库", x, topY, 32, COLORS.white, 900);
  drawText("版本分类 · 具体词库", x + 2, topY + 30, 14, "rgba(255,255,255,0.84)", 700);

  drawCartoonPanel(x, panelY, w, panelH, 12, COLORS.paper, "rgba(255,255,255,0.86)");
  fillRoundedRect(x + 16, panelY + 14, w - 32, 76, 10, "rgba(207,250,254,0.78)");
  drawFitText(getWordBankLabel(pickedBank, false), x + 32, panelY + 40, 16, COLORS.deep, 900, "left", w - 64);
  const pickedStatus = w < 310
    ? (pickedUnlocked ? "已解锁" : `${WORD_BANK_UNLOCK_COST}金币解锁`)
    : (pickedUnlocked ? "已解锁，可进入对战" : `未解锁，消耗 ${WORD_BANK_UNLOCK_COST} 金币开启`);
  drawText(
    pickedStatus,
    x + 32,
    panelY + 66,
    13,
    pickedUnlocked ? COLORS.green : "#B45309",
    800
  );
  drawCoinPill(x + w - 150, panelY + 47, 126, 30);

  const cursorY = panelY + 108;
  drawText("词库类型", x + 20, cursorY, 15, COLORS.text, 900);
  const categoryColumns = Math.min(2, Math.max(1, WORD_BANK_PROVINCES.length));
  const categoryGap = 10;
  const categoryW = (w - 40 - (categoryColumns - 1) * categoryGap) / categoryColumns;
  WORD_BANK_PROVINCES.forEach((province, index) => {
    const col = index % categoryColumns;
    const row = Math.floor(index / categoryColumns);
    const buttonX = x + 20 + col * (categoryW + categoryGap);
    const buttonY = cursorY + 14 + row * 38;
    addButton(`bankProvince:${province.id}`, province.label, buttonX, buttonY, categoryW, 34, {
      kind: province.id === state.bankPickerProvinceId ? "primary" : "secondary"
    });
  });

  const categoryRows = Math.max(1, Math.ceil(WORD_BANK_PROVINCES.length / categoryColumns));
  const listTop = cursorY + 28 + categoryRows * 38;
  const listBottom = panelY + panelH - 116;
  drawText("具体词库", x + 20, listTop, 15, COLORS.text, 900);

  const listY = listTop + 16;
  const bankColumns = 2;
  const bankGap = 10;
  const bankW = (w - 40 - bankGap) / bankColumns;
  const rowH = 42;
  const visibleRows = Math.max(2, Math.floor((listBottom - listY) / rowH));
  const visibleCount = visibleRows * bankColumns;
  const pageCount = Math.max(1, Math.ceil(banks.length / visibleCount));
  state.bankPickerPage = Math.min(state.bankPickerPage, pageCount - 1);
  const pageBanks = banks.slice(state.bankPickerPage * visibleCount, (state.bankPickerPage + 1) * visibleCount);
  pageBanks.forEach((item, index) => {
    const meta = item.bank.meta;
    const selected = state.bankPickerSelectedBankId === item.id;
    const unlocked = isWordBankUnlocked(item.id);
    const wordCount = meta.special === "wrong" ? getStoredWrongWords().length : (item.bank.words || []).length;
    const col = index % bankColumns;
    const row = Math.floor(index / bankColumns);
    const label = bankW < 150 ? meta.unitLabel : `${meta.unitLabel} · ${wordCount}词`;
    const buttonX = x + 20 + col * (bankW + bankGap);
    const buttonY = listY + row * rowH;
    addButton(`bankUnit:${item.id}`, label, buttonX, buttonY, bankW, 34, {
      kind: selected && unlocked ? "primary" : "secondary",
      fontSize: 14
    });
    if (!unlocked) {
      drawUnlockCostBadge(buttonX + bankW - 48, buttonY + 7, 42, 20);
      if (selected) strokeRoundedRect(buttonX, buttonY, bankW, 34, 8, COLORS.gold, 2);
    }
  });

  if (!pageBanks.length) {
    drawText("当前分类暂无词库", x + w / 2, listY + 54, 16, COLORS.muted, 700, "center");
  }

  const controlY = panelY + panelH - 104;
  addButton("bankPrev", "上一页", x + 20, controlY, (w - 56) / 3, 34, { kind: "secondary", disabled: state.bankPickerPage <= 0 });
  drawText(`${state.bankPickerPage + 1} / ${pageCount}`, x + w / 2, controlY + 22, 14, COLORS.deep, 800, "center");
  addButton("bankNext", "下一页", x + w - 20 - (w - 56) / 3, controlY, (w - 56) / 3, 34, { kind: "secondary", disabled: state.bankPickerPage >= pageCount - 1 });
  const bottomY = panelY + panelH - 56;
  const bottomGap = 12;
  const bottomW = (w - 40 - bottomGap) / 2;
  addButton("bankBack", "返回", x + 20, bottomY, bottomW, 44, { kind: "secondary" });
  addButton("bankConfirm", pickedUnlocked ? "确定选择" : "先解锁词库", x + 20 + bottomW + bottomGap, bottomY, bottomW, 44, { disabled: !state.bankPickerSelectedBankId || !pickedUnlocked });
}

function drawStudy() {
  drawBackground();
  state.buttons = [];

  const words = getStudyWords();
  const word = getCurrentStudyWord();
  const bank = getWordBank();
  const x = 24;
  const w = screen.width - 48;
  const topY = getSafeTopY(Math.max(76, screen.height * 0.09));
  const panelY = topY + 58;
  const panelH = Math.max(438, screen.height - panelY - 24);

  drawText("背单词", x, topY, 32, COLORS.white, 900);
  drawFitText(getWordBankLabel(bank, false), x + 2, topY + 30, 14, "rgba(255,255,255,0.84)", 700, "left", w - 130);
  addButton("home", "返回首页", screen.width - 126, topY - 26, 102, 38, { kind: "secondary" });

  drawCartoonPanel(x, panelY, w, panelH, 12, COLORS.paper, "rgba(255,255,255,0.86)");
  fillRoundedRect(x + 16, panelY + 14, w - 32, 58, 10, "rgba(207,250,254,0.78)");
  drawText("当前词库", x + 34, panelY + 38, 14, COLORS.muted, 800);
  drawFitText(getWordBankLabel(bank, true), x + 102, panelY + 38, 16, COLORS.deep, 900, "left", w - 214);
  addButton("optionBank", "换词库", x + w - 108, panelY + 18, 74, 30, { kind: "secondary", fontSize: 13 });
  drawText(words.length ? `${state.studyIndex + 1} / ${words.length}` : "0 / 0", x + w - 34, panelY + 66, 12, COLORS.deep, 900, "right");

  if (!word) {
    fillRoundedRect(x + 20, panelY + 94, w - 40, 188, 14, "#F8FAFC");
    drawText(isWrongBankId(state.gameOptions.bankId) ? "错题库为空" : "当前词库暂无单词", x + w / 2, panelY + 166, 21, COLORS.text, 900, "center");
    drawText("请选择一个已开放并包含单词的词库。", x + w / 2, panelY + 204, 13, COLORS.muted, 700, "center");
    addButton("optionBank", "选择词库", x + 24, panelY + panelH - 116, w - 48, 44, { kind: "primary" });
    addButton("home", "返回首页", x + 24, panelY + panelH - 58, w - 48, 44, { kind: "secondary" });
    return;
  }

  const compactStudy = screen.height < 700;
  const settingsY = Math.min(
    panelY + panelH - 54,
    screen.height - getSafeBottomPadding() - 42
  );
  const rowY = settingsY - 114;
  const cardY = panelY + 92;
  const cardH = Math.max(compactStudy ? 140 : 166, Math.min(246, rowY - cardY - 12));
  const cardBg = ctx.createLinearGradient(x + 20, cardY, x + w - 20, cardY + cardH);
  cardBg.addColorStop(0, "#FFFFFF");
  cardBg.addColorStop(0.55, "#ECFEFF");
  cardBg.addColorStop(1, "#FFF7ED");
  fillRoundedRect(x + 20, cardY, w - 40, cardH, 16, cardBg);
  strokeRoundedRect(x + 20, cardY, w - 40, cardH, 16, "rgba(255,255,255,0.94)", 2);
  drawSparkle(x + 44, cardY + 32, 7, COLORS.yellow);
  fillRoundedRect(x + w / 2 - 36, cardY + 18, 72, 24, 12, COLORS.deep);
  drawText("英文", x + w / 2, cardY + 35, 12, COLORS.white, 900, "center");
  const wordY = cardY + Math.max(78, Math.min(100, cardH * 0.47));
  drawWrappedFitText(word.word, x + w / 2, wordY, w - 84, 2, 38, 36, COLORS.deep, 900, "center");

  fillRoundedRect(x + 40, cardY + cardH - 76, w - 80, 52, 14, "rgba(255,255,255,0.76)");
  if (state.studyShowMeaning || state.studyRevealCurrentMeaning) {
    drawWrappedFitText(word.meaning, x + w / 2, cardY + cardH - 45, w - 104, 2, 21, 22, COLORS.text, 900, "center");
  } else {
    drawText("中文释义已隐藏", x + w / 2, cardY + cardH - 43, 16, COLORS.muted, 800, "center");
  }

  const halfW = (w - 58) / 2;
  const leftX = x + 24;
  const rightX = x + 34 + halfW;
  addButton("studyPrev", "上一个", leftX, rowY, halfW, 44, { kind: "secondary" });
  addButton("studyRandom", "随机", leftX, rowY + 52, halfW, 52, { kind: "secondary" });
  addButton(
    "studyRevealCurrent",
    state.studyShowMeaning ? "中文已全局显示" : (state.studyRevealCurrentMeaning ? "本词释义已显示" : "查看本词释义"),
    rightX,
    rowY,
    halfW,
    40,
    { kind: "secondary", fontSize: 13, disabled: state.studyShowMeaning || state.studyRevealCurrentMeaning }
  );
  addButton("studyNext", "下一个", rightX, rowY + 48, halfW, 56, { kind: "primary", fontSize: 18 });

  addButton("studyToggleMeaning", state.studyShowMeaning ? "全局隐藏中文" : "全局显示中文", leftX, settingsY, halfW, 42, { kind: "secondary", fontSize: 13 });
  addButton("studyWrong", "不熟，加入错题", rightX, settingsY, halfW, 42, { kind: "secondary", fontSize: 13 });
}

function drawCoopModeCard(id, title, subtitle, detail, x, y, w, h, color, options) {
  const opts = options || {};
  const compact = !!opts.compact;
  const extraCompact = h < 120;
  const disabled = !!opts.disabled;
  const buttonText = opts.buttonText || "创建双人房间";
  const bg = ctx.createLinearGradient(x, y, x + w, y + h);
  bg.addColorStop(0, "#FFFFFF");
  bg.addColorStop(1, color);
  fillRoundedRect(x + 3, y + 6, w, h, 14, "rgba(15,23,42,0.16)");
  fillRoundedRect(x, y, w, h, 14, bg);
  strokeRoundedRect(x, y, w, h, 14, "rgba(255,255,255,0.9)", 2);
  addHitArea(id, x, y, w, h, { disabled });
  ctx.fillStyle = COLORS.deep;
  ctx.beginPath();
  ctx.arc(x + 34, y + (compact ? 31 : 36), compact ? 20 : 22, 0, Math.PI * 2);
  ctx.fill();
  drawText(id === "coopShared" ? "1" : "2", x + 34, y + (compact ? 38 : 44), compact ? 18 : 20, COLORS.white, 900, "center");
  drawText(title, x + 66, y + (compact ? 29 : 32), compact ? 18 : 20, COLORS.text, 900);
  drawText(subtitle, x + 68, y + (compact ? 51 : 55), compact ? 12 : 13, COLORS.deep, 800);
  if (!extraCompact) {
    drawWrappedFitText(detail, x + w / 2, y + (compact ? 78 : 96), w - 34, compact ? 1 : 2, compact ? 13 : 14, compact ? 16 : 18, COLORS.muted, 800, "center");
  }
  addButton(id, buttonText, x + 20, y + h - (compact ? 38 : 48), w - 40, compact ? 32 : 38, { kind: "primary", disabled });
}

function drawCoopSelect() {
  drawBackground();
  state.buttons = [];

  const x = 24;
  const w = screen.width - 48;
  const topY = getSafeTopY(Math.max(76, screen.height * 0.09));
  const panelY = topY + 58;
  const panelH = Math.max(340, screen.height - panelY - getSafeBottomPadding());
  const compact = panelH < 462;
  const bank = getWordBank();
  const bankUnlocked = isWordBankUnlocked(state.gameOptions.bankId);

  drawText("双人合作", x, topY, 32, COLORS.white, 900);
  drawText("创建房间，邀请一名好友共同开始", x + 2, topY + 30, 14, "rgba(255,255,255,0.84)", 700);
  addButton("home", "返回首页", screen.width - 126, topY - 26, 102, 38, { kind: "secondary" });

  drawCartoonPanel(x, panelY, w, panelH, 12, COLORS.paper, "rgba(255,255,255,0.86)");
  fillRoundedRect(x + 16, panelY + 14, w - 32, 64, 10, "rgba(207,250,254,0.78)");
  drawText("当前设置", x + 34, panelY + 38, 14, COLORS.muted, 800);
  drawFitText(`双人房间 · ${getWordBankLabel(bank, true)}${bankUnlocked ? "" : " 未解锁"}`, x + 104, panelY + 38, 15, bankUnlocked ? COLORS.deep : COLORS.red, 900, "left", w - 144);
  addButton("optionBank", "换词库", x + w - 108, panelY + 42, 76, 28, { kind: "secondary", fontSize: 13 });

  const cardGap = compact ? 10 : 14;
  const cardY = panelY + (compact ? 86 : 96);
  const bottomReserve = compact ? 34 : 64;
  const cardH = Math.min(compact ? 136 : 164, Math.max(compact ? 106 : 144, (panelH - (cardY - panelY) - cardGap - bottomReserve) / 2));
  drawCoopModeCard(
    "coopShared",
    "默契捕词赛",
    `中文目标 · ${state.gameOptions.duration}秒 · 团队得分`,
    "创建房间并邀请好友。两名玩家都准备后开始，共同寻找正确英文完成捕词挑战。",
    x + 18,
    cardY,
    w - 36,
    cardH,
    "#ECFEFF",
    { compact, disabled: state.busy, buttonText: bankUnlocked ? "创建默契房间" : "先解锁词库" }
  );
  drawCoopModeCard(
    "coopSpell",
    "同舟拼词记",
    `${state.gameOptions.duration}秒 · 每词20秒 · 两人各填2格`,
    "蓝色空格由玩家1填写，粉色空格由玩家2填写。两人都确认或倒计时结束后判定。",
    x + 18,
    cardY + cardH + cardGap,
    w - 36,
    cardH,
    "#FFF7ED",
    { compact, disabled: state.busy, buttonText: bankUnlocked ? "创建同舟房间" : "先解锁词库" }
  );

  if (!bankUnlocked) {
    drawText("当前词库未解锁，请先解锁后创建双人房间。", x + w / 2, panelY + panelH - 24, 12, COLORS.red, 800, "center");
  } else {
    drawText("两个双人合作玩法都需要两名真实玩家准备后开始。", x + w / 2, panelY + panelH - 24, 12, COLORS.muted, 800, "center");
  }
}

function drawHelpItem(index, title, content, x, y, w, compact) {
  const h = compact ? 42 : 48;
  const colorList = [COLORS.coral, COLORS.green, COLORS.gold, COLORS.cyan, COLORS.deep, COLORS.red, COLORS.yellow];
  const accent = colorList[(index - 1) % colorList.length];
  fillRoundedRect(x, y, w, h, 10, "rgba(248,250,252,0.94)");
  strokeRoundedRect(x, y, w, h, 10, "rgba(148,163,184,0.2)", 1);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + 21, y + h / 2, compact ? 13 : 15, 0, Math.PI * 2);
  ctx.fill();
  drawText(String(index), x + 21, y + h / 2 + 5, compact ? 12 : 13, COLORS.white, 900, "center");
  drawText(title, x + 42, y + (compact ? 18 : 20), compact ? 13 : 14, COLORS.text, 900);
  drawFitText(content, x + 42, y + (compact ? 34 : 39), compact ? 11 : 12, COLORS.muted, 700, "left", w - 54);
  return y + h + (compact ? 6 : 8);
}

function drawHelp() {
  drawBackground();
  state.buttons = [];

  const x = 24;
  const w = screen.width - 48;
  const topY = getSafeTopY(Math.max(74, screen.height * 0.09));
  const panelY = topY + 54;
  const panelH = Math.max(430, screen.height - panelY - 24);
  const compact = screen.height < 700;
  const sections = compact ? [
    ["目标", "看上方中文含义，点击正确英文虫子。"],
    ["得分", "答对+100，答错-100，错词进错题词库。"],
    ["词库", `单元词库可用${WORD_BANK_UNLOCK_COST}金币解锁，初始1000金币。`],
    ["房间", "默契捕词赛、同舟拼词记需好友加入。"],
    ["道具", "连续答对3个获得，头像上方点击使用。"],
    ["技能", "杀虫剂清屏加分，苍蝇拍敲晕对手5秒。"]
  ] : [
    ["目标", "看上方中文含义，点击正确英文虫子。"],
    ["得分", "答对+100，答错-100，错词进错题词库。"],
    ["词库", `选择单元开局，锁定词库可用${WORD_BANK_UNLOCK_COST}金币解锁。`],
    ["房间", "双人PK可选机器人；默契捕词赛和同舟拼词记必须邀请好友。"],
    ["道具", "连续答对3个随机获得，头像上方点击使用。"],
    ["技能", "杀虫剂清屏加分，苍蝇拍敲晕对手5秒。"],
    ["结算", `三种模式各保留最近${MATCH_RECORD_LIMIT}局，并记录历史最佳。`]
  ];

  drawText("游戏玩法", x, topY, 32, COLORS.white, 900);
  drawText(getVisualSkin() === "grass" ? "抢拍单词虫 · 道具反击" : "抢选单词鱼 · 道具反击", x + 2, topY + 30, 14, "rgba(255,255,255,0.84)", 700);
  addButton("home", "返回首页", screen.width - 126, topY - 26, 102, 38, { kind: "secondary" });

  drawCartoonPanel(x, panelY, w, panelH, 12, COLORS.paper, "rgba(255,255,255,0.86)");
  fillRoundedRect(x + 16, panelY + 14, w - 32, 68, 10, "rgba(207,250,254,0.78)");
  drawSparkle(x + 42, panelY + 38, 7, COLORS.yellow);
  drawText("一局怎么赢？", x + 58, panelY + 38, 17, COLORS.deep, 900);
  drawFitText("认准中文目标，快点正确英文；道具留着关键时刻用。", x + 58, panelY + 60, 13, COLORS.muted, 700, "left", w - 88);

  let rowY = panelY + 94;
  sections.forEach((item, index) => {
    rowY = drawHelpItem(index + 1, item[0], item[1], x + 18, rowY, w - 36, compact);
  });

  addButton("home", "我知道了", x + 22, panelY + panelH - 58, w - 44, 46, { kind: "primary" });
}

function drawHistory() {
  drawBackground();
  state.buttons = [];

  const mode = getScoreMode(state.historyMode);
  const records = getMatchRecords(mode.id);
  const pageSize = screen.height < 700 ? 3 : HISTORY_PAGE_SIZE;
  const maxPage = Math.max(0, Math.ceil(records.length / pageSize) - 1);
  state.historyPage = Math.min(state.historyPage, maxPage);
  const pageRecords = records.slice(state.historyPage * pageSize, (state.historyPage + 1) * pageSize);
  const x = 24;
  const w = screen.width - 48;
  const topY = getSafeTopY(Math.max(78, screen.height * 0.1));
  const tabsY = topY + 48;
  const listY = tabsY + 48;
  const best = state.bestScores[mode.id];

  drawText("成绩历史", x, topY, 32, COLORS.white, 900);
  drawText(`${mode.label} · 最佳 ${best ? `${best.score}分` : "--"} · 最近 ${records.length}/${MATCH_RECORD_LIMIT}`, x + 2, topY + 28, 13, "rgba(255,255,255,0.86)", 700);
  addButton("home", "返回首页", screen.width - 126, topY - 26, 102, 38, { kind: "secondary" });

  const tabGap = 8;
  const tabW = (w - tabGap * 2) / SCORE_MODES.length;
  SCORE_MODES.forEach((item, index) => {
    addButton(`historyMode:${item.id}`, item.shortLabel, x + index * (tabW + tabGap), tabsY, tabW, 34, {
      kind: item.id === mode.id ? "primary" : "secondary",
      fontSize: 13
    });
  });

  if (!records.length) {
    fillRoundedRect(x, listY, w, 184, 12, COLORS.paper);
    drawText(`还没有${mode.label}记录`, x + w / 2, listY + 78, 19, COLORS.text, 800, "center");
    drawText("完成一局后会自动保存成绩。", x + w / 2, listY + 114, 13, COLORS.muted, 500, "center");
    return;
  }

  pageRecords.forEach((record, index) => {
    const rowY = listY + index * 78;
    const me = record.players.find((player) => player.openid === state.openid);
    const opponent = record.players.find((player) => player.openid !== state.openid) || record.players[1] || record.players[0];
    const resultColor = record.result === "胜利" ? COLORS.green : record.result === "失败" ? COLORS.red : COLORS.deep;
    const detailCount = Array.isArray(record.spellHistory) ? record.spellHistory.length : 0;
    const scoreLine = mode.id === "pk"
      ? `${(me && me.nickName) || "我"} ${me ? me.score : record.score} : ${opponent ? opponent.score : 0} ${(opponent && opponent.nickName) || "对手"}`
      : `${mode.id === "coopSpell" ? "本局总分" : "团队得分"} ${record.score} 分${mode.id === "coopSpell" && detailCount ? ` · ${detailCount}词详情` : ""}`;

    fillRoundedRect(x, rowY, w, 68, 8, COLORS.paper);
    drawText(mode.id === "pk" ? (record.result || "平局") : `${record.score} 分`, x + 18, rowY + 27, 17, resultColor, 900);
    drawText(formatRecordTime(record.finishedAt), x + w - 18, rowY + 25, 12, COLORS.muted, 600, "right");
    drawText(`${record.bankLabel || "词库"} · ${record.duration || 60}秒`, x + w - 18, rowY + 48, 12, COLORS.muted, 500, "right");
    drawFitText(scoreLine, x + 18, rowY + 52, 14, COLORS.text, 800, "left", w - 146);
    if (mode.id === "coopSpell" && detailCount) {
      drawText("点击查看", x + w - 18, rowY + 66, 11, COLORS.cyan, 800, "right");
      addHitArea(`historyDetail:${state.historyPage * pageSize + index}`, x, rowY, w, 68);
    }
  });

  const controlY = Math.min(screen.height - getSafeBottomPadding() - 46, listY + pageSize * 78 + 8);
  addButton("historyPrev", "上一页", x, controlY, (w - 18) / 3, 40, { kind: "secondary", disabled: state.historyPage <= 0 });
  drawText(`${state.historyPage + 1} / ${maxPage + 1}`, x + w / 2, controlY + 26, 15, COLORS.white, 800, "center");
  addButton("historyNext", "下一页", x + w - (w - 18) / 3, controlY, (w - 18) / 3, 40, { kind: "secondary", disabled: state.historyPage >= maxPage });
}

function getSpellRoundReasonLabel(reason) {
  if (reason === "manualSkip") return "手动跳过";
  if (reason === "timeout") return "单词超时";
  if (reason === "gameOver") return "游戏结束";
  return "双方提交";
}

function drawHistoryDetail() {
  drawBackground();
  state.buttons = [];

  const record = state.historyDetailRecord && normalizeScoreRecord(state.historyDetailRecord);
  const rounds = record ? normalizeSpellHistory(record.spellHistory) : [];
  const x = 24;
  const w = screen.width - 48;
  const topY = getSafeTopY(Math.max(78, screen.height * 0.1));
  const listY = topY + 92;
  const pageSize = screen.height < 700 ? 3 : 4;
  const maxPage = Math.max(0, Math.ceil(rounds.length / pageSize) - 1);
  state.historyDetailPage = Math.min(state.historyDetailPage, maxPage);
  const pageRounds = rounds.slice(state.historyDetailPage * pageSize, (state.historyDetailPage + 1) * pageSize);

  drawText("拼词详情", x, topY, 32, COLORS.white, 900);
  drawText(record ? `${record.score}分 · ${record.bankLabel || "词库"} · ${rounds.length}词` : "没有可查看的明细", x + 2, topY + 30, 13, "rgba(255,255,255,0.86)", 700);
  addButton("historyBack", "返回战绩", screen.width - 126, topY - 26, 102, 38, { kind: "secondary" });

  if (!record || !rounds.length) {
    fillRoundedRect(x, listY, w, 184, 12, COLORS.paper);
    drawText("本局没有单词明细", x + w / 2, listY + 82, 19, COLORS.text, 800, "center");
    drawText("新版本完成拼词局后会自动保存。", x + w / 2, listY + 116, 13, COLORS.muted, 500, "center");
    return;
  }

  pageRounds.forEach((round, index) => {
    const rowY = listY + index * 112;
    const ok = !!round.correct;
    const color = ok ? COLORS.green : (round.delta < 0 ? COLORS.red : COLORS.gold);
    fillRoundedRect(x, rowY, w, 102, 8, COLORS.paper);
    drawText(`${state.historyDetailPage * pageSize + index + 1}. ${round.word || "单词"}`, x + 16, rowY + 24, 16, COLORS.deep, 900);
    drawText(`${round.delta > 0 ? "+" : ""}${round.delta}分`, x + w - 16, rowY + 24, 15, color, 900, "right");
    drawFitText(round.meaning || round.mask || "", x + 16, rowY + 48, 13, COLORS.muted, 700, "left", w - 32);
    drawText(getSpellRoundReasonLabel(round.reason), x + w - 16, rowY + 48, 12, COLORS.muted, 700, "right");
    round.players.slice(0, 2).forEach((player, playerIndex) => {
      const lineY = rowY + 72 + playerIndex * 20;
      const label = player.correct ? "正确" : (player.submitted ? "错误" : "未填");
      const answer = player.submitted ? (player.answer || `${player.expectedLength || 0}字母`) : "未提交";
      drawFitText(`${player.nickName || `玩家${playerIndex + 1}`}：${answer} · ${label}`, x + 16, lineY, 12, player.correct ? COLORS.green : COLORS.red, 800, "left", w - 32);
    });
  });

  const controlY = Math.min(screen.height - getSafeBottomPadding() - 46, listY + pageSize * 112 + 8);
  addButton("historyDetailPrev", "上一页", x, controlY, (w - 18) / 3, 40, { kind: "secondary", disabled: state.historyDetailPage <= 0 });
  drawText(`${state.historyDetailPage + 1} / ${maxPage + 1}`, x + w / 2, controlY + 26, 15, COLORS.white, 800, "center");
  addButton("historyDetailNext", "下一页", x + w - (w - 18) / 3, controlY, (w - 18) / 3, 40, { kind: "secondary", disabled: state.historyDetailPage >= maxPage });
}

function getBotDifficultyTheme(difficultyKey) {
  if (difficultyKey === "high") return { color: COLORS.red, bg: "rgba(254,226,226,0.96)", label: "高" };
  if (difficultyKey === "low") return { color: COLORS.green, bg: "rgba(220,252,231,0.96)", label: "低" };
  return { color: COLORS.gold, bg: "rgba(254,243,199,0.96)", label: "中" };
}

function drawBotSwitchControl(x, y, w, h, botName, difficultyKey, disabled) {
  const difficulty = BOT_DIFFICULTIES[difficultyKey] || BOT_DIFFICULTIES.medium;
  const theme = getBotDifficultyTheme(difficultyKey);
  const compact = h < 46;
  const bg = ctx.createLinearGradient(x, y, x + w, y + h);
  bg.addColorStop(0, disabled ? "#E2E8F0" : "#FFFFFF");
  bg.addColorStop(1, disabled ? "#CBD5E1" : "#ECFEFF");

  fillRoundedRect(x + 2, y + 4, w, h, 12, "rgba(15,23,42,0.16)");
  fillRoundedRect(x, y, w, h, 12, bg);
  strokeRoundedRect(x, y, w, h, 12, disabled ? "#CBD5E1" : COLORS.cyan, 1.6);

  const iconX = x + 25;
  const iconY = y + h / 2;
  ctx.fillStyle = disabled ? "#94A3B8" : COLORS.deep;
  ctx.beginPath();
  ctx.arc(iconX, iconY, compact ? 14 : 16, 0, Math.PI * 2);
  ctx.fill();
  drawText("AI", iconX, iconY + 4, compact ? 10 : 11, COLORS.white, 900, "center");

  const badgeW = compact ? 32 : 38;
  const badgeH = compact ? 20 : 22;
  const badgeY = compact ? y + (h - badgeH) / 2 : y + 8;
  fillRoundedRect(x + w - badgeW - 14, badgeY, badgeW, badgeH, badgeH / 2, disabled ? "rgba(226,232,240,0.9)" : theme.bg);
  strokeRoundedRect(x + w - badgeW - 14, badgeY, badgeW, badgeH, badgeH / 2, disabled ? "#CBD5E1" : theme.color, 1.2);
  drawText(theme.label, x + w - badgeW / 2 - 14, badgeY + badgeH / 2 + 4, compact ? 12 : 13, disabled ? "#64748B" : theme.color, 900, "center");

  if (compact) {
    drawFitText(`机器人${botName} ${difficulty.shortLabel} · 点击切换`, x + 48, y + h / 2 + 5, 14, disabled ? "#64748B" : COLORS.text, 900, "left", Math.max(70, w - 104));
  } else {
    drawFitText(`机器人${botName} ${difficulty.shortLabel}`, x + 48, y + 23, 15, disabled ? "#64748B" : COLORS.text, 900, "left", Math.max(70, w - 104));
    drawText("点击切换等级", x + 48, y + h - 10, 11, disabled ? "#64748B" : COLORS.muted, 800);
  }
  drawText(">", x + w - 18, y + h / 2 + 5, 14, disabled ? "#64748B" : COLORS.deep, 900, "center");

  state.buttons.push({
    id: "cycleBotPreset",
    x,
    y,
    w,
    h,
    disabled: !!disabled
  });
}

function drawRoom() {
  drawBackground();
  state.buttons = [];

  const x = 24;
  const w = screen.width - 48;
  const topY = Math.max(104, screen.height * 0.16);
  const cardY = topY + 78;
  drawText("房间码", x, topY, 14, "rgba(255,255,255,0.78)", 500);
  drawText(state.roomCode || "------", x, topY + 42, 36, COLORS.white, 900);
  addButton("invite", "邀请", screen.width - 190, topY - 2, 76, 38, { kind: "secondary" });
  addButton("copy", "复制", screen.width - 104, topY - 2, 80, 38, { kind: "secondary" });

  fillRoundedRect(x, cardY, w, 264, 12, COLORS.paper);
  drawText("玩家", x + 20, cardY + 34, 18, COLORS.text, 800);

  for (let i = 0; i < 2; i += 1) {
    const player = state.players[i];
    const rowY = cardY + 60 + i * 78;
    if (player) {
      ctx.fillStyle = COLORS.deep;
      ctx.beginPath();
      ctx.arc(x + 44, rowY + 26, 24, 0, Math.PI * 2);
      ctx.fill();
      drawText((player.nickName || "玩").slice(0, 1), x + 44, rowY + 33, 18, COLORS.white, 800, "center");
      if (player.isBot && !isCoopMode()) {
        const botDifficulty = player.botDifficulty || state.gameOptions.botDifficulty || "medium";
        drawBotSwitchControl(x + 82, rowY + 5, w - 122, 54, player.nickName || "Jack", botDifficulty, state.busy);
      } else {
        drawText(player.nickName || "玩家", x + 82, rowY + 20, 17, COLORS.text, 800);
        drawText(player.ready ? "已准备" : "未准备", x + 82, rowY + 44, 13, player.ready ? COLORS.green : COLORS.muted, 500);
      }
    } else {
      fillRoundedRect(x + 20, rowY, w - 40, 68, 10, "rgba(248,250,252,0.88)");
      strokeRoundedRect(x + 20, rowY, w - 40, 68, 10, "#CBD5E1", 1);
      drawText(isCoopMode() ? "等待好友加入房间" : "邀请好友，或选择机器人对手", x + 36, rowY + 19, 13, COLORS.muted, 700);
      if (i === 1 && state.players.length < 2 && !isCoopMode()) {
        const bot = BOT_PRESETS[state.selectedBotIndex % BOT_PRESETS.length] || BOT_PRESETS[1];
        drawBotSwitchControl(x + 28, rowY + 26, w - 56, 38, bot.name, bot.difficulty, state.busy);
      } else if (i === 1 && state.players.length < 2 && isCoopMode()) {
        drawText("使用房间码邀请第二名玩家", x + 36, rowY + 51, 13, COLORS.deep, 800);
      }
    }
  }

  const bank = getWordBank();
  const hasBot = !!getBotPlayer();
  const modeText = isCoopMode() ? getCoopModeLabel() : "双人PK";
  const timeModeText = `${state.gameOptions.duration}秒`;
  drawText(`设置：${modeText} · ${timeModeText} · ${getWordBankLabel(bank, true)}${hasBot ? ` · 机器人${getBotDifficulty().shortLabel}` : ""}`, x + 20, cardY + 236, 13, COLORS.muted, 700);
  if (isWrongBankId(state.gameOptions.bankId)) {
    drawText("本局使用创建者的错题库", x + 20, cardY + 256, 12, COLORS.red, 700);
  }

  const me = getLocalPlayer();
  const ready = !!(me && me.ready);
  const minPlayersToStart = 2;
  const canStart = state.players.length >= minPlayersToStart && state.players.every((player) => player.ready);
  const actionY = Math.min(screen.height - 136, cardY + 292);
  const statusText = state.startError || (canStart
    ? "双方已准备，可以开始。"
    : (isCoopMode() && state.players.length < 2 ? "等待第二名玩家加入并准备。" : "双方准备后即可开始。"));
  fillRoundedRect(x + 8, actionY - 46, w - 16, 30, 15, "rgba(255,255,255,0.92)");
  strokeRoundedRect(x + 8, actionY - 46, w - 16, 30, 15, canStart ? COLORS.green : COLORS.cyan, 1.5);
  drawFitText(statusText, x + w / 2, actionY - 25, 13, state.startError ? COLORS.red : (canStart ? COLORS.green : COLORS.deep), 900, "center", w - 36);
  addButton("ready", ready ? "取消准备" : "准备", x, actionY, (w - 14) / 2, 50, { kind: ready ? "secondary" : "primary", disabled: state.busy });
  addButton("start", "开始游戏", x + (w + 14) / 2, actionY, (w - 14) / 2, 50, { disabled: !canStart || state.busy });
  addButton("home", "返回首页", x, actionY + 60, w, 42, { kind: "secondary" });
  if (DEBUG_TOOLS_ENABLED) {
    addButton("debugLogs", "日志", x, actionY + 104, w, 28, { kind: "secondary", fontSize: 13 });
  }
}

function bounce(value, min, max) {
  const span = max - min;
  const loop = span * 2;
  let n = (value - min) % loop;
  if (n < 0) n += loop;
  return n <= span ? min + n : max - (n - span);
}

function hashText(text) {
  let hash = 0;
  const value = String(text || "");
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function setBackgroundScene(seed) {
  state.backgroundScene = Math.abs(hashText(seed || Date.now())) % BACKGROUND_SCENES.length;
  state.visualSkin = FORCED_VISUAL_SKIN || VISUAL_SKINS[state.backgroundScene % VISUAL_SKINS.length];
}

function pickWord(usedWords, excludedWords) {
  const words = getActiveWords();
  const excluded = excludedWords || new Set();
  const available = words.filter((item) => !usedWords.has(item.word) && !excluded.has(item.word));
  const fallback = words.filter((item) => !excluded.has(item.word));
  const source = available.length ? available : fallback.filter((item) => !usedWords.has(item.word));
  if (!source.length) return null;
  return source[Math.floor(Math.random() * source.length)];
}

function makePracticeFish(index, usedWords, forcedItem, forcedLane, excludedWords) {
  const item = forcedItem || pickWord(usedWords, excludedWords);
  if (!item) return null;
  if (!forcedItem) usedWords.add(item.word);
  const speedX = 5 + Math.random() * 7;
  return {
    id: `practice_${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`,
    word: item.word,
    meaning: item.meaning,
    isFake: !!item.isFake,
    correctWord: item.correctWord || item.word,
    lane: Number.isFinite(forcedLane) ? forcedLane : index % LANE_COUNT,
    x: 12 + Math.random() * 76,
    y: 0,
    vx: Math.random() > 0.5 ? speedX : -speedX,
    vy: 0,
    alive: true
  };
}

function makePracticeFishes(count) {
  const fishes = [];
  const usedWords = new Set();
  for (let i = 0; i < count; i += 1) {
    const fish = makePracticeFish(i, usedWords);
    if (fish) fishes.push(fish);
  }
  return fishes;
}

function fillPracticeFishes(excludedWords) {
  const usedWords = new Set(state.usedWords);
  const usedLanes = new Set(state.fishes.filter((fish) => fish.alive).map((fish) => fish.lane));
  let aliveCount = state.fishes.filter((fish) => fish.alive).length;
  while (aliveCount < DEFAULT_FISH_COUNT) {
    const fish = makePracticeFish(state.fishes.length, usedWords, null, null, excludedWords);
    if (!fish) break;
    for (let i = 0; i < LANE_COUNT; i += 1) {
      if (!usedLanes.has(i)) {
        fish.lane = i;
        usedLanes.add(i);
        break;
      }
    }
    state.fishes.push(fish);
    state.usedWords = Array.from(usedWords);
    aliveCount += 1;
  }
}

function pickTarget(fishes) {
  const alive = fishes.filter((fish) => fish.alive && !fish.isFake);
  return alive[Math.floor(Math.random() * alive.length)];
}

function getElapsed() {
  if (!state.startedAt) return 0;
  return Math.max(0, (getNow() - state.startedAt) / 1000);
}

function getFishMetrics(fish) {
  const key = `${fish.id || ""}:${fish.word || ""}`;
  if (fishMetricsCache[key]) return fishMetricsCache[key];
  const wordWidth = measureWordWidth(fish.word);
  const cockroachWidth = Math.max(92, wordWidth + 46);
  const metrics = {
    wordWidth,
    cockroachWidth,
    hash: Math.abs(hashText(key))
  };
  fishMetricsCache[key] = metrics;
  return metrics;
}

function getFishScreenPadding(fish) {
  if (getVisualSkin() === "grass") {
    return Math.min(screen.width / 2 - 18, Math.max(58, getFishMetrics(fish).cockroachWidth / 2 + 42));
  }
  return 64;
}

function getRenderFish(fish) {
  const elapsed = getElapsed();
  const lane = Number.isFinite(fish.lane) ? fish.lane : Math.abs(hashText(fish.id)) % LANE_COUNT;
  const laneTop = Math.max(28, ((getPlayPromptY() + 142) / screen.height) * 100);
  const laneBottom = Math.max(laneTop + 42, Math.min(76, ((getScoreDockY() - 78) / screen.height) * 100));
  const laneStep = (laneBottom - laneTop) / Math.max(1, LANE_COUNT - 1);
  const laneY = laneTop + lane * laneStep;
  const bob = Math.sin(elapsed * 2.2 + lane * 0.9) * 1.2;
  const padding = getFishScreenPadding(fish);
  const minPercent = Math.max(4, (padding / screen.width) * 100);
  const maxPercent = Math.min(96, 100 - minPercent);
  const movingPercent = fish.x + fish.vx * elapsed;
  const xPercent = minPercent < maxPercent
    ? bounce(movingPercent, minPercent, maxPercent)
    : 50 + Math.sin(elapsed * 1.4 + lane) * 3;
  return {
    id: fish.id,
    word: fish.word,
    x: xPercent * screen.width / 100,
    y: (laneY + bob) * screen.height / 100,
    dir: fish.vx >= 0 ? 1 : -1
  };
}

function measureWordWidth(word) {
  const key = String(word || "");
  if (wordWidthCache[key]) return wordWidthCache[key];
  const previousFont = ctx.font;
  ctx.font = "900 14px sans-serif";
  const wordWidth = ctx.measureText(key).width;
  ctx.font = previousFont;
  wordWidthCache[key] = wordWidth;
  return wordWidth;
}

function getCockroachWidth(word) {
  const wordWidth = measureWordWidth(word);
  return Math.max(92, wordWidth + 46);
}

function getFishHitBox(fish) {
  if (getVisualSkin() === "grass") {
    return {
      halfW: getFishMetrics(fish).cockroachWidth / 2 + 8,
      halfH: 24
    };
  }
  return {
    halfW: 54,
    halfH: 28
  };
}

function getTappedFish(x, y) {
  const renderedFishes = state.renderedFishes && state.renderedFishes.length
    ? state.renderedFishes
    : state.fishes.filter((fish) => fish.alive).map((fish) => getRenderFish(fish));
  const candidates = renderedFishes
    .map((fish) => {
      const hitBox = getFishHitBox(fish);
      const dx = Math.abs(x - fish.x);
      const dy = Math.abs(y - fish.y);
      return {
        fish,
        hitBox,
        dx,
        dy,
        score: Math.pow(dx / hitBox.halfW, 2) + Math.pow(dy / hitBox.halfH, 2)
      };
    })
    .filter((item) => item.dx <= item.hitBox.halfW && item.dy <= item.hitBox.halfH)
    .sort((a, b) => a.score - b.score);
  return candidates.length ? candidates[0].fish : null;
}

function getFishStyle(fish) {
  const hash = Math.abs(hashText(`${fish.id}:${fish.word}`));
  const palette = FISH_PALETTES[hash % FISH_PALETTES.length];
  return {
    body: palette[0],
    belly: palette[1],
    fin: palette[2],
    pattern: hash % 4,
    phase: (hash % 628) / 100
  };
}

function drawFish(fish) {
  if (getVisualSkin() === "grass") {
    drawCockroach(fish);
    return;
  }
  const width = 92;
  const height = 42;
  const style = getFishStyle(fish);
  const time = getNow() / 1000;
  const flap = Math.sin(time * 8 + style.phase) * 7;
  const finFlap = Math.sin(time * 5 + style.phase) * 4;

  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.scale(fish.dir, 1);

  ctx.fillStyle = "rgba(15,23,42,0.16)";
  ctx.beginPath();
  ctx.ellipse(3, 8, width / 2.3, height / 2.3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = style.fin;
  ctx.strokeStyle = "rgba(15,23,42,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 6, 0);
  ctx.lineTo(width / 2 + 27, -18 + flap);
  ctx.lineTo(width / 2 + 23, 18 + flap * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = style.fin;
  ctx.beginPath();
  ctx.moveTo(-12, -height / 2 + 5);
  ctx.quadraticCurveTo(2, -height / 2 - 15 - finFlap, 18, -height / 2 + 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const bodyGradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
  bodyGradient.addColorStop(0, style.belly);
  bodyGradient.addColorStop(0.36, style.body);
  bodyGradient.addColorStop(1, style.fin);
  ctx.fillStyle = bodyGradient;
  ctx.strokeStyle = "rgba(15,23,42,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = style.belly;
  ctx.beginPath();
  ctx.ellipse(-7, 10, 32, 12, -0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.52)";
  ctx.lineWidth = 4;
  if (style.pattern === 0) {
    for (let x = -24; x <= 24; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, -18);
      ctx.lineTo(x + 10, 18);
      ctx.stroke();
    }
  } else if (style.pattern === 1) {
    for (let x = -28; x <= 20; x += 18) {
      ctx.beginPath();
      ctx.arc(x, -3 + (x % 3) * 2, 4.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (style.pattern === 2) {
    ctx.beginPath();
    ctx.moveTo(-32, -2);
    ctx.quadraticCurveTo(-5, -14, 28, -4);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.arc(-width / 2 + 15, -7, 5.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.text;
  ctx.beginPath();
  ctx.arc(-width / 2 + 13, -7, 2.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(15,23,42,0.38)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-width / 2 + 11, 4, 7, 0.05, 0.8);
  ctx.stroke();

  ctx.restore();

  const labelW = Math.max(58, fish.word.length * 9 + 18);
  fillRoundedRect(fish.x - labelW / 2, fish.y - 11, labelW, 24, 12, "rgba(255,255,255,0.78)");
  drawText(fish.word, fish.x, fish.y + 6, 14, COLORS.text, 900, "center");
}

function drawCockroachSpriteBody(targetCtx, width) {
  const height = 40;
  targetCtx.save();
  targetCtx.lineCap = "round";
  targetCtx.lineJoin = "round";

  targetCtx.fillStyle = "rgba(15,23,42,0.2)";
  targetCtx.beginPath();
  targetCtx.ellipse(4, 13, width / 2.2, height / 3, 0, 0, Math.PI * 2);
  targetCtx.fill();

  targetCtx.strokeStyle = "#3F1D08";
  targetCtx.lineWidth = 2.2;
  targetCtx.beginPath();
  targetCtx.moveTo(-width / 2 + 15, -14);
  targetCtx.quadraticCurveTo(-width / 2 - 10, -28, -width / 2 - 25, -17);
  targetCtx.moveTo(-width / 2 + 17, -9);
  targetCtx.quadraticCurveTo(-width / 2 - 10, -17, -width / 2 - 28, -5);
  targetCtx.stroke();

  targetCtx.strokeStyle = "#3F1D08";
  targetCtx.lineWidth = 2.3;
  [-width * 0.26, 0, width * 0.26].forEach((legX, index) => {
    const spread = 17 + index * 3;
    const foot = index % 2 ? 1.5 : -1.5;
    targetCtx.beginPath();
    targetCtx.moveTo(legX, -10);
    targetCtx.lineTo(legX - 8, -spread);
    targetCtx.lineTo(legX - 20 + foot, -spread - 4);
    targetCtx.moveTo(legX, 10);
    targetCtx.lineTo(legX - 8, spread);
    targetCtx.lineTo(legX - 20 - foot, spread + 4);
    targetCtx.stroke();
  });

  targetCtx.fillStyle = "#92400E";
  targetCtx.strokeStyle = "#3F1D08";
  targetCtx.lineWidth = 2;
  targetCtx.beginPath();
  targetCtx.ellipse(3, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.stroke();

  targetCtx.fillStyle = "rgba(254,243,199,0.16)";
  targetCtx.beginPath();
  targetCtx.ellipse(0, -7, width / 2.8, height / 5.5, -0.08, 0, Math.PI * 2);
  targetCtx.fill();

  targetCtx.fillStyle = "#78350F";
  targetCtx.beginPath();
  targetCtx.ellipse(-width / 2 + 12, 0, 17, 17, 0, 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.stroke();

  targetCtx.strokeStyle = "rgba(254,243,199,0.25)";
  targetCtx.lineWidth = 4;
  for (let x = -width / 2 + 32; x <= width / 2 - 20; x += 16) {
    targetCtx.beginPath();
    targetCtx.moveTo(x, -16);
    targetCtx.quadraticCurveTo(x + 4, 0, x, 16);
    targetCtx.stroke();
  }

  targetCtx.fillStyle = COLORS.white;
  targetCtx.beginPath();
  targetCtx.arc(-width / 2 + 3, -5, 4.6, 0, Math.PI * 2);
  targetCtx.arc(-width / 2 + 3, 5, 4.6, 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.fillStyle = COLORS.text;
  targetCtx.beginPath();
  targetCtx.arc(-width / 2 + 1, -5, 1.9, 0, Math.PI * 2);
  targetCtx.arc(-width / 2 + 1, 5, 1.9, 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.restore();
}

function getCockroachSprite(width) {
  const bucketWidth = Math.ceil(Math.max(92, width) / 8) * 8;
  const key = `${bucketWidth}:${dpr}`;
  if (cockroachSpriteCache[key]) return cockroachSpriteCache[key];
  const spriteW = bucketWidth + 76;
  const spriteH = 86;
  const buffer = createScaledCanvas(spriteW, spriteH);
  if (!buffer) return null;
  buffer.ctx.translate(spriteW / 2, spriteH / 2 + 1);
  drawCockroachSpriteBody(buffer.ctx, bucketWidth);
  const sprite = { canvas: buffer.canvas, width: spriteW, height: spriteH };
  cockroachSpriteCache[key] = sprite;
  return sprite;
}

function drawCockroach(fish) {
  const labelSize = 14;
  const metrics = getFishMetrics(fish);
  const wordWidth = metrics.wordWidth;
  const width = metrics.cockroachWidth;
  const hash = metrics.hash;
  const time = getNow() / 1000;
  const sprite = getCockroachSprite(width);

  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.scale(fish.dir, 1);
  ctx.rotate(Math.sin(time * 3 + hash) * 0.025);
  if (sprite) {
    ctx.drawImage(sprite.canvas, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
  } else {
    drawCockroachSpriteBody(ctx, width);
  }
  ctx.restore();

  const labelW = Math.max(42, wordWidth + 12);
  const rawLabelX = fish.x + fish.dir * 9;
  const labelX = labelW >= screen.width - 16
    ? screen.width / 2
    : Math.max(labelW / 2 + 8, Math.min(screen.width - labelW / 2 - 8, rawLabelX));
  const labelY = fish.y - 11;
  fillRoundedRect(labelX - labelW / 2, labelY, labelW, 22, 10, "rgba(255,251,235,0.78)");
  strokeRoundedRect(labelX - labelW / 2, labelY, labelW, 22, 10, "rgba(254,243,199,0.82)", 1);
  drawText(fish.word, labelX, labelY + 15, labelSize, "#451A03", 900, "center");
}

function updatePlayingClock() {
  if (isCoopSpellMode()) {
    if (state.scene === GAME.PLAYING) updateCoopSpellQuestionClock();
    return;
  }
  const elapsed = getElapsed();
  state.timeLeft = Math.max(0, Math.ceil(state.duration - elapsed));
  if (state.scene === GAME.PLAYING && state.timeLeft <= 0 && !state.finishing) {
    if (state.practiceMode || state.soloSpellMode) {
      finishPractice();
    } else {
      state.finishing = true;
      callFunction("finishGame", { roomId: state.roomId }).then(fetchRoom).catch(() => {
        state.message = "结算失败，请检查云函数";
      });
    }
  }
}

function getTeamScore() {
  if (!state.soloSpellMode && isCoopSpellMode()) return Number(state.teamScore || 0);
  return (state.players || []).reduce((sum, player) => sum + Number(player.score || 0), 0);
}

function getCoopSpellQuestionStartedAt(question) {
  const value = question && question.createdAt;
  if (value && typeof value.toDate === "function") return value.toDate().getTime();
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : getNow();
}

function getCoopSpellTotalElapsedSeconds() {
  if (!state.soloSpellMode && state.roomStartedLocalAt && Number(state.startedAt || 0) === state.roomStartedRemoteAt) {
    return Math.max(0, (getNow() - state.roomStartedLocalAt) / 1000);
  }
  const totalStartedAt = Number(state.startedAt || getNow());
  return Math.max(0, (getNow() - totalStartedAt) / 1000);
}

function getCoopSpellQuestionElapsedSeconds(question) {
  const questionId = getCoopSpellQuestionId(question);
  if (!state.soloSpellMode && questionId && questionId === state.coopSpellQuestionLocalId && state.coopSpellQuestionLocalStartedAt) {
    return Math.max(0, (getNow() - state.coopSpellQuestionLocalStartedAt) / 1000);
  }
  return Math.max(0, (getNow() - getCoopSpellQuestionStartedAt(question)) / 1000);
}

function updateCoopSpellQuestionClock() {
  const totalElapsed = getCoopSpellTotalElapsedSeconds();
  const totalDuration = Number(state.duration || state.gameOptions.duration || DEFAULT_GAME_OPTIONS.duration);
  state.timeLeft = Math.max(0, Math.ceil(totalDuration - totalElapsed));
  if (state.timeLeft <= 0) {
    state.coopSpellQuestionTimeLeft = 0;
    if (state.finishing) return;
    if (state.soloSpellMode) {
      finishPractice();
    } else {
      state.finishing = true;
      callFunction("finishGame", { roomId: state.roomId }).then(fetchRoom).catch(() => {
        state.finishing = false;
        state.message = "结算失败，请检查云函数";
      });
    }
    return;
  }

  const question = state.coopSpellQuestion;
  if (!question || !question.id) {
    state.coopSpellQuestionTimeLeft = COOP_SPELL_QUESTION_SECONDS;
    return;
  }
  const elapsed = getCoopSpellQuestionElapsedSeconds(question);
  state.coopSpellQuestionTimeLeft = Math.max(0, Math.ceil(COOP_SPELL_QUESTION_SECONDS - elapsed));
  if (state.coopSpellQuestionTimeLeft > 0 || state.catchPending || state.coopSpellAutoSkipQuestionId === question.id) return;
  state.coopSpellAutoSkipQuestionId = question.id;
  skipCoopSpellQuestion(false);
}

function pickSoloSpellTemplate() {
  const templates = getStudySpellTemplates();
  if (!templates.length) return null;
  const used = new Set(state.usedWords || []);
  const available = templates.filter((item) => !used.has(String(item.key || item.word || "").trim().toLowerCase()));
  const source = available.length ? available : templates;
  if (!available.length) state.usedWords = [];
  const template = source[Math.floor(Math.random() * source.length)];
  const wordKey = String(template.key || template.word || "").trim().toLowerCase();
  state.usedWords = [...new Set([...(state.usedWords || []), wordKey])];
  return template;
}

function makeSoloSpellQuestion() {
  const template = pickSoloSpellTemplate();
  if (!template) return null;
  const slots = Array.isArray(template.slots) ? template.slots : [];
  if (slots.length !== 4) return null;
  return {
    id: `solo_spell_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    wordKey: template.key,
    word: template.word,
    meaning: template.meaning,
    mask: template.mask,
    blankPositions: template.blankPositions,
    slots,
    mode: "boatLetters",
    segments: [{
      openid: state.openid || "solo_spell",
      start: 1,
      end: 4,
      length: 4,
      slotIndexes: [0, 1, 2, 3],
      answer: slots.map((slot) => slot.answer).join("")
    }],
    createdAt: Date.now()
  };
}

function applySoloSpellQuestion(question) {
  state.coopSpellQuestion = question;
  state.coopSpellSubmissions = {};
  state.coopSpellInput = [];
  state.coopSpellInputQuestionId = question ? question.id : "";
  state.coopSpellQuestionLocalId = question ? question.id : "";
  state.coopSpellQuestionLocalStartedAt = question ? getNow() : 0;
  state.coopSpellAdvancingQuestionId = "";
  state.coopSpellAutoSkipQuestionId = "";
  state.coopSpellQuestionTimeLeft = COOP_SPELL_QUESTION_SECONDS;
  state.currentMeaning = question ? question.meaning : "";
  state.targetFishId = question ? question.id : "";
}

function parseCoopSpellQuestion(value) {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (err) {
      logWarn("spell", "question.parse.fail", { length: value.length });
      return null;
    }
  }
  return typeof value === "object" ? value : null;
}

function isBotPlayer(player) {
  return !!(player && (player.isBot || String(player.openid || "").indexOf("bot_") === 0));
}

function getLocalPlayer() {
  const players = state.players || [];
  const exact = players.find((player) => player && player.openid === state.openid);
  if (exact) return exact;
  if (state.soloSpellMode && players.length === 1) return players[0];
  if (state.openid) return null;

  const humanPlayers = players.filter((player) => player && !isBotPlayer(player));
  return humanPlayers.length === 1 ? humanPlayers[0] : null;
}

function isLocalPlayer(player) {
  const local = getLocalPlayer();
  return !!(player && local && player.openid === local.openid);
}

function getCoopSpellSegment(player) {
  const question = state.coopSpellQuestion || {};
  const segments = Array.isArray(question.segments) ? question.segments : [];
  const byOpenid = segments.find((item) => item.openid === player.openid);
  if (byOpenid) return byOpenid;
  const index = (state.players || []).findIndex((item) => item.openid === player.openid);
  return segments[index] || null;
}

function getCoopSpellSubmission(openid) {
  const submissions = state.coopSpellSubmissions || {};
  const submission = submissions[openid] || null;
  if (!submission) return null;
  const questionId = (state.coopSpellQuestion && state.coopSpellQuestion.id) || "";
  if (!questionId || String(submission.questionId || "") !== String(questionId)) return null;
  return submission;
}

function getCoopSpellQuestionId(question) {
  return question && question.id ? String(question.id) : "";
}

function filterCoopSpellSubmissionsForQuestion(submissions, questionId) {
  const activeQuestionId = String(questionId || "");
  const source = submissions && typeof submissions === "object" ? submissions : {};
  const result = {};
  if (!activeQuestionId) return result;
  Object.keys(source).forEach((openid) => {
    if (!openid || openid.charAt(0) === "_") return;
    const item = source[openid];
    if (!item || typeof item !== "object") return;
    if (String(item.questionId || "") !== activeQuestionId) return;
    result[openid] = item;
  });
  return result;
}

function resetCoopSpellDraftForQuestion(questionId) {
  state.coopSpellInput = [];
  state.coopSpellInputQuestionId = String(questionId || "");
  state.coopSpellQuestionLocalId = String(questionId || "");
  state.coopSpellQuestionLocalStartedAt = questionId ? getNow() : 0;
  state.coopSpellAutoSkipQuestionId = "";
  state.coopSpellQuestionTimeLeft = COOP_SPELL_QUESTION_SECONDS;
}

function isCoopSpellAdvancingQuestion() {
  const questionId = getCoopSpellQuestionId(state.coopSpellQuestion);
  return !!questionId && state.coopSpellAdvancingQuestionId === questionId;
}

function applyCoopSpellQuestionState(nextQuestion, roomSubmissions) {
  const previousQuestionId = getCoopSpellQuestionId(state.coopSpellQuestion);
  const nextQuestionId = getCoopSpellQuestionId(nextQuestion);
  const questionChanged = nextQuestionId !== previousQuestionId;
  if (questionChanged || nextQuestionId !== state.coopSpellInputQuestionId) {
    resetCoopSpellDraftForQuestion(nextQuestionId);
  }
  if (state.coopSpellAdvancingQuestionId && state.coopSpellAdvancingQuestionId !== nextQuestionId) {
    state.coopSpellAdvancingQuestionId = "";
  }
  const roomActive = filterCoopSpellSubmissionsForQuestion(roomSubmissions, nextQuestionId);
  const localActive = questionChanged ? {} : filterCoopSpellSubmissionsForQuestion(state.coopSpellSubmissions, nextQuestionId);
  state.coopSpellQuestion = nextQuestion;
  state.coopSpellSubmissions = {
    ...localActive,
    ...roomActive
  };
  if (questionChanged) {
    logInfo("spell", "question.change", { from: previousQuestionId, to: nextQuestionId });
  }
}

function isCoopSpellSubmissionReady(submission) {
  return !!(submission && (submission.status === "submitted" || submission.status === "correct" || submission.status === "wrong"));
}

function rememberLocalCoopSpellSubmission(openid, questionId, answer, length) {
  if (!openid || !questionId) return;
  state.coopSpellSubmissions = {
    ...(state.coopSpellSubmissions || {}),
    [openid]: {
      status: "submitted",
      questionId,
      answer,
      length,
      submittedAt: Date.now(),
      optimistic: true
    }
  };
}

function rollbackLocalCoopSpellSubmission(openid, questionId) {
  const submissions = state.coopSpellSubmissions || {};
  const current = submissions[openid];
  if (!current || !current.optimistic || String(current.questionId || "") !== String(questionId || "")) return;
  const next = { ...submissions };
  delete next[openid];
  state.coopSpellSubmissions = next;
}

function getCoopSpellSegmentOwner(slotIndex) {
  const question = state.coopSpellQuestion || {};
  const segments = Array.isArray(question.segments) ? question.segments : [];
  return segments.find((segment) => {
    const slotIndexes = Array.isArray(segment.slotIndexes) ? segment.slotIndexes : [];
    return slotIndexes.indexOf(slotIndex) >= 0;
  }) || null;
}

function getCoopSpellSlotValue(slotIndex, localSegment) {
  const owner = getCoopSpellSegmentOwner(slotIndex);
  if (!owner) return "";
  const slotIndexes = Array.isArray(owner.slotIndexes) ? owner.slotIndexes : [];
  const answerIndex = slotIndexes.indexOf(slotIndex);
  if (localSegment && owner.openid === localSegment.openid) {
    const localSubmission = getCoopSpellSubmission(owner.openid);
    const submittedAnswer = localSubmission && localSubmission.answer;
    const questionId = (state.coopSpellQuestion && state.coopSpellQuestion.id) || "";
    const localInput = state.coopSpellInputQuestionId === questionId ? state.coopSpellInput[answerIndex] : "";
    return String(localInput || (submittedAnswer && submittedAnswer.charAt(answerIndex)) || "").toUpperCase();
  }
  return "";
}

function getCoopSpellCells(localSegment) {
  const question = state.coopSpellQuestion || {};
  const word = String(question.word || "").trim();
  if (!word) return [];
  const slots = Array.isArray(question.slots) ? question.slots : [];
  const slotByPosition = {};
  slots.forEach((slot) => {
    slotByPosition[slot.position] = slot;
  });
  return Array.from(word).map((letter, position) => {
    const slot = slotByPosition[position];
    if (!slot) return { letter: letter.toUpperCase(), blank: false, position };
    return {
      letter: getCoopSpellSlotValue(slot.index, localSegment),
      blank: true,
      slotIndex: slot.index,
      position
    };
  });
}

function syncCoopSpellInputLength(segment) {
  const questionId = (state.coopSpellQuestion && state.coopSpellQuestion.id) || "";
  if (questionId !== state.coopSpellInputQuestionId) {
    state.coopSpellInput = [];
    state.coopSpellInputQuestionId = questionId;
    state.coopSpellQuestionLocalId = questionId;
    state.coopSpellQuestionLocalStartedAt = questionId ? getNow() : 0;
  }
  const maxLength = segment ? Number(segment.length || 0) : 0;
  if (maxLength && state.coopSpellInput.length > maxLength) {
    state.coopSpellInput = state.coopSpellInput.slice(0, maxLength);
  }
}

function addCoopSpellLetter(letter) {
  if (!isCoopSpellMode()) return;
  if (isCoopSpellAdvancingQuestion()) {
    logWarn("spell", "letter.blocked.advancing", { questionId: state.coopSpellAdvancingQuestionId });
    return;
  }
  const me = getLocalPlayer();
  const segment = me && getCoopSpellSegment(me);
  if (!segment) {
    toast("等待分配字母空位");
    return;
  }
  const submission = getCoopSpellSubmission(me.openid);
  if (isCoopSpellSubmissionReady(submission)) {
    logWarn("spell", "submit.alreadySubmitted", { questionId: state.coopSpellQuestion && state.coopSpellQuestion.id });
    toast("你已填写，等待队友");
    return;
  }
  syncCoopSpellInputLength(segment);
  const maxLength = Number(segment.length || 0);
  if (state.coopSpellInput.length >= maxLength) {
    logWarn("spell", "letter.blocked.full", { inputLength: state.coopSpellInput.length, maxLength });
    return;
  }
  state.coopSpellInput = [...state.coopSpellInput, String(letter || "").slice(0, 1).toLowerCase()];
  logInfo("spell", "letter.add", { letter, inputLength: state.coopSpellInput.length, maxLength, questionId: state.coopSpellQuestion && state.coopSpellQuestion.id });
}

function deleteCoopSpellLetter() {
  if (!state.coopSpellInput.length) {
    logWarn("spell", "letter.delete.empty", { questionId: state.coopSpellQuestion && state.coopSpellQuestion.id });
    return;
  }
  state.coopSpellInput = state.coopSpellInput.slice(0, -1);
  logInfo("spell", "letter.delete", { inputLength: state.coopSpellInput.length, questionId: state.coopSpellQuestion && state.coopSpellQuestion.id });
}

function clearCoopSpellLetters() {
  state.coopSpellInput = [];
}

function submitSoloSpellAnswer(answer, me, segment) {
  const expected = String((segment && segment.answer) || "").toLowerCase();
  const normalizedAnswer = String(answer || "").toLowerCase();
  const correct = !!expected && normalizedAnswer === expected;
  if (!me) return;
  if (!correct) {
    me.score = (me.score || 0) - COOP_SPELL_ROUND_SCORE;
    const word = state.coopSpellQuestion && state.coopSpellQuestion.word;
    const meaning = state.coopSpellQuestion && state.coopSpellQuestion.meaning;
    if (word && meaning) saveWrongWord({ word, meaning });
    state.coopSpellInput = [];
    addFeedback("-100", screen.width / 2, screen.height * 0.42, COLORS.red);
    toast("-100");
    return;
  }

  me.score = (me.score || 0) + COOP_SPELL_ROUND_SCORE;
  state.coopSpellSubmissions = {
    [me.openid]: {
      status: "correct",
      length: expected.length,
      submittedAt: Date.now()
    }
  };
  addFeedback("+100", screen.width / 2, screen.height * 0.42, COLORS.green);
  const nextQuestion = makeSoloSpellQuestion();
  if (!nextQuestion) {
    finishPractice();
    return;
  }
  applySoloSpellQuestion(nextQuestion);
}

function rememberSkippedSpellWord() {
  const question = state.coopSpellQuestion || {};
  if (question.word && question.meaning) {
    saveWrongWord({ word: question.word, meaning: question.meaning });
  }
}

function skipSoloSpellQuestion(manual) {
  const me = getLocalPlayer();
  if (!me) return;
  rememberSkippedSpellWord();
  if (manual) {
    me.score = (me.score || 0) - COOP_SPELL_ROUND_SCORE;
    addFeedback("跳过 -100", screen.width / 2, screen.height * 0.42, COLORS.red);
  } else {
    addFeedback("时间到，自动换词", screen.width / 2, screen.height * 0.42, COLORS.gold);
  }
  const nextQuestion = makeSoloSpellQuestion();
  if (!nextQuestion) {
    finishPractice();
    return;
  }
  applySoloSpellQuestion(nextQuestion);
}

function skipCoopSpellQuestion(manual) {
  if (state.catchPending || state.busy || isCoopSpellAdvancingQuestion() || (!state.roomId && !state.soloSpellMode)) {
    logWarn("spell", "skip.blocked", { manual: !!manual, catchPending: state.catchPending, busy: state.busy, advancingQuestionId: state.coopSpellAdvancingQuestionId, roomId: state.roomId, soloSpellMode: state.soloSpellMode });
    return;
  }
  const question = state.coopSpellQuestion;
  if (!question || !question.id) {
    logWarn("spell", "skip.noQuestion", { manual: !!manual });
    return;
  }
  logInfo("spell", "skip.start", { manual: !!manual, questionId: question.id, soloSpellMode: state.soloSpellMode });
  if (state.soloSpellMode) {
    skipSoloSpellQuestion(!!manual);
    return;
  }

  rememberSkippedSpellWord();
  state.catchPending = true;
  callFunction("catchFish", {
    roomId: state.roomId,
    action: manual ? "skipCoopSpell" : "timeoutCoopSpell",
    questionId: question.id
  }).then((res) => {
    const result = res.result || {};
    logInfo("spell", "skip.result", {
      manual: !!manual,
      questionId: question.id,
      stale: !!result.stale,
      tooEarly: !!result.tooEarly,
      finished: !!result.finished,
      delta: result.delta || 0
    });
    if (result.tooEarly) {
      state.coopSpellAutoSkipQuestionId = "";
      return;
    }
    if (!result.stale) {
      state.coopSpellInput = [];
      state.coopSpellInputQuestionId = question.id;
      state.coopSpellSubmissions = {};
      state.coopSpellAdvancingQuestionId = question.id;
      addFeedback(manual ? "跳过 -100" : "时间到，自动换词", screen.width / 2, screen.height * 0.42, manual ? COLORS.red : COLORS.gold);
    }
    fetchRoom();
  }).catch((err) => {
    logError("spell", "skip.fail", { manual: !!manual, questionId: question.id, errMsg: err && (err.errMsg || err.message) });
    state.coopSpellAutoSkipQuestionId = "";
    toast(err.errMsg || "无法跳过当前单词");
  }).finally(() => {
    state.catchPending = false;
  });
}

function drawCoopSpellBoat(x, y, w, h) {
  const waterY = y + h * 0.58;
  const sky = ctx.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, "#BAE6FD");
  sky.addColorStop(1, "#ECFEFF");
  fillRoundedRect(x, y, w, h, 14, sky);
  ctx.fillStyle = "#7DD3FC";
  ctx.beginPath();
  ctx.rect(x, waterY, w, h - (waterY - y));
  ctx.fill();
  for (let i = 0; i < 4; i += 1) {
    const waveY = waterY + 18 + i * 18;
    ctx.strokeStyle = i % 2 ? "rgba(14,116,144,0.18)" : "rgba(255,255,255,0.62)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = x - 20; px <= x + w + 20; px += 18) {
      const py = waveY + Math.sin((px + frameNow * 0.03 + i * 18) / 18) * 4;
      if (px === x - 20) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  const boatCx = x + w / 2;
  const boatY = waterY + Math.min(58, h * 0.2);
  ctx.fillStyle = "#92400E";
  ctx.beginPath();
  ctx.moveTo(boatCx - w * 0.28, boatY - 26);
  ctx.lineTo(boatCx + w * 0.28, boatY - 26);
  ctx.lineTo(boatCx + w * 0.2, boatY + 18);
  ctx.quadraticCurveTo(boatCx, boatY + 38, boatCx - w * 0.22, boatY + 18);
  ctx.closePath();
  ctx.fill();
  strokeRoundedRect(boatCx - w * 0.24, boatY - 28, w * 0.48, 18, 8, "#FBBF24", 2);
  ctx.fillStyle = "#451A03";
  fillRoundedRect(boatCx - w * 0.2, boatY - 18, w * 0.4, 10, 5, "#B45309");

  ctx.strokeStyle = "#78350F";
  ctx.lineWidth = 4;
  const mastTopY = Math.min(boatY - 56, y + Math.max(54, h * 0.28));
  const sailTopY = mastTopY + 6;
  const sailBottomY = boatY - 32;
  ctx.beginPath();
  ctx.moveTo(boatCx, boatY - 28);
  ctx.lineTo(boatCx, mastTopY);
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(boatCx + 4, sailTopY);
  ctx.lineTo(boatCx + 4, sailBottomY);
  ctx.lineTo(boatCx + Math.min(88, w * 0.25), sailBottomY - 10);
  ctx.quadraticCurveTo(boatCx + w * 0.17, (sailTopY + sailBottomY) / 2, boatCx + 4, sailTopY);
  ctx.fill();
  ctx.strokeStyle = "rgba(8,145,178,0.45)";
  ctx.lineWidth = 2;
  ctx.stroke();
  drawText("WORD", boatCx + 28, Math.min(sailBottomY - 12, sailTopY + 32), 13, COLORS.deep, 900, "center");
}

function drawCoopSpellWord(cells, x, y, w, localSegment) {
  const count = Math.max(1, cells.length);
  const gap = cells.length > 14 ? 2 : 4;
  const cellW = Math.min(34, (w - gap * (count - 1)) / count);
  const fontSize = Math.max(13, Math.min(22, cellW * 0.68));
  const startX = x + (w - (cellW * count + gap * (count - 1))) / 2;
  cells.forEach((cell, index) => {
    const cx = startX + index * (cellW + gap);
    if (cell.blank) {
      const theme = COOP_SPELL_PLAYER_THEMES[cell.slotIndex < 2 ? 0 : 1];
      fillRoundedRect(cx, y, cellW, 40, 8, theme.fill);
      strokeRoundedRect(cx, y, cellW, 40, 8, theme.stroke, 2);
      drawText(cell.letter || "_", cx + cellW / 2, y + 27, fontSize, cell.letter ? theme.text : theme.stroke, 900, "center");
    } else {
      drawText(cell.letter, cx + cellW / 2, y + 26, fontSize, COLORS.text, 900, "center");
    }
  });
}

function drawCoopSpellStatusCard(player, x, y, w, isMe, playerIndex) {
  const segment = getCoopSpellSegment(player) || {};
  const submission = getCoopSpellSubmission(player.openid) || {};
  const submitted = isCoopSpellSubmissionReady(submission);
  const pending = !submitted;
  const theme = COOP_SPELL_PLAYER_THEMES[playerIndex === 1 ? 1 : 0];
  fillRoundedRect(x, y, w, 76, 12, theme.fill);
  strokeRoundedRect(x, y, w, 76, 12, submitted ? COLORS.green : theme.stroke, 1.8);
  ctx.fillStyle = theme.badge;
  ctx.beginPath();
  ctx.arc(x + 28, y + 34, 18, 0, Math.PI * 2);
  ctx.fill();
  drawText((player.nickName || "玩").slice(0, 1), x + 28, y + 40, 14, COLORS.white, 900, "center");
  drawFitText(isMe ? "我负责" : `${player.nickName || "队友"}负责`, x + 56, y + 25, 13, COLORS.muted, 800, "left", w - 74);
  const rangeText = segment.start ? `第${segment.start}-${segment.end}空 · ${segment.length || 0}个字母` : "等待分配";
  drawFitText(submitted ? "已提交，等队友" : rangeText, x + 56, y + 50, 15, submitted ? COLORS.green : COLORS.text, 900, "left", w - 74);
  if (isMe && pending && segment.length) {
    const text = `${state.coopSpellInput.length}/${segment.length}`;
    fillRoundedRect(x + w - 58, y + 22, 42, 26, 13, "rgba(255,255,255,0.86)");
    drawText(text, x + w - 37, y + 40, 13, theme.text, 900, "center");
  }
}

function drawCoopSpellLocalFocusCard(player, x, y, w, h, playerIndex) {
  const segment = getCoopSpellSegment(player) || {};
  const submission = getCoopSpellSubmission(player.openid) || {};
  const submitted = isCoopSpellSubmissionReady(submission);
  const theme = COOP_SPELL_PLAYER_THEMES[playerIndex === 1 ? 1 : 0];
  const slotIndexes = Array.isArray(segment.slotIndexes) ? segment.slotIndexes : [];
  const inputCount = submitted ? Number(submission.length || segment.length || 0) : state.coopSpellInput.length;
  const expectedCount = Number(segment.length || slotIndexes.length || 0);
  const title = submitted ? "已填" : "请填";
  const rangeText = segment.start ? `第${segment.start}-${segment.end}空` : "等待分配";

  fillRoundedRect(x, y, w, h, 14, theme.fill);
  strokeRoundedRect(x, y, w, h, 14, submitted ? COLORS.green : theme.stroke, 2.4);
  fillRoundedRect(x + 14, y + 12, 58, 24, 12, theme.badge);
  drawText(title, x + 43, y + 29, 13, COLORS.white, 900, "center");
  drawFitText(rangeText, x + 86, y + 30, 16, theme.text, 900, "left", w - 170);
  fillRoundedRect(x + w - 70, y + 12, 52, 24, 12, "rgba(255,255,255,0.88)");
  drawText(`${inputCount}/${expectedCount || 0}`, x + w - 44, y + 29, 13, theme.text, 900, "center");

  const boxCount = Math.max(1, expectedCount || 2);
  const compact = h < 96;
  const boxGap = compact ? 7 : 9;
  const maxBox = compact ? 42 : 50;
  const boxSize = Math.min(maxBox, (w - 40 - boxGap * (boxCount - 1)) / boxCount);
  const boxesW = boxSize * boxCount + boxGap * (boxCount - 1);
  const boxStartX = x + (w - boxesW) / 2;
  const boxY = y + (compact ? 42 : 46);
  for (let index = 0; index < boxCount; index += 1) {
    const slotIndex = slotIndexes[index];
    const letter = Number.isFinite(slotIndex) ? getCoopSpellSlotValue(slotIndex, segment) : "";
    const bx = boxStartX + index * (boxSize + boxGap);
    fillRoundedRect(bx, boxY, boxSize, boxSize, 10, "rgba(255,255,255,0.92)");
    strokeRoundedRect(bx, boxY, boxSize, boxSize, 10, letter ? theme.stroke : "rgba(8,145,178,0.28)", letter ? 2.2 : 1.4);
    drawText(letter || "_", bx + boxSize / 2, boxY + boxSize * 0.67, compact ? 21 : 25, letter ? theme.text : theme.stroke, 900, "center");
  }
}

function drawCoopSpellPeerMiniCard(player, x, y, w, h, playerIndex) {
  const segment = getCoopSpellSegment(player) || {};
  const submission = getCoopSpellSubmission(player.openid) || {};
  const submitted = isCoopSpellSubmissionReady(submission);
  const theme = COOP_SPELL_PLAYER_THEMES[playerIndex === 1 ? 1 : 0];
  fillRoundedRect(x, y, w, h, 12, "rgba(255,255,255,0.9)");
  strokeRoundedRect(x, y, w, h, 12, submitted ? COLORS.green : theme.stroke, 1.6);
  ctx.fillStyle = theme.badge;
  ctx.beginPath();
  ctx.arc(x + 22, y + h / 2, 14, 0, Math.PI * 2);
  ctx.fill();
  drawText((player.nickName || "队").slice(0, 1), x + 22, y + h / 2 + 5, 12, COLORS.white, 900, "center");
  const rangeText = segment.start ? `队友 ${segment.start}-${segment.end}空` : "队友";
  drawFitText(rangeText, x + 44, y + h / 2 - 3, 12, COLORS.muted, 800, "left", w - 106);
  fillRoundedRect(x + w - 58, y + h / 2 - 13, 46, 26, 13, submitted ? "rgba(220,252,231,0.95)" : "rgba(255,247,237,0.95)");
  drawText(submitted ? "已填" : "等待", x + w - 35, y + h / 2 + 5, 12, submitted ? COLORS.green : COLORS.gold, 900, "center");
}

function drawSoloSpellGroupCard(groupIndex, x, y, w) {
  const theme = COOP_SPELL_PLAYER_THEMES[groupIndex === 1 ? 1 : 0];
  const start = groupIndex === 1 ? 3 : 1;
  const end = groupIndex === 1 ? 4 : 2;
  fillRoundedRect(x, y, w, 76, 12, theme.fill);
  strokeRoundedRect(x, y, w, 76, 12, theme.stroke, 1.8);
  ctx.fillStyle = theme.badge;
  ctx.beginPath();
  ctx.arc(x + 28, y + 34, 18, 0, Math.PI * 2);
  ctx.fill();
  drawText(String(groupIndex + 1), x + 28, y + 40, 14, COLORS.white, 900, "center");
  drawText(groupIndex === 1 ? "粉色 3-4" : "蓝色 1-2", x + 52, y + 27, 11, theme.text, 900);
  drawText(`第${start}-${end}空由你填`, x + 52, y + 51, 11, COLORS.text, 800);
}

function drawCoopSpellPlaying() {
  drawBackground();
  state.buttons = [];
  updatePlayingClock();

  const question = state.coopSpellQuestion || {};
  const players = state.players.length ? state.players : [{ openid: state.openid, nickName: state.playerName, score: 0 }];
  const me = getLocalPlayer() || players[0];
  const other = players.find((player) => player.openid !== me.openid) || players[1] || { openid: "other", nickName: "队友", score: 0 };
  const localSegment = me && getCoopSpellSegment(me);
  syncCoopSpellInputLength(localSegment);

  const promptX = 22;
  const promptY = getPlayPromptY();
  const promptW = screen.width - 44;
  const compact = screen.height < 640;
  const promptH = compact ? 112 : 124;
  const timerX = screen.width - 56;
  drawPromptFrame(promptX, promptY, promptW, promptH);
  addButton("coopSpellExit", "退出", promptX + 8, promptY + 8, 48, 24, { kind: "secondary", fontSize: 11 });
  fillRoundedRect(promptX + promptW / 2 - 54, promptY + 10, 108, 22, 11, COLORS.deep);
  drawText(state.soloSpellMode ? "单人拼词练习" : "同舟拼词记", promptX + promptW / 2, promptY + 26, 12, COLORS.white, 900, "center");
  drawText("总计", timerX, promptY + 17, 10, COLORS.red, 900, "center");
  drawTimer(timerX, promptY + 54);
  fillRoundedRect(timerX - 34, promptY + 92, 68, 20, 10, "rgba(255,255,255,0.92)");
  strokeRoundedRect(timerX - 34, promptY + 92, 68, 20, 10, COLORS.gold, 1.2);
  drawText(`本词 ${state.coopSpellQuestionTimeLeft}s`, timerX, promptY + 106, 11, COLORS.red, 900, "center");
  drawText(state.soloSpellMode ? "当前得分" : "团队总分", promptX + 24, promptY + 48, 13, COLORS.muted, 800);
  drawText(`${getTeamScore()}`, promptX + 24, promptY + 78, 28, COLORS.deep, 900);
  drawWrappedFitText(question.meaning || state.currentMeaning || "等待拼词题", promptX + promptW / 2 + 12, promptY + 70, promptW - 158, 2, compact ? 18 : 21, compact ? 20 : 23, COLORS.deep, 900, "center");

  const keyboardBottom = screen.height - getSafeBottomPadding() - 4;
  const keyColumns = 10;
  const keyGap = screen.width < 360 ? 3 : 4;
  const keyW = (screen.width - 24 - keyGap * (keyColumns - 1)) / keyColumns;
  const keyH = compact ? 36 : 42;
  const keyboardTop = keyboardBottom - keyH * 3 - keyGap * 2 - 4;
  const controlY = keyboardTop - (compact ? 42 : 46);
  const peerCardH = compact ? 46 : 52;
  const localCardH = compact ? 88 : 104;
  const cardGap = compact ? 6 : 8;
  const statusStackH = state.soloSpellMode
    ? (compact ? 82 : 86)
    : peerCardH + localCardH + cardGap + (compact ? 8 : 10);
  const statusY = controlY - statusStackH;
  const boatY = promptY + promptH + (compact ? 12 : 16);
  const availableBoatH = Math.max(72, statusY - boatY - 8);
  const boatH = Math.min(compact ? 112 : 150, availableBoatH);

  drawCoopSpellBoat(18, boatY, screen.width - 36, boatH);
  const cells = getCoopSpellCells(localSegment);
  const wordY = boatY + Math.max(28, Math.min(boatH - 58, boatH * 0.22));
  drawCoopSpellWord(cells, 30, wordY, screen.width - 60, localSegment);
  if (boatH >= 104) {
    drawText(state.soloSpellMode ? "看中文意思，依次填完四个空" : "看中文意思，按颜色填写自己的两个空", screen.width / 2, boatY + boatH - 18, compact ? 11 : 12, COLORS.deep, 900, "center");
  }

  const statusGap = 10;
  const statusW = (screen.width - 48 - statusGap) / 2;
  if (state.soloSpellMode) {
    drawSoloSpellGroupCard(0, 24, statusY, statusW);
    drawSoloSpellGroupCard(1, 24 + statusW + statusGap, statusY, statusW);
  } else {
    const meIndex = Math.max(0, state.players.findIndex((player) => player && player.openid === me.openid));
    const otherIndex = Math.max(0, state.players.findIndex((player) => player && player.openid === other.openid));
    const peerW = Math.min(screen.width - 48, compact ? 214 : 238);
    drawCoopSpellPeerMiniCard(other, screen.width - 24 - peerW, statusY, peerW, peerCardH, otherIndex);
    drawCoopSpellLocalFocusCard(me, 24, statusY + peerCardH + cardGap, screen.width - 48, localCardH, meIndex);
  }

  const localSubmission = me && getCoopSpellSubmission(me.openid);
  const localSubmitted = isCoopSpellSubmissionReady(localSubmission);
  const advancingQuestion = isCoopSpellAdvancingQuestion();
  const readyToSubmit = !!(localSegment && state.coopSpellInput.length >= Number(localSegment.length || 0));
  const controlH = compact ? 36 : 40;
  const skipButtonW = 92;
  const submitX = 24 + skipButtonW + 8;
  addButton("coopSpellSkip", "跳过 -100", 24, controlY, skipButtonW, controlH, { kind: "danger", fontSize: 12, disabled: state.catchPending || advancingQuestion || !question.id });
  addButton("coopSpellSubmit", localSubmitted ? "已提交，等队友" : (state.catchPending ? "发送中..." : "提交我的字母"), submitX, controlY, screen.width - submitX - 24, controlH, { disabled: !readyToSubmit || state.catchPending || advancingQuestion || localSubmitted });

  LETTER_KEY_ROWS.forEach((letters, row) => {
    const rowLength = letters.length;
    const rowOffset = row === 2
      ? (keyW + keyGap) * 0.75
      : (keyColumns - rowLength) * (keyW + keyGap) / 2;
    letters.forEach((letter, col) => {
      const x = 12 + rowOffset + col * (keyW + keyGap);
      const y = keyboardTop + row * (keyH + keyGap);
      addButton(`coopLetter:${letter}`, letter, x, y, keyW, keyH, {
        kind: "secondary",
        fontSize: compact ? 15 : 17,
        disabled: state.catchPending || advancingQuestion || !localSegment || localSubmitted
      });
    });
  });
  const deleteKeyW = keyW * 1.55 + keyGap;
  const deleteKeyY = keyboardTop + 2 * (keyH + keyGap);
  addButton("coopSpellBackspace", "⌫", screen.width - 12 - deleteKeyW, deleteKeyY, deleteKeyW, keyH, {
    kind: "secondary",
    fontSize: compact ? 18 : 21,
    disabled: !state.coopSpellInput.length || state.catchPending || advancingQuestion || localSubmitted
  });
}

function drawPlaying() {
  if (!state.practiceMode && isCoopSpellMode()) {
    drawCoopSpellPlaying();
    return;
  }
  drawBackground();
  state.buttons = [];

  updatePlayingClock();

  const now = getNow();
  const hidingAfterPesticide = state.pesticideHideAt > 0 && now >= state.pesticideHideAt && now < state.pesticideEffectUntil;
  const aliveFishes = hidingAfterPesticide ? [] : state.fishes.filter((fish) => fish.alive);
  const renderedFishes = aliveFishes.map((fish) => getRenderFish(fish));
  state.renderedFishes = renderedFishes;
  renderedFishes.forEach((fish) => drawFish(fish));
  drawPesticideFieldEffect(renderedFishes);
  drawFeedbacks();

  const promptX = 22;
  const promptY = getPlayPromptY();
  const promptW = screen.width - 44;
  const promptH = 112;
  drawPromptFrame(promptX, promptY, promptW, promptH);
  if (isCoopSharedMode()) {
    fillRoundedRect(promptX + promptW / 2 - 54, promptY + 10, 108, 22, 11, COLORS.deep);
    drawText("默契捕词赛", promptX + promptW / 2, promptY + 26, 12, COLORS.white, 900, "center");
  }
  const timerX = screen.width - 56;
  const meaningX = promptX + 24;
  const meaningW = Math.max(112, timerX - 66 - meaningX);
  const meaningSize = screen.width < 360 ? 23 : 25;
  const meaningLineH = screen.width < 360 ? 23 : 25;
  drawWrappedFitText(state.currentMeaning || "等待题目", meaningX + meaningW / 2, promptY + 76, meaningW, 2, meaningSize, meaningLineH, COLORS.deep, 900, "center");
  drawTimer(timerX, promptY + 54);
  if (isWrongBankId(state.gameOptions.bankId) && !isCoopSharedMode()) {
    drawText("错题库", promptX + 18, promptY + promptH - 9, 12, COLORS.red, 800);
  }
  if (state.combo > 1) {
    drawText(`连击 x${state.combo}`, promptX + promptW - 18, promptY + promptH - 9, 14, COLORS.green, 800, "right");
  }
  if (isCoopSharedMode()) {
    drawText(`团队总分 ${getTeamScore()}`, promptX + 18, promptY + promptH - 9, 13, COLORS.deep, 900);
  }

  const scoreY = getScoreDockY();
  drawScoreDock(scoreY);
  const leftPlayer = state.players[0] || { nickName: "玩家1", score: 0 };
  if (state.practiceMode) {
    drawScoreBox(18, scoreY, screen.width - 36, leftPlayer, "me");
    drawText("练习模式", 32, scoreY - 12, 14, "rgba(255,255,255,0.9)", 800);
  } else {
    const rightPlayer = state.players[1] || { nickName: "玩家2", score: 0 };
    const scoreW = (screen.width - 78) / 2;
    drawScoreBox(18, scoreY, scoreW, leftPlayer, "left");
    drawVsBadge(scoreY + 32);
    drawScoreBox(screen.width / 2 + 21, scoreY, scoreW, rightPlayer, "right");
  }
}

function drawScoreDock(y) {
  const dockTop = y - 28;
  const dockH = screen.height - dockTop;
  const sprite = getUiSprite(`score-dock:${screen.width}:${dockH}`, screen.width, dockH, (targetCtx, width, height) => {
    const gradient = targetCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(15,23,42,0)");
    gradient.addColorStop(0.42, "rgba(15,23,42,0.28)");
    gradient.addColorStop(1, "rgba(15,23,42,0.44)");
    targetCtx.fillStyle = gradient;
    targetCtx.fillRect(0, 0, width, height);
    drawBubbleOn(targetCtx, 36, 26, 4, "rgba(255,255,255,0.45)", 0.8);
    drawBubbleOn(targetCtx, width - 34, 36, 5, "rgba(255,255,255,0.38)", 0.8);
  });
  if (sprite) {
    ctx.drawImage(sprite.canvas, 0, dockTop, screen.width, dockH);
    return;
  }
  const gradient = ctx.createLinearGradient(0, dockTop, 0, screen.height);
  gradient.addColorStop(0, "rgba(15,23,42,0)");
  gradient.addColorStop(0.42, "rgba(15,23,42,0.28)");
  gradient.addColorStop(1, "rgba(15,23,42,0.44)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, dockTop, screen.width, dockH);
  drawBubble(36, y - 2, 4, "rgba(255,255,255,0.45)", 0.8);
  drawBubble(screen.width - 34, y + 8, 5, "rgba(255,255,255,0.38)", 0.8);
}

function getAvatarPalette(player) {
  const hash = Math.abs(hashText(`${player.openid || ""}:${player.nickName || ""}`));
  const palettes = [
    ["#0E7490", "#A5F3FC", "#155E75"],
    ["#F97316", "#FFEDD5", "#9A3412"],
    ["#7C3AED", "#EDE9FE", "#4C1D95"],
    ["#16A34A", "#DCFCE7", "#14532D"],
    ["#E11D48", "#FFE4E6", "#881337"]
  ];
  return palettes[hash % palettes.length];
}

function drawPlayerAvatar(player, x, y, r, isMe) {
  const palette = getAvatarPalette(player || {});
  const stunned = getStunLeft(player) > 0;
  ctx.fillStyle = isMe ? COLORS.deep : palette[0];
  ctx.beginPath();
  ctx.arc(x, y, r + 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette[1];
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette[2];
  ctx.beginPath();
  ctx.arc(x, y - 6, r - 1, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.arc(x - 6, y - 1, 4.4, 0, Math.PI * 2);
  ctx.arc(x + 6, y - 1, 4.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = COLORS.text;
  ctx.lineWidth = 1.6;
  if (stunned) {
    [-6, 6].forEach((eyeX) => {
      ctx.beginPath();
      ctx.arc(x + eyeX, y - 1, 3.8, 0, Math.PI * 1.65);
      ctx.stroke();
    });
  } else {
    ctx.fillStyle = COLORS.text;
    ctx.beginPath();
    ctx.arc(x - 5, y - 1, 1.8, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 1, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = stunned ? COLORS.red : palette[2];
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (stunned) {
    ctx.arc(x, y + 8, 4, 0, Math.PI);
  } else {
    ctx.arc(x, y + 5, 6, 0.15, Math.PI - 0.15);
  }
  ctx.stroke();

}

function drawAvatarSwatter(x, y, r) {
  const pulse = Math.sin(getNow() / 130) * 0.03;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.55 + pulse);
  ctx.globalAlpha = 0.96;
  ctx.fillStyle = "rgba(15,23,42,0.18)";
  ctx.beginPath();
  ctx.ellipse(2, 4, r + 9, r * 0.72, 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FED7AA";
  ctx.strokeStyle = "#9A3412";
  ctx.lineWidth = 2;
  fillRoundedRect(-r - 7, -r - 5, r * 2 + 14, r + 18, 8, "#FED7AA");
  strokeRoundedRect(-r - 7, -r - 5, r * 2 + 14, r + 18, 8, "#9A3412", 2);
  ctx.strokeStyle = "rgba(154,52,18,0.65)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i += 1) {
    const lineY = -r + 2 + i * 8;
    ctx.beginPath();
    ctx.moveTo(-r - 2, lineY);
    ctx.lineTo(r + 2, lineY);
    ctx.stroke();
  }
  for (let i = 0; i < 3; i += 1) {
    const lineX = -r + 4 + i * 9;
    ctx.beginPath();
    ctx.moveTo(lineX, -r - 1);
    ctx.lineTo(lineX, r + 10);
    ctx.stroke();
  }
  ctx.strokeStyle = "#7C2D12";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(r - 1, r + 8);
  ctx.lineTo(r + 22, r + 35);
  ctx.stroke();
  ctx.restore();
}

function getPlayerPowerUps(player) {
  if (!player) return [];
  if (Array.isArray(player.powerUps)) return player.powerUps.filter((item) => item && item.type);
  return player.powerUp && player.powerUp.type ? [player.powerUp] : [];
}

function getPowerUpGroup(player, type) {
  const items = getPlayerPowerUps(player).filter((item) => item.type === type);
  return { type, items, count: items.length };
}

function drawPowerUpSlotBadge(text, x, y) {
  fillRoundedRect(x - 12, y - 9, 24, 18, 9, COLORS.red);
  strokeRoundedRect(x - 12, y - 9, 24, 18, 9, "rgba(255,255,255,0.92)", 1.5);
  drawText(text, x, y + 4, 10, COLORS.white, 900, "center");
}

function drawFixedPowerUpSlot(cx, cy, group, isMe, index) {
  const type = group.type;
  const count = group.count;
  const active = count > 0 && isMe && !state.catchPending && !state.busy;
  const slotW = 54;
  const slotH = 50;
  const yOffset = active ? Math.sin(getNow() / 170 + index) * 1.6 : 0;
  const x = cx - slotW / 2;
  const y = cy - slotH / 2 + yOffset * 0.12;
  const bg = ctx.createLinearGradient(x, y, x, y + slotH);
  bg.addColorStop(0, count ? "#FFF7ED" : "rgba(248,250,252,0.74)");
  bg.addColorStop(1, count ? "#FEF3C7" : "rgba(226,232,240,0.66)");

  fillRoundedRect(x + 2, y + 5, slotW, slotH, 14, "rgba(15,23,42,0.2)");
  fillRoundedRect(x, y, slotW, slotH, 14, bg);
  strokeRoundedRect(x, y, slotW, slotH, 14, active ? COLORS.gold : "rgba(255,255,255,0.86)", active ? 2.4 : 1.6);
  if (!count && ctx.setLineDash) {
    ctx.setLineDash([4, 3]);
    strokeRoundedRect(x + 6, y + 6, slotW - 12, slotH - 12, 11, "rgba(100,116,139,0.36)", 1.5);
    ctx.setLineDash([]);
  }
  if (active) {
    ctx.strokeStyle = "rgba(250,204,21,0.46)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 30 + yOffset, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.globalAlpha = count ? 1 : 0.34;
  drawPowerUpIcon(type, cx, cy - 7, 34, active);
  ctx.restore();
  drawText(type === "pesticide" ? "喷剂" : "拍子", cx, cy + 20, 10, count ? "#78350F" : COLORS.muted, 900, "center");
  if (count > 1) {
    drawPowerUpSlotBadge(`X${count}`, x + slotW - 7, y + 4);
  }
  if (count > 0 && isMe && !state.practiceMode) {
    state.buttons.push({
      id: `usePowerUp:${group.items[0].id}`,
      x,
      y,
      w: slotW,
      h: slotH,
      disabled: state.catchPending || state.busy
    });
  }
}

function drawPowerUpSlots(cx, cy, player, isMe) {
  const slotGap = 8;
  const slotW = 54;
  const pesticide = getPowerUpGroup(player, "pesticide");
  const swatter = getPowerUpGroup(player, "swatter");
  drawFixedPowerUpSlot(cx - (slotW + slotGap) / 2, cy, pesticide, isMe, 0);
  drawFixedPowerUpSlot(cx + (slotW + slotGap) / 2, cy, swatter, isMe, 1);
}

function drawScoreBox(x, y, w, player, side) {
  const isMe = isLocalPlayer(player) || side === "me";
  const sprite = getUiSprite(`score-box:${isMe ? "me" : "opponent"}:${w}`, w + 4, 69, (targetCtx) => {
    const bg = targetCtx.createLinearGradient(0, 0, w, 64);
    bg.addColorStop(0, isMe ? "#ECFEFF" : "#FFF7ED");
    bg.addColorStop(1, isMe ? "#A5F3FC" : "#FED7AA");
    fillRoundedRectOn(targetCtx, 2, 5, w, 64, 10, "rgba(15,23,42,0.18)");
    fillRoundedRectOn(targetCtx, 0, 0, w, 64, 10, bg);
    strokeRoundedRectOn(targetCtx, 0, 0, w, 64, 10, isMe ? COLORS.cyan : COLORS.gold, 2);
  });
  if (sprite) {
    ctx.drawImage(sprite.canvas, x, y, w + 4, 69);
  } else {
    const bg = ctx.createLinearGradient(x, y, x + w, y + 64);
    bg.addColorStop(0, isMe ? "#ECFEFF" : "#FFF7ED");
    bg.addColorStop(1, isMe ? "#A5F3FC" : "#FED7AA");
    fillRoundedRect(x + 2, y + 5, w, 64, 10, "rgba(15,23,42,0.18)");
    fillRoundedRect(x, y, w, 64, 10, bg);
    strokeRoundedRect(x, y, w, 64, 10, isMe ? COLORS.cyan : COLORS.gold, 2);
  }

  drawPlayerAvatar(player, x + 28, y + 32, 19, isMe);
  if (getStunLeft(player) > 0) {
    drawAvatarSwatter(x + 28, y + 32, 19);
  }
  if (!isCoopMode()) {
    drawPowerUpSlots(x + w / 2, y - 24, player, isMe);
  }
  const nameX = x + 62;
  drawFitText(player.nickName || "玩家", nameX, y + 25, 13, COLORS.muted, 700, "left", Math.max(36, x + w - 96 - nameX));
  drawText(`${player.score || 0}`, x + 62, y + 53, 25, isMe ? COLORS.deep : COLORS.text, 900);
  fillRoundedRect(x + w - 45, y + 12, 32, 20, 10, isMe ? COLORS.deep : COLORS.gold);
  drawText(isMe ? "我" : side === "right" ? "对手" : "玩家", x + w - 29, y + 27, 11, COLORS.white, 900, "center");
  drawText("分", x + w - 12, y + 53, 12, COLORS.muted, 800, "right");
}

function drawVsBadge(y) {
  const sprite = getUiSprite("vs-badge", 44, 38, (targetCtx) => {
    fillRoundedRectOn(targetCtx, 2, 1, 40, 34, 10, "rgba(15,23,42,0.18)");
    fillRoundedRectOn(targetCtx, 4, 0, 36, 32, 10, "rgba(15,94,117,0.96)");
    strokeRoundedRectOn(targetCtx, 4, 0, 36, 32, 10, COLORS.cyan, 1.5);
    targetCtx.fillStyle = COLORS.white;
    targetCtx.font = "900 14px sans-serif";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "alphabetic";
    targetCtx.fillText("VS", 22, 24);
  });
  if (sprite) {
    ctx.drawImage(sprite.canvas, screen.width / 2 - 22, y - 18, 44, 38);
    return;
  }
  fillRoundedRect(screen.width / 2 - 20, y - 17, 40, 34, 10, "rgba(15,23,42,0.18)");
  fillRoundedRect(screen.width / 2 - 18, y - 18, 36, 32, 10, "rgba(15,94,117,0.96)");
  strokeRoundedRect(screen.width / 2 - 18, y - 18, 36, 32, 10, COLORS.cyan, 1.5);
  drawText("VS", screen.width / 2, y + 6, 14, COLORS.white, 900, "center");
}

function drawTimer(x, y) {
  drawTimerBase(x, y);
  drawText(`${state.timeLeft}s`, x, y + 8, 17, COLORS.white, 900, "center");
}

function getStunLeft(player) {
  return Math.max(0, Math.ceil(((player && player.stunnedUntil) || 0) - getNow()));
}

function drawStunOverlay(msLeft) {
  if (msLeft <= 0) return;
  const seconds = Math.ceil(msLeft / 1000);
  const x = 34;
  const y = screen.height / 2 - 38;
  const w = screen.width - 68;
  drawCartoonPanel(x, y, w, 76, 14, "rgba(254,226,226,0.94)", COLORS.red);
  drawText("你被苍蝇拍拍晕了", x + w / 2, y + 31, 20, COLORS.red, 900, "center");
  drawText(`${seconds}s 后恢复操作`, x + w / 2, y + 57, 15, COLORS.text, 800, "center");
}

function drawFinished() {
  drawPlaying();
  state.buttons = [];

  ctx.fillStyle = "rgba(15,23,42,0.52)";
  ctx.fillRect(0, 0, screen.width, screen.height);

  const x = 28;
  const w = screen.width - 56;
  const y = Math.max(getSafeTopY(112), screen.height * 0.23);
  const panelH = 306;
  const bg = ctx.createLinearGradient(x, y, x + w, y + panelH);
  bg.addColorStop(0, "#FFFFFF");
  bg.addColorStop(0.62, "#ECFEFF");
  bg.addColorStop(1, "#FEF3C7");
  drawCartoonPanel(x, y, w, panelH, 16, bg, "rgba(255,255,255,0.9)");
  drawSparkle(x + 42, y + 40, 9, COLORS.yellow);
  drawSparkle(x + w - 44, y + 62, 7, COLORS.coral);
  if (getVisualSkin() === "grass") {
    drawMascotCockroach(x + w / 2, y - 2, 0.44, false);
  } else {
    drawMascotFish(x + w / 2, y - 4, 0.44, false);
  }
  fillRoundedRect(x + w / 2 - 62, y + 28, 124, 26, 13, COLORS.deep);
  drawText("结算完成", x + w / 2, y + 47, 13, COLORS.white, 900, "center");
  drawText(state.resultTitle || "游戏结束", x + w / 2, y + 88, 30, COLORS.deep, 900, "center");

  const coopSpellResult = !state.practiceMode && isCoopSpellMode();
  const rows = coopSpellResult
    ? [{ nickName: "本局总分", score: getTeamScore(), openid: state.openid }]
    : (state.players.length ? state.players : [{ nickName: "玩家", score: 0, openid: state.openid }]);
  rows.forEach((player, index) => {
    const rowY = y + 118 + index * 58;
    const isMe = isLocalPlayer(player) || (state.practiceMode && index === 0);
    fillRoundedRect(x + 22, rowY, w - 44, 46, 10, isMe ? "#CFFAFE" : "#FFF7ED");
    strokeRoundedRect(x + 22, rowY, w - 44, 46, 10, isMe ? COLORS.cyan : COLORS.gold, 1.5);
    ctx.fillStyle = isMe ? COLORS.deep : COLORS.gold;
    ctx.beginPath();
    ctx.arc(x + 48, rowY + 23, 16, 0, Math.PI * 2);
    ctx.fill();
    drawText(index === 0 ? "1" : "2", x + 48, rowY + 29, 14, COLORS.white, 900, "center");
    drawFitText(player.nickName || "玩家", x + 74, rowY + 29, 16, COLORS.text, 900, "left", w - 170);
    drawText(`${player.score || 0} 分`, x + w - 42, rowY + 30, 18, isMe ? COLORS.deep : COLORS.text, 900, "right");
  });

  addButton("home", "返回首页", x + 22, y + panelH - 60, w - 44, 48, {});
}

function render() {
  const renderStarted = Date.now();
  frameNow = renderStarted;
  if (state.scene !== lastLoggedScene) {
    logInfo("scene", "change", {
      from: lastLoggedScene || "boot",
      to: state.scene,
      players: state.players,
      roomState: lastLoggedRoomState,
      gameOptions: state.gameOptions
    });
    lastLoggedScene = state.scene;
  }
  ctx.clearRect(0, 0, screen.width, screen.height);
  if (state.scene === GAME.HOME) drawHome();
  if (state.scene === GAME.BANKS) drawBankPicker();
  if (state.scene === GAME.STUDY) drawStudy();
  if (state.scene === GAME.COOP_SELECT) drawCoopSelect();
  if (state.scene === GAME.HISTORY) drawHistory();
  if (state.scene === GAME.HISTORY_DETAIL) drawHistoryDetail();
  if (state.scene === GAME.HELP) drawHelp();
  if (state.scene === GAME.ROOM) drawRoom();
  if (state.scene === GAME.PLAYING) drawPlaying();
  if (state.scene === GAME.FINISHED) drawFinished();
  const elapsed = Date.now() - renderStarted;
  if (elapsed >= SLOW_FRAME_MS && renderStarted - lastSlowFrameLogAt >= 1000) {
    lastSlowFrameLogAt = renderStarted;
    logWarn("perf", "render.slow", {
      elapsed,
      scene: state.scene,
      fishCount: state.fishes.length,
      renderedFishCount: state.renderedFishes.length,
      buttonCount: state.buttons.length,
      feedbackCount: state.feedbacks.length
    });
  }
}

function getRenderDelay() {
  if (state.scene === GAME.PLAYING) return PLAYING_RENDER_DELAY;
  if (state.scene === GAME.ROOM) return ROOM_RENDER_DELAY;
  return STATIC_RENDER_DELAY;
}

function getRoomPollInterval() {
  return isCoopSpellMode() ? COOP_SPELL_ROOM_POLL_INTERVAL : ROOM_POLL_INTERVAL;
}

function refreshRoomPollingInterval() {
  if (!pollTimer || !state.roomId) return;
  const nextInterval = getRoomPollInterval();
  if (nextInterval === roomPollInterval) return;
  clearInterval(pollTimer);
  roomPollInterval = nextInterval;
  pollTimer = setInterval(fetchRoom, roomPollInterval);
  logInfo("room", "poll.interval", { roomId: state.roomId, interval: roomPollInterval });
}

function startRenderLoop() {
  if (renderTimer) clearTimeout(renderTimer);
  const loop = () => {
    const loopStarted = Date.now();
    if (lastRenderLoopAt) {
      const gap = loopStarted - lastRenderLoopAt;
      const expected = getRenderDelay();
      if (gap >= expected + SLOW_RENDER_GAP_MS) {
        logWarn("perf", "render.gap", {
          gap,
          expected,
          scene: state.scene,
          busy: state.busy,
          catchPending: state.catchPending
        });
      }
    }
    lastRenderLoopAt = loopStarted;
    render();
    renderTimer = setTimeout(loop, getRenderDelay());
  };
  loop();
}

function startPollingRoom(skipInitialFetch) {
  if (pollTimer) clearInterval(pollTimer);
  if (!skipInitialFetch) fetchRoom();
  roomPollInterval = getRoomPollInterval();
  pollTimer = setInterval(fetchRoom, roomPollInterval);
  logInfo("room", "poll.start", { roomId: state.roomId, skipInitialFetch: !!skipInitialFetch, interval: roomPollInterval });
}

function stopPollingRoom() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
    roomPollInterval = 0;
    logInfo("room", "poll.stop", { roomId: state.roomId });
  }
  roomFetchQueued = false;
}

function applyRoomSnapshot(room) {
  if (!room) return;
  if (room.state !== lastLoggedRoomState) {
    logInfo("room", "state.change", {
      from: lastLoggedRoomState || "unknown",
      to: room.state || "",
      room: room
    });
    lastLoggedRoomState = room.state || "";
  }
  state.players = room.players || state.players || [];
  state.fishes = room.fishes || [];
  state.currentMeaning = room.currentMeaning || "";
  state.targetFishId = room.targetFishId || "";
  state.teamScore = Number(room.teamScore || 0);
  state.spellHistory = normalizeSpellHistory(room.spellHistory || []);
  const nextSpellQuestion = parseCoopSpellQuestion(room.spellQuestion);
  applyCoopSpellQuestionState(nextSpellQuestion, room.spellSubmissions || {});
  state.duration = room.duration || state.duration || 60;
  state.gameOptions = normalizeGameOptions(room.gameOptions || { ...state.gameOptions, duration: state.duration });
  refreshRoomPollingInterval();
  if (room.startedAt) {
    const remoteStartedAt = new Date(room.startedAt).getTime();
    if (Number.isFinite(remoteStartedAt) && remoteStartedAt > 0) {
      if (remoteStartedAt !== state.roomStartedRemoteAt || !state.roomStartedLocalAt) {
        state.roomStartedRemoteAt = remoteStartedAt;
        state.roomStartedLocalAt = getNow();
      }
      state.startedAt = remoteStartedAt;
    }
  }
  addRoomPowerUpUseFeedback(getRoomPowerUpUseEvent(room));

  if (room.state === "playing" && state.scene !== GAME.PLAYING) {
    state.startError = "";
    state.scene = GAME.PLAYING;
    logInfo("room", "enter.playing", { room: room });
    state.message = "游戏开始";
  }
  scheduleBotCatch();
  if (room.state === "finished") {
    clearBotCatchTimer();
    state.scene = GAME.FINISHED;
    updateResult(room);
    saveMatchRecord(room);
    logInfo("room", "enter.finished", { room: room, resultTitle: state.resultTitle });
  }
}

function fetchRoom() {
  if (!state.roomId) return;
  if (roomFetchPending) {
    roomFetchQueued = true;
    logWarn("room", "fetch.queued", { roomId: state.roomId });
    return;
  }
  const requestedRoomId = state.roomId;
  const started = Date.now();
  roomFetchPending = true;
  getRoomDoc(requestedRoomId).then((res) => {
    if (state.roomId !== requestedRoomId) return;
    const room = res.data;
    const elapsed = Date.now() - started;
    if (elapsed >= SLOW_ROOM_FETCH_MS) {
      logWarn("room", "fetch.slow", { roomId: requestedRoomId, elapsed, room: room });
    } else {
      logInfo("room", "fetch.success", { roomId: requestedRoomId, elapsed, roomState: room && room.state });
    }
    applyRoomSnapshot(room);
  }).catch((err) => {
    logError("room", "fetch.fail", {
      roomId: requestedRoomId,
      elapsed: Date.now() - started,
      errMsg: err && (err.errMsg || err.message)
    });
    state.message = "同步房间失败，请检查云开发数据库权限";
  }).finally(() => {
    roomFetchPending = false;
    if (roomFetchQueued && state.roomId) {
      roomFetchQueued = false;
      setTimeout(fetchRoom, 80);
    }
  });
}

function getBotPlayer() {
  return state.players.find(isBotPlayer);
}

function getBotPresetIndexFromRoom() {
  const botPlayer = getBotPlayer();
  if (!botPlayer) return state.selectedBotIndex % BOT_PRESETS.length;
  const name = String(botPlayer.nickName || "");
  const difficulty = (state.gameOptions && state.gameOptions.botDifficulty) || botPlayer.botDifficulty || "";
  const index = BOT_PRESETS.findIndex((preset) => preset.name === name || preset.difficulty === difficulty);
  return index >= 0 ? index : state.selectedBotIndex % BOT_PRESETS.length;
}

function applyBotPreset(advance) {
  if (state.busy || !state.roomId) return;
  if (isCoopMode()) {
    toast(`${getCoopModeLabel()}需要两名真实玩家`);
    return;
  }
  const currentIndex = getBotPresetIndexFromRoom();
  state.selectedBotIndex = advance ? (currentIndex + 1) % BOT_PRESETS.length : currentIndex;
  const bot = BOT_PRESETS[state.selectedBotIndex] || BOT_PRESETS[1];
  const existingBotIndex = state.players.findIndex((player) => player && (player.isBot || String(player.openid || "").indexOf("bot_") === 0));
  const optimisticBot = {
    openid: existingBotIndex >= 0 ? state.players[existingBotIndex].openid : `bot_${state.roomCode || state.roomId}`,
    nickName: bot.name,
    score: 0,
    ready: true,
    isBot: true,
    botDifficulty: bot.difficulty,
    combo: 0,
    stunnedUntil: 0,
    powerUps: [],
    powerUp: null
  };
  if (existingBotIndex >= 0) {
    state.players[existingBotIndex] = { ...state.players[existingBotIndex], ...optimisticBot };
  } else if (state.players.length < 2) {
    state.players = [...state.players, optimisticBot];
  }
  state.gameOptions = normalizeGameOptions({ ...state.gameOptions, botDifficulty: bot.difficulty });
  setBusy(true, "正在设置机器人...");
  callFunction("addBot", { roomId: state.roomId, difficulty: bot.difficulty, botName: bot.name }).then((res) => {
    const result = res.result || {};
    if (result.room) {
      applyRoomSnapshot(result.room);
      return;
    }
    if (result.players) state.players = result.players;
    if (result.gameOptions) state.gameOptions = normalizeGameOptions(result.gameOptions);
  }).catch((err) => {
    toast(err.errMsg || "设置机器人失败");
    fetchRoom();
  }).finally(() => setBusy(false));
}

function scheduleBotCatch() {
  if (state.practiceMode || state.scene !== GAME.PLAYING || !state.roomId || !state.targetFishId) {
    clearBotCatchTimer();
    return;
  }
  const bot = getBotPlayer();
  if (!bot) {
    clearBotCatchTimer();
    return;
  }
  const difficulty = getBotDifficulty();
  if (isCoopSpellMode()) {
    const questionId = state.coopSpellQuestion && state.coopSpellQuestion.id;
    const botSubmission = getCoopSpellSubmission(bot.openid);
    if (!questionId || (botSubmission && botSubmission.status === "correct")) {
      clearBotCatchTimer();
      return;
    }
    const key = `${state.roomId}:spell:${questionId}:${difficulty.delay}`;
    if (state.botCatchTimer && state.botCatchKey === key) return;
    clearBotCatchTimer();
    state.botCatchKey = key;
    state.botCatchTimer = setTimeout(() => {
      state.botCatchTimer = null;
      const activeQuestionId = state.coopSpellQuestion && state.coopSpellQuestion.id;
      if (!activeQuestionId || activeQuestionId !== questionId || state.scene !== GAME.PLAYING) return;
      callFunction("catchFish", {
        roomId: state.roomId,
        action: "botCoopSpell",
        questionId: activeQuestionId
      }).then(() => {
        fetchRoom();
      }).catch(() => {
        state.message = "机器人拼词失败";
      });
    }, difficulty.delay);
    return;
  }
  const target = state.fishes.find((fish) => fish.id === state.targetFishId && fish.alive);
  if (!target) {
    clearBotCatchTimer();
    return;
  }
  const key = `${state.roomId}:${state.targetFishId}:${difficulty.delay}`;
  if (state.botCatchTimer && state.botCatchKey === key) return;
  clearBotCatchTimer();
  state.botCatchKey = key;
  state.botCatchTimer = setTimeout(() => {
    state.botCatchTimer = null;
    const activeTarget = state.targetFishId;
    if (!activeTarget || activeTarget !== target.id || state.scene !== GAME.PLAYING) return;
    callFunction("catchFish", {
      roomId: state.roomId,
      action: "botCatch",
      targetFishId: activeTarget
    }).then((res) => {
      if (res.result && res.result.bot && res.result.correct) {
        state.combo = 0;
        const rendered = state.renderedFishes.find((fish) => fish.id === activeTarget);
        const x = rendered ? rendered.x : screen.width / 2;
        const y = rendered ? rendered.y : screen.height * 0.48;
        addShoeSmash(x, y);
        addFeedback("机器人 +100", x, y - 28, COLORS.gold);
      }
      fetchRoom();
    }).catch(() => {
      state.message = "机器人答题失败";
    });
  }, difficulty.delay);
}

function updateResult(room) {
  if (room && room.gameOptions && room.gameOptions.matchMode === "coop") {
    state.resultTitle = `${getCoopModeLabel(room.gameOptions)}完成`;
    return;
  }
  const winnerOpenid = room.winnerOpenid || "";
  if (!winnerOpenid) {
    state.resultTitle = "平局";
  } else {
    state.resultTitle = winnerOpenid === state.openid ? "你赢了" : "你输了";
  }
}

function enterRoom(roomId, roomCode, initialRoom) {
  logInfo("room", "enter", { roomId, roomCode, initialRoom });
  clearPowerUpRefreshTimer();
  clearBotCatchTimer();
  state.practiceMode = false;
  state.soloSpellMode = false;
  setBackgroundScene(roomCode);
  state.roomId = roomId;
  state.roomCode = roomCode;
  state.scene = GAME.ROOM;
  state.startedAt = 0;
  state.startError = "";
  state.fishes = [];
  state.currentMeaning = "";
  state.targetFishId = "";
  state.teamScore = 0;
  state.spellHistory = [];
  state.coopSpellQuestion = null;
  state.coopSpellSubmissions = {};
  state.coopSpellInput = [];
  state.coopSpellInputQuestionId = "";
  state.coopSpellAdvancingQuestionId = "";
  state.coopSpellAutoSkipQuestionId = "";
  state.coopSpellQuestionTimeLeft = COOP_SPELL_QUESTION_SECONDS;
  state.coopSpellQuestionLocalId = "";
  state.coopSpellQuestionLocalStartedAt = 0;
  state.roomStartedRemoteAt = 0;
  state.roomStartedLocalAt = 0;
  state.finishing = false;
  state.catchPending = false;
  state.pesticideEffectUntil = 0;
  state.pesticideHideAt = 0;
  state.seenPowerUpId = "";
  state.seenUsedPowerUpId = "";
  state.message = "双方准备后开始";
  if (initialRoom) applyRoomSnapshot(initialRoom);
  startPollingRoom(!!initialRoom);
}

function startPractice() {
  logInfo("practice", "start", { gameOptions: state.gameOptions });
  stopPollingRoom();
  clearPowerUpRefreshTimer();
  clearBotCatchTimer();
  setBackgroundScene(`${Date.now()}:${state.playerName}`);
  state.soloSpellMode = false;
  state.gameOptions = normalizeGameOptions(state.gameOptions);
  if (isWrongBankId(state.gameOptions.bankId) && !getStoredWrongWords().length) {
    toast("错题库为空，先去普通单元练习");
    return;
  }
  const fishes = makePracticeFishes(DEFAULT_FISH_COUNT);
  const target = pickTarget(fishes);
  if (!target) {
    toast("当前词库没有可用单词");
    return;
  }
  state.practiceMode = true;
  state.roomId = "";
  state.roomCode = "";
  state.players = [{
    openid: state.openid || "practice",
    nickName: state.playerName,
    score: 0
  }];
  state.fishes = fishes;
  state.usedWords = fishes.filter((fish) => !fish.isFake).map((fish) => fish.correctWord || fish.word);
  state.currentMeaning = target.meaning;
  state.targetFishId = target.id;
  state.teamScore = 0;
  state.spellHistory = [];
  state.startedAt = Date.now();
  state.duration = state.gameOptions.duration;
  state.timeLeft = state.gameOptions.duration;
  state.resultTitle = "";
  state.combo = 0;
  state.feedbacks = [];
  state.finishing = false;
  state.catchPending = false;
  state.pesticideEffectUntil = 0;
  state.pesticideHideAt = 0;
  state.scene = GAME.PLAYING;
  state.message = "练习开始";
}

function startSoloSpellGame() {
  logInfo("spell", "solo.start", { gameOptions: state.gameOptions });
  stopPollingRoom();
  clearPowerUpRefreshTimer();
  clearBotCatchTimer();
  setBackgroundScene(`solo_spell:${Date.now()}:${state.playerName}`);
  state.practiceMode = false;
  state.soloSpellMode = true;
  state.soloSpellRecordSaved = false;
  state.roomId = "";
  state.roomCode = "";
  state.gameOptions = normalizeGameOptions({ ...state.gameOptions, matchMode: "coop", coopMode: "spell" });
  state.players = [{
    openid: state.openid || "solo_spell",
    nickName: state.playerName,
    score: 0,
    ready: true,
    combo: 0,
    stunnedUntil: 0,
    powerUps: []
  }];
  state.fishes = [];
  state.renderedFishes = [];
  state.usedWords = [];
  state.teamScore = 0;
  state.spellHistory = [];
  state.coopSpellAutoSkipQuestionId = "";
  const question = makeSoloSpellQuestion();
  if (!question) {
    state.soloSpellMode = false;
    toast("当前词库没有适合拼词的单词");
    return;
  }
  applySoloSpellQuestion(question);
  state.startedAt = Date.now();
  state.duration = Number(state.gameOptions.duration || DEFAULT_GAME_OPTIONS.duration);
  state.timeLeft = state.duration;
  state.coopSpellQuestionTimeLeft = COOP_SPELL_QUESTION_SECONDS;
  state.resultTitle = "";
  state.combo = 0;
  state.feedbacks = [];
  state.finishing = false;
  state.catchPending = false;
  state.pesticideEffectUntil = 0;
  state.pesticideHideAt = 0;
  state.scene = GAME.PLAYING;
  state.message = "单人拼词开始";
}

function finishPractice() {
  if (state.soloSpellMode) saveSoloSpellRecord();
  logInfo("practice", "finish", { soloSpellMode: state.soloSpellMode, score: getTeamScore(), timeLeft: state.timeLeft });
  state.finishing = true;
  state.resultTitle = state.soloSpellMode ? "时间到" : "练习结束";
  state.scene = GAME.FINISHED;
}

function goHome() {
  logInfo("scene", "goHome", { from: state.scene, roomId: state.roomId, roomCode: state.roomCode });
  stopPollingRoom();
  clearPowerUpRefreshTimer();
  clearBotCatchTimer();
  state.practiceMode = false;
  state.soloSpellMode = false;
  state.soloSpellRecordSaved = false;
  state.scene = GAME.HOME;
  state.roomId = "";
  state.roomCode = "";
  state.players = [];
  state.fishes = [];
  state.renderedFishes = [];
  state.currentMeaning = "";
  state.targetFishId = "";
  state.teamScore = 0;
  state.spellHistory = [];
  state.coopSpellQuestion = null;
  state.coopSpellSubmissions = {};
  state.coopSpellInput = [];
  state.coopSpellInputQuestionId = "";
  state.coopSpellAdvancingQuestionId = "";
  state.coopSpellAutoSkipQuestionId = "";
  state.coopSpellQuestionTimeLeft = COOP_SPELL_QUESTION_SECONDS;
  state.coopSpellQuestionLocalId = "";
  state.coopSpellQuestionLocalStartedAt = 0;
  state.roomStartedRemoteAt = 0;
  state.roomStartedLocalAt = 0;
  state.resultTitle = "";
  state.combo = 0;
  state.feedbacks = [];
  state.usedWords = [];
  state.finishing = false;
  state.catchPending = false;
  state.pesticideEffectUntil = 0;
  state.pesticideHideAt = 0;
  state.historyPage = 0;
  state.historyDetailPage = 0;
  state.historyDetailRecord = null;
  state.seenPowerUpId = "";
  state.seenUsedPowerUpId = "";
  state.startError = "";
  state.message = "创建房间或输入房间码加入对战";
}

function applyCatchFeedback(delta, x, y) {
  if (delta > 0) {
    state.combo += 1;
    addFeedback(state.combo > 1 ? `+${delta} 连击x${state.combo}` : `+${delta}`, x, y, COLORS.green);
  }
  if (delta < 0) {
    state.combo = 0;
    addFeedback("-100", x, y, COLORS.red);
  }
}

function applyCatchResultSnapshot(result) {
  if (!result || !Array.isArray(result.players) || !Array.isArray(result.fishes)) return false;
  state.players = result.players;
  state.fishes = result.fishes;
  state.usedWords = Array.isArray(result.usedWords) ? result.usedWords : state.usedWords;
  if (typeof result.currentMeaning === "string") state.currentMeaning = result.currentMeaning;
  if (typeof result.targetFishId === "string") state.targetFishId = result.targetFishId;
  scheduleBotCatch();
  return true;
}

function collectCurrentMistake() {
  const target = state.fishes.find((fish) => fish.id === state.targetFishId);
  if (!target || target.isFake) return;
  saveWrongWord({
    word: target.correctWord || target.word,
    meaning: target.meaning
  });
}

function handlePracticeFishTap(fishId, x, y) {
  const fishIndex = state.fishes.findIndex((fish) => fish.id === fishId && fish.alive);
  if (fishIndex < 0) return;

  const tappedFish = state.fishes[fishIndex];
  const targetFish = state.fishes.find((fish) => fish.id === state.targetFishId);
  const tappedWord = tappedFish.correctWord || tappedFish.word;
  const targetWord = targetFish ? (targetFish.correctWord || targetFish.word) : "";
  const correct = fishId === state.targetFishId || (!tappedFish.isFake && tappedWord === targetWord);
  const delta = correct ? 100 : -100;
  logInfo("input", "practice.fish.tap", {
    fishId,
    targetFishId: state.targetFishId,
    correct,
    delta,
    x: Math.round(x),
    y: Math.round(y)
  });
  state.players[0].score = (state.players[0].score || 0) + delta;

  if (!correct) {
    collectCurrentMistake();
    addAvatarBonk(state.openid);
  }

  if (correct) {
    addShoeSmash(x, y);
    const caughtWord = state.fishes[fishIndex].correctWord || state.fishes[fishIndex].word;
    state.fishes.forEach((fish) => {
      if (!fish.isFake && (fish.correctWord || fish.word) === caughtWord) fish.alive = false;
      if (fish.isFake) fish.alive = false;
    });
    fillPracticeFishes(new Set([caughtWord]));
    const target = pickTarget(state.fishes);
    if (!target) {
      finishPractice();
      applyCatchFeedback(delta, x, y);
      return;
    }
    state.currentMeaning = target.meaning;
    state.targetFishId = target.id;
  }

  applyCatchFeedback(delta, x, y);
}

function handleFishTap(x, y) {
  const started = Date.now();
  if (!state.practiceMode) {
    const me = getLocalPlayer();
    const stunLeft = getStunLeft(me);
    if (stunLeft > 0) {
      logWarn("input", "fish.tap.blocked.stunned", { stunLeft, x: Math.round(x), y: Math.round(y) });
      return;
    }
  }
  const fish = getTappedFish(x, y);
  if (!fish) {
    if (Date.now() - lastEmptyTapLogAt >= EMPTY_TAP_LOG_INTERVAL_MS) {
      lastEmptyTapLogAt = Date.now();
      logInfo("input", "fish.tap.miss", { x: Math.round(x), y: Math.round(y), renderedFishCount: state.renderedFishes.length });
    }
    return;
  }
  logInfo("input", "fish.tap.start", {
    fishId: fish.id,
    targetFishId: state.targetFishId,
    practiceMode: state.practiceMode,
    catchPending: state.catchPending,
    x: Math.round(x),
    y: Math.round(y)
  });
  if (state.practiceMode) {
    handlePracticeFishTap(fish.id, x, y);
    return;
  }
  if (state.catchPending) {
    logWarn("input", "fish.tap.blocked.pending", { fishId: fish.id });
    return;
  }
  state.catchPending = true;
  if (TAP_RIPPLE_ENABLED) addFeedback("", x, y, COLORS.cyan, { type: "tap" });
  callFunction("catchFish", { roomId: state.roomId, fishId: fish.id }).then((res) => {
    const result = res.result || {};
    const delta = result.delta || 0;
    logInfo("input", "fish.tap.result", {
      fishId: fish.id,
      elapsed: Date.now() - started,
      delta,
      correct: !!result.correct,
      stale: !!result.stale,
      finished: !!result.finished
    });
    if (result.stunned) {
      return;
    }
    if (result.correct) {
      clearBotCatchTimer();
      addShoeSmash(x, y);
    }
    if (delta < 0) {
      collectCurrentMistake();
      addAvatarBonk(state.openid);
    }
    applyCatchFeedback(delta, x, y);
    if (result.powerUp) state.combo = 0;
    addPowerUpFeedback(result.powerUp);
    const snapshotApplied = applyCatchResultSnapshot(result);
    if (!snapshotApplied || result.stale || result.finished) fetchRoom();
  }).catch((err) => {
    logError("input", "fish.tap.fail", { fishId: fish.id, elapsed: Date.now() - started, errMsg: err && (err.errMsg || err.message) });
    toast(err.errMsg || "操作失败");
  }).finally(() => {
    state.catchPending = false;
  });
}

function usePowerUp(powerUpId) {
  if (state.practiceMode || state.catchPending || state.busy) {
    logWarn("input", "powerUp.blocked", { powerUpId, practiceMode: state.practiceMode, catchPending: state.catchPending, busy: state.busy });
    return;
  }
  const me = getLocalPlayer();
  const powerUps = getPlayerPowerUps(me);
  const selectedPowerUp = powerUpId ? powerUps.find((item) => item.id === powerUpId) : powerUps[0];
  if (!me || !selectedPowerUp) {
    logWarn("input", "powerUp.missing", { powerUpId, powerUpCount: powerUps.length });
    return;
  }
  const stunLeft = getStunLeft(me);
  if (stunLeft > 0) {
    logWarn("input", "powerUp.blocked.stunned", { powerUpId: selectedPowerUp.id, stunLeft });
    return;
  }

  state.catchPending = true;
  const started = Date.now();
  logInfo("input", "powerUp.start", { powerUpId: selectedPowerUp.id, type: selectedPowerUp.type });
  callFunction("catchFish", { roomId: state.roomId, action: "usePowerUp", powerUpId: selectedPowerUp.id }).then((res) => {
    logInfo("input", "powerUp.result", {
      powerUpId: selectedPowerUp.id,
      elapsed: Date.now() - started,
      delta: res.result && res.result.delta,
      noPowerUp: !!(res.result && res.result.noPowerUp),
      stunned: !!(res.result && res.result.stunned)
    });
    if (res.result.stunned) {
      return;
    }
    if (res.result.noPowerUp) {
      toast("还没有道具");
      fetchRoom();
      return;
    }
    const delta = res.result.delta || 0;
    const currentPlayer = getLocalPlayer();
    if (currentPlayer) {
      currentPlayer.powerUps = getPlayerPowerUps(currentPlayer).filter((item) => item.id !== selectedPowerUp.id);
      currentPlayer.powerUp = null;
      if (delta > 0) currentPlayer.score = (currentPlayer.score || 0) + delta;
    }
    if (delta > 0) {
      addFeedback(`+${delta}`, screen.width / 2, screen.height * 0.48, COLORS.green);
    }
    const usedPowerUp = res.result.usedPowerUp;
    addRoomPowerUpUseFeedback(usedPowerUp);
    if (usedPowerUp && usedPowerUp.type === "pesticide") {
      clearPowerUpRefreshTimer();
      state.powerUpRefreshTimer = setTimeout(() => {
        state.powerUpRefreshTimer = null;
        fetchRoom();
        state.pesticideHideAt = 0;
        state.pesticideEffectUntil = 0;
        state.catchPending = false;
      }, 1900);
      return;
    }
    fetchRoom();
  }).catch((err) => {
    logError("input", "powerUp.fail", { powerUpId: selectedPowerUp.id, elapsed: Date.now() - started, errMsg: err && (err.errMsg || err.message) });
    toast(err.errMsg || "道具使用失败");
  }).finally(() => {
    if (!state.powerUpRefreshTimer) state.catchPending = false;
  });
}

function createRoomWithOptions(optionOverrides, busyText) {
  if (state.busy) {
    logWarn("room", "create.blocked.busy", { optionOverrides });
    return;
  }
  const soloStart = !!(optionOverrides && optionOverrides.soloStart);
  const quickStartWithBot = !soloStart && (!optionOverrides || optionOverrides.quickStartWithBot !== false);
  const nextOptions = normalizeGameOptions({
    ...state.gameOptions,
    ...(optionOverrides || {})
  });
  const startFunctionName = nextOptions.matchMode === "coop" && nextOptions.coopMode === "spell"
    ? "startCoopSpell"
    : "startGame";
  if (!isWordBankUnlocked(nextOptions.bankId)) {
    toast("请先解锁词库");
    openBankPicker(state.scene);
    return;
  }
  if (isWrongBankId(nextOptions.bankId) && !getStoredWrongWords().length) {
    toast("错题库为空，先去普通单元练习");
    return;
  }
  state.gameOptions = nextOptions;
  setBusy(true, busyText || "正在创建房间...");
  const gameOptions = {
    ...normalizeGameOptions({
      ...nextOptions,
      wrongWords: isWrongBankId(nextOptions.bankId) ? getStoredWrongWords() : []
    }),
    roomWords: getRoomWordPool(),
    roomSpellQuestions: getRoomSpellQuestionPool()
  };
  logInfo("room", "create.start", {
    soloStart,
    quickStartWithBot,
    startFunctionName,
    gameOptions
  });
  callFunction("createRoom", { nickName: state.playerName, gameOptions }).then((res) => {
    const result = res.result || {};
    logInfo("room", "create.result", { roomId: result.roomId, roomCode: result.roomCode, room: result.room });
    if (result.room && result.room.players && result.room.players[0]) {
      rememberLocalOpenId(result.room.players[0].openid);
    }
    if (!result.roomId) {
      enterRoom(result.roomId, result.roomCode, result.room);
      return;
    }

    if (soloStart) {
      let roomSnapshot = result.room;
      return callFunction("toggleReady", { roomId: result.roomId, ready: true })
        .then((readyRes) => {
          const readyResult = readyRes.result || {};
          if (readyResult.room) roomSnapshot = readyResult.room;
          return callFunction(startFunctionName, { roomId: result.roomId, roomWords: gameOptions.roomWords, roomSpellQuestions: gameOptions.roomSpellQuestions });
        })
        .then((startRes) => {
          const startResult = startRes.result || {};
          if (startResult.room) roomSnapshot = startResult.room;
          enterRoom(result.roomId, result.roomCode, roomSnapshot);
          if (!startResult.room || roomSnapshot.state !== "playing") {
            setTimeout(fetchRoom, 80);
          }
        })
        .catch((err) => {
          logError("room", "create.soloStart.fail", { roomId: result.roomId, startFunctionName, errMsg: err && (err.errMsg || err.message) });
          const message = err.errMsg || "无法开始游戏";
          toast(message);
          enterRoom(result.roomId, result.roomCode, roomSnapshot);
          state.message = message;
          setTimeout(fetchRoom, 80);
        });
    }

    if (!quickStartWithBot) {
      enterRoom(result.roomId, result.roomCode, result.room);
      return;
    }

    let roomSnapshot = result.room;
    const bot = BOT_PRESETS[state.selectedBotIndex % BOT_PRESETS.length] || BOT_PRESETS[1];
    return callFunction("toggleReady", { roomId: result.roomId, ready: true })
      .then((readyRes) => {
        const readyResult = readyRes.result || {};
        if (readyResult.room) roomSnapshot = readyResult.room;
        return callFunction("addBot", { roomId: result.roomId, difficulty: bot.difficulty, botName: bot.name });
      })
      .then((botRes) => {
        const botResult = botRes.result || {};
        if (botResult.room) roomSnapshot = botResult.room;
        toast("机器人队友已加入");
        return callFunction(startFunctionName, { roomId: result.roomId, roomWords: gameOptions.roomWords });
      })
      .then((startRes) => {
        const startResult = startRes.result || {};
        if (startResult.room) roomSnapshot = startResult.room;
        enterRoom(result.roomId, result.roomCode, roomSnapshot);
      })
      .catch((err) => {
        logError("room", "create.quickBot.fail", { roomId: result.roomId, startFunctionName, errMsg: err && (err.errMsg || err.message) });
        toast(err.errMsg || "机器人队友加入失败，可在房间内手动添加");
        enterRoom(result.roomId, result.roomCode, roomSnapshot);
      });
  }).catch((err) => {
    toast(err.errMsg || "创建失败");
    logError("room", "create.fail", { errMsg: err && (err.errMsg || err.message), gameOptions });
  }).finally(() => setBusy(false));
}

async function submitCoopSpellAnswer() {
  if (state.catchPending || state.busy || isCoopSpellAdvancingQuestion() || (!state.roomId && !state.soloSpellMode)) {
    logWarn("spell", "submit.blocked", { catchPending: state.catchPending, busy: state.busy, advancingQuestionId: state.coopSpellAdvancingQuestionId, roomId: state.roomId, soloSpellMode: state.soloSpellMode });
    return;
  }
  const me = getLocalPlayer();
  if (!me) {
    logWarn("spell", "submit.noLocalPlayer", {});
    return;
  }
  const segment = getCoopSpellSegment(me);
  if (!segment) {
    logWarn("spell", "submit.noSegment", { questionId: state.coopSpellQuestion && state.coopSpellQuestion.id });
    toast("还没有分配拼词片段");
    return;
  }
  const submission = getCoopSpellSubmission(me.openid);
  if (isCoopSpellSubmissionReady(submission)) {
    toast("你已填写，等待队友");
    return;
  }
  syncCoopSpellInputLength(segment);
  const expectedLength = Number(segment.length || 0);
  if (state.coopSpellInput.length < expectedLength) {
    logWarn("spell", "submit.incomplete", { expectedLength, inputLength: state.coopSpellInput.length });
    toast(`还差 ${expectedLength - state.coopSpellInput.length} 个字母`);
    return;
  }
  const answer = state.coopSpellInput.join("");
  if (state.soloSpellMode) {
    logInfo("spell", "submit.solo", { questionId: state.coopSpellQuestion && state.coopSpellQuestion.id, answerLength: answer.length });
    submitSoloSpellAnswer(answer, me, segment);
    return;
  }
  const questionId = (state.coopSpellQuestion && state.coopSpellQuestion.id) || state.targetFishId;
  rememberLocalCoopSpellSubmission(me.openid, questionId, answer, expectedLength);
  state.catchPending = true;
  const started = Date.now();
  logInfo("spell", "submit.start", { questionId, answerLength: answer.length, segmentLength: expectedLength });
  callFunction("catchFish", {
    roomId: state.roomId,
    action: "submitCoopSpell",
    questionId,
    answer
  }).then((res) => {
    const result = res.result || {};
    const stillSameQuestion = getCoopSpellQuestionId(state.coopSpellQuestion) === String(questionId || "");
    logInfo("spell", "submit.result", {
      questionId,
      elapsed: Date.now() - started,
      correct: !!result.correct,
      roundComplete: !!result.roundComplete,
      waitingPartner: !!result.waitingPartner,
      finished: !!result.finished,
      delta: result.delta || 0,
      stillSameQuestion
    });
    if (!stillSameQuestion) {
      fetchRoom();
      return;
    }
    if (result.submitted && !result.roundComplete) {
      state.coopSpellSubmissions = {
        ...(state.coopSpellSubmissions || {}),
        [me.openid]: {
          status: "submitted",
          questionId,
          answer,
          length: expectedLength,
          submittedAt: Date.now()
        }
      };
    }
    if (result.waitingPartner) {
      addFeedback("已填写，等队友", screen.width / 2, screen.height * 0.42, COLORS.green);
    } else if (result.roundComplete && result.correct) {
      state.coopSpellInput = [];
      state.coopSpellInputQuestionId = questionId;
      state.coopSpellSubmissions = {};
      state.coopSpellAdvancingQuestionId = questionId;
      addFeedback("+100", screen.width / 2, screen.height * 0.42, COLORS.green);
    } else if (result.roundComplete) {
      const word = state.coopSpellQuestion && state.coopSpellQuestion.word;
      const meaning = state.coopSpellQuestion && state.coopSpellQuestion.meaning;
      if (word && meaning) saveWrongWord({ word, meaning });
      state.coopSpellInput = [];
      state.coopSpellInputQuestionId = questionId;
      state.coopSpellSubmissions = {};
      state.coopSpellAdvancingQuestionId = questionId;
      addFeedback("-100", screen.width / 2, screen.height * 0.42, COLORS.red);
    } else {
      addFeedback("已填写", screen.width / 2, screen.height * 0.42, COLORS.green);
    }
    fetchRoom();
  }).catch((err) => {
    rollbackLocalCoopSpellSubmission(me.openid, questionId);
    logError("spell", "submit.fail", { questionId, elapsed: Date.now() - started, errMsg: err && (err.errMsg || err.message) });
    toast(err.errMsg || "提交失败");
  }).finally(() => {
    state.catchPending = false;
  });
}

async function handleButton(id) {
  logInfo("input", "button.tap", {
    id,
    scene: state.scene,
    busy: state.busy,
    catchPending: state.catchPending,
    roomId: state.roomId,
    gameOptions: state.gameOptions
  });
  if (id === "debugLogs") {
    if (DEBUG_TOOLS_ENABLED) copyDebugLogs();
    return;
  }

  if (id === "usePowerUp" || id.indexOf("usePowerUp:") === 0) {
    usePowerUp(id.indexOf(":") >= 0 ? id.split(":")[1] : "");
    return;
  }

  if (id.indexOf("coopLetter:") === 0) {
    addCoopSpellLetter(id.split(":")[1]);
    return;
  }

  if (id.indexOf("historyMode:") === 0) {
    const modeId = id.split(":")[1];
    if (SCORE_MODES.some((mode) => mode.id === modeId)) {
      stopPollingRoom();
      state.historyMode = modeId;
      state.historyPage = 0;
      state.historyDetailPage = 0;
      state.historyDetailRecord = null;
      state.scene = GAME.HISTORY;
    }
    return;
  }

  if (id.indexOf("historyDetail:") === 0) {
    const recordIndex = Number(id.split(":")[1]);
    const records = getMatchRecords(state.historyMode);
    const record = records[recordIndex];
    if (record && Array.isArray(record.spellHistory) && record.spellHistory.length) {
      state.historyDetailRecord = record;
      state.historyDetailPage = 0;
      state.scene = GAME.HISTORY_DETAIL;
    }
    return;
  }

  if (id === "coopSpellBackspace") {
    deleteCoopSpellLetter();
    return;
  }

  if (id === "coopSpellSkip") {
    skipCoopSpellQuestion(true);
    return;
  }

  if (id === "coopSpellExit") {
    goHome();
    return;
  }

  if (id === "bankBack") {
    returnFromBankPicker();
    return;
  }

  if (id === "bankPrev") {
    state.bankPickerPage = Math.max(0, state.bankPickerPage - 1);
    return;
  }

  if (id === "bankNext") {
    state.bankPickerPage += 1;
    return;
  }

  if (id === "bankConfirm") {
    const bankId = state.bankPickerSelectedBankId;
    if (!bankId || !WORD_BANKS[bankId]) {
      toast("请先选择词库");
      return;
    }
    if (!isWordBankUnlocked(bankId)) {
      toast("先解锁这个词库");
      return;
    }
    if (isWrongBankId(bankId) && !getStoredWrongWords().length) {
      toast("错题库为空，先去普通单元练习");
      return;
    }
    state.gameOptions.bankId = bankId;
    state.gameOptions.mode = isWrongBankId(bankId) ? "mistakes" : "regular";
    returnFromBankPicker();
    return;
  }

  if (id.indexOf("bankProvince:") === 0) {
    const provinceId = id.split(":")[1];
    state.bankPickerProvinceId = provinceId;
    state.bankPickerPage = 0;
    state.bankPickerSelectedBankId = getFirstBankIdForProvince(provinceId) || state.bankPickerSelectedBankId;
    return;
  }

  if (id.indexOf("bankUnit:") === 0) {
    const bankId = id.split(":")[1];
    const bank = WORD_BANKS[bankId];
    if (!bank || !bank.words || !bank.words.length) {
      if (!isWrongBankId(bankId)) {
        toast("当前单元暂无单词");
        return;
      }
      if (!getStoredWrongWords().length) {
        toast("错题库为空，先去普通单元练习");
        return;
      }
    }
    if (!isWordBankUnlocked(bankId)) {
      const unlocked = await confirmUnlockWordBank(bankId);
      if (!unlocked) return;
    }
    state.bankPickerSelectedBankId = bankId;
    return;
  }

  if (id === "name") {
    const value = await promptText("玩家昵称", "输入昵称", state.playerName, 12);
    if (value) {
      state.playerName = value;
      wx.setStorageSync("playerName", value);
    }
    return;
  }

  if (id === "history") {
    stopPollingRoom();
    state.historyPage = 0;
    state.historyDetailPage = 0;
    state.historyDetailRecord = null;
    state.scene = GAME.HISTORY;
    return;
  }

  if (id === "help") {
    stopPollingRoom();
    state.scene = GAME.HELP;
    return;
  }

  if (id === "soundToggle") {
    saveSoundMuted(!state.soundMuted);
    toast(state.soundMuted ? "声音已关闭" : "声音已开启");
    return;
  }

  if (id === "study") {
    enterStudyMode();
    return;
  }

  if (id === "coop") {
    stopPollingRoom();
    state.scene = GAME.COOP_SELECT;
    return;
  }

  if (id === "coopShared") {
    createRoomWithOptions({ matchMode: "coop", coopMode: "shared", quickStartWithBot: false }, "正在创建默契捕词赛房间...");
    return;
  }

  if (id === "coopSpell") {
    createRoomWithOptions({
      matchMode: "coop",
      coopMode: "spell",
      quickStartWithBot: false
    }, "正在创建同舟拼词记房间...");
    return;
  }

  if (id === "studyPrev") {
    moveStudyWord(-1);
    return;
  }

  if (id === "studyNext") {
    moveStudyWord(1);
    return;
  }

  if (id === "studyRandom") {
    shuffleStudyWord();
    return;
  }

  if (id === "studyToggleMeaning") {
    state.studyShowMeaning = !state.studyShowMeaning;
    state.studyRevealCurrentMeaning = false;
    return;
  }

  if (id === "studyRevealCurrent") {
    if (!state.studyShowMeaning) state.studyRevealCurrentMeaning = true;
    return;
  }

  if (id === "studyWrong") {
    const word = getCurrentStudyWord();
    if (word) {
      saveWrongWord(word);
      toast("已加入错题库");
    }
    return;
  }

  if (id === "coopSpellSubmit") {
    submitCoopSpellAnswer();
    return;
  }

  if (id === "historyPrev") {
    state.historyPage = Math.max(0, state.historyPage - 1);
    return;
  }

  if (id === "historyNext") {
    const pageSize = screen.height < 700 ? 3 : HISTORY_PAGE_SIZE;
    const maxPage = Math.max(0, Math.ceil(getMatchRecords(state.historyMode).length / pageSize) - 1);
    state.historyPage = Math.min(maxPage, state.historyPage + 1);
    return;
  }

  if (id === "historyBack") {
    state.scene = GAME.HISTORY;
    return;
  }

  if (id === "historyDetailPrev") {
    state.historyDetailPage = Math.max(0, state.historyDetailPage - 1);
    return;
  }

  if (id === "historyDetailNext") {
    const record = state.historyDetailRecord && normalizeScoreRecord(state.historyDetailRecord);
    const rounds = record ? normalizeSpellHistory(record.spellHistory) : [];
    const pageSize = screen.height < 700 ? 3 : 4;
    const maxPage = Math.max(0, Math.ceil(rounds.length / pageSize) - 1);
    state.historyDetailPage = Math.min(maxPage, state.historyDetailPage + 1);
    return;
  }

  if (id === "optionDuration") {
    cycleOption("duration");
    return;
  }

  if (id === "optionBank") {
    openBankPicker(state.scene);
    return;
  }

  if (id === "create") {
    createRoomWithOptions({ matchMode: "pk", coopMode: "shared", quickStartWithBot: false }, "正在创建PK房间...");
    return;
  }

  if (id === "cycleBotPreset") {
    applyBotPreset(!!getBotPlayer());
    return;
  }

  if (id === "addBot") {
    if (state.busy || !state.roomId) return;
    if (isCoopMode()) {
      toast(`${getCoopModeLabel()}需要两名真实玩家`);
      return;
    }
    const bot = BOT_PRESETS[state.selectedBotIndex % BOT_PRESETS.length] || BOT_PRESETS[1];
    const difficulty = bot.difficulty;
    const botName = bot.name;
    setBusy(true, "正在添加机器人...");
    callFunction("addBot", { roomId: state.roomId, difficulty, botName }).then((res) => {
      toast(`${botName} 已加入`);
      const result = res.result || {};
      if (result.room) {
        applyRoomSnapshot(result.room);
      } else {
        if (result.players) state.players = result.players;
        if (result.gameOptions) state.gameOptions = normalizeGameOptions(result.gameOptions);
      }
    }).catch((err) => {
      toast(err.errMsg || "添加机器人失败");
      fetchRoom();
    }).finally(() => setBusy(false));
    return;
  }

  if (id === "join") {
    const code = await promptText("加入房间", "输入 6 位房间码", "", 6);
    if (!code) return;
    setBusy(true, "正在加入房间...");
    callFunction("joinRoom", { roomCode: code.toUpperCase(), nickName: state.playerName }).then((res) => {
      rememberLocalOpenId(res.result && res.result.openid);
      enterRoom(res.result.roomId, code.toUpperCase());
    }).catch((err) => {
      toast(err.errMsg || "加入失败");
    }).finally(() => setBusy(false));
    return;
  }

  if (id === "copy") {
    copyRoomCode();
    return;
  }

  if (id === "invite") {
    shareRoomInvite();
    return;
  }

  if (id === "ready") {
    const me = getLocalPlayer();
    const nextReady = !(me && me.ready);
    state.startError = "";
    if (me) me.ready = nextReady;
    setBusy(true);
    callFunction("toggleReady", { roomId: state.roomId, ready: nextReady }).then((res) => {
      const result = res.result || {};
      if (result.room) {
        applyRoomSnapshot(result.room);
      } else if (result.players) {
        state.players = result.players;
      }
    }).catch((err) => {
      toast(err.errMsg || "操作失败");
      fetchRoom();
    }).finally(() => setBusy(false));
    return;
  }

  if (id === "start") {
    state.startError = "";
    setBusy(true);
    const startFunctionName = isCoopSpellMode() ? "startCoopSpell" : "startGame";
    callFunction(startFunctionName, { roomId: state.roomId, roomWords: getRoomWordPool(), roomSpellQuestions: getRoomSpellQuestionPool() }).then((res) => {
      const result = res.result || {};
      if (result.room) {
        applyRoomSnapshot(result.room);
      } else {
        fetchRoom();
      }
    }).catch((err) => {
      const message = getCloudErrorMessage(err, "无法开始");
      state.startError = `启动失败：${message}`;
      toast(message);
      fetchRoom();
    }).finally(() => setBusy(false));
    return;
  }

  if (id === "home") {
    goHome();
  }
}

wx.onTouchStart((event) => {
  const started = Date.now();
  try {
    if (!state.soundMuted && !bgmStarted) playBgMusic();
    const touch = event.changedTouches[0];
    if (!touch) return;
    const x = touch.clientX;
    const y = touch.clientY;
    const buttonId = hitButton(x, y);
    if (buttonId) {
      logInfo("input", "touch.button", { buttonId, x: Math.round(x), y: Math.round(y), scene: state.scene });
      handleButton(buttonId).catch((err) => {
        logError("input", "button.exception", { buttonId, errMsg: err && (err.errMsg || err.message) });
      });
      return;
    }
    if (state.scene === GAME.PLAYING) {
      handleFishTap(x, y);
      return;
    }
    if (Date.now() - lastEmptyTapLogAt >= EMPTY_TAP_LOG_INTERVAL_MS) {
      lastEmptyTapLogAt = Date.now();
      logInfo("input", "touch.empty", { x: Math.round(x), y: Math.round(y), scene: state.scene });
    }
  } finally {
    const elapsed = Date.now() - started;
    if (elapsed >= SLOW_INPUT_HANDLER_MS) {
      logWarn("perf", "input.slow", { elapsed, scene: state.scene, busy: state.busy, catchPending: state.catchPending });
    }
  }
});

logInfo("client", "boot", {
  envId: config.envId || "dynamic",
  screen,
  dpr,
  system: systemInfo.system,
  platform: systemInfo.platform,
  SDKVersion: systemInfo.SDKVersion,
  soundMuted: state.soundMuted,
  gameOptions: state.gameOptions
});
setupShare();
initCloud();
startRenderLoop();
