import React, { useState } from 'react';
import { X, Thermometer, Droplet, Clock, RotateCw } from 'lucide-react';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: any) => void;
}

const eggIcons = ['🐔', '🦆', '🦢', '🐦', '🦤', '🦜', '🦅', '🦉', '🐧'];

export function CreateTemplateModal({ isOpen, onClose, onSubmit }: CreateTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    icon: '🐔',
    tempMin: '',
    tempMax: '',
    humidityMin: '',
    humidityMax: '',
    duration: '',
    durationUnit: 'days',
    turnCycle: '',
    turnCycleUnit: 'hours',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: `T${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: formData.name,
      icon: formData.icon,
      temperature: `${formData.tempMin}-${formData.tempMax}°C`,
      humidity: `${formData.humidityMin}-${formData.humidityMax}%`,
      duration: `${formData.duration} ${formData.durationUnit === 'days' ? 'ngày' : 'tuần'}`,
      turnCycle: `${formData.turnCycle} ${formData.turnCycleUnit === 'hours' ? 'giờ' : 'phút'}`,
      users: 0,
      sessions: 0,
      successRate: 0,
      ...formData
    });
    onClose();
    // Reset form
    setFormData({
      name: '',
      icon: '🐔',
      tempMin: '',
      tempMax: '',
      humidityMin: '',
      humidityMax: '',
      duration: '',
      durationUnit: 'days',
      turnCycle: '',
      turnCycleUnit: 'hours',
      description: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Tạo Template Mới</h2>
              <p className="text-purple-100 text-xs mt-0.5">Cấu hình thông số ấp trứng</p>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 rounded-lg p-1.5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1.5">
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
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xl"
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

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Mô Tả
              </label>
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

          {/* Temperature Settings */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <Thermometer className="text-red-500" size={16} />
              Nhiệt Độ
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-2.5 border border-red-200">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tối thiểu (°C) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="tempMin"
                  value={formData.tempMin}
                  onChange={handleChange}
                  placeholder="36.0"
                  step="0.1"
                  className="w-full px-2.5 py-1.5 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-2.5 border border-red-200">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tối đa (°C) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="tempMax"
                  value={formData.tempMax}
                  onChange={handleChange}
                  placeholder="38.0"
                  step="0.1"
                  className="w-full px-2.5 py-1.5 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Humidity Settings */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <Droplet className="text-blue-500" size={16} />
              Độ Ẩm
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2.5 border border-blue-200">
                <label className="block text-xs font-medium text-slate-700 mb-1">
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
                  className="w-full px-2.5 py-1.5 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2.5 border border-blue-200">
                <label className="block text-xs font-medium text-slate-700 mb-1">
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
                  className="w-full px-2.5 py-1.5 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration & Turn Cycle - Combined */}
          <div className="grid grid-cols-2 gap-3">
            {/* Duration Settings */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <Clock className="text-purple-500" size={16} />
                Thời Gian Ấp
              </h3>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2.5 border border-purple-200">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Thời gian <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="21"
                      min="1"
                      className="w-full px-2.5 py-1.5 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Đơn vị
                    </label>
                    <select
                      name="durationUnit"
                      value={formData.durationUnit}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="days">Ngày</option>
                      <option value="weeks">Tuần</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Turn Cycle Settings */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <RotateCw className="text-green-500" size={16} />
                Chu Kỳ Đảo
              </h3>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2.5 border border-green-200">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Chu kỳ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="turnCycle"
                      value={formData.turnCycle}
                      onChange={handleChange}
                      placeholder="2"
                      min="0.5"
                      step="0.5"
                      className="w-full px-2.5 py-1.5 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Đơn vị
                    </label>
                    <select
                      name="turnCycleUnit"
                      value={formData.turnCycleUnit}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="hours">Giờ</option>
                      <option value="minutes">Phút</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1.5">
              Xem Trước
            </h3>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{formData.icon}</span>
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    {formData.name || 'Tên Template'}
                  </h4>
                  <p className="text-xs text-slate-600">Template ID: T###</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-0.5">Nhiệt độ</p>
                  <p className="text-xs font-semibold text-slate-800">
                    {formData.tempMin && formData.tempMax 
                      ? `${formData.tempMin}-${formData.tempMax}°C`
                      : '--°C'}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-0.5">Độ ẩm</p>
                  <p className="text-xs font-semibold text-slate-800">
                    {formData.humidityMin && formData.humidityMax 
                      ? `${formData.humidityMin}-${formData.humidityMax}%`
                      : '--%'}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-0.5">Thời gian</p>
                  <p className="text-xs font-semibold text-slate-800">
                    {formData.duration 
                      ? `${formData.duration} ${formData.durationUnit === 'days' ? 'ngày' : 'tuần'}`
                      : '-- ngày'}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-0.5">Đảo trứng</p>
                  <p className="text-xs font-semibold text-slate-800">
                    {formData.turnCycle 
                      ? `${formData.turnCycle} ${formData.turnCycleUnit === 'hours' ? 'giờ' : 'phút'}`
                      : '-- giờ'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors font-medium shadow-lg"
            >
              Tạo Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}