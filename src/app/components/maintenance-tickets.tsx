import React, { useState } from 'react';
import { Wrench, AlertCircle, Clock, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface Ticket {
  id: string;
  deviceId: string;
  customer: string;
  issue: string;
  status: 'new' | 'processing' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  assignee?: string;
  solution?: string;
  hasImage: boolean;
}

const mockTickets: Ticket[] = [
  {
    id: 'TKT-2024-001',
    deviceId: 'INC-2024-045',
    customer: 'Nguyễn Văn A',
    issue: 'Máy không gia nhiệt, nhiệt độ giảm xuống dưới 35°C',
    status: 'processing',
    priority: 'high',
    createdAt: '2024-01-08 09:30',
    assignee: 'Kỹ thuật viên Minh',
    hasImage: true
  },
  {
    id: 'TKT-2024-002',
    deviceId: 'INC-2024-032',
    customer: 'Trần Thị B',
    issue: 'Motor đảo trứng không hoạt động',
    status: 'new',
    priority: 'high',
    createdAt: '2024-01-08 14:15',
    hasImage: true
  },
  {
    id: 'TKT-2024-003',
    deviceId: 'INC-2024-028',
    customer: 'Lê Văn C',
    issue: 'Màn hình LCD hiển thị không chính xác',
    status: 'done',
    priority: 'medium',
    createdAt: '2024-01-07 16:20',
    assignee: 'Kỹ thuật viên Hùng',
    solution: 'Reset cài đặt và cập nhật firmware',
    hasImage: false
  },
  {
    id: 'TKT-2024-004',
    deviceId: 'INC-2024-019',
    customer: 'Phạm Thị D',
    issue: 'Quạt hoạt động không ổn định',
    status: 'processing',
    priority: 'medium',
    createdAt: '2024-01-08 10:45',
    assignee: 'Kỹ thuật viên Minh',
    hasImage: true
  },
  {
    id: 'TKT-2024-005',
    deviceId: 'INC-2024-012',
    customer: 'Hoàng Văn E',
    issue: 'Cảm biến độ ẩm báo lỗi',
    status: 'new',
    priority: 'low',
    createdAt: '2024-01-08 15:30',
    hasImage: false
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    new: { label: 'Mới', color: 'bg-blue-100 text-blue-800', icon: Clock },
    processing: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
    done: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  };

  const { label, color, icon: Icon } = config[status as keyof typeof config];

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const config = {
    low: { label: 'Thấp', color: 'bg-slate-100 text-slate-700' },
    medium: { label: 'Trung bình', color: 'bg-orange-100 text-orange-700' },
    high: { label: 'Cao', color: 'bg-red-100 text-red-700' },
  };

  const { label, color } = config[priority as keyof typeof config];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

export function MaintenanceTickets() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTickets = filterStatus === 'all'
    ? mockTickets
    : mockTickets.filter(t => t.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Hệ Thống Bảo Trì</h2>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="new">Mới</option>
            <option value="processing">Đang xử lý</option>
            <option value="done">Hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 mb-1">Ticket Mới</p>
              <p className="text-3xl font-bold text-blue-600">
                {mockTickets.filter(t => t.status === 'new').length}
              </p>
            </div>
            <Clock size={32} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 mb-1">Đang Xử Lý</p>
              <p className="text-3xl font-bold text-yellow-600">
                {mockTickets.filter(t => t.status === 'processing').length}
              </p>
            </div>
            <Wrench size={32} className="text-yellow-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 mb-1">Hoàn Thành</p>
              <p className="text-3xl font-bold text-green-600">
                {mockTickets.filter(t => t.status === 'done').length}
              </p>
            </div>
            <CheckCircle size={32} className="text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`bg-white rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                selectedTicket?.id === ticket.id
                  ? 'border-blue-500'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-800">{ticket.id}</h3>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Thiết bị: <span className="font-medium text-slate-800">{ticket.deviceId}</span>
                  </p>
                  <p className="text-sm text-slate-700">{ticket.issue}</p>
                </div>
                {ticket.hasImage && (
                  <ImageIcon size={20} className="text-blue-500 ml-3" />
                )}
              </div>

              <div className="flex items-center justify-between text-sm border-t border-slate-200 pt-3 mt-3">
                <div className="text-slate-600">
                  <span className="font-medium text-slate-800">{ticket.customer}</span>
                  <span className="mx-2">•</span>
                  <span>{ticket.createdAt}</span>
                </div>
                {ticket.assignee && (
                  <span className="text-blue-600 font-medium">
                    {ticket.assignee}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Ticket Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit sticky top-6">
          {selectedTicket ? (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Chi Tiết Ticket
                </h3>
                <p className="text-sm text-slate-600">{selectedTicket.id}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Trạng thái
                  </label>
                  <StatusBadge status={selectedTicket.status} />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Mức độ ưu tiên
                  </label>
                  <PriorityBadge priority={selectedTicket.priority} />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Thiết bị
                  </label>
                  <p className="text-sm text-slate-800 bg-slate-50 px-3 py-2 rounded">
                    {selectedTicket.deviceId}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Khách hàng
                  </label>
                  <p className="text-sm text-slate-800 bg-slate-50 px-3 py-2 rounded">
                    {selectedTicket.customer}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Mô tả lỗi
                  </label>
                  <p className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded">
                    {selectedTicket.issue}
                  </p>
                </div>

                {selectedTicket.assignee && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Kỹ thuật viên
                    </label>
                    <p className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-2 rounded">
                      {selectedTicket.assignee}
                    </p>
                  </div>
                )}

                {selectedTicket.solution && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Giải pháp
                    </label>
                    <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                      {selectedTicket.solution}
                    </p>
                  </div>
                )}

                {selectedTicket.hasImage && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Hình ảnh đính kèm
                    </label>
                    <div className="bg-slate-100 rounded-lg p-4 text-center">
                      <ImageIcon size={32} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-xs text-slate-600">Có hình ảnh đính kèm</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  {selectedTicket.status === 'new' && (
                    <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Nhận Xử Lý
                    </button>
                  )}
                  {selectedTicket.status === 'processing' && (
                    <>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Thu Hồi Thiết Bị
                      </button>
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Hoàn Thành
                      </button>
                      <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                        Hướng Dẫn User
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wrench size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Chọn ticket để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
