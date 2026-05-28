import React, { useState, useEffect, useCallback } from 'react';
import { Package, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle, QrCode } from 'lucide-react';
import { CreateOrderModal } from './create-order-modal';
import { UpdateOrderModal } from './update-order-modal';
import { PaymentQRModal } from './payment-qr-modal';
import { Pagination } from './pagination';
import { ResourceActionsMenu } from './resource-actions-menu';
import { can } from '@/config/permissions';
import { useSession } from '@/hooks/use-session';
import { orderService } from '@/services/orders';
import type { SalesOrder, OrderStatus } from '@/types/order';

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800', icon: Package },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ thanh toán', color: 'bg-yellow-50 text-yellow-700' },
  PAID: { label: 'Đã thanh toán', color: 'bg-green-50 text-green-700' },
  FAILED: { label: 'Thất bại', color: 'bg-red-50 text-red-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-slate-100 text-slate-600' },
  EXPIRED: { label: 'Hết hạn', color: 'bg-orange-50 text-orange-700' },
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const config = ORDER_STATUS_CONFIG[status as OrderStatus] ?? { label: status, color: 'bg-slate-100 text-slate-600', icon: Clock };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={11} />
      {config.label}
    </span>
  );
};

export function SalesOrders() {
  const session = useSession();
  const role = session?.role;

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [qrOrder, setQrOrder] = useState<SalesOrder | null>(null);

  const pageSize = 10;

  const fetchOrders = useCallback(async (page = 1, status = '') => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.list({ page, pageSize, status: status || undefined });
      setOrders(result.items);
      setTotalItems(result.totalItems);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage, statusFilter);
  }, [fetchOrders, currentPage, statusFilter]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCreated = () => {
    fetchOrders(1, statusFilter);
    setCurrentPage(1);
  };

  const handleUpdated = () => {
    fetchOrders(currentPage, statusFilter);
    setIsUpdateModalOpen(false);
    setSelectedOrder(null);
  };

  const openUpdateModal = (order: SalesOrder) => {
    setSelectedOrder(order);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Quản Lý Đơn Hàng</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOrders(currentPage, statusFilter)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Làm mới"
          >
            <RefreshCw size={16} />
          </button>
          {can(role, "orders", "edit") && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Package size={16} />
              Tạo Đơn Hàng
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filter Bar */}
        <div className="border-b border-slate-200 px-6 py-3 flex items-center gap-2 flex-wrap">
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusFilterChange(opt.value)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
              <p className="text-sm text-slate-500 mt-2">Đang tải...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">Không có đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mã Đơn</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Địa Chỉ Giao</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Trạng Thái</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Thanh Toán</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tổng Tiền</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ngày Đặt</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orders.map((order) => {
                    const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] ?? { label: order.paymentStatus, color: 'bg-slate-100 text-slate-600' };
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-900">
                            {order.orderCode ?? order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-600 line-clamp-1 max-w-[160px]">
                            {order.shippingAddress || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${paymentCfg.color}`}>
                            {paymentCfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                          {order.totalAmount.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">
                          {order.orderDate
                            ? new Date(order.orderDate).toLocaleDateString('vi-VN')
                            : new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {order.qrCode && order.paymentStatus === 'PENDING' && (
                              <button
                                onClick={() => setQrOrder(order)}
                                title="Xem mã QR thanh toán"
                                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <QrCode size={16} />
                              </button>
                            )}
                            <ResourceActionsMenu
                              canEdit={can(role, "orders", "edit")}
                              canDelete={false}
                              onEdit={() => openUpdateModal(order)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-5 pb-4">
            <Pagination
              totalItems={totalItems}
              itemsPerPage={pageSize}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreated}
      />

      <UpdateOrderModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleUpdated}
        order={selectedOrder}
      />

      <PaymentQRModal
        isOpen={!!qrOrder}
        onClose={() => setQrOrder(null)}
        qrCode={qrOrder?.qrCode ?? ''}
        orderCode={qrOrder?.orderCode ?? qrOrder?.id.slice(0, 8).toUpperCase()}
        totalAmount={qrOrder?.totalAmount}
        expiredAt={qrOrder?.paymentLinkExpiredAt}
      />
    </div>
  );
}
