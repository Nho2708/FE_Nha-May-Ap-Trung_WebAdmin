import React, { useState } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { hatchingSeasonTemplateService } from '@/services/hatchingSeasonTemplates';
import { useSession } from '@/hooks/use-session';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const EGG_TYPES = ['Gà', 'Vịt', 'Ngỗng', 'Chim', 'Đà điểu', 'Cút', 'Khác'];

export function CreateTemplateModal({ isOpen, onClose, onSubmit }: CreateTemplateModalProps) {
  const session = useSession();
  const [formData, setFormData] = useState({
    name: '',
    eggType: '',
    totalDays: '',
    description: '',
    createdByType: 'TECHNICIAN',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await hatchingSeasonTemplateService.create({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        totalDays: Number(formData.totalDays),
        eggType: formData.eggType || undefined,
        createdByType: formData.createdByType,
      });
      onSubmit();
      onClose();
      setFormData({ name: '', eggType: '', totalDays: '', description: '', createdByType: 'TECHNICIAN' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tạo template');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Tạo Template Mới</h2>
              <p className="text-purple-100 text-xs mt-0.5">Cấu hình thông số ấp trứng</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors">
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
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Loại Trứng
              </label>
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
                  <label key={opt.value} className={`flex-1 flex items-center p-2.5 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.createdByType === opt.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}>
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
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Mô Tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về template..."
                rows={3}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">Xem Trước</span>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">{formData.name || 'Tên template'}</p>
              <p className="text-xs text-slate-500">
                {formData.eggType || '—'} · {formData.totalDays ? `${formData.totalDays} ngày` : '— ngày'}
              </p>
              {formData.description && (
                <p className="text-xs text-slate-600 mt-1">{formData.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
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
