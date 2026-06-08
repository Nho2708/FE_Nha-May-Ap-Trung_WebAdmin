import React, { useState } from "react";
import { RefreshCw, AlertCircle, CheckCircle, BrainCircuit, Database } from "lucide-react";
import { aiService, type MlSyncResponse } from "@/services/ai";

export function MlTraining() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<MlSyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    setError(null);
    try {
      const data = await aiService.syncTraining();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sync thất bại");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-800">ML Training</h2>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <BrainCircuit size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Sync Dữ Liệu Training</h3>
            <p className="text-xs text-slate-500">Đồng bộ dữ liệu mới vào model ML</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
          Thao tác này sẽ đồng bộ dữ liệu huấn luyện mới nhất vào model, giúp model cập nhật và nhận diện chính xác hơn.
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {result && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-3">
              <CheckCircle size={15} /> Sync hoàn thành
            </div>
            <div className="space-y-2">
              <ResultRow icon={<Database size={13} className="text-indigo-400" />} label="Cache groups đã làm mới" value={result.clearedCacheGroups} />
              <ResultRow icon={<Database size={13} className="text-indigo-400" />} label="Synthetic cache đã làm mới" value={result.clearedSyntheticCache} />
              <ResultRow icon={<Database size={13} className="text-indigo-400" />} label="Prebuilt model cache đã làm mới" value={result.clearedPrebuiltModelCache} />
            </div>
            {result.message && (
              <p className="mt-3 text-xs text-slate-500 italic">{result.message}</p>
            )}
          </div>
        )}

        <button
          onClick={handleSync}
          disabled={syncing}
          className="mt-5 w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {syncing
            ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Đang sync...</>
            : <><RefreshCw size={15} /> Sync Training</>}
        </button>
      </div>
    </div>
  );
}

function ResultRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-xs bg-white rounded px-3 py-2 border border-green-100">
      <span className="flex items-center gap-1.5 text-slate-600">{icon}{label}</span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}
