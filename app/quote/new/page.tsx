"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DentalChart from "@/components/DentalChart";
import TreatmentAssigner from "@/components/TreatmentAssigner";
import MultiToothAssigner from "@/components/MultiToothAssigner";
import PDFPreviewModal from "@/components/PDFPreviewModal";
import type { CategoryWithTreatments, QuoteLineItem } from "@/lib/types";
import { getToothById } from "@/lib/teeth";

const TAX_RATE = 0.1;
const NO_TOOTH_ID = "__none__";
const NO_TOOTH_LABEL = "部位指定なし";

interface Patient {
  id: number;
  code: string;
  name: string;
  memo: string | null;
}

function QuoteNewInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientIdParam = searchParams.get("patientId");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [categories, setCategories] = useState<CategoryWithTreatments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeeth, setSelectedTeeth] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<QuoteLineItem[]>([]);
  const [memo, setMemo] = useState("");
  const [step, setStep] = useState<"select" | "assign" | "confirm">("select");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [warrantyLoading, setWarrantyLoading] = useState(false);
  const [previewPdf, setPreviewPdf] = useState<{ url: string; filename: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [treatmentsRes] = await Promise.all([fetch("/api/treatments")]);
      setCategories(await treatmentsRes.json());

      if (patientIdParam) {
        const res = await fetch(`/api/patients/${patientIdParam}`);
        if (res.ok) setPatient(await res.json());
      }
      setLoading(false);
    };
    fetchData();
  }, [patientIdParam]);

  const toggleTooth = useCallback((id: string) => {
    setSelectedTeeth((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setItems((prev) => prev.filter((item) => item.toothId !== id));
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const addItem = useCallback((item: QuoteLineItem) => setItems((prev) => [...prev, item]), []);
  const removeItem = useCallback((index: number) => setItems((prev) => prev.filter((_, i) => i !== index)), []);
  const updateItem = useCallback((index: number, updated: Partial<QuoteLineItem>) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, ...updated } : item));
  }, []);

  async function saveQuote() {
    if (items.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: patient?.name ?? "（氏名未入力）",
          patientId: patient?.code ?? null,
          patientFkId: patient?.id ?? null,
          memo: memo || null,
          items: items.map((item) => ({
            treatmentId: item.treatmentId,
            toothLabel: item.toothLabel,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });
      const data = await res.json();
      setSaved(true);
      setSavedQuoteId(data.id);
    } finally {
      setSaving(false);
    }
  }

  function closePreview() {
    if (previewPdf) {
      URL.revokeObjectURL(previewPdf.url);
      setPreviewPdf(null);
    }
  }

  async function openPreviewWarranty() {
    setWarrantyLoading(true);
    try {
      const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
      const res = await fetch("/api/warranty-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: patient?.name ?? "（氏名未入力）",
          patientCode: patient?.code ?? "",
          issuedDate: today,
          treatmentDate: today,
          items: items.map((item) => ({ toothLabel: item.toothLabel, treatmentName: item.treatmentName })),
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewPdf({ url, filename: `補綴保証書_${patient?.code ?? "患者"}_${today.replace(/[年月日]/g, "-")}.pdf` });
    } finally {
      setWarrantyLoading(false);
    }
  }

  async function openPreviewPDF() {
    setPdfLoading(true);
    try {
      const createdAtStr = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, createdAt: createdAtStr }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewPdf({ url, filename: `見積書_${patient?.code ?? patient?.name ?? "患者"}_${createdAtStr.replace(/[年月日]/g, "-")}.pdf` });
    } finally {
      setPdfLoading(false);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = Math.floor(subtotal * TAX_RATE);
  const total = subtotal + tax;
  const selectedTeethArray = Array.from(selectedTeeth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <a href="/" className="text-sm text-gray-400 hover:text-gray-600 flex-shrink-0">← 戻る</a>
            {patient && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono flex-shrink-0">{patient.code}</span>
                <span className="font-semibold text-gray-800 text-sm truncate">{patient.name}</span>
              </div>
            )}
          </div>
          <StepIndicator current={step} />
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {step === "select" && (
          <>
            {/* メモ */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-3">① メモ（任意）</h2>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="備考など"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-1">
                ② 治療する歯をクリック
                {selectedTeeth.size > 0 && (
                  <span className="ml-2 text-sm font-normal text-blue-600">{selectedTeeth.size}本選択中</span>
                )}
              </h2>
              <p className="text-xs text-gray-400 mb-3">○＝乳歯　□＝永久歯（歯を選ばずに次へ進むことも可能です）</p>
              <div className="overflow-x-auto">
                <DentalChart selectedTeeth={selectedTeeth} onToggle={toggleTooth} />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep("assign")}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 shadow"
              >
                治療を割り当てる →
              </button>
            </div>
          </>
        )}

        {step === "assign" && (
          <>
            <button type="button" onClick={() => setStep("select")} className="text-sm text-gray-500 hover:text-gray-700">← 歯選択に戻る</button>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500 mb-2">歯をクリックして選択/解除できます</p>
              <div className="overflow-x-auto">
                <DentalChart selectedTeeth={selectedTeeth} onToggle={toggleTooth} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedTeethArray.map((toothId) => {
                const tooth = getToothById(toothId);
                if (!tooth) return null;
                return (
                  <TreatmentAssigner
                    key={toothId}
                    toothId={toothId}
                    toothLabel={tooth.label}
                    categories={categories}
                    existing={items.filter((i) => i.toothId === toothId)}
                    onAdd={addItem}
                    onRemove={removeItem}
                    onUpdate={updateItem}
                    globalItems={items}
                  />
                );
              })}
              <TreatmentAssigner
                key={NO_TOOTH_ID}
                toothId={NO_TOOTH_ID}
                toothLabel={NO_TOOTH_LABEL}
                categories={categories}
                existing={items.filter((i) => i.toothId === NO_TOOTH_ID)}
                onAdd={addItem}
                onRemove={removeItem}
                onUpdate={updateItem}
                globalItems={items}
                noTooth
              />
              <MultiToothAssigner categories={categories} onAdd={addItem} />
            </div>

            {items.some((i) => i.toothId === "__multi__") && (
              <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-purple-100">
                <h3 className="text-sm font-semibold text-purple-700 mb-3">🦷 複数歯・ブリッジ（登録済み）</h3>
                <div className="space-y-2">
                  {items.map((item, index) => {
                    if (item.toothId !== "__multi__") return null;
                    return (
                      <div key={index} className="flex flex-wrap items-center gap-2 bg-purple-50 rounded-lg px-3 py-2 text-xs">
                        <span className="font-medium text-purple-800 flex-1 min-w-0">{item.toothLabel}</span>
                        <span className="text-gray-700">{item.treatmentName}</span>
                        <span className="text-gray-500">¥{item.unitPrice.toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">×</span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value)) })}
                            className="w-12 text-center border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-purple-400"
                          />
                        </div>
                        <span className="font-semibold text-gray-800">¥{(item.unitPrice * item.quantity).toLocaleString()}</span>
                        <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 font-bold text-sm">×</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => setStep("confirm")}
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-40 shadow"
              >
                見積もり確認 →
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <button type="button" onClick={() => setStep("assign")} className="text-sm text-gray-500 hover:text-gray-700">← 治療割り当てに戻る</button>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">見積もり内容</h2>
                <div className="text-right text-xs text-gray-500 space-y-0.5">
                  {patient && <p>患者番号：{patient.code}</p>}
                  {patient && <p>氏名：{patient.name}</p>}
                  {memo && <p>メモ：{memo}</p>}
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 border-b">
                    <th className="text-left py-2 px-3">部位</th>
                    <th className="text-left py-2 px-3">治療内容</th>
                    <th className="text-left py-2 px-3">カテゴリ</th>
                    <th className="text-right py-2 px-3">数量</th>
                    <th className="text-right py-2 px-3">単価</th>
                    <th className="text-right py-2 px-3">小計</th>
                    <th className="py-2 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${item.isOption ? "bg-amber-50" : "hover:bg-gray-50"}`}>
                      <td className="py-2 px-3 text-xs">{item.isOption ? "" : item.toothLabel}</td>
                      <td className={`py-2 px-3 ${item.isOption ? "text-amber-700 text-xs pl-5" : ""}`}>{item.treatmentName}</td>
                      <td className="py-2 px-3 text-gray-500 text-xs">{item.isOption ? "" : item.categoryName}</td>
                      <td className="py-2 px-3 text-right">{item.quantity}</td>
                      <td className="py-2 px-3 text-right">¥{item.unitPrice.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-medium">¥{(item.unitPrice * item.quantity).toLocaleString()}</td>
                      <td className="py-2 px-2 text-center">
                        <button type="button" onClick={() => removeItem(i)} className="text-red-300 hover:text-red-500 text-base font-bold leading-none">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex flex-col items-end gap-1 text-sm">
                <div className="flex gap-8"><span className="text-gray-500">小計（税抜）</span><span>¥{subtotal.toLocaleString()}</span></div>
                <div className="flex gap-8"><span className="text-gray-500">消費税（10%）</span><span>¥{tax.toLocaleString()}</span></div>
                <div className="flex gap-8 text-base font-bold text-blue-700 border-t pt-2 mt-1">
                  <span>合計（税込）</span><span>¥{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
              {saved && patient && (
                <button
                  type="button"
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  className="px-6 py-3 rounded-xl border border-blue-300 text-sm text-blue-600 hover:bg-blue-50"
                >
                  患者ページへ戻る
                </button>
              )}
              <button
                type="button"
                onClick={saveQuote}
                disabled={saving || saved}
                className={`px-6 py-3 rounded-xl text-sm font-medium shadow ${
                  saved
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                }`}
              >
                {saving ? "保存中..." : saved ? "✓ 保存済み" : "履歴に保存"}
              </button>
              <button
                type="button"
                onClick={openPreviewWarranty}
                disabled={warrantyLoading}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60 shadow"
              >
                {warrantyLoading ? "生成中..." : "保証書をプレビュー"}
              </button>
              <button
                type="button"
                onClick={openPreviewPDF}
                disabled={pdfLoading}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 shadow"
              >
                {pdfLoading ? "生成中..." : "見積PDFをプレビュー"}
              </button>
            </div>
          </>
        )}
      </main>

      {/* PDFプレビュー */}
      {previewPdf && (
        <PDFPreviewModal url={previewPdf.url} filename={previewPdf.filename} onClose={closePreview} />
      )}
    </div>
  );
}

function StepIndicator({ current }: { current: "select" | "assign" | "confirm" }) {
  const steps = [
    { key: "select", label: "歯選択" },
    { key: "assign", label: "治療割当" },
    { key: "confirm", label: "確認・PDF" },
  ];
  return (
    <div className="flex gap-2 items-center">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-300">›</span>}
          <span className={`text-xs px-2 py-1 rounded-full ${current === s.key ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-400"}`}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function QuoteNewPage() {
  return (
    <Suspense>
      <QuoteNewInner />
    </Suspense>
  );
}
