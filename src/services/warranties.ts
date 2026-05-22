import { http } from "@/services/http";
import type { WarrantySummary } from "@/types/maintenance";

export interface CreateWarrantyPayload {
  incubatorId: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface UpdateWarrantyPayload {
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export const warrantyService = {
  getByIncubatorId(incubatorId: string) {
    return http.get<WarrantySummary | null>(`/incubators/${incubatorId}/warranty`);
  },
  create(payload: CreateWarrantyPayload) {
    return http.post<string>("/warranties", payload);
  },
  update(id: string, payload: UpdateWarrantyPayload) {
    return http.put<boolean>(`/warranties/${id}`, payload);
  },
};
