import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  CheckCircle,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { Pagination } from "./pagination";
import { ResourceActionsMenu } from "./resource-actions-menu";
import { OptionalLabel, RequiredLabel, SidePanel } from "./side-panel";
import { can } from "@/config/permissions";
import { useSession } from "@/hooks/use-session";
import { incubatorModelService } from "@/services/incubatorModels";
import { configService, type Config } from "@/services/configs";
import type { IncubatorModel } from "@/types/incubator-model";
import { formatDateTime } from "@/utils/format";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModelConfigItem {
  configId: string;
  quantity?: number;
  required?: boolean;
  absoluteMin?: number;
  absoluteMax?: number;
}

export interface CreateIncubatorModelPayload {
  modelCode: string;
  name: string;
  description?: string;
  unitPrice: number;
  configs: ModelConfigItem[];
}

export interface UpdateIncubatorModelPayload {
  modelCode?: string;
  name?: string;
  description?: string;
  unitPrice?: number;
  configs?: ModelConfigItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ACTIVE: { label: "Đang bán", color: "bg-green-100 text-green-800", icon: CheckCircle },
  INACTIVE: { label: "Ngừng bán", color: "bg-slate-100 text-slate-600", icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, color: "bg-slate-100 text-slate-600", icon: Box };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${meta.color}`}>
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-700 font-semibold">{label}</span>
        <span className="text-sm font-medium text-slate-900 text-right break-all">{children}</span>
      </div>
    </div>
  );
}

// ─── Config row ───────────────────────────────────────────────────────────────

function ConfigRow({
  item,
  configMeta,
  onChange,
  onRemove,
}: {
  item: ModelConfigItem;
  configMeta: Config | null;
  onChange: (updated: ModelConfigItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {configMeta ? configMeta.name : <span className="text-slate-400 italic">Đang tải...</span>}
          </p>
          {configMeta && (
            <p className="text-xs text-slate-500">
              {configMeta.code}
              {configMeta.unit ? ` · ${configMeta.unit}` : ""}
              {configMeta.type ? ` · ${configMeta.type}` : ""}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Số lượng</label>
          <input
            type="number"
            min={1}
            value={item.quantity ?? ""}
            onChange={(e) =>
              onChange({ ...item, quantity: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="Không giới hạn"
            className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={item.required ?? false}
              onChange={(e) => onChange({ ...item, required: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Bắt buộc</span>
          </label>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Min{configMeta?.unit ? ` (${configMeta.unit})` : ""}
          </label>
          <input
            type="number"
            step="any"
            value={item.absoluteMin ?? ""}
            onChange={(e) =>
              onChange({ ...item, absoluteMin: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="--"
            className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Max{configMeta?.unit ? ` (${configMeta.unit})` : ""}
          </label>
          <input
            type="number"
            step="any"
            value={item.absoluteMax ?? ""}
            onChange={(e) =>
              onChange({ ...item, absoluteMax: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="--"
            className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Config picker ────────────────────────────────────────────────────────────

function ConfigPicker({
  existingIds,
  onAdd,
}: {
  existingIds: string[];
  onAdd: (config: Config) => void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Config[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await configService.list({ search, pageSize: 8 });
        if (!cancelled) {
          setResults(res.items);
          setOpen(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [search]);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Tìm config theo tên hoặc mã..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
          autoComplete="off"
        />
        {loading && (
          <Loader2 size={15} className="absolute right-3 top-2.5 text-slate-400 animate-spin" />
        )}
      </div>

      {open && (results.length > 0 || (search.trim() && !loading)) && (
        <div className="absolute z-40 mt-1.5 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl p-1">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">Không tìm thấy config phù hợp.</p>
          ) : (
            results.map((cfg) => {
              const already = existingIds.includes(cfg.id);
              return (
                <button
                  key={cfg.id}
                  type="button"
                  disabled={already}
                  onClick={() => {
                    onAdd(cfg);
                    setSearch("");
                    setResults([]);
                    setOpen(false);
                  }}
                  className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                    already
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900">{cfg.name}</p>
                  <p className="text-xs text-slate-500">
                    {cfg.code}
                    {cfg.unit ? ` · ${cfg.unit}` : ""}
                    {cfg.type ? ` · ${cfg.type}` : ""}
                    {already ? " · Đã thêm" : ""}
                  </p>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Configs section ──────────────────────────────────────────────────────────

function ConfigsSection({
  items,
  onChange,
}: {
  items: ModelConfigItem[];
  onChange: (items: ModelConfigItem[]) => void;
}) {
  const [configMetaMap, setConfigMetaMap] = useState<Record<string, Config>>({});

  const handleAdd = (cfg: Config) => {
    setConfigMetaMap((m) => ({ ...m, [cfg.id]: cfg }));
    onChange([...items, { configId: cfg.id, required: false }]);
  };

  const handleChange = (index: number, updated: ModelConfigItem) => {
    const next = [...items];
    next[index] = updated;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          Cấu hình dòng máy
          {items.length > 0 && (
            <span className="ml-1.5 text-xs text-slate-400 font-normal">({items.length})</span>
          )}
        </label>
      </div>

      <ConfigPicker existingIds={items.map((it) => it.configId)} onAdd={handleAdd} />

      {items.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Chưa có config nào. Tìm và thêm ở trên.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
          {items.map((item, i) => (
            <ConfigRow
              key={item.configId}
              item={item}
              configMeta={configMetaMap[item.configId] ?? null}
              onChange={(updated) => handleChange(i, updated)}
              onRemove={() => onChange(items.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function IncubatorModelManagement() {
  const session = useSession();
  const role = session?.role;

  const [models, setModels] = useState<IncubatorModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<IncubatorModel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<IncubatorModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  const loadModels = async (page = currentPage, search = searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const result = await incubatorModelService.list({ search, page, pageSize: itemsPerPage });
      setModels(result.items);
      setTotalItems(result.totalItems);
      setTotalPages(Math.max(1, result.totalPages));
      if (result.items.length === 0) {
        setSelectedModel(null);
      } else if (!selectedModel || !result.items.some((m) => m.id === selectedModel.id)) {
        setSelectedModel(result.items[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách dòng máy.");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const detail = await incubatorModelService.getById(id);
      setSelectedModel(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải chi tiết.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = async (payload: CreateIncubatorModelPayload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await incubatorModelService.create(payload);
      setIsCreateOpen(false);
      await loadModels(1, searchTerm);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo dòng máy.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, payload: UpdateIncubatorModelPayload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await incubatorModelService.update(id, payload);
      setEditingModel(null);
      await loadModels(currentPage, searchTerm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật dòng máy.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dòng máy này không?")) return;
    setError(null);
    try {
      await incubatorModelService.delete(id);
      if (selectedModel?.id === id) setSelectedModel(null);
      await loadModels(currentPage, searchTerm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa dòng máy.");
    }
  };

  useEffect(() => {
    const t = window.setTimeout(() => {
      setCurrentPage(1);
      void loadModels(1, searchTerm);
    }, 500);
    return () => window.clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    void loadModels(currentPage, searchTerm);
  }, [currentPage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Quản Lý Dòng Máy Ấp</h2>
        <div className="flex gap-3">
          {can(role, "incubator_models", "create") && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              Tạo Dòng Máy
            </button>
          )}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc mã..."
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-56"
          />
          <button
            onClick={() => void loadModels(currentPage, searchTerm)}
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
              Đang tải danh sách dòng máy...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mã</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tên</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Trạng thái</th>
                      <th className="w-10 px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {models.map((model) => (
                      <tr
                        key={model.id}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          selectedModel?.id === model.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => void loadDetail(model.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-slate-900">
                          {model.modelCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {model.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={model.status} />
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <ResourceActionsMenu
                            canEdit={can(role, "incubator_models", "edit")}
                            canDelete={can(role, "incubator_models", "delete")}
                            onEdit={() => setEditingModel(model)}
                            onDelete={() => void handleDelete(model.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {models.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  Không tìm thấy dòng máy phù hợp.
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
          ) : selectedModel ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Chi Tiết Dòng Máy</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedModel.modelCode}</p>
              </div>
              <DetailRow label="Mã dòng máy">{selectedModel.modelCode}</DetailRow>
              <DetailRow label="Tên">{selectedModel.name}</DetailRow>
              <DetailRow label="Mô tả">{selectedModel.description || "Không có mô tả"}</DetailRow>
              <DetailRow label="Giá bán">
                {selectedModel.unitPrice.toLocaleString("vi-VN")} ₫
              </DetailRow>
              <DetailRow label="Ngày tạo">{formatDateTime(selectedModel.createdAt)}</DetailRow>
              <DetailRow label="Cập nhật gần nhất">{formatDateTime(selectedModel.updatedAt)}</DetailRow>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 font-semibold">Trạng thái</span>
                  <StatusBadge status={selectedModel.status} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Box size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Chọn dòng máy để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      <CreateModelPanel
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      <EditModelPanel
        model={editingModel}
        onClose={() => setEditingModel(null)}
        onSubmit={(payload) => {
          if (editingModel) void handleUpdate(editingModel.id, payload);
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

// ─── Create panel ─────────────────────────────────────────────────────────────

function CreateModelPanel({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateIncubatorModelPayload) => void;
  isSubmitting: boolean;
}) {
  const [modelCode, setModelCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState<number | "">("");
  const [configs, setConfigs] = useState<ModelConfigItem[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setModelCode("");
      setName("");
      setDescription("");
      setUnitPrice("");
      setConfigs([]);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      modelCode: modelCode.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      unitPrice: Number(unitPrice),
      configs,
    });
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo dòng máy mới"
      description="Điền thông tin cơ bản và cấu hình cho dòng máy ấp."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <RequiredLabel>Mã dòng máy</RequiredLabel>
          <input
            type="text"
            value={modelCode}
            onChange={(e) => setModelCode(e.target.value)}
            placeholder="VD: MA-500, IS-1000"
            maxLength={50}
            minLength={2}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <RequiredLabel>Tên dòng máy</RequiredLabel>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Máy Ấp Trứng Gà 500 Trứng"
            maxLength={100}
            minLength={2}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <OptionalLabel>Mô tả</OptionalLabel>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn về dòng máy (không bắt buộc)"
            maxLength={255}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <RequiredLabel>Giá bán (VNĐ)</RequiredLabel>
          <input
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : "")}
            placeholder="VD: 5000000"
            min={1}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="border-t border-slate-200" />

        <ConfigsSection items={configs} onChange={setConfigs} />

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
            {isSubmitting ? "Đang tạo..." : "Tạo dòng máy"}
          </button>
        </div>
      </form>
    </SidePanel>
  );
}

// ─── Edit panel ───────────────────────────────────────────────────────────────

function EditModelPanel({
  model,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  model: IncubatorModel | null;
  onClose: () => void;
  onSubmit: (payload: UpdateIncubatorModelPayload) => void;
  isSubmitting: boolean;
}) {
  const [modelCode, setModelCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState<number | "">("");
  const [configs, setConfigs] = useState<ModelConfigItem[]>([]);

  useEffect(() => {
    if (model) {
      setModelCode(model.modelCode);
      setName(model.name);
      setDescription(model.description ?? "");
      setUnitPrice(model.unitPrice ?? "");
      setConfigs([]);
    }
  }, [model]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      modelCode: modelCode.trim() || undefined,
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      unitPrice: unitPrice !== "" ? Number(unitPrice) : undefined,
      configs: configs.length > 0 ? configs : undefined,
    });
  };

  return (
    <SidePanel
      isOpen={!!model}
      onClose={onClose}
      title="Chỉnh sửa dòng máy"
      description={`Cập nhật thông tin cho dòng máy ${model?.modelCode ?? ""}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <RequiredLabel>Mã dòng máy</RequiredLabel>
          <input
            type="text"
            value={modelCode}
            onChange={(e) => setModelCode(e.target.value)}
            maxLength={50}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <RequiredLabel>Tên dòng máy</RequiredLabel>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <OptionalLabel>Mô tả</OptionalLabel>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={255}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <RequiredLabel>Giá bán (VNĐ)</RequiredLabel>
          <input
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : "")}
            min={1}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="border-t border-slate-200" />

        <div>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            Nếu thêm config bên dưới, toàn bộ config cũ sẽ bị thay thế. Để giữ nguyên, bỏ trống phần này.
          </p>
          <ConfigsSection items={configs} onChange={setConfigs} />
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
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </SidePanel>
  );
}
