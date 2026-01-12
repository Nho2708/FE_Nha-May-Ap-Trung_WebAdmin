import React, { useState } from 'react';
import { X, ShoppingCart, Package, User, CreditCard } from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: any) => void;
}

const products = [
  { id: 'P001', name: 'Máy ấp trứng 50', capacity: '50 trứng', price: 3500000 },
  { id: 'P002', name: 'Máy ấp trứng 100', capacity: '100 trứng', price: 5200000 },
  { id: 'P003', name: 'Máy ấp trứng 200', capacity: '200 trứng', price: 8500000 },
  { id: 'P004', name: 'Máy ấp trứng 500', capacity: '500 trứng', price: 18000000 },
  { id: 'P005', name: 'Máy ấp trứng 1000', capacity: '1000 trứng', price: 32000000 },
];

export function CreateOrderModal({ isOpen, onClose, onSubmit }: CreateOrderModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    customerName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'deposit',
    depositAmount: 0,
    notes: '',
  });

  const selectedProduct = products.find(p => p.id === formData.productId);
  const totalAmount = selectedProduct ? selectedProduct.price * formData.quantity : 0;
  const depositPercent = formData.paymentMethod === 'deposit' ? 30 : 100;
  const depositAmount = (totalAmount * depositPercent) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: `ORD-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customer: formData.customerName,
      product: selectedProduct?.name,
      status: formData.paymentMethod === 'full' ? 'shipping' : 'deposit',
      amount: totalAmount,
      date: new Date().toISOString().split('T')[0],
      qrCode: `INC-2024-${Math.floor(Math.random() * 1000)}`,
      ...formData
    });
    onClose();
    setStep(1);
    setFormData({
      productId: '',
      quantity: 1,
      customerName: '',
      email: '',
      phone: '',
      address: '',
      paymentMethod: 'deposit',
      depositAmount: 0,
      notes: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    if (step === 1 && formData.productId) setStep(2);
    else if (step === 2 && formData.customerName && formData.phone) setStep(3);
  };

  const prevStep = () => setStep(step - 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold">Tạo Đơn Hàng Mới</h2>
              <p className="text-green-100 text-xs mt-0.5">Đơn hàng cho khách hàng</p>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 rounded-lg p-1.5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Sản phẩm', icon: Package },
              { num: 2, label: 'Khách hàng', icon: User },
              { num: 3, label: 'Thanh toán', icon: CreditCard },
            ].map((s, index) => {
              const Icon = s.icon;
              return (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step >= s.num 
                        ? 'bg-white text-green-600' 
                        : 'bg-green-500 text-white'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-xs mt-0.5 text-green-100">{s.label}</span>
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${
                      step > s.num ? 'bg-white' : 'bg-green-500'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Step 1: Product Selection */}
          {step === 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Chọn Sản Phẩm
              </h3>

              <div className="space-y-2">
                {products.map((product) => (
                  <label
                    key={product.id}
                    className={`block p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.productId === product.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="productId"
                      value={product.id}
                      checked={formData.productId === product.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className={formData.productId === product.id ? 'text-green-600' : 'text-slate-400'} size={20} />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{product.name}</p>
                          <p className="text-xs text-slate-600">{product.capacity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          {product.price.toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Số Lượng
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {selectedProduct && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 font-medium">Tổng tiền:</span>
                    <span className="text-lg font-bold text-green-600">
                      {totalAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Customer Information */}
          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Thông Tin Khách Hàng
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Họ Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0912345678"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Địa Chỉ Giao Hàng <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ đầy đủ"
                    rows={2}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Thanh Toán
              </h3>

              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Sản phẩm:</span>
                  <span className="font-medium text-slate-800">{selectedProduct?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Số lượng:</span>
                  <span className="font-medium text-slate-800">{formData.quantity}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-300">
                  <span className="text-sm text-slate-700 font-medium">Tổng tiền:</span>
                  <span className="text-base font-bold text-slate-800">
                    {totalAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Phương Thức Thanh Toán
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-slate-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="deposit"
                      checked={formData.paymentMethod === 'deposit'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">Đặt Cọc 30%</p>
                      <p className="text-xs text-slate-600">
                        Thanh toán: {((totalAmount * 30) / 100).toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-slate-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="full"
                      checked={formData.paymentMethod === 'full'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">Thanh Toán Toàn Bộ</p>
                      <p className="text-xs text-slate-600">
                        Thanh toán: {totalAmount.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 font-medium">Số tiền cần thanh toán:</span>
                  <span className="text-lg font-bold text-green-600">
                    {depositAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {formData.paymentMethod === 'deposit' 
                    ? `Còn lại: ${(totalAmount - depositAmount).toLocaleString('vi-VN')} ₫ thanh toán khi giao hàng`
                    : 'Đã bao gồm toàn bộ chi phí'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Ghi Chú
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Ghi chú thêm về đơn hàng..."
                  rows={2}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-200 mt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Quay Lại
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  (step === 1 && !formData.productId) ||
                  (step === 2 && (!formData.customerName || !formData.phone))
                }
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp Theo
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-medium shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                Tạo Đơn Hàng
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}