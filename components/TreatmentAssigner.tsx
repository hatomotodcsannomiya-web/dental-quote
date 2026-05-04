"use client";

import { useState } from "react";
import type { CategoryWithTreatments, QuoteLineItem } from "@/lib/types";

interface Props {
  toothId: string;
  toothLabel: string;
  categories: CategoryWithTreatments[];
  existing: QuoteLineItem[];
  onAdd: (item: QuoteLineItem) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updated: Partial<QuoteLineItem>) => void;
  globalItems: QuoteLineItem[];
  noTooth?: boolean;
}

export default function TreatmentAssigner({ toothId, toothLabel, categories, onAdd, onRemove, onUpdate, globalItems, noTooth }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Set<number>>(new Set());

  const toothItems = globalItems
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.toothId === toothId);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedTreatment = selectedCategory?.treatments.find((t) => t.id === selectedTreatmentId);
  const activeOptions = selectedTreatment?.options?.filter((o) => o.isActive) ?? [];

  function handleAdd() {
    if (!selectedTreatmentId || !selectedCategoryId) return;
    const category = categories.find((c) => c.id === selectedCategoryId);
    const treatment = category?.treatments.find((t) => t.id === selectedTreatmentId);
    if (!treatment || !category) return;

    onAdd({
      toothId,
      toothLabel,
      treatmentId: treatment.id,
      treatmentName: treatment.name,
      categoryName: category.name,
      quantity,
      unitPrice: treatment.unitPrice,
    });

    for (const opt of activeOptions) {
      if (selectedOptionIds.has(opt.id)) {
        onAdd({
          toothId,
          toothLabel,
          treatmentId: treatment.id,
          treatmentName: "└ " + opt.name,
          categoryName: category.name,
          quantity: 1,
          unitPrice: opt.price,
          isOption: true,
        });
      }
    }

    setSelectedTreatmentId("");
    setSelectedOptionIds(new Set());
    setQuantity(1);
  }

  function toggleOption(optId: number) {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev);
      if (next.has(optId)) next.delete(optId);
      else next.add(optId);
      return next;
    });
  }

  return (
    <div className={`border rounded-lg p-3 ${noTooth ? "bg-gray-50 border-dashed border-gray-300 col-span-1 sm:col-span-2 lg:col-span-3" : "bg-white border-gray-200"}`}>
      <h3 className={`text-sm font-bold mb-2 ${noTooth ? "text-gray-500" : "text-blue-700"}`}>
        {noTooth ? "🦷 部位指定なし（口腔全体・その他）" : toothLabel}
      </h3>

      {toothItems.length > 0 && (
        <div className={`mb-3 ${noTooth ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1" : "space-y-1"}`}>
          {toothItems.map(({ item, index }) => (
            <div
              key={index}
              className={`flex items-center gap-2 text-xs rounded px-2 py-1 ${item.isOption ? "bg-amber-50 ml-3" : "bg-blue-50"}`}
            >
              <span className={`flex-1 truncate ${item.isOption ? "text-amber-700" : "text-gray-700"}`}>{item.treatmentName}</span>
              {!item.isOption && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-gray-400">×</span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => onUpdate(index, { quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-10 text-center border border-blue-200 rounded px-1 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              )}
              <span className="text-gray-500 flex-shrink-0">¥{(item.unitPrice * item.quantity).toLocaleString()}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-400 hover:text-red-600 font-bold leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`flex gap-2 ${noTooth ? "flex-wrap items-end" : "flex-col"}`}>
        <select
          value={selectedCategoryId}
          onChange={(e) => {
            setSelectedCategoryId(Number(e.target.value) || "");
            setSelectedTreatmentId("");
            setSelectedOptionIds(new Set());
          }}
          className={`text-xs border border-gray-300 rounded px-2 py-1 ${noTooth ? "flex-1 min-w-32" : "w-full"}`}
        >
          <option value="">カテゴリを選択</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {selectedCategory && (
          <select
            value={selectedTreatmentId}
            onChange={(e) => {
              setSelectedTreatmentId(Number(e.target.value) || "");
              setSelectedOptionIds(new Set());
            }}
            className={`text-xs border border-gray-300 rounded px-2 py-1 ${noTooth ? "flex-1 min-w-40" : "w-full"}`}
          >
            <option value="">治療を選択</option>
            {selectedCategory.treatments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}（¥{t.unitPrice.toLocaleString()}/{t.unit}）
              </option>
            ))}
          </select>
        )}

        {activeOptions.length > 0 && (
          <div className={`bg-amber-50 border border-amber-200 rounded-lg p-2 ${noTooth ? "w-full" : ""}`}>
            <p className="text-xs font-semibold text-amber-700 mb-1.5">オプション（追加）</p>
            <div className="space-y-1">
              {activeOptions.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedOptionIds.has(opt.id)}
                    onChange={() => toggleOption(opt.id)}
                    className="rounded accent-amber-500"
                  />
                  <span className="text-gray-700 flex-1">{opt.name}</span>
                  <span className="text-amber-700 font-medium">+¥{opt.price.toLocaleString()}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <label className="text-xs text-gray-500">数量</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="text-xs border border-gray-300 rounded px-2 py-1 w-16 text-center"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedTreatmentId}
            className="text-xs bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600 disabled:opacity-40"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
