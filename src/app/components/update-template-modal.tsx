import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp, Settings, Loader2 } from 'lucide-react';
import { hatchingSeasonTemplateService } from '@/services/hatchingSeasonTemplates';
import { configService, type Config } from '@/services/configs';
import type { HatchingSeasonTemplate } from '@/types/hatching';

interface UpdateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  template: HatchingSeasonTemplate | null;
}

interface BatchConfigRow {
  configId: string;
  targetValue: string;
  minValue: string;
  maxValue: string;
}

interface BatchRow {
  name: string;
  numberOfDays: string;
  notes: string;
  configs: BatchConfigRow[];
  expanded: boolean;
}

const EGG_TYPE_OPTIONS = [
  { value: 'CHICKEN', label: 'Gà' },
  { value: 'DUCK',    label: 'Vịt' },
  { value: 'QUAIL',   label: 'Cút' },
  { value: 'PIGEON',  label: 'Bồ câu' },
];

const toEggTypeKey = (raw: string | null | undefined): string => {
  if (!raw) return '';
  if (['CHICKEN', 'DUCK', 'QUAIL', 'PIGEON'].includes(raw)) return raw;
  const legacyMap: Record<string, string> = {
    'Gà': 'CHICKEN', 'Vịt': 'DUCK', 'Cút': 'QUAIL',
    'Chim': 'PIGEON', 'Bồ câu': 'PIGEON',
  };
  return legacyMap[raw] ?? '';
};

const emptyBatch = (): BatchRow => ({
  name: '', numberOfDays: '', notes: '', configs: [], expanded: true,
});

const emptyConfig = (): BatchConfigRow => ({
  configId: '', targetValue: '', minValue: '', maxValue: '',
});

export function UpdateTemplateModal({ isOpen, onClose, onSubmit, template }: UpdateTemplateModalProps) {
  const [formData, setFormData] = useState({ name: '', eggType: '', description: '', isActive: true });
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !template) return;

    setFormData({
      name: template.name,
      eggType: toEggTypeKey(template.eggType),
      description: template.description ?? '',
      isActive: template.isActive,
    });
    setError(null);
    setDetailLoading(true);

    Promise.all([
      configService.list({ pageSize: 100 }),
      hatchingSeasonTemplateService.getById(template.id),
    ]).then(([configRes, detail]) => {
      setConfigs(configRes.items ?? []);
      if (detail?.batches?.length) {
        setBatches(
          detail.batches
            .filter((bd) => bd.batch && bd.batch.status !== 'DELETED')
            .sort((a, b) => (a.batch!.batchIndex ?? 0) - (b.batch!.batchIndex ?? 0))
            .map((bd) => ({
              name: bd.batch!.name ?? '',
              numberOfDays: String(bd.batch!.numberOfDays ?? ''),
              notes: bd.batch!.notes ?? '',
              expanded: false,
              configs: bd.configs.map((c) => ({
                configId: c.configId,
                targetValue: c.targetValue != null ? String(c.targetValue) : '',
                minValue: c.minValue != null ? String(c.minValue) : '',
                maxValue: c.maxValue != null ? String(c.maxValue) : '',
              })),
            }))
        );
      } else {
        setBatches([]);
      }
    }).catch(() => {
      setConfigs([]);
      setBatches([]);
    }).finally(() => setDetailLoading(false));
  }, [isOpen, template]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
  };

  // ── Batch handlers ──
  const addBatch = () => setBatches((prev) => [...prev, emptyBatch()]);
  const removeBatch = (i: number) => setBatches((prev) => prev.filter((_, idx) => idx !== i));
  const toggleBatch = (i: number) =>
    setBatches((prev) => prev.map((b, idx) => (idx === i ? { ...b, expanded: !b.expanded } : b)));
  const updateBatch = (i: number, field: keyof Omit<BatchRow, 'configs' | 'expanded'>, value: string) =>
    setBatches((prev) => prev.map((b, idx) => (idx === i ? { ...b, [field]: value } : b)));

  // ── Config handlers ──
  const addConfig = (bi: number) =>
    setBatches((prev) =>
      prev.map((b, i) => (i === bi ? { ...b, configs: [...b.configs, emptyConfig()] } : b))
    );
  const removeConfig = (bi: number, ci: number) =>
    setBatches((prev) =>
      prev.map((b, i) => (i === bi ? { ...b, configs: b.configs.filter((_, idx) => idx !== ci) } : b))
    );
  const updateConfig = (bi: number, ci: number, field: keyof BatchConfigRow, value: string) =>
    setBatches((prev) =>
      prev.map((b, i) =>
        i === bi ? { ...b, configs: b.configs.map((c, idx) => (idx === ci ? { ...c, [field]: value } : c)) } : b
      )
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    for (let i = 0; i < batches.length; i++) {
      const b = batches[i];
      const days = Number(b.numberOfDays);
      if (!b.numberOfDays || isNaN(days) || days < 1) {
        setError(`Giai đoạn ${i + 1}: số ngày phải ít nhất là 1`);
        return;
      }
      for (let j = 0; j < b.configs.length; j++) {
        if (!b.configs[j].configId) {
          setError(`Giai đoạn ${i + 1} - Thông số ${j + 1}: vui lòng chọn thông số`);
          return;
        }
      }
    }

    setLoading(true);
    setError(null);
    try {
      await hatchingSeasonTemplateService.update(template.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        eggType: formData.eggType || undefined,
        isActive: formData.isActive,
        batches: batches.map((b, i) => ({
          batchIndex: i + 1,
          name: b.name.trim() || undefined,
          numberOfDays: Number(b.numberOfDays),
          notes: b.notes.trim() || undefined,
          configs: b.configs.map((c) => ({
            configId: c.configId,
            targetValue: c.targetValue !== '' ? Number(c.targetValue) : undefined,
            minValue: c.minValue !== '' ? Number(c.minValue) : undefined,
            maxValue: c.maxValue !== '' ? Number(c.maxValue) : undefined,
          })),
        })),
      });
      onSubmit();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật template');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Cập Nhật Template</h2>
            <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-2 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Tên Template <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Loại Trứng</label>
              <select
                name="eggType"
                value={formData.eggType}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Không chọn --</option>
                {EGG_TYPE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Mô Tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-slate-700">Đang hoạt động</span>
              </label>
            </div>
          </div>

          {/* Batches */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Settings size={14} className="text-purple-600" />
                <span className="text-xs font-semibold text-slate-700">
                  Các giai đoạn ({batches.length})
                </span>
              </div>
              <button
                type="button"
                onClick={addBatch}
                className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={12} />
                Thêm giai đoạn
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-xs">
                <Loader2 size={14} className="animate-spin" />
                Đang tải giai đoạn...
              </div>
            ) : batches.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Chưa có giai đoạn nào — nhấn "Thêm giai đoạn" để cấu hình
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {batches.map((batch, bi) => (
                  <div key={bi} className="bg-white">
                    {/* Batch header row */}
                    <div className="flex items-center justify-between px-4 py-2 bg-purple-50/50">
                      <button
                        type="button"
                        onClick={() => toggleBatch(bi)}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        <span className="text-xs font-semibold text-purple-700">
                          Giai đoạn {bi + 1}{batch.name ? ` — ${batch.name}` : ''}
                        </span>
                        {batch.numberOfDays && (
                          <span className="text-xs text-slate-500">({batch.numberOfDays} ngày)</span>
                        )}
                        {batch.expanded
                          ? <ChevronUp size={14} className="text-slate-400 ml-auto" />
                          : <ChevronDown size={14} className="text-slate-400 ml-auto" />
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBatch(bi)}
                        className="ml-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {batch.expanded && (
                      <div className="px-4 py-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Tên giai đoạn</label>
                            <input
                              type="text"
                              value={batch.name}
                              onChange={(e) => updateBatch(bi, 'name', e.target.value)}
                              placeholder="VD: Giai đoạn ấp"
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Số ngày <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={batch.numberOfDays}
                              onChange={(e) => updateBatch(bi, 'numberOfDays', e.target.value)}
                              placeholder="7"
                              min="1"
                              max="365"
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú</label>
                            <input
                              type="text"
                              value={batch.notes}
                              onChange={(e) => updateBatch(bi, 'notes', e.target.value)}
                              placeholder="Ghi chú cho giai đoạn này..."
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                          </div>
                        </div>

                        {/* Configs */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between px-3 py-2 bg-slate-50">
                            <span className="text-xs font-medium text-slate-600">
                              Thông số ({batch.configs.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => addConfig(bi)}
                              className="flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300 transition-colors"
                            >
                              <Plus size={10} />
                              Thêm
                            </button>
                          </div>

                          {batch.configs.length === 0 ? (
                            <div className="py-3 text-center text-xs text-slate-400">Chưa có thông số nào</div>
                          ) : (
                            <div className="divide-y divide-slate-100">
                              {batch.configs.map((cfg, ci) => (
                                <div key={ci} className="px-3 py-2 grid grid-cols-12 gap-2 items-end">
                                  <div className="col-span-4">
                                    {ci === 0 && (
                                      <label className="block text-xs text-slate-500 mb-1">
                                        Thông số <span className="text-red-500">*</span>
                                      </label>
                                    )}
                                    <select
                                      value={cfg.configId}
                                      onChange={(e) => updateConfig(bi, ci, 'configId', e.target.value)}
                                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    >
                                      <option value="">-- Chọn --</option>
                                      {configs.map((c) => (
                                        <option key={c.id} value={c.id}>
                                          {c.name}{c.unit ? ` (${c.unit})` : ''}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-span-2">
                                    {ci === 0 && <label className="block text-xs text-slate-500 mb-1">Mục tiêu</label>}
                                    <input
                                      type="number"
                                      step="any"
                                      value={cfg.targetValue}
                                      onChange={(e) => updateConfig(bi, ci, 'targetValue', e.target.value)}
                                      placeholder="—"
                                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    {ci === 0 && <label className="block text-xs text-slate-500 mb-1">Tối thiểu</label>}
                                    <input
                                      type="number"
                                      step="any"
                                      value={cfg.minValue}
                                      onChange={(e) => updateConfig(bi, ci, 'minValue', e.target.value)}
                                      placeholder="—"
                                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    {ci === 0 && <label className="block text-xs text-slate-500 mb-1">Tối đa</label>}
                                    <input
                                      type="number"
                                      step="any"
                                      value={cfg.maxValue}
                                      onChange={(e) => updateConfig(bi, ci, 'maxValue', e.target.value)}
                                      placeholder="—"
                                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    />
                                  </div>
                                  <div className="col-span-2 flex justify-end items-end">
                                    <button
                                      type="button"
                                      onClick={() => removeConfig(bi, ci)}
                                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || detailLoading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors font-medium shadow-lg disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Cập Nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
