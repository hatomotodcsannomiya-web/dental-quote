"use client";

import { useState } from "react";
import { ALL_TEETH, type Tooth } from "@/lib/teeth";
import type { CategoryWithTreatments, QuoteLineItem } from "@/lib/types";

interface Props {
  categories: CategoryWithTreatments[];
  onAdd: (item: QuoteLineItem) => void;
}

type ToothRole = "abutment" | "pontic";

const QUADRANTS: Array<{ label: string; q: Tooth["quadrant"]; side: "right" | "left"; row: "upper" | "lower" }> = [
  { label: "右上", q: "右上", side: "right", row: "upper" },
  { label: "左上", q: "左上", side: "left",  row: "upper" },
  { label: "右下", q: "右下", side: "right", row: "lower" },
  { label: "左下", q: "左下", side: "left",  row: "lower" },
];

export default function MultiToothAssigner({ categories, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [bridgeMode, setBridgeMode] = useState(false);

  // 通常モード
  const [checkedTeeth, setCheckedTeeth] = useState<Set<string>>(new Set());

  // ブリッジモード
  const [toothRoles, setToothRoles] = useState<Map<string, ToothRole>>(new Map());

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<number | "">("");
  const [quantityOverride, setQuantityOverride] = useState<number | "">("");
  const [selectedOptionIds, setSelectedOptionIds] = useState<Set<number>>(new Set());

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedTreatment = selectedCategory?.treatments.find((t) => t.id === selectedTreatmentId);
  const activeOptions = selectedTreatment?.options?.filter((o) => o.isActive) ?? [];

  function toggleOption(optId: number) {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev);
      if (next.has(optId)) next.delete(optId);
      else next.add(optId);
      return next;
    });
  }

  // --- 通常モード ---
  function toggleNormal(id: string) {
    setCheckedTeeth((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // --- ブリッジモード：クリックごとに none→支台歯→ポンティック→none ---
  function toggleBridge(id: string) {
    setToothRoles((prev) => {
      const next = new Map(prev);
      const cur = next.get(id);
      if (!cur) next.set(id, "abutment");
      else if (cur === "abutment") next.set(id, "pontic");
      else next.delete(id);
      return next;
    });
  }

  function buildNormalLabel(ids: string[]): string {
    const labels = ids.map((id) => ALL_TEETH.find((t) => t.id === id)?.label ?? id);
    return `${labels.join("・")}（${ids.length}本）`;
  }

  function buildBridgeLabel(): string {
    const abutments = Array.from(toothRoles.entries())
      .filter(([, r]) => r === "abutment")
      .map(([id]) => ALL_TEETH.find((t) => t.id === id)?.label ?? id);
    const pontics = Array.from(toothRoles.entries())
      .filter(([, r]) => r === "pontic")
      .map(([id]) => ALL_TEETH.find((t) => t.id === id)?.label ?? id);
    const parts: string[] = [];
    if (abutments.length) parts.push(`支台歯：${abutments.join("・")}`);
    if (pontics.length)   parts.push(`ポンティック：${pontics.join("・")}`);
    return parts.join(" / ");
  }

  function handleAdd() {
    const category = categories.find((c) => c.id === selectedCategoryId);
    const treatment = category?.treatments.find((t) => t.id === selectedTreatmentId);
    if (!treatment || !category) return;

    let toothLabel: string;
    let toothIds: string[];

    if (bridgeMode) {
      if (toothRoles.size === 0) return;
      toothLabel = buildBridgeLabel();
      toothIds = Array.from(toothRoles.keys());
      onAdd({
        toothId: "__multi__",
        toothLabel,
        toothIds,
        treatmentId: treatment.id,
        treatmentName: treatment.name,
        categoryName: category.name,
        quantity: quantityOverride !== "" ? Number(quantityOverride) : 1,
        unitPrice: treatment.unitPrice,
      });
      setToothRoles(new Map());
    } else {
      if (checkedTeeth.size === 0) return;
      const ids = Array.from(checkedTeeth);
      toothLabel = buildNormalLabel(ids);
      toothIds = ids;
      const qty = quantityOverride !== "" ? Number(quantityOverride) : ids.length;
      onAdd({
        toothId: "__multi__",
        toothLabel,
        toothIds,
        treatmentId: treatment.id,
        treatmentName: treatment.name,
        categoryName: category.name,
        quantity: qty,
        unitPrice: treatment.unitPrice,
      });
      setCheckedTeeth(new Set());
    }

    for (const opt of activeOptions) {
      if (selectedOptionIds.has(opt.id)) {
        onAdd({
          toothId: "__multi__",
          toothLabel,
          toothIds,
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
    setQuantityOverride("");
    setOpen(false);
  }

  function renderToothGrid(
    onClickTooth: (id: string) => void,
    getStyle: (id: string) => string,
    extraLabel?: (id: string) => React.ReactNode
  ) {
    return (
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
                  onClick={() => onClickTooth(t.id)}
                  className={`w-10 h-10 text-sm border-2 rounded transition-all relative ${getStyle(t.id)}`}
                >
                  {t.number}
                  {extraLabel?.(t.id)}
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
                  onClick={() => onClickTooth(t.id)}
                  className={`w-10 h-10 text-sm border-2 rounded-full transition-all relative ${getStyle(t.id)}`}
                >
                  {t.number}
                  {extraLabel?.(t.id)}
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
    );
  }

  const abutmentCount = Array.from(toothRoles.values()).filter((r) => r === "abutment").length;
  const ponticCount   = Array.from(toothRoles.values()).filter((r) => r === "pontic").length;

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

          {/* モード切替 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setBridgeMode(false); setToothRoles(new Map()); setCheckedTeeth(new Set()); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${!bridgeMode ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"}`}
            >
              通常（複数歯）
            </button>
            <button
              type="button"
              onClick={() => { setBridgeMode(true); setCheckedTeeth(new Set()); setToothRoles(new Map()); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${bridgeMode ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"}`}
            >
              ブリッジ（支台歯 / ポンティック）
            </button>
          </div>

          {/* 歯選択グリッド */}
          {!bridgeMode && (
            <div>
              <p className="text-xs text-gray-500 mb-2">対象歯をチェック（{checkedTeeth.size}本選択中）</p>
              {renderToothGrid(
                toggleNormal,
                (id) => checkedTeeth.has(id)
                  ? "bg-purple-500 border-purple-600 text-white"
                  : "bg-white border-gray-300 text-gray-600 hover:border-purple-400"
              )}
            </div>
          )}

          {bridgeMode && (
            <div>
              <div className="flex gap-4 text-xs mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-4 rounded bg-blue-500 border-2 border-blue-600" />
                  支台歯（{abutmentCount}本）
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-4 rounded bg-amber-400 border-2 border-amber-500" />
                  ポンティック（{ponticCount}本）
                </span>
                <span className="text-gray-400">クリックで切替：未選択 → 支台歯 → ポンティック</span>
              </div>
              {renderToothGrid(
                toggleBridge,
                (id) => {
                  const role = toothRoles.get(id);
                  if (role === "abutment") return "bg-blue-500 border-blue-600 text-white";
                  if (role === "pontic")   return "bg-amber-400 border-amber-500 text-white";
                  return "bg-white border-gray-300 text-gray-600 hover:border-orange-400";
                }
              )}
            </div>
          )}

          {/* 選択中の歯タグ表示 */}
          {!bridgeMode && checkedTeeth.size > 0 && (
            <div className="bg-purple-50 rounded-lg px-3 py-2 text-xs text-purple-700 flex flex-wrap gap-1 items-center">
              <span className="font-medium mr-1">選択中：</span>
              {Array.from(checkedTeeth).map((id) => {
                const t = ALL_TEETH.find((t) => t.id === id);
                return (
                  <span key={id} className="bg-white border border-purple-300 rounded px-1.5 py-0.5 flex items-center gap-1">
                    {t?.label ?? id}
                    <button type="button" onClick={() => toggleNormal(id)} className="text-purple-400 hover:text-purple-600">×</button>
                  </span>
                );
              })}
            </div>
          )}

          {bridgeMode && toothRoles.size > 0 && (
            <div className="bg-orange-50 rounded-lg px-3 py-2 text-xs space-y-1">
              {abutmentCount > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="font-semibold text-blue-700 mr-1">支台歯：</span>
                  {Array.from(toothRoles.entries()).filter(([, r]) => r === "abutment").map(([id]) => {
                    const t = ALL_TEETH.find((t) => t.id === id);
                    return (
                      <span key={id} className="bg-white border border-blue-300 text-blue-700 rounded px-1.5 py-0.5 flex items-center gap-1">
                        {t?.label ?? id}
                        <button type="button" onClick={() => toggleBridge(id)} className="text-blue-400 hover:text-blue-600">×</button>
                      </span>
                    );
                  })}
                </div>
              )}
              {ponticCount > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="font-semibold text-amber-700 mr-1">ポンティック：</span>
                  {Array.from(toothRoles.entries()).filter(([, r]) => r === "pontic").map(([id]) => {
                    const t = ALL_TEETH.find((t) => t.id === id);
                    return (
                      <span key={id} className="bg-white border border-amber-300 text-amber-700 rounded px-1.5 py-0.5 flex items-center gap-1">
                        {t?.label ?? id}
                        <button type="button" onClick={() => toggleBridge(id)} className="text-amber-400 hover:text-amber-600">×</button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* オプション */}
          {activeOptions.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
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

          {/* 治療選択・数量・追加 */}
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-28">
              <label className="block text-xs text-gray-500 mb-1">カテゴリ</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => { setSelectedCategoryId(Number(e.target.value) || ""); setSelectedTreatmentId(""); setSelectedOptionIds(new Set()); }}
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
                  onChange={(e) => { setSelectedTreatmentId(Number(e.target.value) || ""); setSelectedOptionIds(new Set()); }}
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
                {!bridgeMode && checkedTeeth.size > 0 && (
                  <span className="text-purple-500 ml-1">（自動: {checkedTeeth.size}）</span>
                )}
                {bridgeMode && (
                  <span className="text-orange-500 ml-1">（自動: 1）</span>
                )}
              </label>
              <input
                type="number"
                min={1}
                placeholder={bridgeMode ? "1" : String(checkedTeeth.size || 1)}
                value={quantityOverride}
                onChange={(e) => setQuantityOverride(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
                className="text-xs border border-gray-300 rounded px-2 py-1.5 w-20 text-center focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={
                (!bridgeMode && (checkedTeeth.size === 0 || !selectedTreatmentId)) ||
                (bridgeMode && (toothRoles.size === 0 || !selectedTreatmentId))
              }
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
