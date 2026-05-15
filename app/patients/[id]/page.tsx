"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface QuoteItem {
  id: number;
  toothLabel: string;
  quantity: number;
  unitPrice: number;
  treatment: { name: string; category: { name: string } };
}

interface Quote {
  id: number;
  memo: string | null;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  items: QuoteItem[];
}

interface Patient {
  id: number;
  code: string;
  name: string;
  memo: string | null;
  createdAt: string;
  quotes: Quote[];
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [expandedQuoteId, setExpandedQuoteId] = useState<number | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);
  const [warrantyLoadingId, setWarrantyLoadingId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", memo: "" });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const res = await fetch(`/api/patients/${id}`);
    if (!res.ok) { setNotFound(true); setLoading(false); return; }
    const data = await res.json();
    setPatient(data);
    setEditForm({ name: data.name, memo: data.memo ?? "" });
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function handleEditSave() {
    if (!editForm.name.trim()) return;
    setSaving(true);
    await fetch(`/api/patients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editForm.name, memo: editForm.memo }),
    });
    setSaving(false);
    setEditing(false);
    load();
  }

  async function downloadWarranty(quote: Quote) {
    setWarrantyLoadingId(quote.id);
    try {
      const issuedDate = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
      const treatmentDate = new Date(quote.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
      const items = quote.items.map((item) => ({
        toothLabel: item.toothLabel,
        treatmentName: item.treatment.name,
      }));
      const res = await fetch("/api/warranty-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: patient?.name ?? "",
          patientCode: patient?.code ?? "",
          issuedDate,
          treatmentDate,
          items,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `補綴保証書_${patient?.code}_${quote.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setWarrantyLoadingId(null);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/patients/${id}`, { method: "DELETE" });
    router.push("/patients");
  }

  async function downloadPDF(quote: Quote) {
    setPdfLoadingId(quote.id);
    try {
      const createdAt = new Date(quote.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
      const items = quote.items.map((item) => ({
        toothId: "", toothLabel: item.toothLabel,
        treatmentId: 0, treatmentName: item.treatment.name,
        categoryName: item.treatment.category.name,
        quantity: item.quantity, unitPrice: item.unitPrice,
      }));
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, createdAt }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `見積書_${patient?.code}_${quote.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoadingId(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-gray-500">患者が見つかりません</p>
      <a href="/patients" className="text-blue-600 text-sm hover:underline">患者一覧へ</a>
    </div>
  );

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/patients" className="text-sm text-gray-400 hover:text-gray-600">← 患者一覧</a>
          </div>
          <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600">管理</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* 患者情報 */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          {!editing ? (
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">{patient.code}</span>
                  <h1 className="text-xl font-bold text-gray-800">{patient.name}</h1>
                </div>
                {patient.memo && <p className="text-sm text-gray-500 mt-1">{patient.memo}</p>}
                <p className="text-xs text-gray-300 mt-2">登録：{formatDate(patient.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 px-3 py-1 rounded-lg"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1 rounded-lg"
                >
                  削除
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">{patient.code}</span>
                <span className="text-xs text-gray-400">（番号は変更できません）</span>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">氏名</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">メモ</label>
                <input
                  type="text"
                  value={editForm.memo}
                  onChange={(e) => setEditForm((f) => ({ ...f, memo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(false)} className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50">キャンセル</button>
                <button type="button" onClick={handleEditSave} disabled={saving} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "保存中..." : "保存"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 新規見積もりボタン */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push(`/quote/new?patientId=${patient.id}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 shadow flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            新規見積もりを作成
          </button>
        </div>

        {/* 見積履歴 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            見積履歴
            <span className="ml-2 text-gray-400 font-normal">{patient.quotes.length}件</span>
          </h2>

          {patient.quotes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
              まだ見積もりがありません
            </div>
          ) : (
            <div className="space-y-3">
              {patient.quotes.map((quote) => (
                <div key={quote.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div
                    className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedQuoteId(expandedQuoteId === quote.id ? null : quote.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">{formatDate(quote.createdAt)}</p>
                      {quote.memo && <p className="text-xs text-gray-500 mt-0.5">{quote.memo}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{quote.items.length}項目</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-blue-700">¥{quote.total.toLocaleString()}<span className="text-xs font-normal text-gray-400">（税込）</span></p>
                    </div>
                    <span className="text-gray-400 text-sm">{expandedQuoteId === quote.id ? "▲" : "▼"}</span>
                  </div>

                  {expandedQuoteId === quote.id && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      <table className="w-full text-xs mb-3">
                        <thead>
                          <tr className="text-gray-400 border-b">
                            <th className="text-left py-1">部位</th>
                            <th className="text-left py-1">治療内容</th>
                            <th className="text-right py-1">数量</th>
                            <th className="text-right py-1">単価</th>
                            <th className="text-right py-1">小計</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quote.items.map((item, i) => (
                            <tr key={i} className="border-b border-gray-50">
                              <td className="py-1">{item.toothLabel}</td>
                              <td className="py-1">{item.treatment.name}</td>
                              <td className="py-1 text-right">{item.quantity}</td>
                              <td className="py-1 text-right">¥{item.unitPrice.toLocaleString()}</td>
                              <td className="py-1 text-right">¥{(item.unitPrice * item.quantity).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 space-x-4">
                          <span>税抜 ¥{quote.subtotal.toLocaleString()}</span>
                          <span>税 ¥{quote.tax.toLocaleString()}</span>
                          <span className="font-semibold">合計 ¥{quote.total.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => downloadWarranty(quote)}
                            disabled={warrantyLoadingId === quote.id}
                            className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {warrantyLoadingId === quote.id ? "生成中..." : "保証書"}
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadPDF(quote)}
                            disabled={pdfLoadingId === quote.id}
                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {pdfLoadingId === quote.id ? "生成中..." : "見積PDF"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-base font-bold text-gray-800 mb-2">患者を削除しますか？</h2>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-semibold text-gray-700">{patient.name}</span>（{patient.code}）を削除します。
            </p>
            <p className="text-xs text-gray-400 mb-5">この操作は取り消せません。関連する見積データとの紐付けも解除されます。</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
