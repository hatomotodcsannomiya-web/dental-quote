"use client";

import { useState } from "react";
import { ALL_TEETH, type Tooth } from "@/lib/teeth";
import type { CategoryWithTreatments, QuoteLineItem } from "@/lib/types";

interface Props {
  categories: CategoryWithTreatments[];
  onAdd: (item: QuoteLineItem) => void;
}

const QUADRANTS: Array<{ label: string; q: Tooth["quadrant"]; side: "right" | "left"; row: "upper" | "lower" }> = [
  { label: "右上", q: "右上", side: "right", row: "upper" },
  { label: "左上", q: "左上", side: "left",  row: "upper" },
  { label: "右下", q: "右下", side: "right", row: "lower" },
  { label: "左下", q: "左下", side: "left",  row: "lower" },
];

export default function MultiToothAssigner({ categories, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [checkedTeeth, setCheckedTeeth] = useState<Set<string>>(new Set());
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<number | "">("");
  const [quantityOverride, setQuantityOverride] = useState<number | "">("");

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  function toggle(id: string) {
    setCheckedTeeth((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function buildLabel(ids: string[]): string {
    const labels = ids.map((id) => {
      const t = ALL_TEETH.find((t) => t.id === id);
      return t ? t.label : id;
    });
    const count = ids.length;
    return `${labels.join("・")}（${count}本）`;
  }

  function handleAdd() {
    if (checkedTeeth.size === 0 || !selectedTreatmentId || !selectedCategoryId) return;
    const category = categories.find((c) => c.id === selectedCategoryId);
    const treatment = category?.treatments.find((t) => t.id === selectedTreatmentId);
    if (!treatment || !category) return;

    const ids = Array.from(checkedTeeth);
    const qty = quantityOverride !== "" ? Number(quantityOverride) : ids.length;

    onAdd({
      toothId: "__multi__",
      toothLabel: buildLabel(ids),
      toothIds: ids,
      treatmentId: treatment.id,
      treatmentName: treatment.name,
      categoryName: category.name,
      quantity: qty,
      unitPrice: treatment.unitPrice,
    });

    setCheckedTeeth(new Set());
    setSelectedTreatmentId("");
    setQuantityOverride("");
    setOpen(false);
  }

  return (
    <div className="border-2 border-dashed border-purple-200 rounded-xl col-span-1 sm:col-span-2 lg:col-span-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
      >
        <span>🦷 複数歯指定（ブリッジ・連続治療など）</span>
        <span className="text-purple-400 text-xs">{open ? "▲ 閉じる" : "▼ 開く"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* 歯選択グリッド */}
          <div>
            <p className="text-xs text-gray-500 mb-2">対象歯をチェック（{checkedTeeth.size}本選択中）</p>
            <div className="grid grid-cols-2 gap-3">
              {QUADRANTS.map(({ label, q, side, row }) => {
                const permanent = ALL_TEETH
                  .filter((t) => t.quadrant === q && t.type === "permanent")
                  .sort((a, b) => side === "right" ? b.position - a.position : a.position - b.position);
                const deciduous = ALL_TEETH
                  .filter((t) => t.quadrant === q && t.type === "deciduous")
                  .sort((a, b) => side === "right" ? b.position - a.position : a.position - b.position);

                const upperFirst = row === "upper";
                const permRow = (
                  <div className="flex flex-wrap gap-1">
                    {permanent.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggle(t.id)}
                        className={`w-7 h-7 text-xs border-2 rounded transition-all ${
                          checkedTeeth.has(t.id)
                            ? "bg-purple-500 border-purple-600 text-white"
                            : "bg-white border-gray-300 text-gray-600 hover:border-purple-400"
                        }`}
                      >
                        {t.number}
                      </button>
                    ))}
                  </div>
                );
                const deciRow = (
                  <div className="flex flex-wrap gap-1">
                    {deciduous.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggle(t.id)}
                        className={`w-7 h-7 text-xs border-2 rounded-full transition-all ${
                          checkedTeeth.has(t.id)
                            ? "bg-purple-400 border-purple-500 text-white"
                            : "bg-amber-50 border-amber-300 text-amber-700 hover:border-purple-400"
                        }`}
                      >
                        {t.number}
                      </button>
                    ))}
                  </div>
                );

                return (
                  <div key={q} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                    <div className="space-y-1">
                      {upperFirst ? permRow : deciRow}
                      {upperFirst ? deciRow : permRow}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 選択した歯のリスト */}
          {checkedTeeth.size > 0 && (
            <div className="bg-purple-50 rounded-lg px-3 py-2 text-xs text-purple-700 flex flex-wrap gap-1 items-center">
              <span className="font-medium mr-1">選択中：</span>
              {Array.from(checkedTeeth).map((id) => {
                const t = ALL_TEETH.find((t) => t.id === id);
                return (
                  <span
                    key={id}
                    className="bg-white border border-purple-300 rounded px-1.5 py-0.5 flex items-center gap-1"
                  >
                    {t?.label ?? id}
                    <button type="button" onClick={() => toggle(id)} className="text-purple-400 hover:text-purple-600">×</button>
                  </span>
                );
              })}
            </div>
          )}

          {/* 治療選択・数量 */}
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-28">
              <label className="block text-xs text-gray-500 mb-1">カテゴリ</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => { setSelectedCategoryId(Number(e.target.value) || ""); setSelectedTreatmentId(""); }}
                className="text-xs border border-gray-300 rounded px-2 py-1.5 w-full focus:outline-none"
              >
                <option value="">選択...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {selectedCategory && (
              <div className="flex-1 min-w-40">
                <label className="block text-xs text-gray-500 mb-1">治療内容</label>
                <select
                  value={selectedTreatmentId}
                  onChange={(e) => setSelectedTreatmentId(Number(e.target.value) || "")}
                  className="text-xs border border-gray-300 rounded px-2 py-1.5 w-full focus:outline-none"
                >
                  <option value="">選択...</option>
                  {selectedCategory.treatments.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}（¥{t.unitPrice.toLocaleString()}/{t.unit}）</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                数量
                {checkedTeeth.size > 0 && <span className="text-purple-500 ml-1">（自動: {checkedTeeth.size}）</span>}
              </label>
              <input
                type="number"
                min={1}
                placeholder={String(checkedTeeth.size || 1)}
                value={quantityOverride}
                onChange={(e) => setQuantityOverride(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
                className="text-xs border border-gray-300 rounded px-2 py-1.5 w-20 text-center focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={checkedTeeth.size === 0 || !selectedTreatmentId}
              className="text-xs bg-purple-600 text-white rounded-lg px-4 py-1.5 hover:bg-purple-700 disabled:opacity-40"
            >
              追加
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
