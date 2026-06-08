import React, { useState, useEffect } from 'react';
import { X, Package, CheckCircle, XCircle, AlertCircle, Wrench, Truck } from 'lucide-react';
import { orderService } from '@/services/orders';
import { incubatorService } from '@/services/incubators';
import { incubatorModelService } from '@/services/incubatorModels';
import { can } from '@/config/permissions';
import { useSession } from '@/hooks/use-session';
import type { SalesOrder, SalesOrderItem, SalesOrderDetail } from '@/types/order';
import type { Incubator } from '@/types/incubator';

interface UpdateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  order: SalesOrder | null;
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao hàng',
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

interface AssignState {
  incubators: Incubator[];
  selectedId: string;
  loading: boolean;
}

export function UpdateOrderModal({ isOpen, onClose, onSubmit, order }: UpdateOrderModalProps) {
  const session = useSession();
  const role = session?.role;

  const [detail, setDetail] = useState<SalesOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelCodeMap, setModelCodeMap] = useState<Map<string, string>>(new Map());
  const [serialMap, setSerialMap] = useState<Map<string, string>>(new Map());

  // itemId → assign UI state
  const [assignMap, setAssignMap] = useState<Record<string, AssignState>>({});

  const loadDetail = () => {
    if (!order) return;
    setLoading(true);
    setError(null);
    orderService.getById(order.id)
      .then(async (data) => {
        setDetail(data);
        if (!data?.items?.length) return;
        const modelIds = [...new Set(data.items.map((i) => i.incubatorModelId))];
        const incubatorIds = data.items.map((i) => i.incubatorId).filter(Boolean) as string[];
        const [models, incubatorList] = await Promise.all([
          incubatorModelService.list({ pageSize: 200 }).catch(() => ({ items: [] })),
          Promise.all(incubatorIds.map((id) => incubatorService.getById(id).catch(() => null))),
        ]);
        setModelCodeMap(new Map(
          models.items.filter((m) => modelIds.includes(m.id)).map((m) => [m.id, m.name])
        ));
        setSerialMap(new Map(
          incubatorList.filter(Boolean).map((i) => [i!.id, i!.serialNumber ?? i!.id])
        ));
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải chi tiết'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen && order) {
      setAssignMap({});
      loadDetail();
    }
  }, [isOpen, order]);

  const handleShip = async () => {
    if (!order) return;
    setActionLoading('ship');
    setError(null);
    try {
      await orderService.ship(order.id);
      onSubmit();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể xác nhận giao hàng');
    } finally {
      setActionLoading(null);
    }
  };

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

  const openAssignPanel = async (item: SalesOrderItem) => {
    setAssignMap((prev) => ({
      ...prev,
      [item.id]: { incubators: [], selectedId: '', loading: true },
    }));
    try {
      const result = await incubatorService.list({
        modelId: item.incubatorModelId,
        status: 'AVAILABLE',
        pageSize: 50,
      });
      setAssignMap((prev) => ({
        ...prev,
        [item.id]: { incubators: result.items, selectedId: '', loading: false },
      }));
    } catch {
      setAssignMap((prev) => ({
        ...prev,
        [item.id]: { incubators: [], selectedId: '', loading: false },
      }));
    }
  };

  const closeAssignPanel = (itemId: string) => {
    setAssignMap((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleAssign = async (item: SalesOrderItem) => {
    if (!order) return;
    const state = assignMap[item.id];
    if (!state?.selectedId) return;
    setActionLoading(`assign-${item.id}`);
    setError(null);
    try {
      await orderService.assignIncubator(order.id, {
        orderItemId: item.id,
        incubatorId: state.selectedId,
      });
      setAssignMap({});
      loadDetail();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể gán máy');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen || !order) return null;

  const effectiveOrder = detail?.order ?? order;
  const canEdit = can(role, 'orders', 'edit');
  const canShip = canEdit && effectiveOrder.status === 'PROCESSING';
  const canComplete = canEdit && effectiveOrder.status === 'SHIPPING';
  const canCancel = canEdit && (effectiveOrder.status === 'PENDING' || effectiveOrder.status === 'PROCESSING' || effectiveOrder.status === 'SHIPPING');
  const canAssign = canEdit && effectiveOrder.paymentStatus === 'PAID';

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
                <p className={`font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-slate-800'}`}>
                  {PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
                </p>
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
                {detail.items.map((item: SalesOrderItem) => {
                  const assign = assignMap[item.id];
                  const isAssigning = actionLoading === `assign-${item.id}`;
                  return (
                    <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      {/* Item row */}
                      <div className="flex items-center justify-between px-3 py-3 bg-slate-50">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-slate-400 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-slate-700">
                              Model: <span className="font-semibold">{modelCodeMap.get(item.incubatorModelId) ?? '—'}</span>
                            </p>
                            {item.incubatorId && (
                              <p className="text-xs text-slate-500">
                                Serial: <span className="font-semibold text-slate-700">{serialMap.get(item.incubatorId) ?? '—'}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-xs font-semibold text-slate-800">{item.unitPrice.toLocaleString('vi-VN')} ₫</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              item.status === 'ASSIGNED' ? 'bg-green-100 text-green-700' :
                              item.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {ITEM_STATUS_LABEL[item.status] ?? item.status}
                            </span>
                          </div>
                          {canAssign && item.status === 'PENDING_ASSIGNMENT' && !assign && (
                            <button
                              onClick={() => openAssignPanel(item)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium shrink-0"
                            >
                              <Wrench size={12} />
                              Gán máy
                            </button>
                          )}
                          {assign && (
                            <button
                              onClick={() => closeAssignPanel(item.id)}
                              className="text-xs text-slate-400 hover:text-slate-600 px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Assign panel */}
                      {assign && (
                        <div className="px-3 py-3 border-t border-slate-200 bg-blue-50">
                          {assign.loading ? (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <div className="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full" />
                              Đang tải danh sách máy...
                            </div>
                          ) : assign.incubators.length === 0 ? (
                            <p className="text-xs text-orange-600">Không có máy khả dụng cho dòng này.</p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <select
                                value={assign.selectedId}
                                onChange={(e) =>
                                  setAssignMap((prev) => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], selectedId: e.target.value },
                                  }))
                                }
                                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              >
                                <option value="">-- Chọn máy --</option>
                                {assign.incubators.map((inc) => (
                                  <option key={inc.id} value={inc.id}>
                                    {inc.serialNumber ?? inc.id.slice(0, 8)}
                                    {inc.modelName ? ` — ${inc.modelName}` : ''}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssign(item)}
                                disabled={!assign.selectedId || isAssigning}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 shrink-0"
                              >
                                {isAssigning ? 'Đang gán...' : 'Xác nhận'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-3">Không có sản phẩm</p>
            )}
          </div>

          {/* Actions */}
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
            {canShip && (
              <button
                type="button"
                onClick={handleShip}
                disabled={actionLoading === 'ship'}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Truck size={16} />
                {actionLoading === 'ship' ? 'Đang xử lý...' : 'Giao Hàng'}
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
                {actionLoading === 'complete' ? 'Đang xử lý...' : 'Đã Nhận'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
