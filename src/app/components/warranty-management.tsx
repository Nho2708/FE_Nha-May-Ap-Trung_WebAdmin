import React, { useState, useEffect, useCallback } from 'react';
import { Search, Shield, AlertCircle, CheckCircle, Calendar, RefreshCw, Plus, Edit2, Loader2 } from 'lucide-react';
import { Pagination } from './pagination';
import { can } from '@/config/permissions';
import { useSession } from '@/hooks/use-session';
import { incubatorService } from '@/services/incubators';
import { warrantyService } from '@/services/warranties';
import type { Incubator, IncubatorStatus } from '@/types/incubator';
import type { WarrantySummary } from '@/types/maintenance';

const WARRANTY_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ACTIVE: { label: 'Có hiệu lực', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  INACTIVE: { label: 'Không hiệu lực', color: 'bg-slate-100 text-slate-600', icon: Shield },
  DELETED: { label: 'Đã xóa', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

const INCUBATOR_STATUS_COLOR: Record<IncubatorStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  RESERVED: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-indigo-100 text-indigo-800',
  REPLACEMENT_PENDING: 'bg-orange-100 text-orange-800',
  IN_MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  DAMAGED: 'bg-red-100 text-red-800',
  RETIRED: 'bg-slate-100 text-slate-600',
};

const INCUBATOR_STATUS_LABEL: Record<IncubatorStatus, string> = {
  AVAILABLE: 'Sẵn sàng',
  RESERVED: 'Đã đặt',
  ACTIVE: 'Đang dùng',
  REPLACEMENT_PENDING: 'Chờ thay',
  IN_MAINTENANCE: 'Bảo trì',
  DAMAGED: 'Hỏng',
  RETIRED: 'Ngưng dùng',
};

interface WarrantyFormState {
  startDate: string;
  endDate: string;
  notes: string;
}

export function WarrantyManagement() {
  const session = useSession();
  const role = session?.role;

  const [incubators, setIncubators] = useState<Incubator[]>([]);
  const [totalIncubators, setTotalIncubators] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedIncubator, setSelectedIncubator] = useState<Incubator | null>(null);
  const [warranty, setWarranty] = useState<WarrantySummary | null>(null);
  const [warrantyLoading, setWarrantyLoading] = useState(false);
  const [warrantyError, setWarrantyError] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<'none' | 'create' | 'edit'>('none');
  const [form, setForm] = useState<WarrantyFormState>({ startDate: '', endDate: '', notes: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const pageSize = 10;

  const fetchIncubators = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await incubatorService.list({ page, pageSize });
      setIncubators(result.items);
      setTotalIncubators(result.totalItems);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách máy ấp');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncubators(currentPage);
  }, [fetchIncubators, currentPage]);

  const fetchWarranty = async (incubator: Incubator) => {
    setSelectedIncubator(incubator);
    setWarranty(null);
    setWarrantyError(null);
    setFormMode('none');
    setWarrantyLoading(true);
    try {
      const data = await warrantyService.getByIncubatorId(incubator.id);
      setWarranty(data);
    } catch (err: unknown) {
      setWarrantyError(err instanceof Error ? err.message : 'Không thể tải thông tin bảo hành');
    } finally {
      setWarrantyLoading(false);
    }
  };

  const openCreateForm = () => {
    setForm({ startDate: '', endDate: '', notes: '' });
    setFormMode('create');
    setFormError(null);
  };

  const openEditForm = () => {
    if (!warranty) return;
    setForm({
      startDate: warranty.startDate ? warranty.startDate.slice(0, 10) : '',
      endDate: warranty.endDate ? warranty.endDate.slice(0, 10) : '',
      notes: warranty.notes ?? '',
    });
    setFormMode('edit');
    setFormError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncubator) return;
    setFormSubmitting(true);
    setFormError(null);
    try {
      if (formMode === 'create') {
        await warrantyService.create({
          incubatorId: selectedIncubator.id,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          notes: form.notes.trim() || undefined,
        });
      } else if (formMode === 'edit' && warranty) {
        await warrantyService.update(warranty.id, {
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          notes: form.notes.trim() || undefined,
        });
      }
      setFormMode('none');
      await fetchWarranty(selectedIncubator);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Không thể lưu bảo hành');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredIncubators = searchTerm.trim()
    ? incubators.filter((inc) =>
        inc.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.modelName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : incubators;

  const isWarrantyExpired = warranty?.endDate
    ? new Date(warranty.endDate) < new Date()
    : false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Shield size={22} className="text-blue-600" />
          Quản Lý Bảo Hành
        </h2>
        <button
          onClick={() => fetchIncubators(currentPage)}
          disabled={loading}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-60"
          title="Làm mới"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Incubator List */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo serial hoặc dòng máy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <Loader2 size={24} className="mx-auto animate-spin mb-2" />
              <p className="text-sm">Đang tải...</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Serial</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Dòng Máy</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Trạng Thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Ngày Kích Hoạt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncubators.map((inc) => (
                    <tr
                      key={inc.id}
                      onClick={() => void fetchWarranty(inc)}
                      className={`border-b border-slate-200 cursor-pointer transition-colors ${
                        selectedIncubator?.id === inc.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-slate-700">{inc.serialNumber || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{inc.modelName || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          INCUBATOR_STATUS_COLOR[inc.status as IncubatorStatus] ?? 'bg-slate-100 text-slate-600'
                        }`}>
                          {INCUBATOR_STATUS_LABEL[inc.status as IncubatorStatus] ?? inc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {inc.activatedAt ? new Date(inc.activatedAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                    </tr>
                  ))}
                  {filteredIncubators.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">Không có kết quả</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="p-3 border-t border-slate-200">
                  <Pagination
                    totalItems={totalIncubators}
                    itemsPerPage={pageSize}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Warranty Detail Panel */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {!selectedIncubator ? (
            <div className="h-full flex items-center justify-center py-16 text-center px-4">
              <div>
                <Shield size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">Chọn máy ấp để xem bảo hành</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Machine Info */}
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">Máy ấp đã chọn</p>
                <p className="text-sm font-mono font-medium text-slate-800 truncate">
                  {selectedIncubator.serialNumber || selectedIncubator.id.slice(0, 12) + "..."}
                </p>
                {selectedIncubator.modelName && (
                  <p className="text-xs text-slate-500 mt-0.5">{selectedIncubator.modelName}</p>
                )}
              </div>

              <div className="flex-1 p-4 space-y-4">
                {warrantyError && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                    <AlertCircle size={14} />
                    {warrantyError}
                  </div>
                )}

                {warrantyLoading ? (
                  <div className="text-center py-6">
                    <Loader2 size={20} className="mx-auto animate-spin text-slate-400" />
                  </div>
                ) : warranty ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <Shield size={14} className="text-blue-600" />
                        Thông Tin Bảo Hành
                      </h4>
                      {formMode === 'none' && (
                        <div className="flex items-center gap-2">
                          {can(role, "warranties", "create") && (isWarrantyExpired || warranty.status !== 'ACTIVE') && (
                            <button
                              onClick={openCreateForm}
                              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
                            >
                              <Plus size={12} />
                              Tạo mới
                            </button>
                          )}
                          {can(role, "warranties", "edit") && (
                            <button
                              onClick={openEditForm}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 size={12} />
                              Sửa
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      {warranty.warrantyCode && (
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                          <span className="text-slate-500">Mã bảo hành:</span>
                          <span className="font-medium text-slate-800">{warranty.warrantyCode}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                        <span className="text-slate-500">Trạng thái:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          WARRANTY_STATUS_CONFIG[warranty.status]?.color ?? 'bg-slate-100 text-slate-600'
                        }`}>
                          {isWarrantyExpired ? 'Hết hạn' : (WARRANTY_STATUS_CONFIG[warranty.status]?.label ?? warranty.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                        <span className="text-slate-500 flex items-center gap-1"><Calendar size={11} />Bắt đầu:</span>
                        <span className="font-medium text-slate-800">
                          {warranty.startDate ? new Date(warranty.startDate).toLocaleDateString('vi-VN') : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                        <span className="text-slate-500 flex items-center gap-1"><Calendar size={11} />Kết thúc:</span>
                        <span className={`font-medium ${isWarrantyExpired ? 'text-red-600' : 'text-slate-800'}`}>
                          {warranty.endDate ? new Date(warranty.endDate).toLocaleDateString('vi-VN') : '—'}
                        </span>
                      </div>
                      {warranty.notes && (
                        <div className="p-2 bg-slate-50 rounded text-xs">
                          <p className="text-slate-500 mb-1">Ghi chú:</p>
                          <p className="text-slate-800">{warranty.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500 mb-3">Chưa có bảo hành cho máy này</p>
                    {can(role, "warranties", "create") && formMode === 'none' && (
                      <button
                        onClick={openCreateForm}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mx-auto"
                      >
                        <Plus size={14} />
                        Tạo bảo hành
                      </button>
                    )}
                  </div>
                )}

                {/* Form */}
                {formMode !== 'none' && (
                  <form onSubmit={(e) => void handleFormSubmit(e)} className="space-y-3 border-t border-slate-200 pt-3">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {formMode === 'create' ? 'Tạo Bảo Hành' : 'Cập Nhật Bảo Hành'}
                    </h4>
                    {formError && (
                      <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{formError}</p>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ngày bắt đầu</label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ngày kết thúc</label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ghi chú</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormMode('none')}
                        className="flex-1 px-3 py-1.5 border border-slate-300 text-slate-700 text-xs rounded-lg hover:bg-slate-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {formSubmitting ? 'Đang lưu...' : 'Lưu'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
