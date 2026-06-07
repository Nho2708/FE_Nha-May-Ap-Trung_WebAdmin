import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { hatchingSeasonService } from '@/services/hatchingSeasons';
import { incubatorService } from '@/services/incubators';
import { hatchingSeasonTemplateService } from '@/services/hatchingSeasonTemplates';
import type { Incubator } from '@/types/incubator';
import type { HatchingSeasonTemplate } from '@/types/hatching';

interface CreateSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function CreateSeasonModal({ isOpen, onClose, onSubmit }: CreateSeasonModalProps) {
  const [formData, setFormData] = useState({
    incubatorId: '',
    templateId: '',
    startDate: '',
    totalEggs: '',
    notes: '',
  });
  const [incubators, setIncubators] = useState<Incubator[]>([]);
  const [templates, setTemplates] = useState<HatchingSeasonTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDataLoading(true);
    Promise.all([
      incubatorService.list({ pageSize: 100 }),
      hatchingSeasonTemplateService.list({ pageSize: 100 }),
    ]).then(([incResult, tplResult]) => {
      setIncubators(incResult.items.filter(i => i.status === 'ACTIVE' || i.status === 'RESERVED'));
      setTemplates(tplResult.items.filter(t => t.isActive));
    }).catch(() => {}).finally(() => setDataLoading(false));
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await hatchingSeasonService.create({
        incubatorId: formData.incubatorId,
        templateId: formData.templateId || undefined,
        startDate: formData.startDate,
        totalEggs: formData.totalEggs ? Number(formData.totalEggs) : undefined,
        notes: formData.notes.trim() || undefined,
      });
      onSubmit();
      onClose();
      setFormData({ incubatorId: '', templateId: '', startDate: '', totalEggs: '', notes: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tạo mùa ấp');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedTemplate = templates.find(t => t.id === formData.templateId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Tạo Mùa Ấp Mới</h2>
              <p className="text-green-100 text-xs mt-0.5">Bắt đầu mùa ấp thực tế trên máy</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {dataLoading ? (
          <div className="p-8 text-center"><div className="animate-spin inline-block w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Máy Ấp <span className="text-red-500">*</span></label>
              <select name="incubatorId" value={formData.incubatorId} onChange={handleChange} required
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">-- Chọn máy ấp --</option>
                {incubators.map(inc => (
                  <option key={inc.id} value={inc.id}>
                    {inc.serialNumber ?? inc.id.slice(0, 8)}{inc.modelName ? ` — ${inc.modelName}` : ''} [{inc.status}]
                  </option>
                ))}
              </select>
              {incubators.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">Không có máy ở trạng thái ACTIVE/RESERVED</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Template Ấp <span className="text-red-500">*</span></label>
              <select name="templateId" value={formData.templateId} onChange={handleChange} required
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">-- Chọn template --</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.eggType ? ` (${t.eggType})` : ''} — {t.totalDays} ngày
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                <p className="font-semibold mb-1">{selectedTemplate.name}</p>
                <p>Loại trứng: {selectedTemplate.eggType ?? '—'} · Tổng ngày: {selectedTemplate.totalDays}</p>
                {selectedTemplate.description && <p className="mt-1 text-green-700">{selectedTemplate.description}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Ngày Bắt Đầu <span className="text-red-500">*</span></label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Số Trứng</label>
              <input type="number" name="totalEggs" value={formData.totalEggs} onChange={handleChange} min="1" max="100000" placeholder="VD: 500"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Ghi Chú</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium">
                Hủy
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-medium shadow-lg disabled:opacity-50">
                {loading ? 'Đang tạo...' : 'Bắt Đầu Mùa Ấp'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
