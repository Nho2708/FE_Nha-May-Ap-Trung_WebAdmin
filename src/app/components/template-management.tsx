import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, Plus, RefreshCw, AlertCircle, ChevronRight, Settings, Loader2 } from 'lucide-react';
import { CreateTemplateModal } from './create-template-modal';
import { UpdateTemplateModal } from './update-template-modal';
import { ResourceActionsMenu } from './resource-actions-menu';
import { Pagination } from './pagination';
import { can } from '@/config/permissions';
import { useSession } from '@/hooks/use-session';
import { hatchingSeasonTemplateService } from '@/services/hatchingSeasonTemplates';
import { configService, type Config } from '@/services/configs';
import type { HatchingSeasonTemplate, HatchingSeasonTemplateDetail } from '@/types/hatching';

const EGG_TYPE_ICONS: Record<string, string> = {
  'Gà': '🐔', 'Vịt': '🦆', 'Ngỗng': '🦢', 'Chim': '🐦', 'Đà điểu': '🦤', 'Cút': '🐦',
  'CHICKEN': '🐔', 'DUCK': '🦆', 'QUAIL': '🐦', 'PIGEON': '🕊️',
};

const EGG_TYPE_LABELS: Record<string, string> = {
  'CHICKEN': 'Gà', 'DUCK': 'Vịt', 'QUAIL': 'Cút', 'PIGEON': 'Bồ câu',
};

const getEggIcon = (eggType: string | null) => EGG_TYPE_ICONS[eggType ?? ''] ?? '🥚';
const getEggLabel = (eggType: string | null) => EGG_TYPE_LABELS[eggType ?? ''] ?? eggType ?? '';

export function TemplateManagement() {
  const session = useSession();
  const role = session?.role;

  const [templates, setTemplates] = useState<HatchingSeasonTemplate[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<HatchingSeasonTemplate | null>(null);
  const [selectedTemplateDetail, setSelectedTemplateDetail] = useState<HatchingSeasonTemplateDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const pageSize = 10;

  const fetchTemplates = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await hatchingSeasonTemplateService.list({ page, pageSize });
      setTemplates(result.items);
      setTotalItems(result.totalItems);
      setTotalPages(result.totalPages);
      return result.items as HatchingSeasonTemplate[];
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách template');
      return [] as HatchingSeasonTemplate[];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates(currentPage);
  }, [fetchTemplates, currentPage]);

  useEffect(() => {
    configService.list({ pageSize: 100 }).then((res) => setConfigs(res.items ?? [])).catch(() => {});
  }, []);

  const handleSelectTemplate = useCallback(async (template: HatchingSeasonTemplate) => {
    setSelectedTemplate(template);
    setSelectedTemplateDetail(null);
    setDetailLoading(true);
    try {
      const detail = await hatchingSeasonTemplateService.getById(template.id);
      setSelectedTemplateDetail(detail);
    } catch {
      // keep basic info, just no batches
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleCreated = () => {
    fetchTemplates(1);
    setCurrentPage(1);
  };

  const handleUpdated = async () => {
    const prevSelected = selectedTemplate;
    const freshList = await fetchTemplates(currentPage);
    setIsUpdateModalOpen(false);
    if (prevSelected) {
      const fresh = freshList.find((t) => t.id === prevSelected.id);
      await handleSelectTemplate(fresh ?? prevSelected);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await hatchingSeasonTemplateService.delete(id);
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
        setSelectedTemplateDetail(null);
      }
      fetchTemplates(currentPage);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể xóa template');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Quản Lý Template Ấp Trứng</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTemplates(currentPage)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Làm mới"
          >
            <RefreshCw size={16} />
          </button>
          {can(role, "templates", "create") && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} />
              Tạo Template
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Template List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
              <FileText size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">Chưa có template nào</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer hover:shadow ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 shadow'
                    : 'border-slate-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{getEggIcon(template.eggType)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-800">{template.name}</h3>
                          {!template.isActive && (
                            <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-500 rounded">
                              Tắt
                            </span>
                          )}
                        </div>
                        {template.eggType && (
                          <p className="text-xs text-slate-600">Loại: {getEggLabel(template.eggType)}</p>
                        )}
                      </div>
                    </div>
                    <ResourceActionsMenu
                      canEdit={can(role, "templates", "edit")}
                      canDelete={can(role, "templates", "delete")}
                      onEdit={() => {
                        setSelectedTemplate(template);
                        setIsUpdateModalOpen(true);
                      }}
                      onDelete={() => handleDelete(template.id)}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Clock size={12} className="text-purple-600" />
                        <span className="text-xs text-slate-700">Tổng ngày</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{template.totalDays} ngày</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <FileText size={12} className="text-blue-600" />
                        <span className="text-xs text-slate-700">Tạo bởi</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {template.createdByType === 'TECHNICIAN' ? 'Kỹ thuật viên' : 'Khách hàng'}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs text-green-600">●</span>
                        <span className="text-xs text-slate-700">Trạng thái</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {template.isActive ? 'Đang dùng' : 'Không dùng'}
                      </p>
                    </div>
                  </div>

                  {template.description && (
                    <p className="text-xs text-slate-500 truncate">{template.description}</p>
                  )}

                  <div className="flex items-center justify-end mt-1 text-blue-500 text-xs gap-1">
                    <span>Xem chi tiết</span>
                    <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            ))
          )}

          {totalPages > 1 && (
            <Pagination
              totalItems={totalItems}
              itemsPerPage={pageSize}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Template Details */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 h-fit sticky top-6 max-h-[80vh] overflow-y-auto hide-scrollbar">
          {selectedTemplate ? (
            <div className="space-y-4">
              <div className="text-center pb-3 border-b border-slate-200">
                <span className="text-5xl mb-2 block">{getEggIcon(selectedTemplate.eggType)}</span>
                <h3 className="text-base font-semibold text-slate-800">{selectedTemplate.name}</h3>
                {selectedTemplate.eggType && (
                  <p className="text-xs text-slate-600 mt-0.5">{getEggLabel(selectedTemplate.eggType)}</p>
                )}
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                  <span className="text-slate-600">Tổng ngày ấp:</span>
                  <span className="font-semibold text-slate-800">{selectedTemplate.totalDays} ngày</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                  <span className="text-slate-600">Tạo bởi:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedTemplate.createdByType === 'TECHNICIAN' ? 'Kỹ thuật viên' : 'Khách hàng'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                  <span className="text-slate-600">Trạng thái:</span>
                  <span className={`font-semibold ${selectedTemplate.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                    {selectedTemplate.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                {selectedTemplate.description && (
                  <div className="p-2 bg-slate-50 rounded text-xs">
                    <p className="text-slate-600 mb-1">Mô tả:</p>
                    <p className="text-slate-800">{selectedTemplate.description}</p>
                  </div>
                )}
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                  <span className="text-slate-600">Ngày tạo:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedTemplate.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Batches detail */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Settings size={13} className="text-purple-600" />
                  <span className="text-xs font-semibold text-slate-700">Các giai đoạn</span>
                </div>
                {detailLoading ? (
                  <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-xs">
                    <Loader2 size={14} className="animate-spin" />
                    Đang tải...
                  </div>
                ) : !selectedTemplateDetail || selectedTemplateDetail.batches.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">Chưa có giai đoạn nào</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTemplateDetail.batches.map((bd, idx) => {
                      const batch = bd.batch;
                      if (!batch) return null;
                      return (
                        <div key={batch.id} className="border border-slate-200 rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between px-3 py-2 bg-purple-50">
                            <span className="text-xs font-semibold text-purple-700">
                              Giai đoạn {idx + 1}{batch.name ? ` — ${batch.name}` : ''}
                            </span>
                            <span className="text-xs text-slate-500">
                              {batch.numberOfDays} ngày
                            </span>
                          </div>
                          {batch.notes && (
                            <p className="px-3 py-1 text-xs text-slate-500 italic">{batch.notes}</p>
                          )}
                          {bd.configs.length > 0 && (
                            <div className="px-3 py-2 space-y-1">
                              {bd.configs.map((cfg) => {
                                const cfgDef = configs.find((c) => c.id === cfg.configId);
                                return (
                                  <div key={cfg.id} className="flex items-center justify-between text-xs bg-slate-50 rounded px-2 py-1">
                                    <span className="text-slate-700 font-medium">
                                      {cfgDef?.name ?? cfg.configId}
                                      {cfgDef?.unit ? ` (${cfgDef.unit})` : ''}
                                    </span>
                                    <span className="text-slate-500 text-right">
                                      {cfg.targetValue != null && <span>Mục tiêu: {cfg.targetValue}</span>}
                                      {cfg.minValue != null && cfg.maxValue != null && (
                                        <span className="ml-1">[{cfg.minValue}–{cfg.maxValue}]</span>
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {bd.configs.length === 0 && (
                            <p className="px-3 py-1.5 text-xs text-slate-400">Không có thông số</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {can(role, "templates", "edit") && (
                <div className="pt-3 space-y-2">
                  <button
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Chỉnh Sửa
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">Chọn template để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreated}
      />

      <UpdateTemplateModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedTemplate(null);
        }}
        onSubmit={handleUpdated}
        template={selectedTemplate}
      />
    </div>
  );
}
