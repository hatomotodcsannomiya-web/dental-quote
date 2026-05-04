const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "dev.db"));

const data = [
  {
    name: "補綴・修復",
    sortOrder: 0,
    treatments: [
      { name: "セラミックインレー", unitPrice: 66000, unit: "本", priceType: "flat" },
      { name: "セラミッククラウン", unitPrice: 132000, unit: "本", priceType: "flat" },
      { name: "モノリシックジルコニアクラウン", unitPrice: 110000, unit: "本", priceType: "flat" },
      { name: "ジルコニアレイヤリングクラウン", unitPrice: 165000, unit: "本", priceType: "flat" },
      { name: "ラミネートベニア", unitPrice: 132000, unit: "本", priceType: "flat" },
      { name: "レジンコア", unitPrice: 8800, unit: "本", priceType: "flat" },
      { name: "ダイレクトボンディング（1部位）", unitPrice: 44000, unit: "部位", priceType: "flat" },
      { name: "仮歯（テンポラリークラウン）", unitPrice: 5500, unit: "本", priceType: "flat" },
      { name: "仮歯（プロビジョナルレストレーション）", unitPrice: 11000, unit: "本", priceType: "flat" },
    ],
  },
  {
    name: "処置",
    sortOrder: 1,
    treatments: [
      { name: "歯髄温存療法（VPT）", unitPrice: 55000, unit: "歯", priceType: "flat" },
      { name: "矯正的挺出（MTM）", unitPrice: 55000, unit: "歯", priceType: "flat" },
      { name: "精密根管治療（前歯）", unitPrice: 66000, unit: "本", priceType: "flat" },
      { name: "精密根管治療（小臼歯）", unitPrice: 88000, unit: "本", priceType: "flat" },
      { name: "精密根管治療（大臼歯）", unitPrice: 110000, unit: "本", priceType: "flat" },
      { name: "精密再根管治療（前歯）", unitPrice: 88000, unit: "本", priceType: "flat" },
      { name: "精密再根管治療（小臼歯）", unitPrice: 110000, unit: "本", priceType: "flat" },
      { name: "精密再根管治療（大臼歯）", unitPrice: 132000, unit: "本", priceType: "flat" },
    ],
  },
  {
    name: "義歯",
    sortOrder: 2,
    treatments: [
      { name: "全部床義歯（金属）", unitPrice: 363000, unit: "式", priceType: "flat" },
      { name: "ノンメタルクラスプデンチャー", unitPrice: 55000, unit: "式", priceType: "flat" },
    ],
  },
  {
    name: "外科",
    sortOrder: 3,
    treatments: [
      { name: "歯根端切除術", unitPrice: 132000, unit: "本", priceType: "flat" },
      { name: "クラウンレングスニング（3歯まで）", unitPrice: 66000, unit: "式", priceType: "flat" },
      { name: "FGG（遊離歯肉移植術）", unitPrice: 88000, unit: "箇所", priceType: "flat" },
      { name: "CTG（結合組織移植術）", unitPrice: 88000, unit: "箇所", priceType: "flat" },
    ],
  },
  {
    name: "インプラント",
    sortOrder: 4,
    treatments: [
      { name: "インプラント（上部構造込み）", unitPrice: 484000, unit: "本", priceType: "flat" },
      { name: "インプラントBr（3歯）", unitPrice: 1078000, unit: "式", priceType: "flat" },
      { name: "マイナーGBR", unitPrice: 55000, unit: "箇所", priceType: "flat" },
      { name: "GBR（骨壁がない場合）", unitPrice: 110000, unit: "箇所", priceType: "flat" },
      { name: "ソケットリフト", unitPrice: 55000, unit: "箇所", priceType: "flat" },
      { name: "サイナスリフト", unitPrice: 165000, unit: "箇所", priceType: "flat" },
    ],
  },
  {
    name: "ホワイトニング",
    sortOrder: 5,
    treatments: [
      { name: "ウォーキングブリーチ（1歯）", unitPrice: 11000, unit: "本", priceType: "flat" },
      { name: "オフィスホワイトニング", unitPrice: 16500, unit: "回", priceType: "flat" },
      { name: "ホームホワイトニング", unitPrice: 22000, unit: "セット", priceType: "flat" },
      { name: "デュアルホワイトニング", unitPrice: 33000, unit: "セット", priceType: "flat" },
    ],
  },
  {
    name: "予防",
    sortOrder: 6,
    treatments: [
      { name: "パウダークリーニング", unitPrice: 11000, unit: "回", priceType: "flat" },
    ],
  },
  {
    name: "矯正",
    sortOrder: 7,
    treatments: [
      { name: "クリンチェック", unitPrice: 0, unit: "回", priceType: "flat" },
      { name: "インビザラインコンプリヘンシブ", unitPrice: 880000, unit: "式", priceType: "flat" },
      { name: "インビザラインモデレート", unitPrice: 660000, unit: "式", priceType: "flat" },
      { name: "インビザラインライト", unitPrice: 550000, unit: "式", priceType: "flat" },
      { name: "インビザラインGoPlus", unitPrice: 550000, unit: "式", priceType: "flat" },
      { name: "インビザラインGo", unitPrice: 440000, unit: "式", priceType: "flat" },
      { name: "インビザラインファースト1期", unitPrice: 440000, unit: "式", priceType: "flat" },
      { name: "インビザラインファースト2期", unitPrice: 440000, unit: "式", priceType: "flat" },
      { name: "IPE（インビザラインパラタルエキスパンダー）", unitPrice: 220000, unit: "式", priceType: "flat" },
    ],
  },
];

const now = new Date().toISOString();

const insertCategory = db.prepare(
  "INSERT OR IGNORE INTO Category (name, sortOrder, createdAt) VALUES (?, ?, ?)"
);
const updateCategory = db.prepare(
  "UPDATE Category SET sortOrder = ? WHERE name = ?"
);
const getCategoryByName = db.prepare("SELECT id FROM Category WHERE name = ?");
const getTreatment = db.prepare(
  "SELECT id FROM Treatment WHERE name = ? AND categoryId = ?"
);
const insertTreatment = db.prepare(
  "INSERT INTO Treatment (name, categoryId, priceType, unitPrice, unit, isActive, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)"
);

for (const cat of data) {
  insertCategory.run(cat.name, cat.sortOrder, now);
  updateCategory.run(cat.sortOrder, cat.name);
  const row = getCategoryByName.get(cat.name);
  const categoryId = row.id;

  for (let i = 0; i < cat.treatments.length; i++) {
    const t = cat.treatments[i];
    const existing = getTreatment.get(t.name, categoryId);
    if (!existing) {
      insertTreatment.run(t.name, categoryId, t.priceType, t.unitPrice, t.unit, i, now, now);
      console.log(`  追加: ${t.name}`);
    } else {
      console.log(`  スキップ: ${t.name}`);
    }
  }
}

db.close();
console.log("完了");
