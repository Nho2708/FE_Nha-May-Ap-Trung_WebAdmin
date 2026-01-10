import React, { useState, useEffect } from 'react';
import { X, Thermometer, Droplet, Clock, RotateCw } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  icon: string;
  temperature: string;
  humidity: string;
  duration: string;
  turnCycle: string;
  users: number;
  sessions: number;
  successRate: number;
}

interface UpdateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: Template) => void;
  template: Template | null;
}

const eggIcons = ['🐔', '🦆', '🦢', '🐦', '🦤', '🦜', '🦅', '🦉', '🐧'];

export function UpdateTemplateModal({ isOpen, onClose, onSubmit, template }: UpdateTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    icon: '🐔',
    tempMin: '',
    tempMax: '',
    humidityMin: '',
    humidityMax: '',
    duration: '',
    turnCycle: '',
  });

  useEffect(() => {
    if (template) {
      // Parse temperature range (e.g., "37-38°C" -> tempMin: 37, tempMax: 38)
      const tempMatch = template.temperature.match(/(\d+\.?\d*)-(\d+\.?\d*)/);
      const tempMin = tempMatch ? tempMatch[1] : '';
      const tempMax = tempMatch ? tempMatch[2] : '';

      // Parse humidity range (e.g., "55-65%" -> humidityMin: 55, humidityMax: 65)
      const humidityMatch = template.humidity.match(/(\d+)-(\d+)/);
      const humidityMin = humidityMatch ? humidityMatch[1] : '';
      const humidityMax = humidityMatch ? humidityMatch[2] : '';

      // Parse duration (e.g., "21 ngày" -> duration: 21)
      const durationMatch = template.duration.match(/(\d+)/);
      const duration = durationMatch ? durationMatch[1] : '';

      // Parse turn cycle (e.g., "2 giờ" -> turnCycle: 2)
      const turnCycleMatch = template.turnCycle.match(/(\d+\.?\d*)/);
      const turnCycle = turnCycleMatch ? turnCycleMatch[1] : '';

      setFormData({
        name: template.name,
        icon: template.icon,
        tempMin,
        tempMax,
        humidityMin,
        humidityMax,
        duration,
        turnCycle,
      });
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    onSubmit({
      ...template,
      name: formData.name,
      icon: formData.icon,
      temperature: `${formData.tempMin}-${formData.tempMax}°C`,
      humidity: `${formData.humidityMin}-${formData.humidityMax}%`,
      duration: `${formData.duration} ngày`,
      turnCycle: `${formData.turnCycle} giờ`,
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Cập Nhật Template</h2>
              <p className="text-purple-100 text-sm mt-1">Mã: {template.id}</p>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Thông Tin Cơ Bản
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Tên Template <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Trứng Gà Công Nghiệp"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Icon <span className="text-red-500">*</span>
                </label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-2xl"
                  required
                >
                  {eggIcons.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Temperature Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Thermometer className="text-red-500" size={16} />
              Nhiệt Độ
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Tối thiểu (°C) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="tempMin"
                  value={formData.tempMin}
                  onChange={handleChange}
                  placeholder="36.0"
                  step="0.1"
                  className="w-full px-3 py-1.5 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Tối đa (°C) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="tempMax"
                  value={formData.tempMax}
                  onChange={handleChange}
                  placeholder="38.0"
                  step="0.1"
                  className="w-full px-3 py-1.5 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Humidity Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Droplet className="text-blue-500" size={16} />
              Độ Ẩm
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Tối thiểu (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="humidityMin"
                  value={formData.humidityMin}
                  onChange={handleChange}
                  placeholder="50"
                  min="0"
                  max="100"
                  className="w-full px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Tối đa (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="humidityMax"
                  value={formData.humidityMax}
                  onChange={handleChange}
                  placeholder="65"
                  min="0"
                  max="100"
                  className="w-full px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration & Turn Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                <Clock className="text-purple-500" size={16} />
                Thời Gian Ấp
              </h3>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Ngày <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="21"
                  min="1"
                  className="w-full px-3 py-1.5 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                <RotateCw className="text-green-500" size={16} />
                Chu Kỳ Đảo
              </h3>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Giờ <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="turnCycle"
                  value={formData.turnCycle}
                  onChange={handleChange}
                  placeholder="2"
                  min="0.5"
                  step="0.5"
                  className="w-full px-3 py-1.5 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Statistics (Read-only) */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Thống Kê</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-slate-600 mb-1">Người dùng</p>
                <p className="text-lg font-bold text-blue-600">{template.users}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Số vụ ấp</p>
                <p className="text-lg font-bold text-purple-600">{template.sessions}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Tỉ lệ thành công</p>
                <p className="text-lg font-bold text-green-600">{template.successRate}%</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors font-medium shadow-lg"
            >
              Cập Nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
