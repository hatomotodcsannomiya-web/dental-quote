"use client";

import { useState, useEffect } from "react";
import type { CategoryWithTreatments, TreatmentItem } from "@/lib/types";

type AdminTab = "categories" | "treatments" | "password";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<AdminTab>("treatments");
  const [categories, setCategories] = useState<CategoryWithTreatments[]>([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    const res = await fetch("/api/treatments");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
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

function TreatmentsTab({ categories, onReload }: { categories: CategoryWithTreatments[]; onReload: () => void }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", categoryId: 0, priceType: "per_tooth", unitPrice: 0, unit: "本" });
  const [newForm, setNewForm] = useState({ name: "", categoryId: categories[0]?.id ?? 0, priceType: "per_tooth", unitPrice: 0, unit: "本" });

  async function addTreatment() {
    if (!newForm.name.trim() || !newForm.categoryId) return;
    const cat = categories.find((c) => c.id === newForm.categoryId);
    await fetch("/api/treatments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newForm, sortOrder: cat?.treatments.length ?? 0 }),
    });
    setNewForm({ name: "", categoryId: newForm.categoryId, priceType: "per_tooth", unitPrice: 0, unit: "本" });
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
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">価格タイプ</label>
            <select
              value={newForm.priceType}
              onChange={(e) => setNewForm({ ...newForm, priceType: e.target.value })}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none"
            >
              <option value="per_tooth">本数×単価</option>
              <option value="flat">一律価格</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">単価（税抜・円）</label>
            <input
              type="number"
              value={newForm.unitPrice}
              onChange={(e) => setNewForm({ ...newForm, unitPrice: Number(e.target.value) })}
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

      {categories.map((cat) => (
        <div key={cat.id} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">{cat.name}</h3>
          {cat.treatments.length === 0 ? (
            <p className="text-xs text-gray-400">項目なし</p>
          ) : (
            <div className="space-y-2">
              {cat.treatments.map((t) => (
                <div key={t.id} className={`flex items-center gap-2 py-2 px-2 rounded-lg ${!t.isActive ? "opacity-50 bg-gray-50" : "bg-white border border-gray-100"}`}>
                  {editingId === t.id ? (
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded px-2 py-1 text-xs col-span-2" />
                      <input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} className="border rounded px-2 py-1 text-xs" />
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
                      <span className="text-xs text-gray-400">{t.priceType === "per_tooth" ? "本数×単価" : "一律"}</span>
                      <button type="button" onClick={() => { setEditingId(t.id); setForm({ name: t.name, categoryId: t.categoryId, priceType: t.priceType, unitPrice: t.unitPrice, unit: t.unit }); }} className="text-xs text-blue-500 hover:text-blue-700">編集</button>
                      <button type="button" onClick={() => toggleActive(t)} className={`text-xs ${t.isActive ? "text-orange-400 hover:text-orange-600" : "text-green-500 hover:text-green-700"}`}>
                        {t.isActive ? "無効化" : "有効化"}
                      </button>
                      <button type="button" onClick={() => deleteTreatment(t.id)} className="text-xs text-red-400 hover:text-red-600">削除</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
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
