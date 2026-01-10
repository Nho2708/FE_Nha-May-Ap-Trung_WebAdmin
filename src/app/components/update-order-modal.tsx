import React, { useState, useEffect } from 'react';
import { X, Package, Truck, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  product: string;
  status: string;
  amount: number;
  date: string;
  qrCode: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

interface UpdateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: Order) => void;
  order: Order | null;
}

const statusOptions = [
  { value: 'pending', label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: Package },
  { value: 'deposit', label: 'Đã đặt cọc', color: 'bg-blue-100 text-blue-800', icon: Package },
  { value: 'shipping', label: 'Đang giao', color: 'bg-purple-100 text-purple-800', icon: Truck },
  { value: 'completed', label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircle },
];

export function UpdateOrderModal({ isOpen, onClose, onSubmit, order }: UpdateOrderModalProps) {
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        notes: order.notes || '',
        phone: order.phone || '',
        address: order.address || '',
      });
    }
  }, [order]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    onSubmit({
      ...order,
      ...formData,
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Cập Nhật Đơn Hàng</h2>
              <p className="text-blue-100 text-sm mt-1">Mã đơn: {order.id}</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Order Info */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Thông Tin Đơn Hàng</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-600">Khách hàng:</span>
                <p className="font-medium text-slate-800">{order.customer}</p>
              </div>
              <div>
                <span className="text-slate-600">Sản phẩm:</span>
                <p className="font-medium text-slate-800">{order.product}</p>
              </div>
              <div>
                <span className="text-slate-600">Tổng tiền:</span>
                <p className="font-medium text-green-600">
                  {order.amount.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div>
                <span className="text-slate-600">Ngày đặt:</span>
                <p className="font-medium text-slate-800">{order.date}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trạng Thái <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.status === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={formData.status === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Icon 
                      size={18} 
                      className={formData.status === option.value ? 'text-blue-600' : 'text-slate-400'} 
                    />
                    <span className={`ml-2 text-sm font-medium ${
                      formData.status === option.value ? 'text-blue-800' : 'text-slate-700'
                    }`}>
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số Điện Thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912345678"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Địa Chỉ Giao Hàng
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ giao hàng..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ghi Chú
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ghi chú thêm về đơn hàng..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium shadow-lg"
            >
              Cập Nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
