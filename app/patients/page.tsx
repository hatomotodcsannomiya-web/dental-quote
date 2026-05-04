"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Patient {
  id: number;
  code: string;
  name: string;
  memo: string | null;
  createdAt: string;
  _count: { quotes: number };
}

function PatientsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    const res = await fetch(`/api/patients?q=${encodeURIComponent(q)}`);
    setPatients(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(searchParams.get("q") ?? ""); }, [load, searchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/patients?q=${encodeURIComponent(query)}`);
    load(query);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-gray-400 hover:text-gray-600">← トップ</a>
            <h1 className="text-lg font-bold text-gray-800">患者一覧</h1>
          </div>
          <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600">管理</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-4 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="患者番号または氏名で検索"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
            検索
          </button>
          {query && (
            <button type="button" onClick={() => { setQuery(""); load(""); router.push("/patients"); }} className="text-xs text-gray-400 hover:text-gray-600 px-2">
              クリア
            </button>
          )}
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">患者が見つかりません</p>
            <a href="/" className="mt-3 inline-block text-xs text-blue-500 hover:underline">新規患者を登録する</a>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 px-1">{patients.length}名</p>
            {patients.map((p) => (
              <a
                key={p.id}
                href={`/patients/${p.id}`}
                className="block bg-white rounded-xl shadow-sm px-5 py-4 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono flex-shrink-0">{p.code}</span>
                    <span className="font-semibold text-gray-800 truncate">{p.name}</span>
                    {p.memo && <span className="text-xs text-gray-400 truncate hidden sm:block">{p.memo}</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{p._count.quotes}件</span>
                    <span className="text-gray-300">›</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsInner />
    </Suspense>
  );
}
