export interface WarrantyRow {
  category: string;
  period: string;
  year1: string;
  year2to3: string;
  year3to5: string;
  year6plus: string;
}

export const WARRANTY_TABLE: WarrantyRow[] = [
  { category: "インレー・アンレー（詰め物）", period: "2年間",  year1: "無償", year2to3: "無償",    year3to5: "対象外", year6plus: "対象外" },
  { category: "クラウン（被せ物）",           period: "5年間",  year1: "無償", year2to3: "30%負担", year3to5: "50%負担", year6plus: "対象外" },
  { category: "ブリッジ",                     period: "5年間",  year1: "無償", year2to3: "30%負担", year3to5: "50%負担", year6plus: "対象外" },
  { category: "義歯（入れ歯）",               period: "1年間",  year1: "無償", year2to3: "対象外",  year3to5: "対象外",  year6plus: "対象外" },
  { category: "インプラント上部構造",         period: "5年間",  year1: "無償", year2to3: "30%負担", year3to5: "50%負担", year6plus: "対象外" },
  { category: "インプラント体（フィクスチャー）", period: "10年間", year1: "無償", year2to3: "無償", year3to5: "無償",   year6plus: "無償"   },
];

// 治療名のキーワードから保証カテゴリへのマッピング
const MAPPING: { keywords: string[]; category: string }[] = [
  { keywords: ["インレー", "アンレー"],                             category: "インレー・アンレー（詰め物）" },
  { keywords: ["クラウン", "ラミネートベニア", "ベニア"],           category: "クラウン（被せ物）" },
  { keywords: ["Br", "ブリッジ"],                                   category: "ブリッジ" },
  { keywords: ["義歯", "デンチャー", "入れ歯"],                     category: "義歯（入れ歯）" },
  { keywords: ["インプラント体", "フィクスチャー"],                  category: "インプラント体（フィクスチャー）" },
  { keywords: ["インプラント"],                                      category: "インプラント上部構造" },
];

export function mapToWarrantyCategory(treatmentName: string): string | null {
  for (const { keywords, category } of MAPPING) {
    if (keywords.some((k) => treatmentName.includes(k))) return category;
  }
  return null;
}

export interface WarrantyItem {
  toothLabel: string;
  treatmentName: string;
  warrantyCategory: string;
}

export function filterWarrantyItems(
  items: { toothLabel: string; treatmentName: string }[]
): WarrantyItem[] {
  const result: WarrantyItem[] = [];
  for (const item of items) {
    if (item.treatmentName.startsWith("└ ")) continue; // オプション行はスキップ
    const cat = mapToWarrantyCategory(item.treatmentName);
    if (cat) result.push({ ...item, warrantyCategory: cat });
  }
  return result;
}
