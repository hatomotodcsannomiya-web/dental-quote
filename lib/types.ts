export interface TreatmentItem {
  id: number;
  name: string;
  categoryId: number;
  priceType: string;
  unitPrice: number;
  unit: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CategoryWithTreatments {
  id: number;
  name: string;
  sortOrder: number;
  treatments: TreatmentItem[];
}

export interface QuoteLineItem {
  toothId: string;        // "__none__" | "__multi__" | 単一歯ID
  toothLabel: string;     // 表示用文字列
  toothIds?: string[];    // 複数歯指定時のID一覧
  treatmentId: number;
  treatmentName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
}
