"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TopPage() {
  const router = useRouter();
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", memo: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function handleCreatePatient(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      setError("患者番号と氏名は必須です");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "エラーが発生しました"); return; }
      router.push(`/patients/${data.id}`);
    } finally {
      setSaving(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/patients?q=${encodeURIComponent(search)}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-blue-800">自費診療 見積書作成</h1>
          <div className="flex gap-3">
            <a href="/patients" className="text-xs text-blue-500 hover:text-blue-700">患者一覧</a>
            <a href="/quotes" className="text-xs text-blue-500 hover:text-blue-700">見積履歴</a>
            <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600">管理</a>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm">患者を選択してください</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 新規患者 */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-gray-800">新規患者</h2>
                <p className="text-xs text-gray-400 mt-1">新しい患者を登録して見積もりを作成</p>
              </div>

              {!showNewPatient ? (
                <button
                  type="button"
                  onClick={() => setShowNewPatient(true)}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  新規患者を登録
                </button>
              ) : (
                <form onSubmit={handleCreatePatient} className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">患者番号 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                      placeholder="例：P001"
                      autoFocus
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">氏名 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="例：山田 太郎"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">メモ（任意）</label>
                    <input
                      type="text"
                      value={form.memo}
                      onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
                      placeholder="備考など"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowNewPatient(false); setError(""); }}
                      className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "登録中..." : "登録して続ける"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 患者検索 */}
            <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-gray-800">既存患者を検索</h2>
                <p className="text-xs text-gray-400 mt-1">患者番号または氏名で検索</p>
              </div>

              <form onSubmit={handleSearch} className="space-y-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="患者番号または氏名"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  検索する
                </button>
              </form>

              <div className="mt-3 text-center">
                <a href="/patients" className="text-xs text-indigo-400 hover:text-indigo-600">
                  患者一覧を見る →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
