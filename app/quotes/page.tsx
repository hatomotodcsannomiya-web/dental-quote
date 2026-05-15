"use client";

import { useState, useEffect, useCallback } from "react";

interface QuoteItem {
  id: number;
  toothLabel: string;
  quantity: number;
  unitPrice: number;
  treatment: { name: string; category: { name: string } };
}

interface Quote {
  id: number;
  patientName: string;
  patientId: string | null;
  memo: string | null;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  items: QuoteItem[];
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ patientId: "", patientName: "" });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.patientId) params.set("patientId", search.patientId);
    if (search.patientName) params.set("patientName", search.patientName);
    const res = await fetch(`/api/quotes?${params}`);
    const data = await res.json();
    setQuotes(data);
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ja-JP", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  async function downloadPDF(quote: Quote) {
    setPdfLoadingId(quote.id);
    try {
      const createdAt = new Date(quote.createdAt).toLocaleDateString("ja-JP", {
        year: "numeric", month: "long", day: "numeric",
      });
      const items = quote.items.map((item) => ({
        toothId: "",
        toothLabel: item.toothLabel,
        treatmentId: 0,
        treatmentName: item.treatment.name,
        categoryName: item.treatment.category.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
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
      a.download = `見積書_${quote.patientId ?? quote.patientName}_${quote.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoadingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-blue-600" title="ホーム">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v9a1 1 0 001 1h3a1 1 0 001-1v-4h2v4a1 1 0 001 1h3a1 1 0 001-1v-9m-9 2h4" />
              </svg>
            </a>
            <h1 className="text-lg font-bold text-gray-800">見積もり履歴</h1>
          </div>
          <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600">管理</a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">患者ID</label>
            <input
              type="text"
              value={search.patientId}
              onChange={(e) => setSearch((s) => ({ ...s, patientId: e.target.value }))}
              placeholder="例：P001"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">患者名</label>
            <input
              type="text"
              value={search.patientName}
              onChange={(e) => setSearch((s) => ({ ...s, patientName: e.target.value }))}
              placeholder="例：山田"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <button
            type="button"
            onClick={() => setSearch({ patientId: "", patientName: "" })}
            className="text-xs text-gray-400 hover:text-gray-600 pb-0.5"
          >
            クリア
          </button>
          <span className="text-xs text-gray-400 ml-auto pb-0.5">{quotes.length}件</span>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm text-center py-10">読み込み中...</p>
        ) : quotes.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">見積もりが見つかりません</p>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => (
              <div key={quote.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === quote.id ? null : quote.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-800">{quote.patientName}</span>
                      {quote.patientId && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{quote.patientId}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(quote.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-blue-700">¥{quote.total.toLocaleString()}<span className="text-xs font-normal text-gray-400">（税込）</span></p>
                    <p className="text-xs text-gray-400">{quote.items.length}項目</p>
                  </div>
                  <span className="text-gray-400 text-sm">{expandedId === quote.id ? "▲" : "▼"}</span>
                </div>

                {expandedId === quote.id && (
                  <div className="border-t border-gray-100 px-4 py-3">
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
                        <span className="font-semibold text-gray-700">合計 ¥{quote.total.toLocaleString()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadPDF(quote)}
                        disabled={pdfLoadingId === quote.id}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {pdfLoadingId === quote.id ? "生成中..." : "PDFダウンロード"}
                      </button>
                    </div>
                    {quote.memo && (
                      <p className="mt-2 text-xs text-gray-400 italic">メモ：{quote.memo}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
