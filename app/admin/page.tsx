"use client";

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CategoryWithTreatments, TreatmentItem, TreatmentOption } from "@/lib/types";

type AdminTab = "categories" | "treatments" | "labs" | "doctors" | "materials" | "password";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<AdminTab>("treatments");
  const [categories, setCategories] = useState<CategoryWithTreatments[]>([]);
  const [loading, setLoading] = useState(false);
  const dataLoadedRef = useRef(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const { success } = await res.json();
    if (success) {
      setAuthed(true);
      loadData();
    } else {
      setAuthError("パスワードが違います");
    }
  }

  async function loadData() {
    if (!dataLoadedRef.current) setLoading(true);
    const res = await fetch("/api/treatments");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
    dataLoadedRef.current = true;
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow p-8 w-80">
          <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">管理画面</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
            </div>
            {authError && <p className="text-red-500 text-xs">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              ログイン
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/" className="text-xs text-gray-400 hover:text-gray-600">← 見積もり作成に戻る</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">管理画面</h1>
          <a href="/" className="text-xs text-blue-600 hover:underline">← 見積もり作成</a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {([
            { key: "treatments", label: "治療メニュー" },
            { key: "categories", label: "カテゴリ管理" },
            { key: "labs", label: "技工所管理" },
            { key: "doctors", label: "担当医管理" },
            { key: "materials", label: "素材管理" },
            { key: "password", label: "パスワード変更" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">読み込み中...</p>
        ) : (
          <>
            {tab === "categories" && <CategoriesTab categories={categories} onReload={loadData} />}
            {tab === "treatments" && <TreatmentsTab categories={categories} onReload={loadData} />}
            {tab === "labs" && <LabsTab />}
            {tab === "doctors" && <DoctorsTab />}
            {tab === "materials" && <MaterialsTab />}
            {tab === "password" && <PasswordTab />}
          </>
        )}
      </div>
    </div>
  );
}

function CategoriesTab({ categories, onReload }: { categories: CategoryWithTreatments[]; onReload: () => void }) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  async function addCategory() {
    if (!newName.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), sortOrder: categories.length }),
    });
    setNewName("");
    onReload();
  }

  async function updateCategory(id: number) {
    await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    setEditingId(null);
    onReload();
  }

  async function deleteCategory(id: number) {
    if (!confirm("このカテゴリを削除しますか？（配下の治療項目も削除されます）")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    onReload();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">カテゴリ管理</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新しいカテゴリ名"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
        />
        <button
          type="button"
          onClick={addCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          追加
        </button>
      </div>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 py-2 border-b border-gray-100">
            {editingId === cat.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border border-blue-300 rounded px-2 py-1 text-sm flex-1 focus:outline-none"
                  autoFocus
                />
                <button type="button" onClick={() => updateCategory(cat.id)} className="text-xs text-blue-600 hover:text-blue-800">保存</button>
                <button type="button" onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-gray-600">キャンセル</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.treatments.length}件</span>
                <button type="button" onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="text-xs text-blue-500 hover:text-blue-700">編集</button>
                <button type="button" onClick={() => deleteCategory(cat.id)} className="text-xs text-red-400 hover:text-red-600">削除</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ドラッグハンドルアイコン
function GripIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

interface SortableRowProps {
  t: TreatmentItem;
  editingId: number | null;
  form: { name: string; categoryId: number; unitPrice: number; unit: string };
  setEditingId: (id: number | null) => void;
  setForm: (f: { name: string; categoryId: number; unitPrice: number; unit: string }) => void;
  updateTreatment: (id: number) => void;
  toggleActive: (t: TreatmentItem) => void;
  deleteTreatment: (id: number) => void;
  toggleOptions: (id: number) => void;
  expandedOptionsId: number | null;
  loadedOptions: Record<number, TreatmentOption[]>;
  editingOptionId: number | null;
  optionForm: { name: string; price: number };
  setEditingOptionId: (id: number | null) => void;
  setOptionForm: (f: { name: string; price: number }) => void;
  updateOption: (treatmentId: number, optionId: number) => void;
  deleteOption: (treatmentId: number, optionId: number) => void;
  newOptionForms: Record<number, { name: string; price: string }>;
  setNewOptionForms: React.Dispatch<React.SetStateAction<Record<number, { name: string; price: string }>>>;
  addOption: (treatmentId: number) => void;
}

function SortableTreatmentRow(props: SortableRowProps) {
  const { t, editingId, form, setEditingId, setForm, updateTreatment, toggleActive, deleteTreatment,
    toggleOptions, expandedOptionsId, loadedOptions, editingOptionId, optionForm,
    setEditingOptionId, setOptionForm, updateOption, deleteOption, newOptionForms, setNewOptionForms, addOption } = props;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: t.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border ${!t.isActive ? "opacity-50 border-gray-100" : "border-gray-100"} ${isDragging ? "shadow-lg z-10 bg-white" : ""}`}
    >
      {/* 治療行 */}
      <div className={`flex items-center gap-2 py-2 px-2 ${!t.isActive ? "bg-gray-50" : "bg-white"}`}>
        {editingId !== t.id && (
          <button
            {...attributes}
            {...listeners}
            type="button"
            className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
            tabIndex={-1}
          >
            <GripIcon />
          </button>
        )}
        {editingId === t.id ? (
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded px-2 py-1 text-xs col-span-2" />
            <input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} onFocus={(e) => e.target.select()} className="border rounded px-2 py-1 text-xs" />
            <input type="text" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="border rounded px-2 py-1 text-xs" />
            <div className="col-span-2 flex gap-2">
              <button type="button" onClick={() => updateTreatment(t.id)} className="text-xs text-blue-600 hover:text-blue-800">保存</button>
              <button type="button" onClick={() => setEditingId(null)} className="text-xs text-gray-400">キャンセル</button>
            </div>
          </div>
        ) : (
          <>
            <span className="flex-1 text-sm">{t.name}</span>
            <span className="text-xs text-gray-500">¥{t.unitPrice.toLocaleString()}/{t.unit}</span>
            <button
              type="button"
              onClick={() => toggleOptions(t.id)}
              className={`text-xs px-2 py-0.5 rounded border ${expandedOptionsId === t.id ? "border-purple-300 text-purple-700 bg-purple-50" : "border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600"}`}
            >
              オプション {t.options.length > 0 ? `(${t.options.length})` : ""}
            </button>
            <button type="button" onClick={() => { setEditingId(t.id); setForm({ name: t.name, categoryId: t.categoryId, unitPrice: t.unitPrice, unit: t.unit }); }} className="text-xs text-blue-500 hover:text-blue-700">編集</button>
            <button type="button" onClick={() => toggleActive(t)} className={`text-xs ${t.isActive ? "text-orange-400 hover:text-orange-600" : "text-green-500 hover:text-green-700"}`}>
              {t.isActive ? "無効化" : "有効化"}
            </button>
            <button type="button" onClick={() => deleteTreatment(t.id)} className="text-xs text-red-400 hover:text-red-600">削除</button>
          </>
        )}
      </div>

      {/* オプションパネル */}
      {expandedOptionsId === t.id && (
        <div className="border-t border-gray-100 bg-purple-50 px-4 py-3">
          <p className="text-xs font-semibold text-purple-700 mb-2">オプション管理</p>

          {(loadedOptions[t.id] ?? []).length === 0 ? (
            <p className="text-xs text-gray-400 mb-2">オプションなし</p>
          ) : (
            <div className="space-y-1 mb-3">
              {(loadedOptions[t.id] ?? []).map((opt) => (
                <div key={opt.id} className="flex items-center gap-2 bg-white rounded px-2 py-1.5 border border-purple-100">
                  {editingOptionId === opt.id ? (
                    <>
                      <input
                        type="text"
                        value={optionForm.name}
                        onChange={(e) => setOptionForm({ ...optionForm, name: e.target.value })}
                        className="border rounded px-2 py-0.5 text-xs flex-1 focus:outline-none"
                        autoFocus
                      />
                      <input
                        type="number"
                        value={optionForm.price}
                        onChange={(e) => setOptionForm({ ...optionForm, price: Number(e.target.value) })}
                        onFocus={(e) => e.target.select()}
                        className="border rounded px-2 py-0.5 text-xs w-24 focus:outline-none"
                        min={0}
                      />
                      <button type="button" onClick={() => updateOption(t.id, opt.id)} className="text-xs text-blue-600 hover:text-blue-800">保存</button>
                      <button type="button" onClick={() => setEditingOptionId(null)} className="text-xs text-gray-400">キャンセル</button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-xs">{opt.name}</span>
                      <span className="text-xs text-gray-500">¥{opt.price.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => { setEditingOptionId(opt.id); setOptionForm({ name: opt.name, price: opt.price }); }}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >編集</button>
                      <button type="button" onClick={() => deleteOption(t.id, opt.id)} className="text-xs text-red-400 hover:text-red-600">削除</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newOptionForms[t.id]?.name ?? ""}
              onChange={(e) => setNewOptionForms((prev) => ({ ...prev, [t.id]: { ...prev[t.id] ?? { name: "", price: "0" }, name: e.target.value } }))}
              placeholder="オプション名"
              className="border border-gray-300 rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
              onKeyDown={(e) => e.key === "Enter" && addOption(t.id)}
            />
            <input
              type="number"
              value={newOptionForms[t.id]?.price ?? "0"}
              onChange={(e) => setNewOptionForms((prev) => ({ ...prev, [t.id]: { ...prev[t.id] ?? { name: "", price: "0" }, price: e.target.value } }))}
              onFocus={(e) => e.target.select()}
              placeholder="価格"
              min={0}
              className="border border-gray-300 rounded px-2 py-1 text-xs w-24 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => addOption(t.id)}
              className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
            >追加</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TreatmentsTab({ categories, onReload }: { categories: CategoryWithTreatments[]; onReload: () => void }) {
  const [localCategories, setLocalCategories] = useState<CategoryWithTreatments[]>(categories);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", categoryId: 0, unitPrice: 0, unit: "本" });
  const [newForm, setNewForm] = useState({ name: "", categoryId: categories[0]?.id ?? 0, unitPrice: 0, unit: "本" });

  const [expandedOptionsId, setExpandedOptionsId] = useState<number | null>(null);
  const [loadedOptions, setLoadedOptions] = useState<Record<number, TreatmentOption[]>>({});
  const [editingOptionId, setEditingOptionId] = useState<number | null>(null);
  const [optionForm, setOptionForm] = useState({ name: "", price: 0 });
  const [newOptionForms, setNewOptionForms] = useState<Record<number, { name: string; price: string }>>({});

  useEffect(() => { setLocalCategories(categories); }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  async function handleDragEnd(event: DragEndEvent, catId: number) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const cat = localCategories.find((c) => c.id === catId);
    if (!cat) return;

    const oldIdx = cat.treatments.findIndex((t) => t.id === Number(active.id));
    const newIdx = cat.treatments.findIndex((t) => t.id === Number(over.id));
    if (oldIdx === -1 || newIdx === -1) return;

    const newTreatments = arrayMove(cat.treatments, oldIdx, newIdx);
    setLocalCategories((prev) => prev.map((c) => c.id === catId ? { ...c, treatments: newTreatments } : c));

    await fetch("/api/treatments/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTreatments.map((t, i) => ({ id: t.id, sortOrder: i }))),
    });
  }

  async function loadOptions(treatmentId: number) {
    const res = await fetch(`/api/treatments/${treatmentId}/options`);
    const opts = await res.json();
    setLoadedOptions((prev) => ({ ...prev, [treatmentId]: opts }));
  }

  async function toggleOptions(treatmentId: number) {
    if (expandedOptionsId === treatmentId) {
      setExpandedOptionsId(null);
    } else {
      setExpandedOptionsId(treatmentId);
      loadOptions(treatmentId);
    }
  }

  async function addOption(treatmentId: number) {
    const f = newOptionForms[treatmentId] ?? { name: "", price: "0" };
    if (!f.name.trim()) return;
    const currentOptions = loadedOptions[treatmentId] ?? [];
    await fetch(`/api/treatments/${treatmentId}/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: f.name.trim(), price: Number(f.price), sortOrder: currentOptions.length }),
    });
    setNewOptionForms((prev) => ({ ...prev, [treatmentId]: { name: "", price: "0" } }));
    loadOptions(treatmentId);
  }

  async function updateOption(treatmentId: number, optionId: number) {
    await fetch(`/api/treatments/${treatmentId}/options/${optionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: optionForm.name, price: optionForm.price }),
    });
    setEditingOptionId(null);
    loadOptions(treatmentId);
  }

  async function deleteOption(treatmentId: number, optionId: number) {
    if (!confirm("このオプションを削除しますか？")) return;
    await fetch(`/api/treatments/${treatmentId}/options/${optionId}`, { method: "DELETE" });
    loadOptions(treatmentId);
  }

  async function addTreatment() {
    if (!newForm.name.trim() || !newForm.categoryId) return;
    const cat = localCategories.find((c) => c.id === newForm.categoryId);
    await fetch("/api/treatments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newForm.name, categoryId: newForm.categoryId, unitPrice: newForm.unitPrice, unit: newForm.unit, sortOrder: cat?.treatments.length ?? 0 }),
    });
    setNewForm({ name: "", categoryId: newForm.categoryId, unitPrice: 0, unit: "本" });
    onReload();
  }

  async function updateTreatment(id: number) {
    await fetch(`/api/treatments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditingId(null);
    onReload();
  }

  async function toggleActive(t: TreatmentItem) {
    await fetch(`/api/treatments/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, isActive: !t.isActive }),
    });
    onReload();
  }

  async function deleteTreatment(id: number) {
    if (!confirm("この治療項目を削除しますか？")) return;
    await fetch(`/api/treatments/${id}`, { method: "DELETE" });
    onReload();
  }

  const rowProps = {
    editingId, form, setEditingId, setForm, updateTreatment, toggleActive, deleteTreatment,
    toggleOptions, expandedOptionsId, loadedOptions, editingOptionId, optionForm,
    setEditingOptionId, setOptionForm, updateOption, deleteOption, newOptionForms, setNewOptionForms, addOption,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">治療メニュー管理</h2>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-3">新規追加</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">治療名</label>
            <input
              type="text"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              placeholder="例：セラミッククラウン"
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">カテゴリ</label>
            <select
              value={newForm.categoryId}
              onChange={(e) => setNewForm({ ...newForm, categoryId: Number(e.target.value) })}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none"
            >
              <option value="">選択...</option>
              {localCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">単価（税抜・円）</label>
            <input
              type="number"
              value={newForm.unitPrice}
              onChange={(e) => setNewForm({ ...newForm, unitPrice: Number(e.target.value) })}
              onFocus={(e) => e.target.select()}
              min={0}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">単位</label>
            <input
              type="text"
              value={newForm.unit}
              onChange={(e) => setNewForm({ ...newForm, unit: e.target.value })}
              placeholder="本・回・セット"
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={addTreatment}
          className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          追加する
        </button>
      </div>

      {localCategories.map((cat) => (
        <div key={cat.id} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">{cat.name}</h3>
          {cat.treatments.length === 0 ? (
            <p className="text-xs text-gray-400">項目なし</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event, cat.id)}
            >
              <SortableContext items={cat.treatments.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {cat.treatments.map((t) => (
                    <SortableTreatmentRow key={t.id} t={t} {...rowProps} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      ))}
    </div>
  );
}

interface Doctor {
  id: number;
  name: string;
  isActive: boolean;
}

function DoctorsTab() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDoctors(); }, []);

  async function loadDoctors() {
    const res = await fetch("/api/doctors");
    setDoctors(await res.json());
  }

  async function addDoctor() {
    if (!newName.trim()) return;
    setSaving(true);
    await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    await loadDoctors();
    setSaving(false);
  }

  async function updateDoctor(id: number) {
    await fetch(`/api/doctors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    setEditingId(null);
    loadDoctors();
  }

  async function toggleActive(doctor: Doctor) {
    await fetch(`/api/doctors/${doctor.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !doctor.isActive }),
    });
    loadDoctors();
  }

  async function deleteDoctor(id: number) {
    if (!confirm("この担当医を削除しますか？")) return;
    await fetch(`/api/doctors/${id}`, { method: "DELETE" });
    loadDoctors();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">担当医管理</h2>

      {/* 新規追加 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-3">新規追加</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="例：田中 太郎"
            className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
            onKeyDown={(e) => e.key === "Enter" && addDoctor()}
          />
          <button
            type="button"
            onClick={addDoctor}
            disabled={saving || !newName.trim()}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            追加する
          </button>
        </div>
      </div>

      {/* 一覧 */}
      <div className="space-y-2">
        {doctors.length === 0 && <p className="text-sm text-gray-400">担当医が登録されていません</p>}
        {doctors.map((doc) => (
          <div key={doc.id} className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${!doc.isActive ? "opacity-50 bg-gray-50 border-gray-100" : "bg-white border-gray-200"}`}>
            {editingId === doc.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && updateDoctor(doc.id)}
                />
                <button type="button" onClick={() => updateDoctor(doc.id)} className="text-xs text-blue-600 hover:text-blue-800">保存</button>
                <button type="button" onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-gray-600">キャンセル</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium text-gray-800">{doc.name}</span>
                {!doc.isActive && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">無効</span>}
                <button
                  type="button"
                  onClick={() => { setEditingId(doc.id); setEditName(doc.name); }}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >編集</button>
                <button
                  type="button"
                  onClick={() => toggleActive(doc)}
                  className={`text-xs ${doc.isActive ? "text-orange-400 hover:text-orange-600" : "text-green-500 hover:text-green-700"}`}
                >
                  {doc.isActive ? "無効化" : "有効化"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteDoctor(doc.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >削除</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface LabMaterial {
  id: number;
  name: string;
  isActive: boolean;
}

function MaterialsTab() {
  const [materials, setMaterials] = useState<LabMaterial[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadMaterials(); }, []);

  async function loadMaterials() {
    const res = await fetch("/api/lab-materials");
    setMaterials(await res.json());
  }

  async function addMaterial() {
    if (!newName.trim()) return;
    setSaving(true);
    await fetch("/api/lab-materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    await loadMaterials();
    setSaving(false);
  }

  async function updateMaterial(id: number) {
    await fetch(`/api/lab-materials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    setEditingId(null);
    loadMaterials();
  }

  async function toggleActive(mat: LabMaterial) {
    await fetch(`/api/lab-materials/${mat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !mat.isActive }),
    });
    loadMaterials();
  }

  async function deleteMaterial(id: number) {
    if (!confirm("この素材を削除しますか？")) return;
    await fetch(`/api/lab-materials/${id}`, { method: "DELETE" });
    loadMaterials();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-1">素材管理</h2>
      <p className="text-xs text-gray-400 mb-4">技工指示書の「素材」プルダウンに表示される素材名を管理します。</p>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-3">新規追加</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="例：ジルコニア、メタルボンド、e.max"
            className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
            onKeyDown={(e) => e.key === "Enter" && addMaterial()}
          />
          <button
            type="button"
            onClick={addMaterial}
            disabled={saving || !newName.trim()}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            追加する
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {materials.length === 0 && <p className="text-sm text-gray-400">素材が登録されていません</p>}
        {materials.map((mat) => (
          <div key={mat.id} className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${!mat.isActive ? "opacity-50 bg-gray-50 border-gray-100" : "bg-white border-gray-200"}`}>
            {editingId === mat.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && updateMaterial(mat.id)}
                />
                <button type="button" onClick={() => updateMaterial(mat.id)} className="text-xs text-blue-600 hover:text-blue-800">保存</button>
                <button type="button" onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-gray-600">キャンセル</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium text-gray-800">{mat.name}</span>
                {!mat.isActive && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">無効</span>}
                <button type="button" onClick={() => { setEditingId(mat.id); setEditName(mat.name); }} className="text-xs text-blue-500 hover:text-blue-700">編集</button>
                <button type="button" onClick={() => toggleActive(mat)} className={`text-xs ${mat.isActive ? "text-orange-400 hover:text-orange-600" : "text-green-500 hover:text-green-700"}`}>
                  {mat.isActive ? "無効化" : "有効化"}
                </button>
                <button type="button" onClick={() => deleteMaterial(mat.id)} className="text-xs text-red-400 hover:text-red-600">削除</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface LabLaboratory {
  id: number;
  name: string;
  tel: string | null;
  address: string | null;
  isActive: boolean;
}

function LabsTab() {
  const [labs, setLabs] = useState<LabLaboratory[]>([]);
  const [newForm, setNewForm] = useState({ name: "", tel: "", address: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", tel: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadLabs(); }, []);

  async function loadLabs() {
    const res = await fetch("/api/labs");
    setLabs(await res.json());
  }

  async function addLab() {
    if (!newForm.name.trim()) return;
    setSaving(true);
    await fetch("/api/labs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    setNewForm({ name: "", tel: "", address: "" });
    await loadLabs();
    setSaving(false);
  }

  async function updateLab(id: number) {
    await fetch(`/api/labs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    loadLabs();
  }

  async function deleteLab(id: number) {
    if (!confirm("この技工所を削除しますか？")) return;
    await fetch(`/api/labs/${id}`, { method: "DELETE" });
    loadLabs();
  }

  async function toggleActive(lab: LabLaboratory) {
    await fetch(`/api/labs/${lab.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !lab.isActive }),
    });
    loadLabs();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">技工所管理</h2>

      {/* 新規追加フォーム */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-3">新規追加</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">技工所名 <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              placeholder="例：○○歯科技工所"
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
              onKeyDown={(e) => e.key === "Enter" && addLab()}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">電話番号</label>
            <input
              type="text"
              value={newForm.tel}
              onChange={(e) => setNewForm({ ...newForm, tel: e.target.value })}
              placeholder="例：078-000-0000"
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">住所</label>
            <input
              type="text"
              value={newForm.address}
              onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
              placeholder="例：神戸市中央区..."
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={addLab}
          disabled={saving || !newForm.name.trim()}
          className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          追加する
        </button>
      </div>

      {/* 一覧 */}
      <div className="space-y-2">
        {labs.length === 0 && <p className="text-sm text-gray-400">技工所が登録されていません</p>}
        {labs.map((lab) => (
          <div key={lab.id} className={`rounded-lg border px-4 py-3 ${!lab.isActive ? "opacity-50 bg-gray-50 border-gray-100" : "bg-white border-gray-200"}`}>
            {editingId === lab.id ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  autoFocus
                />
                <input
                  type="text"
                  value={editForm.tel}
                  onChange={(e) => setEditForm({ ...editForm, tel: e.target.value })}
                  placeholder="電話番号"
                  className="border rounded px-2 py-1 text-sm focus:outline-none"
                />
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="住所"
                  className="border rounded px-2 py-1 text-sm focus:outline-none"
                />
                <div className="col-span-3 flex gap-2 mt-1">
                  <button type="button" onClick={() => updateLab(lab.id)} className="text-xs text-blue-600 hover:text-blue-800">保存</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-gray-600">キャンセル</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{lab.name}</p>
                  {(lab.tel || lab.address) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lab.tel && <span className="mr-3">📞 {lab.tel}</span>}
                      {lab.address && <span>📍 {lab.address}</span>}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setEditingId(lab.id); setEditForm({ name: lab.name, tel: lab.tel ?? "", address: lab.address ?? "" }); }}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >編集</button>
                <button
                  type="button"
                  onClick={() => toggleActive(lab)}
                  className={`text-xs ${lab.isActive ? "text-orange-400 hover:text-orange-600" : "text-green-500 hover:text-green-700"}`}
                >
                  {lab.isActive ? "無効化" : "有効化"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteLab(lab.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >削除</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PasswordTab() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    if (form.newPassword !== form.confirm) {
      setError("新しいパスワードが一致しません");
      return;
    }
    const res = await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("パスワードを変更しました");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } else {
      setError(data.error ?? "エラーが発生しました");
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 max-w-md">
      <h2 className="text-base font-semibold text-gray-800 mb-4">パスワード変更</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {[
          { key: "currentPassword", label: "現在のパスワード" },
          { key: "newPassword", label: "新しいパスワード" },
          { key: "confirm", label: "新しいパスワード（確認）" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm text-gray-600 mb-1">{label}</label>
            <input
              type="password"
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}
        {error && <p className="text-red-500 text-xs">{error}</p>}
        {message && <p className="text-green-600 text-xs">{message}</p>}
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
          変更する
        </button>
      </form>
    </div>
  );
}
