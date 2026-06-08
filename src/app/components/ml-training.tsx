import React, { useState } from "react";
import { Plus, Trash2, AlertCircle, CheckCircle, BrainCircuit, ChevronDown, ChevronUp } from "lucide-react";
import { aiService, type MlTrainingAddRequest, type MlTrainingPhase, type MlTrainingPhaseParameter } from "@/services/ai";

const EGG_TYPES = ["chicken", "duck", "quail", "goose", "turkey"];

const CONFIG_CODES = [
  { code: "TEMP", label: "Nhiệt độ (°C)" },
  { code: "HUMID", label: "Độ ẩm (%)" },
  { code: "TURN", label: "Lần xoay trứng" },
  { code: "FAN", label: "Tốc độ quạt" },
];

function defaultParameter(code: string): MlTrainingPhaseParameter {
  return { configCode: code, targetValue: 0, minValue: 0, maxValue: 0 };
}

function defaultPhase(index: number): MlTrainingPhase {
  return {
    phaseIndex: index,
    phaseName: `Giai đoạn ${index}`,
    dayStart: 1,
    dayEnd: 7,
    parameters: CONFIG_CODES.map((c) => defaultParameter(c.code)),
  };
}

export function MlTraining() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ recordsAdded: number; totalRecords: number; validationIssues: string[]; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]));

  const [form, setForm] = useState<MlTrainingAddRequest>({
    eggType: "chicken",
    totalEggs: 100,
    expectedSuccessRate: 0.85,
    ambientTemperature: undefined,
    ambientHumidity: undefined,
    phases: [defaultPhase(1)],
  });

  const togglePhase = (idx: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const setField = <K extends keyof MlTrainingAddRequest>(key: K, value: MlTrainingAddRequest[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addPhase = () => {
    const nextIndex = form.phases.length + 1;
    const newPhase = defaultPhase(nextIndex);
    setForm((f) => ({ ...f, phases: [...f.phases, newPhase] }));
    setExpandedPhases((prev) => new Set([...prev, form.phases.length]));
  };

  const removePhase = (idx: number) => {
    setForm((f) => {
      const phases = f.phases.filter((_, i) => i !== idx).map((p, i) => ({ ...p, phaseIndex: i + 1 }));
      return { ...f, phases };
    });
  };

  const setPhaseField = (phaseIdx: number, key: keyof MlTrainingPhase, value: unknown) => {
    setForm((f) => {
      const phases = f.phases.map((p, i) => (i === phaseIdx ? { ...p, [key]: value } : p));
      return { ...f, phases };
    });
  };

  const setParamField = (phaseIdx: number, configCode: string, key: keyof MlTrainingPhaseParameter, value: number) => {
    setForm((f) => {
      const phases = f.phases.map((p, i) => {
        if (i !== phaseIdx) return p;
        const parameters = p.parameters.map((param) =>
          param.configCode === configCode ? { ...param, [key]: value } : param
        );
        return { ...p, parameters };
      });
      return { ...f, phases };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setError(null);
    try {
      const payload: MlTrainingAddRequest = {
        ...form,
        ambientTemperature: form.ambientTemperature || undefined,
        ambientHumidity: form.ambientHumidity || undefined,
      };
      const data = await aiService.addTrainingData(payload);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Thêm dữ liệu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-slate-800">ML Training</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <BrainCircuit size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Thông Tin Cơ Bản</h3>
              <p className="text-xs text-slate-500">Điền thông tin tổng quát của mẻ ấp</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Loại trứng</label>
              <select
                value={form.eggType}
                onChange={(e) => setField("eggType", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {EGG_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Tổng số trứng</label>
              <input
                type="number" min={1} required
                value={form.totalEggs}
                onChange={(e) => setField("totalEggs", Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tỷ lệ thành công dự kiến (0–1)
              </label>
              <input
                type="number" min={0} max={1} step={0.01} required
                value={form.expectedSuccessRate}
                onChange={(e) => setField("expectedSuccessRate", Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Nhiệt độ môi trường (°C) <span className="text-slate-400">— tuỳ chọn</span></label>
              <input
                type="number" step={0.1}
                value={form.ambientTemperature ?? ""}
                onChange={(e) => setField("ambientTemperature", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Bỏ trống nếu không biết"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Độ ẩm môi trường (%) <span className="text-slate-400">— tuỳ chọn</span></label>
              <input
                type="number" min={0} max={100} step={0.1}
                value={form.ambientHumidity ?? ""}
                onChange={(e) => setField("ambientHumidity", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Bỏ trống nếu không biết"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Các Giai Đoạn Ấp ({form.phases.length})</h3>
            <button
              type="button"
              onClick={addPhase}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={13} /> Thêm giai đoạn
            </button>
          </div>

          {form.phases.map((phase, phaseIdx) => (
            <div key={phaseIdx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Phase header */}
              <div
                className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => togglePhase(phaseIdx)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full flex items-center justify-center">{phase.phaseIndex}</span>
                  <span className="text-sm font-medium text-slate-700">{phase.phaseName || `Giai đoạn ${phase.phaseIndex}`}</span>
                  <span className="text-xs text-slate-400">Ngày {phase.dayStart}–{phase.dayEnd}</span>
                </div>
                <div className="flex items-center gap-2">
                  {form.phases.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removePhase(phaseIdx); }}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  {expandedPhases.has(phaseIdx) ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                </div>
              </div>

              {expandedPhases.has(phaseIdx) && (
                <div className="px-5 pb-5 border-t border-slate-100">
                  {/* Phase basic fields */}
                  <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tên giai đoạn</label>
                      <input
                        type="text" required
                        value={phase.phaseName}
                        onChange={(e) => setPhaseField(phaseIdx, "phaseName", e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Ngày bắt đầu</label>
                      <input
                        type="number" min={1} required
                        value={phase.dayStart}
                        onChange={(e) => setPhaseField(phaseIdx, "dayStart", Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Ngày kết thúc</label>
                      <input
                        type="number" min={1} required
                        value={phase.dayEnd}
                        onChange={(e) => setPhaseField(phaseIdx, "dayEnd", Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                  </div>

                  {/* Parameters */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thông số</p>
                    {phase.parameters.map((param) => {
                      const meta = CONFIG_CODES.find((c) => c.code === param.configCode);
                      return (
                        <div key={param.configCode} className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-slate-600 mb-2">{meta?.label ?? param.configCode}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {(["targetValue", "minValue", "maxValue"] as const).map((field) => (
                              <div key={field}>
                                <label className="block text-[11px] text-slate-400 mb-1">
                                  {field === "targetValue" ? "Mục tiêu" : field === "minValue" ? "Tối thiểu" : "Tối đa"}
                                </label>
                                <input
                                  type="number" step={0.1} required
                                  value={param[field]}
                                  onChange={(e) => setParamField(phaseIdx, param.configCode, field, Number(e.target.value))}
                                  className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-3">
              <CheckCircle size={15} /> Thêm dữ liệu thành công
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded px-3 py-2 border border-green-100">
                <span className="text-slate-500">Bản ghi đã thêm</span>
                <span className="float-right font-bold text-slate-800">{result.recordsAdded}</span>
              </div>
              <div className="bg-white rounded px-3 py-2 border border-green-100">
                <span className="text-slate-500">Tổng bản ghi</span>
                <span className="float-right font-bold text-slate-800">{result.totalRecords}</span>
              </div>
            </div>
            {result.validationIssues?.length > 0 && (
              <div className="mt-3 space-y-1">
                {result.validationIssues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1.5 rounded border border-amber-200">
                    <AlertCircle size={12} className="mt-0.5 shrink-0" /> {issue}
                  </div>
                ))}
              </div>
            )}
            {result.message && <p className="mt-3 text-xs text-slate-500 italic">{result.message}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting
            ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Đang lưu...</>
            : <><Plus size={15} /> Thêm Dữ Liệu Training</>}
        </button>
      </form>
    </div>
  );
}
