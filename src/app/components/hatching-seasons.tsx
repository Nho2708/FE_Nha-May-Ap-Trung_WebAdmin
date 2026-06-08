import React, { useState, useEffect, useCallback } from 'react';
import { Egg, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';
import { SeasonDetailModal } from './season-detail-modal';
import { Pagination } from './pagination';
import { useSession } from '@/hooks/use-session';
import { can } from '@/config/permissions';
import { hatchingSeasonService } from '@/services/hatchingSeasons';
import type { HatchingSeason, HatchingSeasonStatus } from '@/types/hatching';

const STATUS_CONFIG: Record<HatchingSeasonStatus, { label: string; color: string; icon: React.ElementType }> = {
  ACTIVE:    { label: 'Đang ấp',    color: 'bg-green-100 text-green-800',  icon: Clock },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-800',   icon: CheckCircle },
  FAILED:    { label: 'Thất bại',   color: 'bg-orange-100 text-orange-800', icon: XCircle },
  CANCELLED: { label: 'Đã hủy',    color: 'bg-slate-100 text-slate-600',  icon: Ban },
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang ấp' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status as HatchingSeasonStatus] ?? { label: status, color: 'bg-slate-100 text-slate-600', icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

export function HatchingSeasons() {
  const session = useSession();
  const role = session?.role;

  const [seasons, setSeasons] = useState<HatchingSeason[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSeason, setSelectedSeason] = useState<HatchingSeason | null>(null);

  const pageSize = 10;

  const fetchSeasons = useCallback(async (page = 1, status = '') => {
    setLoading(true);
    setError(null);
    try {
      const result = await hatchingSeasonService.list({ page, pageSize, status: status || undefined });
      setSeasons(result.items);
      setTotalItems(result.totalItems);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách mùa ấp');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeasons(currentPage, statusFilter);
  }, [fetchSeasons, currentPage, statusFilter]);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Quản Lý Mùa Ấp</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchSeasons(currentPage, statusFilter)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Làm mới">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-3 flex items-center gap-2 flex-wrap">
          {STATUS_FILTER_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => handleFilterChange(opt.value)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                statusFilter === opt.value ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full" />
            <p className="text-sm text-slate-500 mt-2">Đang tải...</p>
          </div>
        ) : seasons.length === 0 ? (
          <div className="p-8 text-center">
            <Egg size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">Không có mùa ấp nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mã Mùa Ấp</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tên / Loại Trứng</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Trạng Thái</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ngày Bắt Đầu</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Trứng</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Kết Quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {seasons.map(s => (
                  <tr key={s.id} onClick={() => setSelectedSeason(s)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-slate-900">{s.seasonCode}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">{s.name ?? '—'}</p>
                      {s.eggType && <p className="text-xs text-slate-500">{s.eggType}</p>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(s.startDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">
                      {s.totalEggs != null ? s.totalEggs.toLocaleString('vi-VN') : '—'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {(s.successCount > 0 || s.failCount > 0) ? (
                        <div className="text-xs">
                          <span className="text-green-600 font-medium">✓ {s.successCount}</span>
                          <span className="text-slate-400 mx-1">/</span>
                          <span className="text-red-500 font-medium">✗ {s.failCount}</span>
                        </div>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 pb-4">
            <Pagination totalItems={totalItems} itemsPerPage={pageSize} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <SeasonDetailModal
        isOpen={!!selectedSeason}
        onClose={() => setSelectedSeason(null)}
        onUpdated={() => fetchSeasons(currentPage, statusFilter)}
        season={selectedSeason}
      />
    </div>
  );
}
