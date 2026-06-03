import React, { useState, useEffect } from 'react';
import { X, FileText, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { hatchingSeasonTemplateService } from '@/services/hatchingSeasonTemplates';
import { configService, type Config } from '@/services/configs';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

interface BatchConfigRow {
  configId: string;
  targetValue: string;
  minValue: string;
  maxValue: string;
}

interface BatchRow {
  name: string;
  dayStart: string;
  dayEnd: string;
  notes: string;
  configs: BatchConfigRow[];
  expanded: boolean;
}

const EGG_TYPES = ['Gà', 'Vịt', 'Ngỗng', 'Chim', 'Đà điểu', 'Cút', 'Khác'];

const emptyBatch = (): BatchRow => ({
  name: '',
  dayStart: '',
  dayEnd: '',
  notes: '',
  configs: [],
  expanded: true,
});

const emptyConfig = (): BatchConfigRow => ({
  configId: '',
  targetValue: '',
  minValue: '',
  maxValue: '',
});

export function CreateTemplateModal({ isOpen, onClose, onSubmit }: CreateTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    eggType: '',
    totalDays: '',
    description: '',
    createdByType: 'TECHNICIAN',
  });
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      configService.list({ pageSize: 100 }).then((res) => setConfigs(res.items ?? [])).catch(() => {});
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Batch handlers
  const addBatch = () => setBatches((prev) => [...prev, emptyBatch()]);

  const removeBatch = (i: number) =>
    setBatches((prev) => prev.filter((_, idx) => idx !== i));

  const toggleBatch = (i: number) =>
    setBatches((prev) => prev.map((b, idx) => (idx === i ? { ...b, expanded: !b.expanded } : b)));

  const updateBatch = (i: number, field: keyof Omit<BatchRow, 'configs' | 'expanded'>, value: string) =>
    setBatches((prev) => prev.map((b, idx) => (idx === i ? { ...b, [field]: value } : b)));

  // Config handlers
  const addConfig = (batchIdx: number) =>
    setBatches((prev) =>
      prev.map((b, i) => (i === batchIdx ? { ...b, configs: [...b.configs, emptyConfig()] } : b))
    );

  const removeConfig = (batchIdx: number, configIdx: number) =>
    setBatches((prev) =>
      prev.map((b, i) =>
        i === batchIdx ? { ...b, configs: b.configs.filter((_, ci) => ci !== configIdx) } : b
      )
    );

  const updateConfig = (batchIdx: number, configIdx: number, field: keyof BatchConfigRow, value: string) =>
    setBatches((prev) =>
      prev.map((b, i) =>
        i === batchIdx
          ? {
              ...b,
              configs: b.configs.map((c, ci) => (ci === configIdx ? { ...c, [field]: value } : c)),
            }
          : b
      )
    );

  const resetForm = () => {
    setFormData({ name: '', eggType: '', totalDays: '', description: '', createdByType: 'TECHNICIAN' });
    setBatches([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Tên template không được để trống');
      return;
    }
    const totalDaysNum = Number(formData.totalDays);
    if (!formData.totalDays || totalDaysNum < 1 || totalDaysNum > 365) {
      setError('Tổng số ngày ấp phải từ 1 đến 365');
      return;
    }

    // Validate batches
    for (let i = 0; i < batches.length; i++) {
      const b = batches[i];
      if (!b.dayStart || !b.dayEnd) {
        setError(`Giai đoạn ${i + 1}: vui lòng nhập ngày bắt đầu và kết thúc`);
        return;
      }
      if (Number(b.dayStart) >= Number(b.dayEnd)) {
        setError(`Giai đoạn ${i + 1}: ngày bắt đầu phải nhỏ hơn ngày kết thúc`);
        return;
      }
      for (let j = 0; j < b.configs.length; j++) {
        if (!b.configs[j].configId) {
          setError(`Giai đoạn ${i + 1} - Config ${j + 1}: vui lòng chọn thông số`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        totalDays: totalDaysNum,
        eggType: formData.eggType || undefined,
        createdByType: formData.createdByType,
        batches: batches.map((b, i) => ({
          batchIndex: i + 1,
          name: b.name.trim() || undefined,
          dayStart: Number(b.dayStart),
          dayEnd: Number(b.dayEnd),
          numberOfDays: Number(b.dayEnd) - Number(b.dayStart),
          notes: b.notes.trim() || undefined,
          configs: b.configs.map((c) => ({
            configId: c.configId,
            targetValue: c.targetValue !== '' ? Number(c.targetValue) : undefined,
            minValue: c.minValue !== '' ? Number(c.minValue) : undefined,
            maxValue: c.maxValue !== '' ? Number(c.maxValue) : undefined,
          })),
        })),
      };
      console.log('[CreateTemplate] payload', JSON.stringify(payload, null, 2));
      await hatchingSeasonTemplateService.create(payload);
      onSubmit();
      resetForm();
    } catch (err: unknown) {
      console.error('[CreateTemplate]', err);
      const msg = err instanceof Error ? err.message : 'Không thể tạo template';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Tạo Template Mới</h2>
              <p className="text-purple-100 text-xs mt-0.5">Cấu hình thông số ấp trứng</p>
            </div>
            <button onClick={handleClose} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
                placeholder="VD: Mẫu ấp trứng gà công nghiệp"
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
                <option value="">-- Chọn loại trứng --</option>
                {EGG_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Tổng Số Ngày Ấp <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalDays"
                value={formData.totalDays}
                onChange={handleChange}
                placeholder="VD: 21"
                min="1"
                max="365"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Tạo Bởi <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'TECHNICIAN', label: 'Kỹ thuật viên (template công khai)' },
                  { value: 'CUSTOMER', label: 'Khách hàng (template cá nhân)' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex-1 flex items-center p-2.5 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.createdByType === opt.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="createdByType"
                      value={opt.value}
                      checked={formData.createdByType === opt.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-xs font-medium text-slate-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Mô Tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về template..."
                rows={2}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Batches section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Settings size={14} className="text-purple-600" />
                <span className="text-xs font-semibold text-slate-700">
                  Cấu hình giai đoạn ({batches.length})
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

            {batches.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Chưa có giai đoạn nào — nhấn "Thêm giai đoạn" để bắt đầu cấu hình
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {batches.map((batch, bi) => (
                  <div key={bi} className="bg-white">
                    {/* Batch header */}
                    <div className="flex items-center justify-between px-4 py-2 bg-purple-50/50">
                      <button
                        type="button"
                        onClick={() => toggleBatch(bi)}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        <span className="text-xs font-semibold text-purple-700">
                          Giai đoạn {bi + 1}{batch.name ? ` — ${batch.name}` : ''}
                        </span>
                        {batch.dayStart && batch.dayEnd && (
                          <span className="text-xs text-slate-500">
                            (Ngày {batch.dayStart} → {batch.dayEnd})
                          </span>
                        )}
                        {batch.expanded ? (
                          <ChevronUp size={14} className="text-slate-400 ml-auto" />
                        ) : (
                          <ChevronDown size={14} className="text-slate-400 ml-auto" />
                        )}
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
                        {/* Batch fields */}
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
                              Ngày bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={batch.dayStart}
                              onChange={(e) => updateBatch(bi, 'dayStart', e.target.value)}
                              placeholder="1"
                              min="1"
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Ngày kết thúc <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={batch.dayEnd}
                              onChange={(e) => updateBatch(bi, 'dayEnd', e.target.value)}
                              placeholder="7"
                              min="1"
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú</label>
                            <input
                              type="text"
                              value={batch.notes}
                              onChange={(e) => updateBatch(bi, 'notes', e.target.value)}
                              placeholder="Ghi chú cho mẻ này..."
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                          </div>
                        </div>

                        {/* Configs for this batch */}
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
                            <div className="py-3 text-center text-xs text-slate-400">
                              Chưa có thông số nào
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100">
                              {batch.configs.map((cfg, ci) => (
                                <div key={ci} className="px-3 py-2 grid grid-cols-12 gap-2 items-end">
                                  {/* Config select */}
                                  <div className="col-span-4">
                                    {ci === 0 && (
                                      <label className="block text-xs text-slate-500 mb-1">Thông số <span className="text-red-500">*</span></label>
                                    )}
                                    <select
                                      value={cfg.configId}
                                      onChange={(e) => updateConfig(bi, ci, 'configId', e.target.value)}
                                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                      required
                                    >
                                      <option value="">-- Chọn --</option>
                                      {configs.map((c) => (
                                        <option key={c.id} value={c.id}>
                                          {c.name}{c.unit ? ` (${c.unit})` : ''}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  {/* Target */}
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
                                  {/* Min */}
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
                                  {/* Max */}
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
                                  {/* Delete */}
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

          {/* Preview */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">Xem Trước</span>
            </div>
            <p className="font-semibold text-slate-800 text-sm">{formData.name || 'Tên template'}</p>
            <p className="text-xs text-slate-500">
              {formData.eggType || '—'} · {formData.totalDays ? `${formData.totalDays} ngày` : '— ngày'} · {batches.length} giai đoạn
            </p>
            {formData.description && (
              <p className="text-xs text-slate-600 mt-1">{formData.description}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors font-medium shadow-lg disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
