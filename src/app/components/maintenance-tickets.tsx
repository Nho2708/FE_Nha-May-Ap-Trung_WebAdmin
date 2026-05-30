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
  CreditCard,
  QrCode,
} from "lucide-react";
import { Pagination } from "./pagination";
import { ResourceActionsMenu } from "./resource-actions-menu";
import { OptionalLabel, RequiredLabel, SidePanel } from "./side-panel";
import { PaymentQRModal } from "./payment-qr-modal";
import { can } from "@/config/permissions";
import { useSession } from "@/hooks/use-session";
import { maintenanceService } from "@/services/maintenance";
import { incubatorService } from "@/services/incubators";
import { userService } from "@/services/users";
import type {
  ConfigAssessmentItem,
  ConfigCondition,
  CreateMaintenanceTicketPayload,
  MaintenanceLog,
  MaintenanceTicket,
  MaintenanceTicketDetail,
  MaintenanceTicketPaymentResponse,
  MaintenanceTicketStatus,
  ModelConfigWithDetail,
} from "@/types/maintenance";
import type { User } from "@/types/user";
import { formatDateTime, formatEnumLabel, formatShortId } from "@/utils/format";

const STATUS_META: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: { label: "Chờ xử lý", color: "bg-blue-100 text-blue-800", icon: Clock },
  ASSIGNED: { label: "Đã phân công", color: "bg-amber-100 text-amber-800", icon: Wrench },
  AWAITING_PAYMENT: { label: "Chờ thanh toán", color: "bg-purple-100 text-purple-800", icon: CreditCard },
  IN_PROGRESS: { label: "Đang xử lý", color: "bg-yellow-100 text-yellow-800", icon: Wrench },
  RESOLVED: { label: "Đã xử lý", color: "bg-green-100 text-green-800", icon: CheckCircle },
  REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-800", icon: AlertCircle },
  CANCELLED: { label: "Đã hủy", color: "bg-slate-100 text-slate-700", icon: AlertCircle },
  CLOSED: { label: "Đã đóng", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
};

const CONDITION_CONFIG: Record<ConfigCondition, { label: string; color: string; discount: string }> = {
  NORMAL: { label: "Bình thường", color: "text-green-700 bg-green-50", discount: "Không tính phí" },
  USER_DAMAGE: { label: "Người dùng làm hỏng", color: "text-orange-700 bg-orange-50", discount: "Giảm 20%" },
  MANUFACTURING_DEFECT: { label: "Lỗi nhà sản xuất", color: "text-red-700 bg-red-50", discount: "Giảm 80%" },
};

const FILTER_OPTIONS: { value: MaintenanceTicketStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "ASSIGNED", label: "Đã phân công" },
  { value: "AWAITING_PAYMENT", label: "Chờ thanh toán" },
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

const getStatusMeta = (status: string) =>
  STATUS_META[status] || {
    label: formatEnumLabel(status),
    color: "bg-slate-100 text-slate-700",
    icon: ClipboardList,
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

const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN") + " ₫";

function calcFinalPrice(marketPrice: number, condition: ConfigCondition): number {
  if (condition === "USER_DAMAGE") return Math.round(marketPrice * 0.8);
  if (condition === "MANUFACTURING_DEFECT") return Math.round(marketPrice * 0.2);
  return 0;
}

// ─── Config Assessment Form ────────────────────────────────────────────────────

interface AssessmentRow {
  configId: string;
  configName: string;
  configCode: string;
  configUnit: string | null;
  condition: ConfigCondition;
  marketPrice: string;
  note: string;
}

function ConfigAssessmentForm({
  configs,
  onSubmit,
  isSubmitting,
}: {
  configs: ModelConfigWithDetail[];
  onSubmit: (items: ConfigAssessmentItem[]) => void;
  isSubmitting: boolean;
}) {
  const [rows, setRows] = useState<AssessmentRow[]>(() =>
    configs.map((c) => ({
      configId: c.configId,
      configName: c.configName,
      configCode: c.configCode,
      configUnit: c.configUnit,
      condition: "NORMAL" as ConfigCondition,
      marketPrice: "0",
      note: "",
    }))
  );

  const totalFinal = rows.reduce((sum, r) => {
    const price = parseInt(r.marketPrice, 10) || 0;
    return sum + calcFinalPrice(price, r.condition);
  }, 0);

  const update = (idx: number, field: keyof AssessmentRow, value: string) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = () => {
    const items: ConfigAssessmentItem[] = rows.map((r) => ({
      configId: r.configId,
      condition: r.condition,
      marketPrice: parseInt(r.marketPrice, 10) || 0,
      note: r.note.trim() || undefined,
    }));
    onSubmit(items);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {rows.map((row, idx) => {
          const price = parseInt(row.marketPrice, 10) || 0;
          const final = calcFinalPrice(price, row.condition);
          const condCfg = CONDITION_CONFIG[row.condition];
          return (
            <div key={row.configId} className="border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{row.configName}</p>
                  <p className="text-xs text-slate-400">{row.configCode}{row.configUnit ? ` · ${row.configUnit}` : ""}</p>
                </div>
                {row.condition !== "NORMAL" && (
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${condCfg.color}`}>
                    {condCfg.discount}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">Tình trạng</label>
                  <select
                    value={row.condition}
                    onChange={(e) => update(idx, "condition", e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="NORMAL">Bình thường</option>
                    <option value="USER_DAMAGE">Người dùng làm hỏng</option>
                    <option value="MANUFACTURING_DEFECT">Lỗi nhà sản xuất</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">Giá thị trường (₫)</label>
                  <input
                    type="number"
                    min={0}
                    value={row.marketPrice}
                    onChange={(e) => update(idx, "marketPrice", e.target.value)}
                    disabled={row.condition === "NORMAL"}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>
              {row.condition !== "NORMAL" && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Khách trả:</span>
                  <span className="font-semibold text-blue-700">{formatCurrency(final)}</span>
                </div>
              )}
              <input
                type="text"
                value={row.note}
                onChange={(e) => update(idx, "note", e.target.value)}
                placeholder="Ghi chú (tuỳ chọn)"
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 pt-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">Tổng cần thanh toán:</span>
          <span className={`text-base font-bold ${totalFinal > 0 ? "text-blue-700" : "text-green-700"}`}>
            {totalFinal > 0 ? formatCurrency(totalFinal) : "Miễn phí"}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          {isSubmitting ? "Đang xử lý..." : "Xác nhận đánh giá"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function MaintenanceTickets() {
  const session = useSession();
  const role = session?.role;
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [ticketTotalItems, setTicketTotalItems] = useState(0);
  const [ticketTotalPages, setTicketTotalPages] = useState(1);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<MaintenanceTicketDetail | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [incubatorSerialMap, setIncubatorSerialMap] = useState<Map<string, string>>(new Map());
  const [filterStatus, setFilterStatus] = useState<MaintenanceTicketStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState<TicketStats>({ total: 0, pending: 0, processing: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressNote, setProgressNote] = useState("");

  // Assign technician
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignTechnicianId, setAssignTechnicianId] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);

  // Assessment state
  const [modelConfigs, setModelConfigs] = useState<ModelConfigWithDetail[]>([]);
  const [modelConfigsLoading, setModelConfigsLoading] = useState(false);
  const [showAssessForm, setShowAssessForm] = useState(false);
  const [assessError, setAssessError] = useState<string | null>(null);

  // Payment QR
  const [paymentInfo, setPaymentInfo] = useState<MaintenanceTicketPaymentResponse | null>(null);
  const [showQR, setShowQR] = useState(false);

  const ticketsPerPage = 10;

  const technicianMap = useMemo(
    () => new Map(technicians.map((u) => [u.id, u.fullName])),
    [technicians]
  );

  const loadStats = async () => {
    const [all, pending, assigned, inProgress, awaitingPayment, resolved, closed] = await Promise.all([
      maintenanceService.list({ page: 1, pageSize: 1 }),
      maintenanceService.list({ status: "PENDING", page: 1, pageSize: 1 }),
      maintenanceService.list({ status: "ASSIGNED", page: 1, pageSize: 1 }),
      maintenanceService.list({ status: "IN_PROGRESS", page: 1, pageSize: 1 }),
      maintenanceService.list({ status: "AWAITING_PAYMENT", page: 1, pageSize: 1 }),
      maintenanceService.list({ status: "RESOLVED", page: 1, pageSize: 1 }),
      maintenanceService.list({ status: "CLOSED", page: 1, pageSize: 1 }),
    ]);
    setStats({
      total: all.totalItems,
      pending: pending.totalItems,
      processing: assigned.totalItems + inProgress.totalItems + awaitingPayment.totalItems,
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

  const loadIncubatorSerials = async () => {
    try {
      const result = await incubatorService.list({ pageSize: 200 });
      setIncubatorSerialMap(
        new Map(result.items.filter((i) => i.serialNumber).map((i) => [i.id, i.serialNumber as string]))
      );
    } catch {
      // keep empty map
    }
  };

  const loadTickets = async (page = currentPage, status = filterStatus) => {
    setLoading(true);
    setError(null);
    try {
      const result = await maintenanceService.list({ status, page, pageSize: ticketsPerPage });
      setTickets(result.items);
      setTicketTotalItems(result.totalItems);
      setTicketTotalPages(Math.max(1, result.totalPages));
      if (result.items.length === 0) {
        setSelectedTicketId(null);
      } else if (!selectedTicketId || !result.items.some((t) => t.id === selectedTicketId)) {
        setSelectedTicketId(result.items[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedTicketId || !assignTechnicianId) return;
    setActionLoading(true);
    setAssignError(null);
    try {
      await maintenanceService.assignTechnician(selectedTicketId, assignTechnicianId);
      setShowAssignForm(false);
      setAssignTechnicianId("");
      await Promise.all([loadDetail(selectedTicketId), loadTickets(currentPage, filterStatus), loadStats()]);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Không thể gán kỹ thuật viên.");
    } finally {
      setActionLoading(false);
    }
  };

  const loadDetail = async (ticketId: string) => {
    setDetailLoading(true);
    setShowAssessForm(false);
    setShowAssignForm(false);
    setAssessError(null);
    try {
      const detail = await maintenanceService.getById(ticketId);
      setSelectedDetail(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải chi tiết ticket.");
    } finally {
      setDetailLoading(false);
    }
  };

  const loadModelConfigs = async (modelId: string) => {
    setModelConfigsLoading(true);
    try {
      const configs = await maintenanceService.getModelConfigs(modelId);
      setModelConfigs(configs);
    } catch {
      setModelConfigs([]);
    } finally {
      setModelConfigsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadStats(), loadTechnicians(), loadIncubatorSerials()]);
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

  // Load model configs when ASSIGNED ticket is selected and assess form opens
  useEffect(() => {
    if (!showAssessForm || !selectedDetail?.ticket) return;
    const incubatorId = selectedDetail.ticket.incubatorId;
    // find modelId via incubator — need to fetch incubator
    incubatorService.getById(incubatorId).then((inc) => {
      if (inc?.modelId) void loadModelConfigs(inc.modelId);
    }).catch(() => setModelConfigs([]));
  }, [showAssessForm, selectedDetail?.ticket?.incubatorId]);

  const handleStatusUpdate = async (status: MaintenanceTicketStatus) => {
    if (!selectedTicketId) return;
    const needsSummary = status === "RESOLVED" || status === "REJECTED";
    if (needsSummary && !progressNote.trim()) {
      setError("Vui lòng nhập tóm tắt kết quả xử lý.");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await maintenanceService.updateStatus(selectedTicketId, status, needsSummary ? progressNote : undefined);
      if (needsSummary) setProgressNote("");
      await Promise.all([loadDetail(selectedTicketId), loadTickets(currentPage, filterStatus), loadStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!selectedTicketId || !progressNote.trim()) return;
    setActionLoading(true);
    setError(null);
    try {
      await maintenanceService.addLog(selectedTicketId, progressNote);
      setProgressNote("");
      await loadDetail(selectedTicketId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể thêm log.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssessConfigs = async (items: ConfigAssessmentItem[]) => {
    if (!selectedTicketId) return;
    setActionLoading(true);
    setAssessError(null);
    try {
      const result = await maintenanceService.assessConfigs(selectedTicketId, { items });
      setShowAssessForm(false);
      if (result.requiresPayment && result.qrCode) {
        setPaymentInfo(result);
        setShowQR(true);
      }
      await Promise.all([loadDetail(selectedTicketId), loadTickets(currentPage, filterStatus), loadStats()]);
    } catch (err) {
      setAssessError(err instanceof Error ? err.message : "Không thể lưu đánh giá.");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo ticket bảo trì.");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedTicket = selectedDetail?.ticket ?? null;

  return (
    <div className="space-y-4">
      {/* Header */}
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
            onChange={(e) => { setCurrentPage(1); setFilterStatus(e.target.value as MaintenanceTicketStatus | "all"); }}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => void Promise.all([loadStats(), loadTickets(currentPage, filterStatus)])}
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

      {/* Stats */}
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

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ticket list */}
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
                        <StatusBadge status={ticket.status} />
                        {ticket.status === "AWAITING_PAYMENT" && ticket.totalAmount > 0 && (
                          <span className="text-xs font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                            {formatCurrency(ticket.totalAmount)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mb-1.5">
                        Máy ấp: <span className="font-medium text-slate-800">{incubatorSerialMap.get(ticket.incubatorId) ?? "—"}</span>
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

        {/* Detail panel */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 h-fit sticky top-6">
          {detailLoading ? (
            <div className="py-8 text-center text-slate-500">
              <Loader2 size={28} className="mx-auto mb-3 animate-spin" />
              Đang tải chi tiết...
            </div>
          ) : selectedTicket ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-semibold text-slate-800">Chi Tiết Ticket</h3>
              </div>

              <div className="space-y-3">
                <DetailRow label="Trạng thái">
                  <StatusBadge status={selectedTicket.status} />
                </DetailRow>
                <DetailRow label="Máy ấp">
                  {incubatorSerialMap.get(selectedTicket.incubatorId) ?? "—"}
                </DetailRow>
                <DetailRow label="Kỹ thuật viên">
                  {selectedTicket.technicianId
                    ? technicianMap.get(selectedTicket.technicianId) || "—"
                    : "Chưa phân công"}
                </DetailRow>

                {/* Assign technician — for PENDING or ASSIGNED tickets */}
                {["PENDING", "ASSIGNED"].includes(selectedTicket.status) && can(role, "maintenance", "edit") && (
                  <div>
                    {!showAssignForm ? (
                      <button
                        onClick={() => { setShowAssignForm(true); setAssignTechnicianId(selectedTicket.technicianId ?? ""); }}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        {selectedTicket.technicianId ? "Thay đổi kỹ thuật viên" : "Gán kỹ thuật viên"}
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <select
                          value={assignTechnicianId}
                          onChange={(e) => setAssignTechnicianId(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">-- Chọn kỹ thuật viên --</option>
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>{t.fullName}</option>
                          ))}
                        </select>
                        {assignError && <p className="text-xs text-red-600">{assignError}</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setShowAssignForm(false); setAssignError(null); }}
                            className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50"
                          >Hủy</button>
                          <button
                            onClick={() => void handleAssignTechnician()}
                            disabled={actionLoading || !assignTechnicianId}
                            className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                          >Xác nhận</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <DetailRow label="Ngày tạo">{formatDateTime(selectedTicket.createdAt)}</DetailRow>
                {selectedTicket.startedAt && (
                  <DetailRow label="Ngày bắt đầu">{formatDateTime(selectedTicket.startedAt)}</DetailRow>
                )}
                {selectedTicket.resolvedAt && (
                  <DetailRow label="Ngày hoàn tất">{formatDateTime(selectedTicket.resolvedAt)}</DetailRow>
                )}

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

                {/* Payment info */}
                {selectedTicket.totalAmount > 0 && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">Thanh toán</label>
                    <div className="bg-slate-50 rounded px-2.5 py-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tổng tiền:</span>
                        <span className="font-semibold text-blue-700">{formatCurrency(selectedTicket.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trạng thái:</span>
                        <span className={`font-medium ${selectedTicket.paymentStatus === "PAID" ? "text-green-700" : "text-orange-600"}`}>
                          {selectedTicket.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                        </span>
                      </div>
                      {selectedTicket.paidAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Thanh toán lúc:</span>
                          <span>{formatDateTime(selectedTicket.paidAt)}</span>
                        </div>
                      )}
                    </div>
                    {selectedTicket.status === "AWAITING_PAYMENT" && selectedTicket.qrCode && (
                      <button
                        onClick={() => {
                          setPaymentInfo({
                            ticketId: selectedTicket.id,
                            totalAmount: selectedTicket.totalAmount,
                            requiresPayment: true,
                            paymentStatus: selectedTicket.paymentStatus,
                            paymentOrderCode: selectedTicket.paymentOrderCode,
                            paymentLinkId: selectedTicket.paymentLinkId,
                            qrCode: selectedTicket.qrCode,
                            paymentLinkExpiredAt: selectedTicket.paymentLinkExpiredAt,
                          });
                          setShowQR(true);
                        }}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-purple-300 text-purple-700 text-xs rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <QrCode size={13} />
                        Hiển thị QR thanh toán
                      </button>
                    )}
                  </div>
                )}

                {/* Config assessment results */}
                {(selectedDetail?.configItems ?? []).length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">
                      Đánh giá cấu hình ({selectedDetail!.configItems.length})
                    </label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedDetail!.configItems.map((ci) => {
                        const condCfg = CONDITION_CONFIG[ci.condition as ConfigCondition];
                        return (
                          <div key={ci.id} className="bg-slate-50 rounded px-2.5 py-2 text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-800">{ci.configName || ci.configCode || ci.configId.slice(0, 8)}</span>
                              <span className="font-semibold text-blue-700">{formatCurrency(ci.finalPrice)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {condCfg && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${condCfg.color}`}>{condCfg.label}</span>
                              )}
                              {ci.condition !== "NORMAL" && (
                                <span className="text-slate-400">Giá gốc: {formatCurrency(ci.marketPrice)}</span>
                              )}
                            </div>
                            {ci.note && <p className="text-slate-500 italic">{ci.note}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Warranty */}
                {selectedDetail?.warranty && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">Bảo hành</label>
                    <div className="text-xs text-slate-700 bg-slate-50 px-2.5 py-2 rounded space-y-1">
                      <p>Mã BH: <span className="font-medium">{selectedDetail.warranty.warrantyCode ?? selectedDetail.warranty.id.slice(0, 12) + "..."}</span></p>
                      <p>Đến: {selectedDetail.warranty.endDate
                        ? new Date(selectedDetail.warranty.endDate).toLocaleDateString("vi-VN")
                        : "--"}</p>
                    </div>
                  </div>
                )}

                {/* Logs */}
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">
                    Lịch sử ({selectedDetail?.logs.length ?? 0})
                  </label>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {(selectedDetail?.logs ?? []).map((log) => (
                      <LogItem key={log.id} log={log} />
                    ))}
                    {(selectedDetail?.logs.length ?? 0) === 0 && (
                      <p className="text-xs text-slate-500">Chưa có cập nhật.</p>
                    )}
                  </div>
                </div>

                {/* Config assessment form — show for ASSIGNED tickets */}
                {selectedTicket.status === "ASSIGNED" && can(role, "maintenance", "edit") && (
                  <div className="border-t border-slate-200 pt-3">
                    {!showAssessForm ? (
                      <button
                        onClick={() => setShowAssessForm(true)}
                        className="w-full px-3 py-2 text-sm border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <ClipboardList size={15} />
                        Đánh giá cấu hình & tính tiền
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-700">Đánh giá từng cấu hình</p>
                          <button onClick={() => setShowAssessForm(false)} className="text-xs text-slate-400 hover:text-slate-600">Hủy</button>
                        </div>
                        {assessError && (
                          <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{assessError}</p>
                        )}
                        {modelConfigsLoading ? (
                          <div className="text-center py-4">
                            <Loader2 size={18} className="mx-auto animate-spin text-slate-400" />
                          </div>
                        ) : modelConfigs.length === 0 ? (
                          <p className="text-xs text-slate-500">Không có cấu hình cho dòng máy này.</p>
                        ) : (
                          <ConfigAssessmentForm
                            configs={modelConfigs}
                            onSubmit={handleAssessConfigs}
                            isSubmitting={actionLoading}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Progress note + log */}
                {["ASSIGNED", "IN_PROGRESS", "AWAITING_PAYMENT"].includes(selectedTicket.status) && (
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <label className="text-xs font-medium text-slate-700 block">Cập nhật tiến độ</label>
                    <textarea
                      value={progressNote}
                      onChange={(e) => setProgressNote(e.target.value)}
                      rows={2}
                      placeholder="Ghi chú tiến độ (bắt buộc khi đánh dấu Đã xử lý)"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                      onClick={() => void handleAddLog()}
                      disabled={actionLoading || !progressNote.trim()}
                      className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <Send size={14} />
                      Lưu cập nhật
                    </button>
                  </div>
                )}

                {/* Status action buttons */}
                <div className="pt-1 space-y-1.5">
                  {selectedTicket.status === "IN_PROGRESS" && can(role, "maintenance", "edit") && (
                    <>
                      <button
                        onClick={() => void handleStatusUpdate("RESOLVED")}
                        disabled={actionLoading}
                        className="w-full px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                      >
                        Đánh dấu Đã sửa xong
                      </button>
                      <button
                        onClick={() => void handleStatusUpdate("REJECTED")}
                        disabled={actionLoading}
                        className="w-full px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                  {selectedTicket.status === "RESOLVED" && can(role, "maintenance", "edit") && (
                    <button
                      onClick={() => void handleStatusUpdate("CLOSED")}
                      disabled={actionLoading}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
                    >
                      Đóng Ticket
                    </button>
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

      <CreateMaintenanceTicketPanel
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTicket}
        isSubmitting={actionLoading}
        technicians={technicians}
      />

      <PaymentQRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        qrCode={paymentInfo?.qrCode ?? ""}
        orderCode={paymentInfo?.paymentOrderCode}
        totalAmount={paymentInfo?.totalAmount}
        expiredAt={paymentInfo?.paymentLinkExpiredAt}
      />
    </div>
  );
}

// ─── Create Ticket Panel ───────────────────────────────────────────────────────

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
  const [serialNumber, setSerialNumber] = useState("");
  const [serialError, setSerialError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({ technicianId: "", issueDescription: "" });

  useEffect(() => {
    if (!isOpen) {
      setSerialNumber("");
      setSerialError(null);
      setFormData({ technicianId: "", issueDescription: "" });
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!serialNumber.trim()) {
      setSerialError("Vui lòng nhập số serial máy ấp.");
      return;
    }
    setIsSearching(true);
    setSerialError(null);
    try {
      const result = await incubatorService.list({ pageSize: 200 });
      const found = result.items.find(
        (i) => i.serialNumber?.toLowerCase() === serialNumber.trim().toLowerCase()
      );
      if (!found) {
        setSerialError("Không tìm thấy máy ấp với số serial này.");
        return;
      }
      onSubmit({
        incubatorId: found.id,
        technicianId: formData.technicianId.trim() || undefined,
        issueDescription: formData.issueDescription.trim(),
      });
    } catch {
      setSerialError("Không thể tra cứu máy ấp. Vui lòng thử lại.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Ticket Bảo Trì"
      description="Ghi nhận sự cố và phân công kỹ thuật viên nếu đã xác định."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <RequiredLabel>Số serial máy ấp</RequiredLabel>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => { setSerialNumber(e.target.value); setSerialError(null); }}
            placeholder="VD: IS-001-3EFECJ"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              serialError ? "border-red-300" : "border-slate-300"
            }`}
          />
          {serialError
            ? <p className="mt-1 text-xs text-red-600">{serialError}</p>
            : <p className="mt-1 text-xs text-slate-500">Nhập đúng số serial in trên máy ấp.</p>}
        </div>
        <div>
          <OptionalLabel>Kỹ thuật viên</OptionalLabel>
          <select
            value={formData.technicianId}
            onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chưa phân công</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>{t.fullName}</option>
            ))}
          </select>
        </div>
        <div>
          <RequiredLabel>Mô tả sự cố</RequiredLabel>
          <textarea
            value={formData.issueDescription}
            onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
            placeholder="Mô tả vấn đề khách hàng hoặc kỹ thuật viên ghi nhận..."
            rows={5}
            maxLength={1000}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Tối đa 1000 ký tự.</p>
        </div>
        <div className="flex gap-3 border-t border-slate-200 pt-5">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            Hủy
          </button>
          <button type="submit" disabled={isSubmitting || isSearching} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
            {isSearching ? "Đang tra cứu..." : isSubmitting ? "Đang tạo..." : "Tạo ticket"}
          </button>
        </div>
      </form>
    </SidePanel>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-700 block mb-1.5">{label}</label>
      <div className="text-xs text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded">{children}</div>
    </div>
  );
}

function LogItem({ log }: { log: MaintenanceLog }) {
  return (
    <div className="p-2.5 bg-slate-50 rounded-lg text-sm">
      <p className="font-medium text-slate-900 text-xs mb-0.5">
        {formatDateTime(log.createdAt)}
      </p>
      <p className="text-xs text-slate-600">{log.description || "Không có nội dung."}</p>
    </div>
  );
}
