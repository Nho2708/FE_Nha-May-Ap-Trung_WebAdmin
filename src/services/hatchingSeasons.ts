import { http } from "@/services/http";
import type { PagedResult } from "@/types/api";
import type {
  HatchingSeason,
  HatchingSeasonDetail,
  HatchingBatchDetail,
  CreateHatchingSeasonPayload,
  UpdateHatchingSeasonPayload,
  UpdateHatchingSeasonStatusPayload,
  CreateHatchingBatchPayload,
  UpdateHatchingBatchPayload,
} from "@/types/hatching";

export const hatchingSeasonService = {
  list(params: { incubatorId?: string; customerId?: string; status?: string; page?: number; pageSize?: number } = {}) {
    const p = new URLSearchParams({ page: String(params.page ?? 1), pageSize: String(params.pageSize ?? 10) });
    if (params.incubatorId) p.set("incubatorId", params.incubatorId);
    if (params.customerId) p.set("customerId", params.customerId);
    if (params.status) p.set("status", params.status);
    return http.get<PagedResult<HatchingSeason>>(`/hatching-seasons?${p.toString()}`);
  },
  getById(id: string) {
    return http.get<HatchingSeasonDetail | null>(`/hatching-seasons/${id}`);
  },
  create(payload: CreateHatchingSeasonPayload) {
    return http.post<string>("/hatching-seasons", payload);
  },
  update(id: string, payload: UpdateHatchingSeasonPayload) {
    return http.put<boolean>(`/hatching-seasons/${id}`, payload);
  },
  updateStatus(id: string, payload: UpdateHatchingSeasonStatusPayload) {
    return http.put<boolean>(`/hatching-seasons/${id}/status`, payload);
  },
};

export const hatchingBatchService = {
  getBySeasonId(seasonId: string) {
    return http.get<HatchingBatchDetail[]>(`/hatching-seasons/${seasonId}/batches`);
  },
  create(payload: CreateHatchingBatchPayload) {
    return http.post<string>("/hatching-batches", payload);
  },
  update(id: string, payload: UpdateHatchingBatchPayload) {
    return http.put<boolean>(`/hatching-batches/${id}`, payload);
  },
  delete(id: string) {
    return http.request<boolean>(`/hatching-batches/${id}`, { method: "DELETE" });
  },
};
