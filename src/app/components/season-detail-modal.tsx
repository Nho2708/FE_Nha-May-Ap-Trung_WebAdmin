import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ChevronDown, ChevronRight, CheckCircle, XCircle, Ban } from 'lucide-react';
import { hatchingSeasonService } from '@/services/hatchingSeasons';
import { hatchingSeasonTemplateService } from '@/services/hatchingSeasonTemplates';
import { configService, type Config } from '@/services/configs';
import { can } from '@/config/permissions';
import { useSession } from '@/hooks/use-session';
import { incubatorService } from '@/services/incubators';
import type { Incubator } from '@/types/incubator';
import type { HatchingSeason, HatchingSeasonDetail, HatchingSeasonTemplateDetail, TemplateBatchDetail } from '@/types/hatching';

interface SeasonDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  season: HatchingSeason | null;
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Đang ấp',
  COMPLETED: 'Hoàn thành',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  FAILED: 'bg-orange-100 text-orange-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
};

export function SeasonDetailModal({ isOpen, onClose, onUpdated, season }: SeasonDetailModalProps) {
  const session = useSession();
  const role = session?.role;
  const canEdit = can(role, 'seasons', 'edit');
  const [detail, setDetail] = useState<HatchingSeasonDetail | null>(null);
  const [templateDetail, setTemplateDetail] = useState<HatchingSeasonTemplateDetail | null>(null);
  const [incubator, setIncubator] = useState<Incubator | null>(null);
  const [availableConfigs, setAvailableConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const loadDetail = () => {
    if (!season) return;
    setLoading(true);
    setError(null);
    Promise.all([
      hatchingSeasonService.getById(season.id),
      configService.list({ pageSize: 100 }),
    ]).then(([d, cfgResult]) => {
      setDetail(d);
      setAvailableConfigs(cfgResult.items);
      if (d?.season?.templateId) {
        hatchingSeasonTemplateService.getById(d.season.templateId)
          .then(td => setTemplateDetail(td))
          .catch(() => {});
      } else {
        setTemplateDetail(null);
      }
      if (d?.season?.incubatorId) {
        incubatorService.getById(d.season.incubatorId)
          .then(inc => setIncubator(inc))
          .catch(() => {});
      }
    }).catch(() => setError('Không thể tải chi tiết mùa ấp'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isOpen || !season) return;
    setExpandedBatches(new Set());
    setPendingStatus(null);
    loadDetail();
  }, [isOpen, season]);

  const toggleBatch = (id: string) => {
    setExpandedBatches(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const confirmUpdateStatus = async () => {
    if (!season || !pendingStatus) return;
    setStatusLoading(pendingStatus);
    setError(null);
    try {
      await hatchingSeasonService.updateStatus(season.id, { status: pendingStatus });
      setPendingStatus(null);
      loadDetail();
      onUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái');
    } finally {
      setStatusLoading(null);
    }
  };

  if (!isOpen || !season) return null;

  const s = detail?.season ?? season;
  const configNames = availableConfigs.reduce<Record<string, string>>((acc, c) => {
    acc[c.id] = `${c.name}${c.unit ? ` (${c.unit})` : ''}`;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Chi Tiết Mùa Ấp</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-green-100 text-sm font-mono">{season.seasonCode}</span>
                {incubator?.serialNumber && (
                  <span className="text-green-200 text-xs font-mono">· {incubator.serialNumber}</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[s.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {STATUS_LABEL[s.status] ?? s.status}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-2 transition-colors"><X size={20} /></button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin inline-block w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full" /></div>
        ) : (
          <div className="p-5 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Thông tin mùa ấp */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Thông Tin</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Loại trứng</p>
                  <p className="font-semibold text-slate-800">{s.eggType ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Ngày bắt đầu</p>
                  <p className="font-semibold text-slate-800">{new Date(s.startDate).toLocaleDateString('vi-VN')}</p>
                </div>
                {s.endDate && (
                  <div>
                    <p className="text-xs text-slate-500">Ngày kết thúc</p>
                    <p className="font-semibold text-slate-800">{new Date(s.endDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                )}
                {s.totalEggs != null && (
                  <div>
                    <p className="text-xs text-slate-500">Tổng số trứng</p>
                    <p className="font-semibold text-slate-800">{s.totalEggs.toLocaleString('vi-VN')}</p>
                  </div>
                )}
                {(s.successCount > 0 || s.failCount > 0) && (
                  <>
                    <div>
                      <p className="text-xs text-slate-500">Trứng nở thành công</p>
                      <p className="font-semibold text-green-600">{s.successCount.toLocaleString('vi-VN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Trứng thất bại</p>
                      <p className="font-semibold text-red-500">{s.failCount.toLocaleString('vi-VN')}</p>
                    </div>
                  </>
                )}
                {detail?.template && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Template</p>
                    <p className="font-semibold text-slate-800">{detail.template.name} · {detail.template.totalDays} ngày</p>
                  </div>
                )}
                {s.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Ghi chú</p>
                    <p className="text-slate-700">{s.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Giai đoạn */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800">
                  Giai Đoạn Ấp ({templateDetail?.batches.length ?? 0})
                </h3>
              </div>

              {!templateDetail && (
                <p className="text-xs text-slate-500 text-center py-5">Mùa ấp này không có template</p>
              )}

              {templateDetail && templateDetail.batches.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-5">Template chưa có giai đoạn nào</p>
              )}

              <div className="divide-y divide-slate-100">
                {templateDetail?.batches.map((bd: TemplateBatchDetail) => {
                  if (!bd.batch) return null;
                  const expanded = expandedBatches.has(bd.batch.id);
                  return (
                    <div key={bd.batch.id}>
                      <button type="button" onClick={() => toggleBatch(bd.batch!.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                        {expanded ? <ChevronDown size={14} className="text-slate-400 shrink-0" /> : <ChevronRight size={14} className="text-slate-400 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">
                            Giai đoạn {bd.batch.batchIndex}{bd.batch.name ? ` — ${bd.batch.name}` : ''}
                          </p>
                          <p className="text-xs text-slate-500">
                            {bd.batch.numberOfDays} ngày
                            {bd.configs.length > 0 && ` · ${bd.configs.length} thông số`}
                            {bd.batch.notes && ` · ${bd.batch.notes}`}
                          </p>
                        </div>
                      </button>

                      {expanded && bd.configs.length > 0 && (
                        <div className="px-4 pb-3 bg-slate-50 border-t border-slate-100">
                          <table className="w-full text-xs mt-2">
                            <thead>
                              <tr className="text-slate-500">
                                <th className="text-left py-1 font-medium">Thông số</th>
                                <th className="text-right py-1 font-medium">Target</th>
                                <th className="text-right py-1 font-medium">Min</th>
                                <th className="text-right py-1 font-medium">Max</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {bd.configs.map(cfg => (
                                <tr key={cfg.id}>
                                  <td className="py-1.5 text-slate-700">{configNames[cfg.configId] ?? cfg.configId.slice(0, 8)}</td>
                                  <td className="py-1.5 text-right font-medium text-slate-800">{cfg.targetValue ?? '—'}</td>
                                  <td className="py-1.5 text-right text-slate-600">{cfg.minValue ?? '—'}</td>
                                  <td className="py-1.5 text-right text-slate-600">{cfg.maxValue ?? '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inline confirm đổi trạng thái */}
            {pendingStatus && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 flex-1">
                  Xác nhận chuyển sang <span className="font-semibold">"{STATUS_LABEL[pendingStatus]}"</span>?
                </p>
                <button
                  type="button"
                  onClick={() => setPendingStatus(null)}
                  className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmUpdateStatus}
                  disabled={!!statusLoading}
                  className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium disabled:opacity-50"
                >
                  {statusLoading ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-slate-200">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium">
                Đóng
              </button>
              {canEdit && s.status === 'ACTIVE' && !pendingStatus && (
                <>
                  <button
                    type="button"
                    onClick={() => setPendingStatus('COMPLETED')}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle size={15} />
                    Hoàn thành
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingStatus('FAILED')}
                    className="flex-1 px-4 py-2.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={15} />
                    Thất bại
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingStatus('CANCELLED')}
                    className="flex-1 px-4 py-2.5 bg-slate-500 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors font-medium flex items-center justify-center gap-1.5"
                  >
                    <Ban size={15} />
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
