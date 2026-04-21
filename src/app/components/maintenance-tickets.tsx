import React, { useEffect, useMemo, useState } from "react";
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  ClipboardList,
  Send,
} from "lucide-react";
import { Pagination } from "./pagination";
import { ResourceActionsMenu } from "./resource-actions-menu";
import { OptionalLabel, RequiredLabel, SidePanel } from "./side-panel";
import { can } from "@/config/permissions";
import { useSession } from "@/hooks/use-session";
import { maintenanceService } from "@/services/maintenance";
import { userService } from "@/services/users";
import type {
  CreateMaintenanceTicketPayload,
  MaintenanceLog,
  MaintenanceTicket,
  MaintenanceTicketDetail,
  MaintenanceTicketStatus,
} from "@/types/maintenance";
import type { User } from "@/types/user";
import { formatDateTime, formatEnumLabel, formatShortId } from "@/utils/format";

const STATUS_META: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: { label: "Chờ xử lý", color: "bg-blue-100 text-blue-800", icon: Clock },
  ASSIGNED: { label: "Đã phân công", color: "bg-amber-100 text-amber-800", icon: Wrench },
  IN_PROGRESS: { label: "Đang xử lý", color: "bg-yellow-100 text-yellow-800", icon: Wrench },
  RESOLVED: { label: "Đã xử lý", color: "bg-green-100 text-green-800", icon: CheckCircle },
  REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-800", icon: AlertCircle },
  CANCELLED: { label: "Đã hủy", color: "bg-slate-100 text-slate-700", icon: AlertCircle },
  CLOSED: { label: "Đã đóng", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
};

const FILTER_OPTIONS: { value: MaintenanceTicketStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "ASSIGNED", label: "Đã phân công" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "RESOLVED", label: "Đã xử lý" },
  { value: "CLOSED", label: "Đã đóng" },
];

interface TicketStats {
  total: number;
  pending: number;
  processing: number;
  done: number;
}

const getStatusMeta = (status: string) => {
  return STATUS_META[status] || {
    label: formatEnumLabel(status),
    color: "bg-slate-100 text-slate-700",
    icon: ClipboardList,
  };
};

const StatusBadge = ({ status }: { status: string }) => {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
      <Icon size={10} />
      {meta.label}
    </span>
  );
};

export function MaintenanceTickets() {
  const session = useSession();
  const role = session?.role;
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [ticketTotalItems, setTicketTotalItems] = useState(0);
  const [ticketTotalPages, setTicketTotalPages] = useState(1);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<MaintenanceTicketDetail | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [filterStatus, setFilterStatus] = useState<MaintenanceTicketStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState<TicketStats>({ total: 0, pending: 0, processing: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressNote, setProgressNote] = useState("");

  const ticketsPerPage = 10;

  const technicianMap = useMemo(() => {
    return new Map(technicians.map((user) => [user.id, user.fullName]));
  }, [technicians]);

  const loadStats = async () => {
    const [all, pending, assigned, inProgress, resolved, closed] = await Promise.all([
      maintenanceService.list({ page: 1, pageSize: 1 }),
      maintenanceService.list({ status: "PENDING", page: 1, pageSize: 1 }),
      maintenanceService.list({ status: "ASSIGNED", page: 1, pageSize: 1 }),
      maintenanceService.list({ status: "IN_PROGRESS", page: 1, pageSize: 1 }),
      maintenanceService.list({ status: "RESOLVED", page: 1, pageSize: 1 }),
      maintenanceService.list({ status: "CLOSED", page: 1, pageSize: 1 }),
    ]);

    setStats({
      total: all.totalItems,
      pending: pending.totalItems,
      processing: assigned.totalItems + inProgress.totalItems,
      done: resolved.totalItems + closed.totalItems,
    });
  };

  const loadTechnicians = async () => {
    try {
      const result = await userService.list({ role: "TECHNICIAN", page: 1, pageSize: 200 });
      setTechnicians(result.items);
    } catch {
      setTechnicians([]);
    }
  };

  const loadTickets = async (page = currentPage, status = filterStatus) => {
    setLoading(true);
    setError(null);

    try {
      const result = await maintenanceService.list({
        status,
        page,
        pageSize: ticketsPerPage,
      });

      setTickets(result.items);
      setTicketTotalItems(result.totalItems);
      setTicketTotalPages(Math.max(1, result.totalPages));

      if (result.items.length === 0) {
        setSelectedTicketId(null);
      } else if (!selectedTicketId || !result.items.some((ticket) => ticket.id === selectedTicketId)) {
        setSelectedTicketId(result.items[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách ticket.");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (ticketId: string) => {
    setDetailLoading(true);

    try {
      const detail = await maintenanceService.getById(ticketId);
      setSelectedDetail(detail);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải chi tiết ticket.");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadStats(), loadTechnicians()]);
  }, []);

  useEffect(() => {
    void loadTickets(currentPage, filterStatus);
  }, [currentPage, filterStatus]);

  useEffect(() => {
    if (selectedTicketId) {
      void loadDetail(selectedTicketId);
    } else {
      setSelectedDetail(null);
    }
  }, [selectedTicketId]);

  const handleStatusUpdate = async (status: MaintenanceTicketStatus) => {
    if (!selectedTicketId) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await maintenanceService.updateStatus(selectedTicketId, status);
      await Promise.all([loadDetail(selectedTicketId), loadTickets(currentPage, filterStatus), loadStats()]);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Không thể cập nhật trạng thái.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!selectedTicketId || !progressNote.trim()) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await maintenanceService.addLog(selectedTicketId, progressNote);
      setProgressNote("");
      await loadDetail(selectedTicketId);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Không thể thêm log.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTicket = async (payload: CreateMaintenanceTicketPayload) => {
    setActionLoading(true);
    setError(null);

    try {
      await maintenanceService.create(payload);
      setIsCreateOpen(false);
      setCurrentPage(1);
      await Promise.all([loadStats(), loadTickets(1, filterStatus)]);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Không thể tạo ticket bảo trì.");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedTicket = selectedDetail?.ticket ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Hệ Thống Bảo Trì</h2>
        <div className="flex items-center gap-2">
          {can(role, "maintenance", "create") && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              Tạo Ticket
            </button>
          )}
          <select
            value={filterStatus}
            onChange={(event) => {
              setCurrentPage(1);
              setFilterStatus(event.target.value as MaintenanceTicketStatus | "all");
            }}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              void Promise.all([loadStats(), loadTickets(currentPage, filterStatus)]);
            }}
            disabled={loading}
            className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Tải lại
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-700 mb-0.5">Chờ Xử Lý</p>
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            </div>
            <Clock size={24} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-700 mb-0.5">Đang Xử Lý</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
            </div>
            <Wrench size={24} className="text-yellow-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-700 mb-0.5">Đã Xử Lý</p>
              <p className="text-2xl font-bold text-green-600">{stats.done}</p>
            </div>
            <CheckCircle size={24} className="text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2.5">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-10 text-center text-slate-500">
              <Loader2 size={28} className="mx-auto mb-3 animate-spin" />
              Đang tải ticket...
            </div>
          ) : (
            <>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`bg-white rounded-lg shadow-sm border-2 p-3.5 cursor-pointer transition-all hover:shadow ${
                    selectedTicketId === ticket.id ? "border-blue-500" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <h3 className="text-sm font-semibold text-slate-800">{formatShortId(ticket.id)}</h3>
                        <StatusBadge status={ticket.status} />
                      </div>
                      <p className="text-xs text-slate-600 mb-1.5">
                        Máy ấp: <span className="font-medium text-slate-800">{formatShortId(ticket.incubatorId)}</span>
                      </p>
                      <p className="text-xs text-slate-700">{ticket.issueDescription}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-2 mt-2">
                    <div className="text-slate-600">
                      Tạo lúc <span className="font-medium text-slate-800">{formatDateTime(ticket.createdAt)}</span>
                    </div>
                    <span className="text-blue-600 font-medium text-xs">
                      {ticket.technicianId
                        ? technicianMap.get(ticket.technicianId) || formatShortId(ticket.technicianId)
                        : "Chưa phân công"}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <ResourceActionsMenu
                      canEdit={can(role, "maintenance", "edit")}
                      canDelete={can(role, "maintenance", "delete")}
                    />
                  </div>
                </div>
              ))}

              {tickets.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-10 text-center text-slate-500">
                  Không có ticket phù hợp với bộ lọc.
                </div>
              )}
            </>
          )}

          <Pagination
            totalItems={ticketTotalItems}
            itemsPerPage={ticketsPerPage}
            currentPage={currentPage}
            totalPages={ticketTotalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 h-fit sticky top-6">
          {detailLoading ? (
            <div className="py-8 text-center text-slate-500">
              <Loader2 size={28} className="mx-auto mb-3 animate-spin" />
              Đang tải chi tiết ticket...
            </div>
          ) : selectedTicket ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-semibold text-slate-800 mb-1">Chi Tiết Ticket</h3>
                <p className="text-xs text-slate-600">{selectedTicket.id}</p>
              </div>

              <div className="space-y-3">
                <DetailRow label="Trạng thái">
                  <StatusBadge status={selectedTicket.status} />
                </DetailRow>
                <DetailRow label="Máy ấp">{selectedTicket.incubatorId}</DetailRow>
                <DetailRow label="Kỹ thuật viên">
                  {selectedTicket.technicianId
                    ? technicianMap.get(selectedTicket.technicianId) || selectedTicket.technicianId
                    : "Chưa phân công"}
                </DetailRow>
                <DetailRow label="Ngày tạo">{formatDateTime(selectedTicket.createdAt)}</DetailRow>
                <DetailRow label="Ngày bắt đầu">{formatDateTime(selectedTicket.startedAt)}</DetailRow>
                <DetailRow label="Ngày hoàn tất">{formatDateTime(selectedTicket.resolvedAt)}</DetailRow>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">Mô tả lỗi</label>
                  <p className="text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded">
                    {selectedTicket.issueDescription}
                  </p>
                </div>

                {selectedTicket.resolutionSummary && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">Kết quả xử lý</label>
                    <p className="text-xs text-green-700 bg-green-50 px-2.5 py-1.5 rounded">
                      {selectedTicket.resolutionSummary}
                    </p>
                  </div>
                )}

                {selectedDetail?.warranty && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">Bảo hành liên quan</label>
                    <div className="text-xs text-slate-700 bg-slate-50 px-2.5 py-2 rounded space-y-1">
                      <p>Mã BH: {selectedDetail.warranty.id}</p>
                      <p>Hiệu lực đến: {selectedDetail.warranty.endDate || "--"}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">
                    Lịch sử xử lý ({selectedDetail?.logs.length ?? 0})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(selectedDetail?.logs ?? []).map((log) => (
                      <LogItem key={log.id} log={log} />
                    ))}
                    {(selectedDetail?.logs.length ?? 0) === 0 && (
                      <p className="text-xs text-slate-500">Chưa có cập nhật xử lý.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 block">Cập nhật tiến độ</label>
                  <textarea
                    value={progressNote}
                    onChange={(event) => setProgressNote(event.target.value)}
                    rows={3}
                    placeholder="Ví dụ: Đã liên hệ khách hàng, đang chờ linh kiện thay thế..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button
                    onClick={() => void handleAddLog()}
                    disabled={actionLoading || !progressNote.trim()}
                    className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    Lưu Cập Nhật
                  </button>
                </div>

                <div className="pt-3 space-y-1.5">
                  <button
                    onClick={() => void handleStatusUpdate("IN_PROGRESS")}
                    disabled={actionLoading}
                    className="w-full px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-60"
                  >
                    Chuyển Sang Đang Xử Lý
                  </button>
                  <button
                    onClick={() => void handleStatusUpdate("RESOLVED")}
                    disabled={actionLoading}
                    className="w-full px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                  >
                    Đánh Dấu Đã Xử Lý
                  </button>
                  <button
                    onClick={() => void handleStatusUpdate("CLOSED")}
                    disabled={actionLoading}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
                  >
                    Đóng Ticket
                  </button>
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

      <CreateMaintenanceTicketPanel
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTicket}
        isSubmitting={actionLoading}
        technicians={technicians}
      />
    </div>
  );
}

function CreateMaintenanceTicketPanel({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  technicians,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMaintenanceTicketPayload) => void;
  isSubmitting: boolean;
  technicians: User[];
}) {
  const [formData, setFormData] = useState<CreateMaintenanceTicketPayload>({
    incubatorId: "",
    technicianId: "",
    issueDescription: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({ incubatorId: "", technicianId: "", issueDescription: "" });
    }
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      incubatorId: formData.incubatorId.trim(),
      technicianId: formData.technicianId?.trim() || undefined,
      issueDescription: formData.issueDescription.trim(),
    });
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Ticket Bảo Trì"
      description="Ghi nhận sự cố và phân công kỹ thuật viên nếu đã xác định người xử lý."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <RequiredLabel>Máy ấp</RequiredLabel>
          <input
            type="text"
            value={formData.incubatorId}
            onChange={(event) => setFormData({ ...formData, incubatorId: event.target.value })}
            placeholder="Nhập ID máy ấp"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Phải là GUID máy ấp theo API.</p>
        </div>

        <div>
          <OptionalLabel>Kỹ thuật viên</OptionalLabel>
          <select
            value={formData.technicianId ?? ""}
            onChange={(event) => setFormData({ ...formData, technicianId: event.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chưa phân công</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <RequiredLabel>Mô tả sự cố</RequiredLabel>
          <textarea
            value={formData.issueDescription}
            onChange={(event) => setFormData({ ...formData, issueDescription: event.target.value })}
            placeholder="Mô tả vấn đề khách hàng hoặc kỹ thuật viên ghi nhận..."
            rows={5}
            maxLength={1000}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Tối đa 1000 ký tự theo API.</p>
        </div>

        <div className="flex gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Đang tạo..." : "Tạo ticket"}
          </button>
        </div>
      </form>
    </SidePanel>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-700 block mb-1.5">{label}</label>
      <div className="text-xs text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded">{children}</div>
    </div>
  );
}

function LogItem({ log }: { log: MaintenanceLog }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg text-sm">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="font-medium text-slate-900">Cập nhật lúc {formatDateTime(log.createdAt)}</p>
      </div>
      <p className="text-xs text-slate-600">{log.description || "Không có nội dung."}</p>
    </div>
  );
}
