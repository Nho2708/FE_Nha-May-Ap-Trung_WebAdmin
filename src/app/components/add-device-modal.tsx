import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (device: any) => void;
}

export function AddDeviceModal({ isOpen, onClose, onSubmit }: AddDeviceModalProps) {
  const [formData, setFormData] = useState({
    deviceId: '',
    model: '50',
    quantity: 1,
    serialNumber: '',
    purchaseDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: 'running',
      temperature: 37.5,
      humidity: 65,
      fanSpeed: 85,
      heaterStatus: true,
      motorCycle: '2h'
    });
    onClose();
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
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Thêm Thiết Bị Mới</h2>
              <p className="text-blue-100 text-xs mt-0.5">Đăng ký thiết bị mới vào hệ thống</p>
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
          {/* Device Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1.5">
              Thông Tin Thiết Bị
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Mã Thiết Bị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="deviceId"
                  value={formData.deviceId}
                  onChange={handleChange}
                  placeholder="INC-2024-XXX"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Dòng Máy <span className="text-red-500">*</span>
                </label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="50">50 trứng</option>
                  <option value="100">100 trứng</option>
                  <option value="200">200 trứng</option>
                  <option value="500">500 trứng</option>
                  <option value="1000">1000 trứng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Số Serial <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="SN-XXXXXXXXXX"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Ngày Mua <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Quantity Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1.5">
              Thông Tin Tồn Kho
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Số Lượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="1"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1.5">
              QR Code & Tài Liệu
            </h3>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 text-center border border-purple-200">
              <div className="w-24 h-24 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Upload size={24} className="text-purple-400" />
              </div>
              <p className="text-xs text-slate-700 mb-1">
                QR Code sẽ được tự động tạo sau khi đăng ký
              </p>
              <p className="text-xs text-slate-600">
                Mã: {formData.deviceId || 'INC-2024-XXX'}
              </p>
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium shadow-lg"
            >
              Thêm Thiết Bị
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}