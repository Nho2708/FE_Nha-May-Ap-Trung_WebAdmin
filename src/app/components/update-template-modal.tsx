import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { hatchingSeasonTemplateService } from '@/services/hatchingSeasonTemplates';
import { configService, type Config } from '@/services/configs';
import type { HatchingSeasonTemplate } from '@/types/hatching';

interface UpdateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  template: HatchingSeasonTemplate | null;
}

const EGG_TYPES = [
  { value: 'CHICKEN', label: 'Gà' },
  { value: 'DUCK',    label: 'Vịt' },
  { value: 'QUAIL',   label: 'Cút' },
  { value: 'PIGEON',  label: 'Bồ câu' },
];

const LEGACY_EGG_MAP: Record<string, string> = {
  'Gà': 'CHICKEN', 'Vịt': 'DUCK', 'Cút': 'QUAIL', 'Bồ câu': 'PIGEON',
};

const normalizeEggType = (v: string | undefined | null) =>
  LEGACY_EGG_MAP[v ?? ''] ?? (EGG_TYPES.some(e => e.value === v) ? v : '') ?? '';

interface BatchConfigForm {
  configId: string;
  targetValue: string;
  minValue: string;
  maxValue: string;
}

interface BatchForm {
  batchIndex: number;
  name: string;
  numberOfDays: string;
  notes: string;
  configs: BatchConfigForm[];
}

const emptyConfig = (): BatchConfigForm => ({ configId: '', targetValue: '', minValue: '', maxValue: '' });

export function UpdateTemplateModal({ isOpen, onClose, onSubmit, template }: UpdateTemplateModalProps) {
  const [formData, setFormData] = useState({ name: '', eggType: '', description: '', isActive: true });
  const [batches, setBatches] = useState<BatchForm[]>([]);
  const [availableConfigs, setAvailableConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !template) return;
    setFormData({ name: template.name, eggType: normalizeEggType(template.eggType), description: template.description ?? '', isActive: template.isActive });
    setDetailLoading(true);
    Promise.all([
      hatchingSeasonTemplateService.getById(template.id),
      configService.list({ pageSize: 100 }),
    ]).then(([detail, cfgResult]) => {
      setAvailableConfigs(cfgResult.items);
      if (detail?.batches) {
        setBatches(detail.batches
          .filter(bd => bd.batch && bd.batch.status !== 'DELETED')
          .map(bd => ({
            batchIndex: bd.batch?.batchIndex ?? 0,
            name: bd.batch?.name ?? '',
            numberOfDays: String(bd.batch?.numberOfDays ?? ''),
            notes: bd.batch?.notes ?? '',
            configs: bd.configs.map(c => ({
              configId: c.configId,
              targetValue: c.targetValue != null ? String(c.targetValue) : '',
              minValue: c.minValue != null ? String(c.minValue) : '',
              maxValue: c.maxValue != null ? String(c.maxValue) : '',
            })),
          })));
      }
    }).catch(() => {}).finally(() => setDetailLoading(false));
  }, [isOpen, template]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
  };

  const addBatch = () => {
    const nextIndex = batches.length + 1;
    setBatches([...batches, { batchIndex: nextIndex, name: '', numberOfDays: '', notes: '', configs: [] }]);
  };

  const removeBatch = (i: number) => {
    setBatches(batches.filter((_, idx) => idx !== i).map((b, idx) => ({ ...b, batchIndex: idx + 1 })));
  };

  const updateBatch = (i: number, field: keyof Omit<BatchForm, 'configs' | 'batchIndex'>, value: string) => {
    const updated = [...batches];
    updated[i] = { ...updated[i], [field]: value };
    setBatches(updated);
  };

  const addConfig = (bi: number) => {
    const updated = [...batches];
    updated[bi].configs = [...updated[bi].configs, emptyConfig()];
    setBatches(updated);
  };

  const removeConfig = (bi: number, ci: number) => {
    const updated = [...batches];
    updated[bi].configs = updated[bi].configs.filter((_, idx) => idx !== ci);
    setBatches(updated);
  };

  const updateConfig = (bi: number, ci: number, field: keyof BatchConfigForm, value: string) => {
    const updated = [...batches];
    updated[bi].configs[ci] = { ...updated[bi].configs[ci], [field]: value };
    setBatches(updated);
  };

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
        batches: batches.map(b => ({
          batchIndex: b.batchIndex,
          name: b.name.trim() || undefined,
          numberOfDays: Number(b.numberOfDays),
          notes: b.notes.trim() || undefined,
          configs: b.configs
            .filter(c => c.configId)
            .map(c => ({
              configId: c.configId,
              targetValue: c.targetValue ? Number(c.targetValue) : undefined,
              minValue: c.minValue ? Number(c.minValue) : undefined,
              maxValue: c.maxValue ? Number(c.maxValue) : undefined,
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
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Cập Nhật Template</h2>
              <p className="text-purple-100 text-sm mt-1">{template.name}</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-2 transition-colors"><X size={20} /></button>
          </div>
        </div>

        {detailLoading ? (
          <div className="p-8 text-center"><div className="animate-spin inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Tên Template <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} maxLength={100} required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Loại Trứng</label>
                <select name="eggType" value={formData.eggType} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Không chọn --</option>
                  {EGG_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Mô Tả</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange}
                    className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500" />
                  <span className="text-sm font-medium text-slate-700">Đang hoạt động</span>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Giai Đoạn Ấp</h3>
                <button type="button" onClick={addBatch}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  <Plus size={13} /> Thêm giai đoạn
                </button>
              </div>

              {batches.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4 border-2 border-dashed border-slate-200 rounded-lg">
                  Chưa có giai đoạn nào
                </p>
              )}

              <div className="space-y-3">
                {batches.map((batch, bi) => (
                  <div key={bi} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-700">Giai đoạn #{batch.batchIndex}</span>
                      <button type="button" onClick={() => removeBatch(bi)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input placeholder="Tên giai đoạn" value={batch.name} onChange={e => updateBatch(bi, 'name', e.target.value)}
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" />
                        <input type="number" placeholder="Số ngày *" value={batch.numberOfDays} onChange={e => updateBatch(bi, 'numberOfDays', e.target.value)} min="1" max="365" required
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" />
                      </div>
                      <div className="border-t border-slate-100 pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-600 font-medium">Thông số đo</span>
                          <button type="button" onClick={() => addConfig(bi)}
                            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium">
                            <Plus size={11} /> Thêm thông số
                          </button>
                        </div>
                        {batch.configs.length === 0 && <p className="text-xs text-slate-400 italic">Chưa có thông số</p>}
                        <div className="space-y-1.5">
                          {batch.configs.map((cfg, ci) => (
                            <div key={ci} className="grid grid-cols-[1fr_70px_70px_70px_auto] gap-1.5 items-center">
                              <select value={cfg.configId} onChange={e => updateConfig(bi, ci, 'configId', e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400">
                                <option value="">-- Chọn thông số --</option>
                                {availableConfigs.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}{c.unit ? ` (${c.unit})` : ''}</option>
                                ))}
                              </select>
                              <input type="number" placeholder="Target" value={cfg.targetValue} onChange={e => updateConfig(bi, ci, 'targetValue', e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" />
                              <input type="number" placeholder="Min" value={cfg.minValue} onChange={e => updateConfig(bi, ci, 'minValue', e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" />
                              <input type="number" placeholder="Max" value={cfg.maxValue} onChange={e => updateConfig(bi, ci, 'maxValue', e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" />
                              <button type="button" onClick={() => removeConfig(bi, ci)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium">
                Hủy
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors font-medium shadow-lg disabled:opacity-50">
                {loading ? 'Đang lưu...' : 'Cập Nhật'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
