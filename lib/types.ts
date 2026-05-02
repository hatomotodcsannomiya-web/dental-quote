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
  toothId: string;
  toothLabel: string;
  treatmentId: number;
  treatmentName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
}
