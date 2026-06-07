import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { hatchingSeasonService } from '@/services/hatchingSeasons';
import { configService, type Config } from '@/services/configs';
import type { HatchingSeason, HatchingSeasonDetail, HatchingBatchDetail } from '@/types/hatching';

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

export function SeasonDetailModal({ isOpen, onClose, season }: SeasonDetailModalProps) {
  const [detail, setDetail] = useState<HatchingSeasonDetail | null>(null);
  const [availableConfigs, setAvailableConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen || !season) return;
    setExpandedBatches(new Set());
    setError(null);
    setLoading(true);
    Promise.all([
      hatchingSeasonService.getById(season.id),
      configService.list({ pageSize: 100 }),
    ]).then(([d, cfgResult]) => {
      setDetail(d);
      setAvailableConfigs(cfgResult.items);
    }).catch(() => setError('Không thể tải chi tiết mùa ấp'))
      .finally(() => setLoading(false));
  }, [isOpen, season]);

  const toggleBatch = (id: string) => {
    setExpandedBatches(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
              <div className="flex items-center gap-2 mt-1">
                <span className="text-green-100 text-sm font-mono">{season.seasonCode}</span>
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
                <h3 className="text-sm font-semibold text-slate-800">Giai Đoạn Ấp ({detail?.batches.length ?? 0})</h3>
              </div>

              {detail?.batches.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-5">Chưa có giai đoạn nào</p>
              )}

              <div className="divide-y divide-slate-100">
                {detail?.batches.map((bd: HatchingBatchDetail) => {
                  const expanded = expandedBatches.has(bd.batch.id);
                  return (
                    <div key={bd.batch.id}>
                      <button type="button" onClick={() => toggleBatch(bd.batch.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                        {expanded ? <ChevronDown size={14} className="text-slate-400 shrink-0" /> : <ChevronRight size={14} className="text-slate-400 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">
                            #{bd.batch.batchIndex}{bd.batch.name ? ` — ${bd.batch.name}` : ''}
                          </p>
                          <p className="text-xs text-slate-500">
                            Ngày {bd.batch.dayStart} → {bd.batch.dayEnd}
                            {bd.batch.actualStartAt && ` · Bắt đầu: ${new Date(bd.batch.actualStartAt).toLocaleDateString('vi-VN')}`}
                            {bd.batch.actualEndAt && ` · Kết thúc: ${new Date(bd.batch.actualEndAt).toLocaleDateString('vi-VN')}`}
                            {` · ${bd.configs.length} thông số`}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                          bd.batch.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>{bd.batch.status}</span>
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
          </div>
        )}
      </div>
    </div>
  );
}
