"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import DentalChart from "@/components/DentalChart";
import TreatmentAssigner from "@/components/TreatmentAssigner";
import type { CategoryWithTreatments, QuoteLineItem } from "@/lib/types";
import type { ToothType } from "@/lib/teeth";
import { getToothById } from "@/lib/teeth";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);
const QuotePDF = dynamic(() => import("@/components/QuotePDF"), { ssr: false });

const TAX_RATE = 0.1;

export default function Home() {
  const [mode, setMode] = useState<ToothType>("permanent");
  const [selectedTeeth, setSelectedTeeth] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<CategoryWithTreatments[]>([]);
  const [items, setItems] = useState<QuoteLineItem[]>([]);
  const [patientName, setPatientName] = useState("");
  const [step, setStep] = useState<"select" | "assign" | "confirm">("select");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/treatments")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

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

  const addItem = useCallback((item: QuoteLineItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = Math.floor(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const createdAt = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const selectedTeethArray = Array.from(selectedTeeth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-600">治療メニューが登録されていません。</p>
        <a href="/admin" className="text-blue-600 underline text-sm">管理画面でメニューを登録する</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-blue-800">自費診療 見積書作成</h1>
          <StepIndicator current={step} />
          <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600">管理</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {step === "select" && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-3">① 患者名・モード選択</h2>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">患者名（PDF非表示）</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="例：山田 太郎"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">歯種</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setMode("permanent"); setSelectedTeeth(new Set()); setItems([]); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "permanent" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      永久歯
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode("deciduous"); setSelectedTeeth(new Set()); setItems([]); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "deciduous" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      乳歯
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-3">
                ② 治療する歯をクリック
                {selectedTeeth.size > 0 && (
                  <span className="ml-2 text-sm font-normal text-blue-600">
                    {selectedTeeth.size}本選択中
                  </span>
                )}
              </h2>
              <div className="overflow-x-auto">
                <DentalChart mode={mode} selectedTeeth={selectedTeeth} onToggle={toggleTooth} />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={selectedTeeth.size === 0}
                onClick={() => setStep("assign")}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow"
              >
                治療を割り当てる →
              </button>
            </div>
          </>
        )}

        {step === "assign" && (
          <>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep("select")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← 歯の選択に戻る
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 mb-2">
              <p className="text-xs text-gray-500 mb-2">歯をクリックして選択/解除できます</p>
              <div className="overflow-x-auto">
                <DentalChart mode={mode} selectedTeeth={selectedTeeth} onToggle={toggleTooth} />
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
                    globalItems={items}
                  />
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => setStep("confirm")}
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow"
              >
                見積もり確認 →
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <button
              type="button"
              onClick={() => setStep("assign")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← 治療割り当てに戻る
            </button>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">見積もり内容</h2>
                {patientName && (
                  <span className="text-sm text-gray-500">患者名：{patientName}</span>
                )}
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
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3">{item.toothLabel}</td>
                      <td className="py-2 px-3">{item.treatmentName}</td>
                      <td className="py-2 px-3 text-gray-500 text-xs">{item.categoryName}</td>
                      <td className="py-2 px-3 text-right">{item.quantity}</td>
                      <td className="py-2 px-3 text-right">¥{item.unitPrice.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-medium">¥{(item.unitPrice * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex flex-col items-end gap-1 text-sm">
                <div className="flex gap-8">
                  <span className="text-gray-500">小計（税抜）</span>
                  <span>¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex gap-8">
                  <span className="text-gray-500">消費税（10%）</span>
                  <span>¥{tax.toLocaleString()}</span>
                </div>
                <div className="flex gap-8 text-base font-bold text-blue-700 border-t pt-2 mt-1">
                  <span>合計（税込）</span>
                  <span>¥{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setStep("select");
                  setSelectedTeeth(new Set());
                  setItems([]);
                  setPatientName("");
                }}
                className="px-6 py-3 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
              >
                新しい見積もりを作成
              </button>

              <PDFDownloadLink
                document={<QuotePDF items={items} createdAt={createdAt} />}
                fileName={`見積書_${createdAt.replace(/[年月日]/g, "-")}.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <button
                    type="button"
                    disabled={pdfLoading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-all shadow"
                  >
                    {pdfLoading ? "PDF生成中..." : "PDFをダウンロード"}
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          </>
        )}
      </main>
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
          <span
            className={`text-xs px-2 py-1 rounded-full ${current === s.key ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-400"}`}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
