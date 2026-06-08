import React, { useEffect, useState } from "react";
import { Activity, AlertCircle, CheckCircle, Image as ImageIcon, Loader2, Plus, QrCode, RefreshCw, Settings } from "lucide-react";
import { Pagination } from "./pagination";
import { ResourceActionsMenu } from "./resource-actions-menu";
import { RequiredLabel, SidePanel } from "./side-panel";
import { can } from "@/config/permissions";
import { useSession } from "@/hooks/use-session";
import { incubatorModelService } from "@/services/incubatorModels";
import { incubatorService } from "@/services/incubators";
import type { IncubatorModel } from "@/types/incubator-model";
import type { CreateIncubatorPayload, Incubator, IncubatorStatus } from "@/types/incubator";
import { formatDateTime, formatEnumLabel } from "@/utils/format";

const STATUS_OPTIONS: { value: IncubatorStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "AVAILABLE", label: "Sẵn sàng" },
  { value: "RESERVED", label: "Đã giữ chỗ" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "IN_MAINTENANCE", label: "Đang bảo trì" },
  { value: "DAMAGED", label: "Hư hỏng" },
  { value: "RETIRED", label: "Ngừng sử dụng" },
];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  AVAILABLE: { label: "Sẵn sàng", color: "bg-green-100 text-green-800", icon: CheckCircle },
  RESERVED: { label: "Đã giữ chỗ", color: "bg-blue-100 text-blue-800", icon: QrCode },
  ACTIVE: { label: "Đang hoạt động", color: "bg-emerald-100 text-emerald-800", icon: Activity },
  REPLACEMENT_PENDING: { label: "Chờ thay thế", color: "bg-amber-100 text-amber-800", icon: AlertCircle },
  IN_MAINTENANCE: { label: "Đang bảo trì", color: "bg-yellow-100 text-yellow-800", icon: Settings },
  DAMAGED: { label: "Hư hỏng", color: "bg-red-100 text-red-800", icon: AlertCircle },
  RETIRED: { label: "Ngừng sử dụng", color: "bg-slate-100 text-slate-700", icon: AlertCircle },
};

const getStatusMeta = (status: string) => {
  return STATUS_META[status] || {
    label: formatEnumLabel(status),
    color: "bg-slate-100 text-slate-700",
    icon: Settings,
  };
};

function StatusBadge({ status }: { status: string }) {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${meta.color}`}>
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

export function DeviceManagement() {
  const session = useSession();
  const role = session?.role;
  const [incubators, setIncubators] = useState<Incubator[]>([]);
  const [selectedIncubator, setSelectedIncubator] = useState<Incubator | null>(null);
  const [statusFilter, setStatusFilter] = useState<IncubatorStatus | "all">("all");
  const [modelFilter, setModelFilter] = useState<string>("");
  const [models, setModels] = useState<IncubatorModel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  const loadIncubators = async (page = currentPage, status = statusFilter, modelId = modelFilter) => {
    setLoading(true);
    setError(null);

    try {
      const result = await incubatorService.list({
        status,
        modelId: modelId || undefined,
        page,
        pageSize: itemsPerPage,
      });

      setIncubators(result.items);
      setTotalItems(result.totalItems);
      setTotalPages(Math.max(1, result.totalPages));

      if (result.items.length === 0) {
        setSelectedIncubator(null);
      } else if (!selectedIncubator || !result.items.some((item) => item.id === selectedIncubator.id)) {
        setSelectedIncubator(result.items[0]);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách máy ấp.");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    setDetailLoading(true);
    setError(null);

    try {
      const detail = await incubatorService.getById(id);
      setSelectedIncubator(detail);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải chi tiết máy ấp.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateIncubator = async (payload: CreateIncubatorPayload) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await incubatorService.create(payload);
      setIsCreateOpen(false);
      await loadIncubators(1, statusFilter);
      setCurrentPage(1);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Không thể tạo máy ấp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    incubatorModelService.list({ pageSize: 100 }).then(r => setModels(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    void loadIncubators(currentPage, statusFilter, modelFilter);
  }, [currentPage, statusFilter, modelFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Quản Lý Máy Ấp</h2>
        <div className="flex gap-3">
          {can(role, "incubators", "create") && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              Tạo Máy Ấp
            </button>
          )}
          <select
            value={modelFilter}
            onChange={(event) => {
              setCurrentPage(1);
              setModelFilter(event.target.value);
            }}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <option value="">Tất cả dòng máy</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setCurrentPage(1);
              setStatusFilter(event.target.value as IncubatorStatus | "all");
            }}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => void loadIncubators(currentPage, statusFilter)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Tải lại
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <Loader2 size={30} className="mx-auto mb-3 animate-spin" />
              Đang tải danh sách máy ấp...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 w-14" />
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Serial
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Dòng máy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Kích hoạt
                      </th>
                      <th className="w-10 px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {incubators.map((incubator) => (
                      <tr
                        key={incubator.id}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          selectedIncubator?.id === incubator.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => void loadDetail(incubator.id)}
                      >
                        <td className="px-4 py-3">
                          {incubator.modelImageUrl ? (
                            <img
                              src={incubator.modelImageUrl}
                              alt={incubator.modelName ?? ""}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-50"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                              <ImageIcon size={16} className="text-slate-300" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-slate-900">
                          {incubator.serialNumber || "--"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {incubator.modelName || "--"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={incubator.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {formatDateTime(incubator.activatedAt)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <ResourceActionsMenu
                            canEdit={can(role, "incubators", "edit")}
                            canDelete={can(role, "incubators", "delete")}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {incubators.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  Không có máy ấp phù hợp với bộ lọc.
                </div>
              )}

              <Pagination
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {detailLoading ? (
            <div className="text-center py-12 text-slate-500">
              <Loader2 size={30} className="mx-auto mb-3 animate-spin" />
              Đang tải chi tiết...
            </div>
          ) : selectedIncubator ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Chi Tiết Máy Ấp</h3>
                <p className="text-sm font-mono text-slate-600">{selectedIncubator.serialNumber || "--"}</p>
              </div>

              {selectedIncubator.modelImageUrl ? (
                <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={selectedIncubator.modelImageUrl}
                    alt={selectedIncubator.modelName ?? "Ảnh dòng máy"}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-28 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1">
                  <ImageIcon size={24} className="text-slate-300" />
                  <p className="text-xs text-slate-400">Dòng máy chưa có ảnh</p>
                </div>
              )}

              <DetailRow label="Serial">{selectedIncubator.serialNumber || "--"}</DetailRow>
              <DetailRow label="Dòng máy">{selectedIncubator.modelName || "--"}</DetailRow>
              <DetailRow label="Khách hàng">{selectedIncubator.customerId || "Chưa gán khách hàng"}</DetailRow>
              <DetailRow label="Ngày kích hoạt">{formatDateTime(selectedIncubator.activatedAt)}</DetailRow>
              <DetailRow label="Ngày tạo">{formatDateTime(selectedIncubator.createdAt)}</DetailRow>
              <DetailRow label="Cập nhật gần nhất">{formatDateTime(selectedIncubator.updatedAt)}</DetailRow>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 font-semibold">Trạng thái</span>
                  <StatusBadge status={selectedIncubator.status} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Chọn máy ấp để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      <CreateIncubatorPanel
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateIncubator}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

function CreateIncubatorPanel({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateIncubatorPayload) => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState<CreateIncubatorPayload>({
    modelId: "",
    quantity: 1,
  });
  const [modelSearch, setModelSearch] = useState("");
  const [models, setModels] = useState<IncubatorModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<IncubatorModel | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [isCheckingModel, setIsCheckingModel] = useState(false);
  const [isModelSuggestOpen, setIsModelSuggestOpen] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ modelId: "", quantity: 1 });
      setModelSearch("");
      setSelectedModel(null);
      setModels([]);
      setIsCheckingModel(false);
      setIsModelSuggestOpen(false);
      setModelError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const selectedModelLabel = selectedModel ? `${selectedModel.modelCode} - ${selectedModel.name}` : "";

    if (!modelSearch.trim() || (selectedModel && modelSearch === selectedModelLabel)) {
      setModels([]);
      setModelsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadModels = async () => {
      setModelsLoading(true);
      try {
        const result = await incubatorModelService.searchByName(modelSearch, 7);

        if (!isCancelled) {
          setModels(result.items);
          setIsModelSuggestOpen(true);
        }
      } finally {
        if (!isCancelled) {
          setModelsLoading(false);
        }
      }
    };

    const timeout = window.setTimeout(() => {
      void loadModels();
    }, 1000);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
    };
  }, [isOpen, modelSearch, selectedModel]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const selectedModelLabel = selectedModel ? `${selectedModel.modelCode} - ${selectedModel.name}` : "";

    if (!formData.modelId || !selectedModel || modelSearch !== selectedModelLabel) {
      setModelError("Vui lòng chọn dòng máy từ danh sách gợi ý.");
      return;
    }

    setIsCheckingModel(true);
    setModelError(null);

    try {
      const verifiedModel = await incubatorModelService.getById(formData.modelId);
      const verifiedModelLabel = `${verifiedModel.modelCode} - ${verifiedModel.name}`;

      setSelectedModel(verifiedModel);
      setModelSearch(verifiedModelLabel);

      onSubmit({
        modelId: verifiedModel.id,
        quantity: Math.max(1, Number(formData.quantity) || 1),
      });
    } catch {
      setFormData((current) => ({ ...current, modelId: "" }));
      setSelectedModel(null);
      setModelError("Dòng máy đã chọn không còn tồn tại. Vui lòng chọn lại.");
    } finally {
      setIsCheckingModel(false);
    }
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo máy ấp"
      description="Nhập tên hoặc mã dòng máy để tìm, chọn đúng dòng máy và số lượng cần tạo."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <RequiredLabel>Tên dòng máy</RequiredLabel>
          <div className="relative">
            <input
              type="text"
              value={modelSearch}
              onFocus={() => {
                if (models.length > 0) {
                  setIsModelSuggestOpen(true);
                }
              }}
              onChange={(event) => {
                setModelSearch(event.target.value);
                setSelectedModel(null);
                setFormData((current) => ({ ...current, modelId: "" }));
                setModelError(null);
              }}
              placeholder="Nhập tên hoặc mã dòng máy"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                modelError ? "border-red-300" : "border-slate-300"
              }`}
              autoComplete="off"
            />

            {isModelSuggestOpen && (modelsLoading || models.length > 0 || modelSearch.trim()) && (
              <div className="absolute z-40 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                {modelsLoading && (
                  <div className="px-3 py-2 text-sm text-slate-500">Đang tìm dòng máy...</div>
                )}

                {!modelsLoading &&
                  models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model);
                        setModelSearch(`${model.modelCode} - ${model.name}`);
                        setFormData((current) => ({ ...current, modelId: model.id }));
                        setIsModelSuggestOpen(false);
                        setModelError(null);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center gap-3"
                    >
                      {model.imageUrl ? (
                        <img
                          src={model.imageUrl}
                          alt={model.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                          <ImageIcon size={14} className="text-slate-300" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {model.modelCode} - {model.name}
                        </div>
                        {model.description && (
                          <div className="mt-0.5 line-clamp-1 text-xs text-slate-500">{model.description}</div>
                        )}
                      </div>
                    </button>
                  ))}

                {!modelsLoading && models.length === 0 && modelSearch.trim() && (
                  <div className="px-3 py-2 text-sm text-slate-500">Không tìm thấy dòng máy phù hợp.</div>
                )}
              </div>
            )}
          </div>
          {modelError && <p className="mt-1 text-xs text-red-600">{modelError}</p>}
          <p className="mt-1 text-xs text-slate-500">Gợi ý tối đa 7 dòng máy sau khi ngừng nhập 1 giây.</p>
        </div>

        {selectedModel && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 flex items-center gap-4">
            {selectedModel.imageUrl ? (
              <img
                src={selectedModel.imageUrl}
                alt={selectedModel.name}
                className="w-20 h-20 rounded-lg object-contain border border-slate-200 bg-white shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center shrink-0 gap-1">
                <ImageIcon size={20} className="text-slate-300" />
                <span className="text-[10px] text-slate-400">Chưa có ảnh</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-0.5">Dòng máy đã chọn</p>
              <p className="text-sm font-bold text-slate-800 truncate">{selectedModel.name}</p>
              <p className="text-xs font-mono text-slate-500">{selectedModel.modelCode}</p>
              {selectedModel.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{selectedModel.description}</p>
              )}
            </div>
          </div>
        )}

        <div>
          <RequiredLabel>Số lượng</RequiredLabel>
          <input
            type="number"
            value={formData.quantity}
            onChange={(event) => setFormData({ ...formData, quantity: Number(event.target.value) })}
            min={1}
            max={100}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Hệ thống sẽ tạo đúng số lượng máy ấp theo dòng máy đã chọn.</p>
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
            disabled={isSubmitting || isCheckingModel}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {isCheckingModel ? "Đang kiểm tra..." : isSubmitting ? "Đang tạo..." : "Tạo máy ấp"}
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
    <div className="bg-slate-50 rounded-lg p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-700 font-semibold">{label}</span>
        <span className="text-sm font-medium text-slate-900 text-right break-all">{children}</span>
      </div>
    </div>
  );
}
