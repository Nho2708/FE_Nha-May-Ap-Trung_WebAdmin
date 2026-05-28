import React from 'react';
import { X, QrCode, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  orderCode?: string | number | null;
  totalAmount?: number | null;
  expiredAt?: string | null;
}

export function PaymentQRModal({ isOpen, onClose, qrCode, orderCode, totalAmount, expiredAt }: PaymentQRModalProps) {
  if (!isOpen) return null;

  const expiredDate = expiredAt ? new Date(expiredAt) : null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-slate-800">Mã QR Thanh Toán</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-6 flex flex-col items-center gap-4">
          {orderCode && (
            <div className="text-center">
              <p className="text-xs text-slate-500">Đơn hàng</p>
              <p className="text-sm font-semibold text-slate-800">#{orderCode}</p>
            </div>
          )}

          <div className="p-3 bg-white border-2 border-slate-200 rounded-xl">
            <QRCodeSVG
              value={qrCode}
              size={220}
              level="M"
              includeMargin={false}
            />
          </div>

          {totalAmount != null && (
            <div className="text-center">
              <p className="text-xs text-slate-500">Số tiền</p>
              <p className="text-lg font-bold text-blue-600">
                {totalAmount.toLocaleString('vi-VN')} ₫
              </p>
            </div>
          )}

          {expiredDate && (
            <div className="flex items-center gap-1.5 text-xs text-orange-600">
              <Clock size={13} />
              <span>Hết hạn lúc {expiredDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày {expiredDate.toLocaleDateString('vi-VN')}</span>
            </div>
          )}

          <p className="text-xs text-slate-500 text-center">
            Khách hàng quét mã QR để thanh toán qua PayOS
          </p>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-900 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
