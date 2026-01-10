import React, { useState } from 'react';
import { Wrench, AlertCircle, Clock, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Pagination } from './pagination';

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
  {
    id: 'TKT-2024-006',
    deviceId: 'INC-2024-056',
    customer: 'Vũ Thị F',
    issue: 'Máy tự động tắt sau 2 giờ hoạt động',
    status: 'processing',
    priority: 'high',
    createdAt: '2024-01-09 08:15',
    assignee: 'Kỹ thuật viên Hùng',
    hasImage: true
  },
  {
    id: 'TKT-2024-007',
    deviceId: 'INC-2024-067',
    customer: 'Đặng Văn G',
    issue: 'Cảnh báo nhiệt độ cao liên tục',
    status: 'new',
    priority: 'high',
    createdAt: '2024-01-09 11:20',
    hasImage: true
  },
  {
    id: 'TKT-2024-008',
    deviceId: 'INC-2024-021',
    customer: 'Bùi Thị H',
    issue: 'Nút bấm không phản hồi',
    status: 'done',
    priority: 'low',
    createdAt: '2024-01-07 14:30',
    assignee: 'Kỹ thuật viên Minh',
    solution: 'Thay bàn phím mới',
    hasImage: false
  },
  {
    id: 'TKT-2024-009',
    deviceId: 'INC-2024-038',
    customer: 'Ngô Văn I',
    issue: 'Độ ẩm không đạt mức cài đặt',
    status: 'processing',
    priority: 'medium',
    createdAt: '2024-01-09 09:45',
    assignee: 'Kỹ thuật viên Hùng',
    hasImage: true
  },
  {
    id: 'TKT-2024-010',
    deviceId: 'INC-2024-049',
    customer: 'Phan Thị J',
    issue: 'Tiếng ồn bất thường từ motor',
    status: 'new',
    priority: 'medium',
    createdAt: '2024-01-09 13:00',
    hasImage: true
  },
  {
    id: 'TKT-2024-011',
    deviceId: 'INC-2024-014',
    customer: 'Trịnh Văn K',
    issue: 'Đèn báo hiệu không sáng',
    status: 'done',
    priority: 'low',
    createdAt: '2024-01-06 10:15',
    assignee: 'Kỹ thuật viên Minh',
    solution: 'Thay đèn LED mới',
    hasImage: false
  },
  {
    id: 'TKT-2024-012',
    deviceId: 'INC-2024-072',
    customer: 'Lý Thị L',
    issue: 'Lỗi kết nối WiFi',
    status: 'processing',
    priority: 'low',
    createdAt: '2024-01-09 14:30',
    assignee: 'Kỹ thuật viên Hùng',
    hasImage: false
  },
  {
    id: 'TKT-2024-013',
    deviceId: 'INC-2024-083',
    customer: 'Mai Văn M',
    issue: 'Bộ nhớ lưu trữ đầy',
    status: 'new',
    priority: 'medium',
    createdAt: '2024-01-10 08:00',
    hasImage: false
  },
  {
    id: 'TKT-2024-014',
    deviceId: 'INC-2024-051',
    customer: 'Dương Thị N',
    issue: 'Quạt không quay sau khi bật máy',
    status: 'processing',
    priority: 'high',
    createdAt: '2024-01-10 09:20',
    assignee: 'Kỹ thuật viên Minh',
    hasImage: true
  },
  {
    id: 'TKT-2024-015',
    deviceId: 'INC-2024-029',
    customer: 'Hà Văn O',
    issue: 'Cảm biến nhiệt độ đọc sai',
    status: 'done',
    priority: 'high',
    createdAt: '2024-01-08 11:00',
    assignee: 'Kỹ thuật viên Hùng',
    solution: 'Hiệu chuẩn lại cảm biến',
    hasImage: true
  },
  {
    id: 'TKT-2024-016',
    deviceId: 'INC-2024-094',
    customer: 'Cao Thị P',
    issue: 'Máy không lưu cài đặt',
    status: 'new',
    priority: 'medium',
    createdAt: '2024-01-10 10:15',
    hasImage: false
  },
  {
    id: 'TKT-2024-017',
    deviceId: 'INC-2024-063',
    customer: 'Tô Văn Q',
    issue: 'Nguồn điện không ổn định',
    status: 'processing',
    priority: 'high',
    createdAt: '2024-01-10 11:30',
    assignee: 'Kỹ thuật viên Minh',
    hasImage: true
  },
  {
    id: 'TKT-2024-018',
    deviceId: 'INC-2024-041',
    customer: 'Đinh Thị R',
    issue: 'Ứng dụng mobile không kết nối được',
    status: 'new',
    priority: 'low',
    createdAt: '2024-01-10 12:45',
    hasImage: false
  },
  {
    id: 'TKT-2024-019',
    deviceId: 'INC-2024-076',
    customer: 'Lâm Văn S',
    issue: 'Khay đảo trứng bị kẹt',
    status: 'done',
    priority: 'high',
    createdAt: '2024-01-09 07:30',
    assignee: 'Kỹ thuật viên Hùng',
    solution: 'Vệ sinh và bôi trơn motor',
    hasImage: true
  },
  {
    id: 'TKT-2024-020',
    deviceId: 'INC-2024-088',
    customer: 'Ông Thị T',
    issue: 'Báo lỗi E03 không rõ nguyên nhân',
    status: 'processing',
    priority: 'medium',
    createdAt: '2024-01-10 13:00',
    assignee: 'Kỹ thuật viên Minh',
    hasImage: true
  },
  {
    id: 'TKT-2024-021',
    deviceId: 'INC-2024-052',
    customer: 'Võ Văn U',
    issue: 'Máy phát ra mùi cháy nhẹ',
    status: 'new',
    priority: 'high',
    createdAt: '2024-01-10 14:00',
    hasImage: true
  },
  {
    id: 'TKT-2024-022',
    deviceId: 'INC-2024-069',
    customer: 'Từ Thị V',
    issue: 'Thời gian đảo trứng không chính xác',
    status: 'done',
    priority: 'medium',
    createdAt: '2024-01-09 15:30',
    assignee: 'Kỹ thuật viên Hùng',
    solution: 'Cập nhật firmware mới nhất',
    hasImage: false
  },
  {
    id: 'TKT-2024-023',
    deviceId: 'INC-2024-035',
    customer: 'Khương Văn W',
    issue: 'Màn hình hiển thị nhấp nháy',
    status: 'processing',
    priority: 'low',
    createdAt: '2024-01-10 15:00',
    assignee: 'Kỹ thuật viên Minh',
    hasImage: true
  },
  {
    id: 'TKT-2024-024',
    deviceId: 'INC-2024-091',
    customer: 'La Thị X',
    issue: 'Cửa máy đóng không kín',
    status: 'new',
    priority: 'medium',
    createdAt: '2024-01-10 16:00',
    hasImage: true
  },
  {
    id: 'TKT-2024-025',
    deviceId: 'INC-2024-047',
    customer: 'Thạch Văn Y',
    issue: 'Hệ thống báo lỗi cảm biến áp suất',
    status: 'processing',
    priority: 'high',
    createdAt: '2024-01-10 16:30',
    assignee: 'Kỹ thuật viên Hùng',
    hasImage: true
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
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon size={10} />
      {label}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const config = {
    low: { label: 'Thấp', color: 'bg-slate-100 text-slate-700' },
    medium: { label: 'TB', color: 'bg-orange-100 text-orange-700' },
    high: { label: 'Cao', color: 'bg-red-100 text-red-700' },
  };

  const { label, color } = config[priority as keyof typeof config];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

export function MaintenanceTickets() {
  const [tickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  const filteredTickets = filterStatus === 'all'
    ? tickets
    : tickets.filter(t => t.status === filterStatus);

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Hệ Thống Bảo Trì</h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả</option>
          <option value="new">Mới</option>
          <option value="processing">Đang xử lý</option>
          <option value="done">Hoàn thành</option>
        </select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-700 mb-0.5">Ticket Mới</p>
              <p className="text-2xl font-bold text-blue-600">
                {tickets.filter(t => t.status === 'new').length}
              </p>
            </div>
            <Clock size={24} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-700 mb-0.5">Đang Xử Lý</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tickets.filter(t => t.status === 'processing').length}
              </p>
            </div>
            <Wrench size={24} className="text-yellow-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-700 mb-0.5">Hoàn Thành</p>
              <p className="text-2xl font-bold text-green-600">
                {tickets.filter(t => t.status === 'done').length}
              </p>
            </div>
            <CheckCircle size={24} className="text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-2.5">
          {currentTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`bg-white rounded-lg shadow-sm border-2 p-3.5 cursor-pointer transition-all hover:shadow ${
                selectedTicket?.id === ticket.id
                  ? 'border-blue-500'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <h3 className="text-sm font-semibold text-slate-800">{ticket.id}</h3>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <p className="text-xs text-slate-600 mb-1.5">
                    Thiết bị: <span className="font-medium text-slate-800">{ticket.deviceId}</span>
                  </p>
                  <p className="text-xs text-slate-700">{ticket.issue}</p>
                </div>
                {ticket.hasImage && (
                  <ImageIcon size={16} className="text-blue-500 ml-2" />
                )}
              </div>

              <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-2 mt-2">
                <div className="text-slate-600">
                  <span className="font-medium text-slate-800">{ticket.customer}</span>
                  <span className="mx-1.5">•</span>
                  <span>{ticket.createdAt}</span>
                </div>
                {ticket.assignee && (
                  <span className="text-blue-600 font-medium text-xs">
                    {ticket.assignee}
                  </span>
                )}
              </div>
            </div>
          ))}
          <Pagination
            totalItems={filteredTickets.length}
            itemsPerPage={ticketsPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Ticket Details */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 h-fit sticky top-6">
          {selectedTicket ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-semibold text-slate-800 mb-1">
                  Chi Tiết Ticket
                </h3>
                <p className="text-xs text-slate-600">{selectedTicket.id}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">
                    Trạng thái
                  </label>
                  <StatusBadge status={selectedTicket.status} />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">
                    Mức độ ưu tiên
                  </label>
                  <PriorityBadge priority={selectedTicket.priority} />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">
                    Thiết bị
                  </label>
                  <p className="text-xs text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded">
                    {selectedTicket.deviceId}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">
                    Khách hàng
                  </label>
                  <p className="text-xs text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded">
                    {selectedTicket.customer}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">
                    Mô tả lỗi
                  </label>
                  <p className="text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded">
                    {selectedTicket.issue}
                  </p>
                </div>

                {selectedTicket.assignee && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">
                      Kỹ thuật viên
                    </label>
                    <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1.5 rounded">
                      {selectedTicket.assignee}
                    </p>
                  </div>
                )}

                {selectedTicket.solution && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">
                      Giải pháp
                    </label>
                    <p className="text-xs text-green-700 bg-green-50 px-2.5 py-1.5 rounded">
                      {selectedTicket.solution}
                    </p>
                  </div>
                )}

                {selectedTicket.hasImage && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">
                      Hình ảnh
                    </label>
                    <div className="bg-slate-100 rounded-lg p-3 text-center">
                      <ImageIcon size={24} className="mx-auto text-slate-400 mb-1" />
                      <p className="text-xs text-slate-600">Có hình ảnh</p>
                    </div>
                  </div>
                )}

                <div className="pt-3 space-y-1.5">
                  {selectedTicket.status === 'new' && (
                    <button className="w-full px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Nhận Xử Lý
                    </button>
                  )}
                  {selectedTicket.status === 'processing' && (
                    <>
                      <button className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Thu Hồi Thiết Bị
                      </button>
                      <button className="w-full px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Hoàn Thành
                      </button>
                      <button className="w-full px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                        Hướng Dẫn User
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Wrench size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">Chọn ticket để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}