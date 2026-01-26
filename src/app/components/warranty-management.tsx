import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Shield, AlertCircle, CheckCircle, Calendar, X } from 'lucide-react';
import { Pagination } from './pagination';

interface WarrantyProduct {
  id: string;
  productName: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  purchaseDate: string;
  warrantyEndDate: string;
  warrantyStatus: 'active' | 'expiring' | 'expired';
  serviceCounts: number;
  maxServiceAllowed: number;
  issues: TechnicalIssue[];
}

interface TechnicalIssue {
  issueId: string;
  issueDate: string;
  issueType: string;
  description: string;
  status: 'reported' | 'in-progress' | 'resolved';
  resolutionDate?: string;
  notes?: string;
}

const mockWarrantyProducts: WarrantyProduct[] = [
  {
    id: 'WRT-2024-001',
    productName: 'Máy Ấp Trứng 1000 Trứng',
    productId: 'INC-2024-045',
    customerName: 'Nguyễn Văn A',
    customerEmail: 'nva@example.com',
    customerPhone: '0912345678',
    purchaseDate: '2023-12-15',
    warrantyEndDate: '2024-12-15',
    warrantyStatus: 'expiring',
    serviceCounts: 1,
    maxServiceAllowed: 3,
    issues: [
      {
        issueId: 'ISS-001',
        issueDate: '2024-01-08',
        issueType: 'Nhiệt độ',
        description: 'Máy không gia nhiệt đều',
        status: 'resolved',
        resolutionDate: '2024-01-09',
        notes: 'Thay cảm biến nhiệt độ'
      }
    ]
  },
  {
    id: 'WRT-2024-002',
    productName: 'Máy Ấp Trứng 500 Trứng',
    productId: 'INC-2024-032',
    customerName: 'Trần Thị B',
    customerEmail: 'ttb@example.com',
    customerPhone: '0987654321',
    purchaseDate: '2024-01-05',
    warrantyEndDate: '2025-01-05',
    warrantyStatus: 'active',
    serviceCounts: 0,
    maxServiceAllowed: 3,
    issues: []
  },
  {
    id: 'WRT-2024-003',
    productName: 'Máy Ấp Trứng 2000 Trứng',
    productId: 'INC-2024-087',
    customerName: 'Phạm Văn C',
    customerEmail: 'pvc@example.com',
    customerPhone: '0912987654',
    purchaseDate: '2023-01-20',
    warrantyEndDate: '2024-01-20',
    warrantyStatus: 'expired',
    serviceCounts: 2,
    maxServiceAllowed: 3,
    issues: [
      {
        issueId: 'ISS-002',
        issueDate: '2023-08-15',
        issueType: 'Motor',
        description: 'Motor đảo trứng không chạy',
        status: 'resolved',
        resolutionDate: '2023-08-20',
        notes: 'Thay motor mới'
      },
      {
        issueId: 'ISS-003',
        issueDate: '2023-11-10',
        issueType: 'Điện',
        description: 'Cảnh báo quá điện áp',
        status: 'resolved',
        resolutionDate: '2023-11-12',
        notes: 'Kiểm tra và hiệu chỉnh bảng điều khiển'
      }
    ]
  },
  {
    id: 'WRT-2024-004',
    productName: 'Máy Ấp Trứng 1500 Trứng',
    productId: 'INC-2024-056',
    customerName: 'Hoàng Thị D',
    customerEmail: 'htd@example.com',
    customerPhone: '0945678901',
    purchaseDate: '2023-06-10',
    warrantyEndDate: '2025-06-10',
    warrantyStatus: 'active',
    serviceCounts: 2,
    maxServiceAllowed: 3,
    issues: [
      {
        issueId: 'ISS-004',
        issueDate: '2024-01-07',
        issueType: 'Độ ẩm',
        description: 'Cảm biến độ ẩm không chính xác',
        status: 'in-progress',
        notes: 'Đang chờ thay thế cảm biến'
      }
    ]
  }
];

const statusConfig = {
  active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Còn Hiệu Lực', icon: CheckCircle },
  expiring: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Sắp Hết', icon: AlertCircle },
  expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã Hết', icon: AlertCircle }
};

const issueStatusConfig = {
  reported: { label: 'Báo Cáo', color: 'bg-blue-100 text-blue-800' },
  'in-progress': { label: 'Đang Xử Lý', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'Đã Giải Quyết', color: 'bg-green-100 text-green-800' }
};

export function WarrantyManagement() {
  const [warranties, setWarranties] = useState<WarrantyProduct[]>(mockWarrantyProducts);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const itemsPerPage = 10;

  // Filter warranties
  const filteredWarranties = warranties.filter(w => {
    const matchesSearch = w.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         w.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         w.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || w.warrantyStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredWarranties.length / itemsPerPage);
  const displayedWarranties = filteredWarranties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: warranties.length,
    active: warranties.filter(w => w.warrantyStatus === 'active').length,
    expiring: warranties.filter(w => w.warrantyStatus === 'expiring').length,
    expired: warranties.filter(w => w.warrantyStatus === 'expired').length
  };

  const handleAddWarranty = () => {
    setIsAddModalOpen(true);
  };

  const handleAddIssue = () => {
    if (!selectedWarranty) return;
    setIsIssueModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Shield size={32} className="text-blue-600" />
          Quản Lý Bảo Hành
        </h2>
        <p className="text-slate-600 mt-1">Quản lý sản phẩm bảo hành, số lần bảo hành và lỗi kỹ thuật</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <p className="text-sm text-slate-600 mb-2">Tổng Sản Phẩm</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-green-200">
          <p className="text-sm text-green-700 mb-2">Còn Hiệu Lực</p>
          <p className="text-3xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-2">Sắp Hết</p>
          <p className="text-3xl font-bold text-yellow-700">{stats.expiring}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-red-200">
          <p className="text-sm text-red-700 mb-2">Đã Hết</p>
          <p className="text-3xl font-bold text-red-700">{stats.expired}</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Warranty List */}
        <div className="col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Danh Sách Bảo Hành</h3>
              <button
                onClick={handleAddWarranty}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Thêm Bảo Hành
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm, khách hàng..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất Cả</option>
                <option value="active">Còn Hiệu Lực</option>
                <option value="expiring">Sắp Hết</option>
                <option value="expired">Đã Hết</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Mã BH</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Sản Phẩm</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Khách Hàng</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Trạng Thái</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Sửa/Tổng</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Hết Hạn</th>
                </tr>
              </thead>
              <tbody>
                {displayedWarranties.map((warranty) => {
                  const config = statusConfig[warranty.warrantyStatus];
                  const StatusIcon = config.icon;
                  return (
                    <tr
                      key={warranty.id}
                      onClick={() => setSelectedWarranty(warranty)}
                      className={`border-b border-slate-200 cursor-pointer transition-colors ${
                        selectedWarranty?.id === warranty.id
                          ? 'bg-blue-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{warranty.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{warranty.productName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{warranty.customerName}</td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                          <StatusIcon size={14} />
                          {config.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {warranty.serviceCounts}/{warranty.maxServiceAllowed}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{warranty.warrantyEndDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredWarranties.length}
              />
            </div>
          )}
        </div>

        {/* Warranty Details */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {selectedWarranty ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{selectedWarranty.id}</h3>
                <p className="text-sm text-slate-600">{selectedWarranty.productName}</p>
              </div>

              {/* Details */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Thông Tin Khách Hàng</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-600"><span className="font-medium">Tên:</span> {selectedWarranty.customerName}</p>
                    <p className="text-slate-600"><span className="font-medium">Email:</span> {selectedWarranty.customerEmail}</p>
                    <p className="text-slate-600"><span className="font-medium">Điện Thoại:</span> {selectedWarranty.customerPhone}</p>
                  </div>
                </div>

                {/* Warranty Info */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Calendar size={16} />
                    Thông Tin Bảo Hành
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-600"><span className="font-medium">Ngày Mua:</span> {selectedWarranty.purchaseDate}</p>
                    <p className="text-slate-600"><span className="font-medium">Hết Hạn:</span> {selectedWarranty.warrantyEndDate}</p>
                    <p className="text-slate-600">
                      <span className="font-medium">Trạng Thái:</span>
                      <span className="ml-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusConfig[selectedWarranty.warrantyStatus].bg} ${statusConfig[selectedWarranty.warrantyStatus].text}`}>
                          {statusConfig[selectedWarranty.warrantyStatus].label}
                        </span>
                      </span>
                    </p>
                    <p className="text-slate-600"><span className="font-medium">Lần Bảo Hành:</span> {selectedWarranty.serviceCounts}/{selectedWarranty.maxServiceAllowed}</p>
                  </div>
                </div>

                {/* Issues */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Lỗi Kỹ Thuật ({selectedWarranty.issues.length})</h4>
                  <div className="space-y-2">
                    {selectedWarranty.issues.length > 0 ? (
                      selectedWarranty.issues.map(issue => (
                        <div key={issue.issueId} className="p-3 bg-slate-50 rounded-lg text-sm">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-slate-900">{issue.issueType}</p>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${issueStatusConfig[issue.status].color}`}>
                              {issueStatusConfig[issue.status].label}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs mb-1">{issue.description}</p>
                          <p className="text-slate-500 text-xs">Ngày báo cáo: {issue.issueDate}</p>
                          {issue.notes && <p className="text-slate-600 text-xs mt-1">Ghi chú: {issue.notes}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Không có lỗi nào được báo cáo</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-slate-200 space-y-2">
                <button
                  onClick={handleAddIssue}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <AlertCircle size={16} />
                  Thêm Lỗi Kỹ Thuật
                </button>
                <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                  Gia Hạn Bảo Hành
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center py-12">
              <div>
                <Shield size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">Chọn sản phẩm để xem chi tiết bảo hành</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Warranty Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Thêm Bảo Hành Mới</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sản Phẩm</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>-- Chọn sản phẩm --</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Khách Hàng</label>
                  <input
                    type="text"
                    placeholder="Nhập tên khách hàng"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày Mua</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thời Hạn (Năm)</label>
                  <input
                    type="number"
                    placeholder="1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số Lần Bảo Hành Tối Đa</label>
                  <input
                    type="number"
                    placeholder="3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Issue Modal */}
      {isIssueModalOpen && selectedWarranty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Thêm Lỗi Kỹ Thuật</h3>
                <button
                  onClick={() => setIsIssueModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại Lỗi</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>-- Chọn loại lỗi --</option>
                    <option>Nhiệt độ</option>
                    <option>Motor</option>
                    <option>Điện</option>
                    <option>Độ ẩm</option>
                    <option>Cảm biến</option>
                    <option>Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô Tả Lỗi</label>
                  <textarea
                    placeholder="Mô tả chi tiết lỗi kỹ thuật"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ghi Chú</label>
                  <textarea
                    placeholder="Ghi chú thêm"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsIssueModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => setIsIssueModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                >
                  <AlertCircle size={16} />
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
