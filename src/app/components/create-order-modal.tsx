import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, Package, User, AlertCircle, Plus, Trash2, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { orderService } from '@/services/orders';
import { incubatorModelService } from '@/services/incubatorModels';
import type { OrderItemPayload, CreateOrderResponse } from '@/types/order';
import type { IncubatorModel } from '@/types/incubator-model';

function ModelPicker({
  models,
  value,
  onChange,
}: {
  models: IncubatorModel[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = models.find((m) => m.id === value) ?? null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setOpen((o) => !o);
  };

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-left transition-colors"
      >
        {selected ? (
          <>
            {selected.imageUrl ? (
              <img src={selected.imageUrl} alt={selected.name} className="w-8 h-8 rounded object-cover shrink-0 border border-slate-200" />
            ) : (
              <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                <ImageIcon size={14} className="text-slate-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{selected.name}</p>
              <p className="text-xs text-slate-400">{selected.modelCode} · {selected.unitPrice.toLocaleString('vi-VN')} ₫</p>
            </div>
          </>
        ) : (
          <span className="text-sm text-slate-400 flex-1">-- Chọn dòng máy --</span>
        )}
        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div style={dropdownStyle} className="max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl p-1">
          {models.length === 0 ? (
            <p className="text-xs text-slate-400 px-3 py-2">Không có dòng máy nào.</p>
          ) : (
            models.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { onChange(m.id); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                  m.id === value ? 'bg-green-50 border border-green-200' : 'hover:bg-slate-50'
                }`}
              >
                {m.imageUrl ? (
                  <img src={m.imageUrl} alt={m.name} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                    <ImageIcon size={15} className="text-slate-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.modelCode} · {m.unitPrice.toLocaleString('vi-VN')} ₫</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function CreateOrderModal({ isOpen, onClose, onSubmit }: CreateOrderModalProps) {
  const [step, setStep] = useState(1);
  const [models, setModels] = useState<IncubatorModel[]>([]);
  const [items, setItems] = useState<OrderItemPayload[]>([{ incubatorModelId: '', quantity: 1 }]);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<CreateOrderResponse | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      incubatorModelService.list({ pageSize: 50 }).then((result) => setModels(result.items)).catch(() => {});
    } else {
      setStep(1);
      setItems([{ incubatorModelId: '', quantity: 1 }]);
      setCustomerInfo({ fullName: '', phone: '', email: '', address: '', description: '' });
      setError(null);
      setCreatedOrder(null);
      setTouched({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (step !== 3 || !createdOrder?.orderId) return;
    const interval = setInterval(async () => {
      try {
        const detail = await orderService.getById(createdOrder.orderId);
        if (detail?.order?.paymentStatus === 'PAID') {
          handleClose();
        }
      } catch {
        // silent
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [step, createdOrder?.orderId]);

  const handleClose = () => {
    onClose();
  };

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const VN_PHONE_RE = /^0[3-9][0-9]{8}$/;
  const phoneError = touched.phone && customerInfo.phone.trim() && !VN_PHONE_RE.test(customerInfo.phone.trim())
    ? 'Số điện thoại không hợp lệ (10 số, bắt đầu 03-09)'
    : null;
  const addressError = touched.address && customerInfo.address.trim().length > 0 && customerInfo.address.trim().length < 10
    ? 'Địa chỉ tối thiểu 10 ký tự'
    : null;
  const addressMissing = touched.address && !customerInfo.address.trim()
    ? 'Vui lòng nhập địa chỉ giao hàng'
    : null;

  const addItem = () => {
    setItems([...items, { incubatorModelId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItemPayload, value: string | number) => {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const isStep1Valid = items.length > 0 && items.every((item) => item.incubatorModelId && item.quantity >= 1);
  const isStep2Valid =
    customerInfo.fullName.trim() &&
    customerInfo.phone.trim() &&
    VN_PHONE_RE.test(customerInfo.phone.trim()) &&
    customerInfo.email.trim() &&
    customerInfo.address.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ phone: true, address: true });
    if (!isStep2Valid) return;
    setLoading(true);
    setError(null);
    try {
      const verificationPass = Math.random().toString(36).slice(2, 10);
      const response = await orderService.createByGuest({
        fullName: customerInfo.fullName.trim(),
        phone: customerInfo.phone.trim(),
        email: customerInfo.email.trim(),
        shippingAddress: customerInfo.address.trim() || undefined,
        description: customerInfo.description.trim() || undefined,
        verificationPass,
        items,
      });
      onSubmit();
      if (response?.qrCode) {
        setCreatedOrder(response);
        setStep(3);
      } else {
        handleClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold">
                {step === 3 ? 'Thanh Toán QR' : 'Tạo Đơn Hàng Mới'}
              </h2>
              <p className="text-green-100 text-xs mt-0.5">
                {step === 3 ? 'Quét mã để thanh toán qua PayOS' : 'Đơn hàng cho khách vãng lai'}
              </p>
            </div>
            <button onClick={handleClose} className="hover:bg-white/20 rounded-lg p-1.5 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Steps */}
          {step < 3 && (
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: 'Sản phẩm', icon: Package },
                { num: 2, label: 'Khách hàng', icon: User },
              ].map((s, index) => {
                const Icon = s.icon;
                return (
                  <div key={s.num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step >= s.num ? 'bg-white text-green-600' : 'bg-green-500 text-white'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-xs mt-0.5 text-green-100">{s.label}</span>
                    </div>
                    {index < 1 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${step > s.num ? 'bg-white' : 'bg-green-500'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Step 1: Products */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Chọn Sản Phẩm</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus size={14} />
                  Thêm sản phẩm
                </button>
              </div>

              {items.map((item, index) => {
                return (
                  <div key={index} className="flex items-end gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Dòng Máy <span className="text-red-500">*</span>
                      </label>
                      <ModelPicker
                        models={models}
                        value={item.incubatorModelId}
                        onChange={(id) => updateItem(index, 'incubatorModelId', id)}
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Số lượng</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        min="1"
                        max="100"
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1.5 text-red-400 hover:text-red-600 transition-colors mb-0.5"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 2: Customer Info */}
          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Thông Tin Khách Hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Họ Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={customerInfo.fullName}
                    onChange={handleCustomerChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerChange}
                    onBlur={() => markTouched('phone')}
                    placeholder="0912345678"
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${phoneError ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                    required
                  />
                  {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleCustomerChange}
                    placeholder="example@email.com"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Địa Chỉ Giao Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleCustomerChange}
                    onBlur={() => markTouched('address')}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${(addressMissing || addressError) ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                    required
                  />
                  {(addressMissing || addressError) && (
                    <p className="mt-1 text-xs text-red-600">{addressMissing ?? addressError}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Ghi Chú</label>
                  <textarea
                    name="description"
                    value={customerInfo.description}
                    onChange={handleCustomerChange}
                    placeholder="Ghi chú thêm..."
                    rows={2}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: QR Payment */}
          {step === 3 && createdOrder && createdOrder.qrCode && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="text-center">
                <p className="text-sm text-slate-500">Đơn hàng đã được tạo thành công!</p>
                {createdOrder.orderCode && (
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">#{createdOrder.orderCode}</p>
                )}
                {createdOrder.totalAmount != null && (
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {createdOrder.totalAmount.toLocaleString('vi-VN')} ₫
                  </p>
                )}
              </div>

              <div className="p-3 bg-white border-2 border-slate-200 rounded-xl">
                <QRCodeSVG
                  value={createdOrder.qrCode}
                  size={210}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {createdOrder.paymentLinkExpiredAt && (
                <p className="text-xs text-orange-600">
                  Hết hạn lúc {new Date(createdOrder.paymentLinkExpiredAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày {new Date(createdOrder.paymentLinkExpiredAt).toLocaleDateString('vi-VN')}
                </p>
              )}

              <p className="text-xs text-slate-500 text-center">
                Khách hàng quét mã QR để thanh toán qua PayOS
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-3 border-t border-slate-200">
            {step === 3 ? (
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-900 transition-colors font-medium"
              >
                Đóng
              </button>
            ) : (
              <>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Quay Lại
                  </button>
                )}
                {step < 2 ? (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp Theo
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !isStep2Valid}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-medium shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    {loading ? 'Đang tạo...' : 'Tạo Đơn Hàng'}
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
