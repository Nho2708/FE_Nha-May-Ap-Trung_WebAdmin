import React, { useState, useEffect } from 'react';
import { X, Package, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { orderService } from '@/services/orders';
import { can } from '@/config/permissions';
import { useSession } from '@/hooks/use-session';
import type { SalesOrder, SalesOrderItem, SalesOrderDetail } from '@/types/order';

interface UpdateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  order: SalesOrder | null;
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
};

const ITEM_STATUS_LABEL: Record<string, string> = {
  PENDING_ASSIGNMENT: 'Chờ gán máy',
  ASSIGNED: 'Đã gán máy',
  CANCELLED: 'Đã hủy',
};

export function UpdateOrderModal({ isOpen, onClose, onSubmit, order }: UpdateOrderModalProps) {
  const session = useSession();
  const role = session?.role;

  const [detail, setDetail] = useState<SalesOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && order) {
      setLoading(true);
      setError(null);
      orderService.getById(order.id)
        .then((data) => setDetail(data))
        .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải chi tiết'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, order]);

  const handleComplete = async () => {
    if (!order) return;
    setActionLoading('complete');
    setError(null);
    try {
      await orderService.complete(order.id);
      onSubmit();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể hoàn thành đơn hàng');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setActionLoading('cancel');
    setError(null);
    try {
      await orderService.cancel(order.id);
      onSubmit();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể hủy đơn hàng');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen || !order) return null;

  const canEdit = can(role, "orders", "edit");
  const canComplete = canEdit && (order.status === 'PROCESSING');
  const canCancel = canEdit && (order.status === 'PENDING' || order.status === 'PROCESSING');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Chi Tiết Đơn Hàng</h2>
              <p className="text-blue-100 text-sm mt-1">
                {order.orderCode ?? order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-2 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Order Info */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Thông Tin Đơn Hàng</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-slate-500 text-xs">Trạng thái:</span>
                <p className="font-semibold text-slate-800">{ORDER_STATUS_LABEL[order.status] ?? order.status}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Thanh toán:</span>
                <p className="font-semibold text-slate-800">{PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Tổng tiền:</span>
                <p className="font-semibold text-green-600">{order.totalAmount.toLocaleString('vi-VN')} ₫</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Ngày đặt:</span>
                <p className="font-semibold text-slate-800">
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleDateString('vi-VN')
                    : new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              {order.shippingAddress && (
                <div className="col-span-2">
                  <span className="text-slate-500 text-xs">Địa chỉ giao:</span>
                  <p className="font-medium text-slate-800">{order.shippingAddress}</p>
                </div>
              )}
              {order.checkoutUrl && order.paymentStatus === 'PENDING' && (
                <div className="col-span-2">
                  <a
                    href={order.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    <ExternalLink size={12} />
                    Link thanh toán
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Sản Phẩm Trong Đơn</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : detail?.items && detail.items.length > 0 ? (
              <div className="space-y-2">
                {detail.items.map((item: SalesOrderItem) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                    <div>
                      <p className="font-medium text-slate-800 text-xs">
                        Model ID: {item.incubatorModelId.slice(0, 8)}...
                      </p>
                      {item.incubatorId && (
                        <p className="text-xs text-slate-500">Máy: {item.incubatorId.slice(0, 8)}...</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{item.unitPrice.toLocaleString('vi-VN')} ₫</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.status === 'ASSIGNED' ? 'bg-green-100 text-green-700' :
                        item.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ITEM_STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-3">Không có sản phẩm</p>
            )}
          </div>

          {/* Actions */}
          {canEdit && (canComplete || canCancel) && (
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Đóng
              </button>
              {canCancel && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={actionLoading === 'cancel'}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle size={16} />
                  {actionLoading === 'cancel' ? 'Đang hủy...' : 'Hủy Đơn'}
                </button>
              )}
              {canComplete && (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={actionLoading === 'complete'}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  {actionLoading === 'complete' ? 'Đang xử lý...' : 'Hoàn Thành'}
                </button>
              )}
            </div>
          )}

          {(!canComplete && !canCancel) && (
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
