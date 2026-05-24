import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { hatchingSeasonTemplateService } from '@/services/hatchingSeasonTemplates';
import type { HatchingSeasonTemplate } from '@/types/hatching';

interface UpdateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  template: HatchingSeasonTemplate | null;
}

const EGG_TYPES = ['Gà', 'Vịt', 'Ngỗng', 'Chim', 'Đà điểu', 'Cút', 'Khác'];

export function UpdateTemplateModal({ isOpen, onClose, onSubmit, template }: UpdateTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    eggType: '',
    totalDays: '',
    description: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        eggType: template.eggType ?? '',
        totalDays: String(template.totalDays),
        description: template.description ?? '',
        isActive: template.isActive,
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;
    setLoading(true);
    setError(null);
    try {
      await hatchingSeasonTemplateService.update(template.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        totalDays: Number(formData.totalDays),
        eggType: formData.eggType || undefined,
        isActive: formData.isActive,
      });
      onSubmit();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật template');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Cập Nhật Template</h2>
              <p className="text-purple-100 text-sm mt-1">ID: {template.id.slice(0, 8)}...</p>
            </div>
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
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Loại Trứng
              </label>
              <select
                name="eggType"
                value={formData.eggType}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Không chọn --</option>
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
                min="1"
                max="365"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Mô Tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
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
              disabled={loading}
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
