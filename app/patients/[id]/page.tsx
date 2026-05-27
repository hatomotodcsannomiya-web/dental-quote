"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import PDFPreviewModal from "@/components/PDFPreviewModal";
import { filterWarrantyItems, type WarrantyItem } from "@/lib/warrantyMap";

interface QuoteItem {
  id: number;
  toothLabel: string;
  quantity: number;
  unitPrice: number;
  treatmentName: string;
  treatment: { name: string; category: { name: string } } | null;
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

interface SavedWarranty {
  id: number;
  quoteId: number | null;
  patientName: string;
  patientCode: string;
  issuedDate: string;
  items: string;
  createdAt: string;
}

interface LabLaboratory {
  id: number;
  name: string;
  isActive: boolean;
}

interface Doctor {
  id: number;
  name: string;
  isActive: boolean;
}

interface LabMaterial {
  id: number;
  name: string;
  isActive: boolean;
}

interface TreatmentMaster {
  id: number;
  name: string;
}

interface LabOrderItemForm {
  toothLabel: string;
  treatmentName: string;
  material: string;
  shade: string;
  quantity: number;
  itemNote: string;
}

interface SavedLabOrder {
  id: number;
  quoteId: number | null;
  patientName: string;
  patientCode: string;
  doctorName: string;
  orderDate: string;
  dueDate: string;
  note: string | null;
  items: string;
  laboratory: { name: string } | null;
  createdAt: string;
}

const TECH_EXCLUDE_KEYWORDS = ["仮歯", "麻酔", "抜歯", "消毒", "レントゲン", "CT", "相談", "検査", "診断", "クリーニング", "ホワイトニング", "矯正装置", "インビザライン", "マウスピース", "シーラント"];

function filterLabItems(items: QuoteItem[]): LabOrderItemForm[] {
  return items
    .filter((item) => {
      const name = item.treatment?.name ?? item.treatmentName;
      if (!name) return false;
      if (name.startsWith("└ ")) return false;
      if (TECH_EXCLUDE_KEYWORDS.some((kw) => name.includes(kw))) return false;
      return true;
    })
    .map((item) => ({
      toothLabel: item.toothLabel,
      treatmentName: item.treatment?.name ?? item.treatmentName,
      material: "",
      shade: "",
      quantity: item.quantity,
      itemNote: "",
    }));
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [expandedQuoteId, setExpandedQuoteId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", memo: "" });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [quoteDeleteConfirmId, setQuoteDeleteConfirmId] = useState<number | null>(null);
  const [deletingQuoteId, setDeletingQuoteId] = useState<number | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);

  const [warrantyEditData, setWarrantyEditData] = useState<{ quote: Quote; items: WarrantyItem[] } | null>(null);
  const [warrantySubmitting, setWarrantySubmitting] = useState(false);
  const [previewPdf, setPreviewPdf] = useState<{ url: string; filename: string } | null>(null);

  const [warranties, setWarranties] = useState<SavedWarranty[]>([]);
  const [warrantyPdfLoadingId, setWarrantyPdfLoadingId] = useState<number | null>(null);
  const [warrantyDeleteConfirmId, setWarrantyDeleteConfirmId] = useState<number | null>(null);
  const [deletingWarrantyId, setDeletingWarrantyId] = useState<number | null>(null);

  // 技工指示書
  const [labOrders, setLabOrders] = useState<SavedLabOrder[]>([]);
  const [labs, setLabs] = useState<LabLaboratory[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [materials, setMaterials] = useState<LabMaterial[]>([]);
  const [treatments, setTreatments] = useState<TreatmentMaster[]>([]);
  const [labOrderForm, setLabOrderForm] = useState<{
    quote: Quote | null;
    laboratoryId: number | null;
    doctorId: number | null;
    orderDate: string;
    dueDate: string;
    note: string;
    items: LabOrderItemForm[];
  } | null>(null);
  const [labOrderSubmitting, setLabOrderSubmitting] = useState(false);
  const [labOrderPdfLoadingId, setLabOrderPdfLoadingId] = useState<number | null>(null);
  const [labOrderDeleteConfirmId, setLabOrderDeleteConfirmId] = useState<number | null>(null);
  const [deletingLabOrderId, setDeletingLabOrderId] = useState<number | null>(null);

  async function load() {
    const res = await fetch(`/api/patients/${id}`);
    if (!res.ok) { setNotFound(true); setLoading(false); return; }
    const data = await res.json();
    setPatient(data);
    setEditForm({ name: data.name, memo: data.memo ?? "" });
    setLoading(false);
  }

  async function loadWarranties() {
    const res = await fetch(`/api/warranties?patientId=${id}`);
    if (res.ok) setWarranties(await res.json());
  }

  async function loadLabOrders() {
    const res = await fetch(`/api/lab-orders?patientId=${id}`);
    if (res.ok) setLabOrders(await res.json());
  }

  async function loadMasters() {
    const [labsRes, doctorsRes, matsRes, treatsRes] = await Promise.all([
      fetch("/api/labs"),
      fetch("/api/doctors"),
      fetch("/api/lab-materials"),
      fetch("/api/treatments"),
    ]);
    if (labsRes.ok) { const all: LabLaboratory[] = await labsRes.json(); setLabs(all.filter((l) => l.isActive)); }
    if (doctorsRes.ok) { const all: Doctor[] = await doctorsRes.json(); setDoctors(all.filter((d) => d.isActive)); }
    if (matsRes.ok) { const all: LabMaterial[] = await matsRes.json(); setMaterials(all.filter((m) => m.isActive)); }
    if (treatsRes.ok) {
      const cats: { treatments: TreatmentMaster[] }[] = await treatsRes.json();
      const flat = cats.flatMap((c) => c.treatments);
      setTreatments(flat.filter((t: TreatmentMaster & { isActive?: boolean }) => t.isActive !== false));
    }
  }

  useEffect(() => { load(); loadWarranties(); loadLabOrders(); loadMasters(); }, [id]);

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

  async function handleDeletePatient() {
    setDeleting(true);
    await fetch(`/api/patients/${id}`, { method: "DELETE" });
    router.push("/patients");
  }

  async function handleDeleteQuote(quoteId: number) {
    setDeletingQuoteId(quoteId);
    await fetch(`/api/quotes/${quoteId}`, { method: "DELETE" });
    setDeletingQuoteId(null);
    setQuoteDeleteConfirmId(null);
    if (expandedQuoteId === quoteId) setExpandedQuoteId(null);
    load();
  }

  async function openPreviewPDF(quote: Quote) {
    setPdfLoadingId(quote.id);
    try {
      const createdAt = new Date(quote.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
      const items = quote.items.map((item) => ({
        toothId: "", toothLabel: item.toothLabel,
        treatmentId: 0, treatmentName: item.treatment?.name ?? item.treatmentName,
        categoryName: item.treatment?.category.name ?? "割引",
        quantity: item.quantity, unitPrice: item.unitPrice,
      }));
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, createdAt }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewPdf({ url, filename: `見積書_${patient?.code}_${quote.id}.pdf` });
    } finally {
      setPdfLoadingId(null);
    }
  }

  function openWarrantyForm(quote: Quote) {
    const defaultDate = new Date(quote.createdAt).toISOString().slice(0, 10);
    const rawItems = quote.items.map((item) => ({
      toothLabel: item.toothLabel,
      treatmentName: item.treatment?.name ?? item.treatmentName,
    }));
    const items = filterWarrantyItems(rawItems, defaultDate);
    if (items.length === 0) return;
    setWarrantyEditData({ quote, items });
  }

  async function submitWarrantyPDF() {
    if (!warrantyEditData) return;
    setWarrantySubmitting(true);
    try {
      const issuedDate = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
      const saveRes = await fetch("/api/warranties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient?.id ?? null,
          quoteId: warrantyEditData.quote.id,
          patientName: patient?.name ?? "",
          patientCode: patient?.code ?? "",
          issuedDate,
          items: warrantyEditData.items,
        }),
      });
      const saved = await saveRes.json();
      const pdfRes = await fetch(`/api/warranties/${saved.id}/pdf`);
      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      setPreviewPdf({ url, filename: `補綴保証書_${patient?.code}_${saved.id}.pdf` });
      setWarrantyEditData(null);
      loadWarranties();
    } finally {
      setWarrantySubmitting(false);
    }
  }

  async function handleDeleteWarranty(warrantyId: number) {
    setDeletingWarrantyId(warrantyId);
    await fetch(`/api/warranties/${warrantyId}`, { method: "DELETE" });
    setDeletingWarrantyId(null);
    setWarrantyDeleteConfirmId(null);
    loadWarranties();
  }

  async function downloadSavedWarrantyPDF(warranty: SavedWarranty) {
    setWarrantyPdfLoadingId(warranty.id);
    try {
      const res = await fetch(`/api/warranties/${warranty.id}/pdf`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewPdf({ url, filename: `補綴保証書_${warranty.patientCode}_${warranty.id}.pdf` });
    } finally {
      setWarrantyPdfLoadingId(null);
    }
  }

  // 技工指示書フォームを開く（見積もりから）
  function openLabOrderFromQuote(quote: Quote) {
    const today = new Date().toISOString().slice(0, 10);
    setLabOrderForm({
      quote,
      laboratoryId: null,
      doctorId: null,
      orderDate: today,
      dueDate: "",
      note: "",
      items: filterLabItems(quote.items),
    });
  }

  // 技工指示書フォームを開く（独立作成）
  function openLabOrderNew() {
    const today = new Date().toISOString().slice(0, 10);
    setLabOrderForm({
      quote: null,
      laboratoryId: null,
      doctorId: null,
      orderDate: today,
      dueDate: "",
      note: "",
      items: [{ toothLabel: "", treatmentName: "", material: "", shade: "", quantity: 1, itemNote: "" }],
    });
  }

  function addLabOrderItem() {
    setLabOrderForm((prev) => prev ? {
      ...prev,
      items: [...prev.items, { toothLabel: "", treatmentName: "", material: "", shade: "", quantity: 1, itemNote: "" }],
    } : null);
  }

  function removeLabOrderItem(idx: number) {
    setLabOrderForm((prev) => prev ? {
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    } : null);
  }

  function updateLabOrderItem(idx: number, field: keyof LabOrderItemForm, value: string | number) {
    setLabOrderForm((prev) => prev ? {
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    } : null);
  }

  async function submitLabOrder() {
    if (!labOrderForm || !patient) return;
    if (!labOrderForm.orderDate || !labOrderForm.dueDate) return;
    setLabOrderSubmitting(true);
    try {
      const lab = labs.find((l) => l.id === labOrderForm.laboratoryId);
      const doctor = doctors.find((d) => d.id === labOrderForm.doctorId);
      const doctorName = doctor?.name ?? "";
      const createdAt = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });

      const saveRes = await fetch("/api/lab-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          quoteId: labOrderForm.quote?.id ?? null,
          laboratoryId: labOrderForm.laboratoryId,
          patientName: patient.name,
          patientCode: patient.code,
          doctorName,
          orderDate: labOrderForm.orderDate,
          dueDate: labOrderForm.dueDate,
          note: labOrderForm.note,
          items: labOrderForm.items,
        }),
      });
      const saved = await saveRes.json();

      const pdfRes = await fetch("/api/lab-order-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: patient.name,
          patientCode: patient.code,
          laboratoryName: lab?.name ?? "",
          doctorName,
          orderDate: labOrderForm.orderDate,
          dueDate: labOrderForm.dueDate,
          note: labOrderForm.note,
          items: labOrderForm.items,
          createdAt,
        }),
      });
      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      setPreviewPdf({ url, filename: `技工指示書_${patient.code}_${saved.id}.pdf` });
      setLabOrderForm(null);
      loadLabOrders();
    } finally {
      setLabOrderSubmitting(false);
    }
  }

  async function viewLabOrderPDF(order: SavedLabOrder) {
    setLabOrderPdfLoadingId(order.id);
    try {
      const items = JSON.parse(order.items) as LabOrderItemForm[];
      const createdAt = new Date(order.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
      const res = await fetch("/api/lab-order-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: order.patientName,
          patientCode: order.patientCode,
          laboratoryName: order.laboratory?.name ?? "",
          doctorName: order.doctorName,
          orderDate: order.orderDate,
          dueDate: order.dueDate,
          note: order.note ?? "",
          items,
          createdAt,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewPdf({ url, filename: `技工指示書_${order.patientCode}_${order.id}.pdf` });
    } finally {
      setLabOrderPdfLoadingId(null);
    }
  }

  async function handleDeleteLabOrder(labOrderId: number) {
    setDeletingLabOrderId(labOrderId);
    await fetch(`/api/lab-orders/${labOrderId}`, { method: "DELETE" });
    setDeletingLabOrderId(null);
    setLabOrderDeleteConfirmId(null);
    loadLabOrders();
  }

  function closePreview() {
    if (previewPdf) {
      URL.revokeObjectURL(previewPdf.url);
      setPreviewPdf(null);
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

  const quoteToDelete = quoteDeleteConfirmId ? patient.quotes.find((q) => q.id === quoteDeleteConfirmId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-blue-600" title="ホーム">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v9a1 1 0 001 1h3a1 1 0 001-1v-4h2v4a1 1 0 001 1h3a1 1 0 001-1v-9m-9 2h4" />
              </svg>
            </a>
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
                <button type="button" onClick={() => setEditing(true)} className="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 px-3 py-1 rounded-lg">編集</button>
                <button type="button" onClick={() => setShowDeleteConfirm(true)} className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1 rounded-lg">削除</button>
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
                <input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">メモ</label>
                <input type="text" value={editForm.memo} onChange={(e) => setEditForm((f) => ({ ...f, memo: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(false)} className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50">キャンセル</button>
                <button type="button" onClick={handleEditSave} disabled={saving} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">{saving ? "保存中..." : "保存"}</button>
              </div>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={openLabOrderNew}
            className="bg-purple-600 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-purple-700 shadow flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            技工指示書を作成
          </button>
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
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">まだ見積もりがありません</div>
          ) : (
            <div className="space-y-3">
              {patient.quotes.map((quote) => (
                <div key={quote.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedQuoteId(expandedQuoteId === quote.id ? null : quote.id)}>
                      <p className="text-xs text-gray-400">{formatDate(quote.createdAt)}</p>
                      {quote.memo && <p className="text-xs text-gray-500 mt-0.5">{quote.memo}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{quote.items.length}項目</p>
                    </div>
                    <div className="text-right shrink-0 cursor-pointer" onClick={() => setExpandedQuoteId(expandedQuoteId === quote.id ? null : quote.id)}>
                      <p className="text-sm font-bold text-blue-700">¥{quote.total.toLocaleString()}<span className="text-xs font-normal text-gray-400">（税込）</span></p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setQuoteDeleteConfirmId(quote.id); }} className="text-red-300 hover:text-red-500 text-sm font-bold shrink-0 px-1" title="この見積を削除">×</button>
                    <span className="text-gray-400 text-sm cursor-pointer" onClick={() => setExpandedQuoteId(expandedQuoteId === quote.id ? null : quote.id)}>
                      {expandedQuoteId === quote.id ? "▲" : "▼"}
                    </span>
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
                          {quote.items.map((item, i) => {
                            const isDiscount = item.unitPrice < 0;
                            return (
                            <tr key={i} className={`border-b border-gray-50 ${isDiscount ? "bg-red-50" : ""}`}>
                              <td className="py-1">{item.toothLabel}</td>
                              <td className={`py-1 ${isDiscount ? "text-red-700 font-medium" : ""}`}>
                                {isDiscount && <span className="text-xs mr-0.5">▼</span>}{item.treatment?.name ?? item.treatmentName}
                              </td>
                              <td className="py-1 text-right">{item.quantity}</td>
                              <td className={`py-1 text-right ${isDiscount ? "text-red-600" : ""}`}>¥{item.unitPrice.toLocaleString()}</td>
                              <td className={`py-1 text-right ${isDiscount ? "text-red-600" : ""}`}>¥{(item.unitPrice * item.quantity).toLocaleString()}</td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 space-x-4">
                          <span>税抜 ¥{quote.subtotal.toLocaleString()}</span>
                          <span>税 ¥{quote.tax.toLocaleString()}</span>
                          <span className="font-semibold">合計 ¥{quote.total.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => openLabOrderFromQuote(quote)} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700">技工指示書</button>
                          <button type="button" onClick={() => openWarrantyForm(quote)} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">保証書</button>
                          <button type="button" onClick={() => openPreviewPDF(quote)} disabled={pdfLoadingId === quote.id} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
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

        {/* 技工指示書履歴 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            技工指示書履歴
            <span className="ml-2 text-gray-400 font-normal">{labOrders.length}件</span>
          </h2>
          {labOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">まだ技工指示書がありません</div>
          ) : (
            <div className="space-y-2">
              {labOrders.map((order) => {
                const items = JSON.parse(order.items) as LabOrderItemForm[];
                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">
                        {order.laboratory?.name ?? "技工所未指定"}
                        <span className="ml-2 text-xs text-gray-400">納品: {order.dueDate}</span>
                      </p>
                      <p className="text-xs text-gray-400">{items.length}項目 · 発注: {order.orderDate}{order.doctorName ? ` · ${order.doctorName}` : ""}</p>
                    </div>
                    <button type="button" onClick={() => viewLabOrderPDF(order)} disabled={labOrderPdfLoadingId === order.id} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 shrink-0">
                      {labOrderPdfLoadingId === order.id ? "読込中..." : "プレビュー"}
                    </button>
                    <button type="button" onClick={() => setLabOrderDeleteConfirmId(order.id)} className="text-red-300 hover:text-red-500 text-sm font-bold shrink-0 px-1" title="この技工指示書を削除">×</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 保証書履歴 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            保証書履歴
            <span className="ml-2 text-gray-400 font-normal">{warranties.length}件</span>
          </h2>
          {warranties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">まだ保証書がありません</div>
          ) : (
            <div className="space-y-2">
              {warranties.map((w) => {
                const parsedItems = JSON.parse(w.items) as WarrantyItem[];
                return (
                  <div key={w.id} className="bg-white rounded-xl shadow-sm px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{w.issuedDate}</p>
                      <p className="text-xs text-gray-400">{parsedItems.length}項目</p>
                    </div>
                    <button type="button" onClick={() => downloadSavedWarrantyPDF(w)} disabled={warrantyPdfLoadingId === w.id} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 shrink-0">
                      {warrantyPdfLoadingId === w.id ? "読込中..." : "プレビュー"}
                    </button>
                    <a href={`/api/warranties/${w.id}/pdf`} download={`補綴保証書_${w.patientCode}_${w.id}.pdf`} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 shrink-0">
                      ダウンロード
                    </a>
                    <button type="button" onClick={() => setWarrantyDeleteConfirmId(w.id)} className="text-red-300 hover:text-red-500 text-sm font-bold shrink-0 px-1" title="この保証書を削除">×</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PDFプレビュー */}
      {previewPdf && <PDFPreviewModal url={previewPdf.url} filename={previewPdf.filename} onClose={closePreview} />}

      {/* ===== 技工指示書作成モーダル ===== */}
      {labOrderForm && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-4">
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">
                技工指示書を作成
                {labOrderForm.quote && <span className="ml-2 text-xs text-gray-400 font-normal">（見積 #{labOrderForm.quote.id} より）</span>}
              </h2>
              <button type="button" onClick={() => setLabOrderForm(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">技工所</label>
                  <select
                    value={labOrderForm.laboratoryId ?? ""}
                    onChange={(e) => setLabOrderForm((p) => p ? { ...p, laboratoryId: e.target.value ? Number(e.target.value) : null } : null)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">選択してください</option>
                    {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">担当医</label>
                  <select
                    value={labOrderForm.doctorId ?? ""}
                    onChange={(e) => setLabOrderForm((p) => p ? { ...p, doctorId: e.target.value ? Number(e.target.value) : null } : null)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">選択してください</option>
                    {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">発注日 <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={labOrderForm.orderDate}
                    onChange={(e) => setLabOrderForm((p) => p ? { ...p, orderDate: e.target.value } : null)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">納品希望日 <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={labOrderForm.dueDate}
                    onChange={(e) => setLabOrderForm((p) => p ? { ...p, dueDate: e.target.value } : null)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              {/* 指示内容 — カード式（縦並び） */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-600">指示内容</p>
                  <button type="button" onClick={addLabOrderItem} className="text-xs text-purple-600 hover:text-purple-800 border border-purple-200 px-2 py-0.5 rounded">
                    + 行を追加
                  </button>
                </div>
                <div className="space-y-3">
                  {labOrderForm.items.map((item, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-purple-700">#{i + 1}</span>
                        <button type="button" onClick={() => removeLabOrderItem(i)} disabled={labOrderForm.items.length <= 1} className="text-xs text-red-400 hover:text-red-600 disabled:opacity-30">削除</button>
                      </div>
                      {/* 1行目: 部位 + 処置名 */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-0.5">部位</label>
                          <input
                            type="text"
                            value={item.toothLabel}
                            onChange={(e) => updateLabOrderItem(i, "toothLabel", e.target.value)}
                            placeholder="例：上6"
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-full bg-white focus:outline-none focus:ring-1 focus:ring-purple-300"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-0.5">処置名</label>
                          <select
                            value={item.treatmentName}
                            onChange={(e) => updateLabOrderItem(i, "treatmentName", e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-full bg-white focus:outline-none focus:ring-1 focus:ring-purple-300"
                          >
                            <option value="">選択 or 下で入力</option>
                            {treatments.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                          </select>
                        </div>
                      </div>
                      {/* 処置名 自由入力フォールバック */}
                      {!treatments.find((t) => t.name === item.treatmentName) && (
                        <div>
                          <label className="block text-xs text-gray-400 mb-0.5">処置名（直接入力）</label>
                          <input
                            type="text"
                            value={item.treatmentName}
                            onChange={(e) => updateLabOrderItem(i, "treatmentName", e.target.value)}
                            placeholder="例：ジルコニアクラウン"
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-full bg-white focus:outline-none focus:ring-1 focus:ring-purple-300"
                          />
                        </div>
                      )}
                      {/* 2行目: 素材 + シェード + 数量 */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-0.5">素材</label>
                          <select
                            value={item.material}
                            onChange={(e) => updateLabOrderItem(i, "material", e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-full bg-white focus:outline-none focus:ring-1 focus:ring-purple-300"
                          >
                            <option value="">選択 or 入力</option>
                            {materials.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-0.5">シェード</label>
                          <input
                            type="text"
                            value={item.shade}
                            onChange={(e) => updateLabOrderItem(i, "shade", e.target.value)}
                            placeholder="例：A2"
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-full bg-white focus:outline-none focus:ring-1 focus:ring-purple-300"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-0.5">数量</label>
                          <input
                            type="number"
                            value={item.quantity}
                            min={1}
                            onChange={(e) => updateLabOrderItem(i, "quantity", Number(e.target.value))}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-full bg-white text-center focus:outline-none focus:ring-1 focus:ring-purple-300"
                          />
                        </div>
                      </div>
                      {/* 素材 自由入力フォールバック */}
                      {item.material && !materials.find((m) => m.name === item.material) && (
                        <div>
                          <label className="block text-xs text-gray-400 mb-0.5">素材（直接入力）</label>
                          <input
                            type="text"
                            value={item.material}
                            onChange={(e) => updateLabOrderItem(i, "material", e.target.value)}
                            placeholder="例：ジルコニア"
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-full bg-white focus:outline-none focus:ring-1 focus:ring-purple-300"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 特記事項 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">特記事項</label>
                <textarea
                  value={labOrderForm.note}
                  onChange={(e) => setLabOrderForm((p) => p ? { ...p, note: e.target.value } : null)}
                  rows={3}
                  placeholder="例：色調は隣在歯に合わせてください"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>
            </div>

            {/* フッターボタン */}
            <div className="flex gap-3 px-6 pb-5">
              <button type="button" onClick={() => setLabOrderForm(null)} disabled={labOrderSubmitting} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">
                キャンセル
              </button>
              <button type="button" onClick={submitLabOrder} disabled={labOrderSubmitting || !labOrderForm.orderDate || !labOrderForm.dueDate} className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50">
                {labOrderSubmitting ? "保存中..." : "保存してPDF生成"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 保証書セット日編集モーダル */}
      {warrantyEditData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col">
            <h2 className="text-base font-bold text-gray-800 mb-2">セット日を確認・編集</h2>
            <p className="text-xs text-gray-400 mb-4">各治療のセット日を入力してください。</p>
            <div className="overflow-y-auto flex-1 space-y-2 mb-4">
              {warrantyEditData.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{item.toothLabel} {item.treatmentName}</p>
                  </div>
                  <input
                    type="date"
                    value={item.treatmentDate}
                    onChange={(e) => setWarrantyEditData((prev) => prev ? {
                      ...prev,
                      items: prev.items.map((it, idx) => idx === i ? { ...it, treatmentDate: e.target.value } : it),
                    } : null)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setWarrantyEditData(null)} disabled={warrantySubmitting} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">キャンセル</button>
              <button type="button" onClick={submitWarrantyPDF} disabled={warrantySubmitting} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50">{warrantySubmitting ? "保存中..." : "保存して生成"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 患者削除確認 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-base font-bold text-gray-800 mb-2">患者を削除しますか？</h2>
            <p className="text-sm text-gray-500 mb-1"><span className="font-semibold text-gray-700">{patient.name}</span>（{patient.code}）を削除します。</p>
            <p className="text-xs text-gray-400 mb-5">この操作は取り消せません。関連する見積データとの紐付けも解除されます。</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">キャンセル</button>
              <button type="button" onClick={handleDeletePatient} disabled={deleting} className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50">{deleting ? "削除中..." : "削除する"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 保証書削除確認 */}
      {warrantyDeleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-base font-bold text-gray-800 mb-2">保証書を削除しますか？</h2>
            <p className="text-xs text-gray-400 mb-5">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setWarrantyDeleteConfirmId(null)} disabled={!!deletingWarrantyId} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">キャンセル</button>
              <button type="button" onClick={() => handleDeleteWarranty(warrantyDeleteConfirmId)} disabled={!!deletingWarrantyId} className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50">{deletingWarrantyId ? "削除中..." : "削除する"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 技工指示書削除確認 */}
      {labOrderDeleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-base font-bold text-gray-800 mb-2">技工指示書を削除しますか？</h2>
            <p className="text-xs text-gray-400 mb-5">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setLabOrderDeleteConfirmId(null)} disabled={!!deletingLabOrderId} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">キャンセル</button>
              <button type="button" onClick={() => handleDeleteLabOrder(labOrderDeleteConfirmId)} disabled={!!deletingLabOrderId} className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50">{deletingLabOrderId ? "削除中..." : "削除する"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 見積削除確認 */}
      {quoteDeleteConfirmId && quoteToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-base font-bold text-gray-800 mb-2">見積を削除しますか？</h2>
            <p className="text-sm text-gray-500 mb-1">{formatDate(quoteToDelete.createdAt)} の見積を削除します。</p>
            <p className="text-xs text-gray-400 mb-5">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setQuoteDeleteConfirmId(null)} disabled={!!deletingQuoteId} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">キャンセル</button>
              <button type="button" onClick={() => handleDeleteQuote(quoteDeleteConfirmId)} disabled={!!deletingQuoteId} className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50">{deletingQuoteId ? "削除中..." : "削除する"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
