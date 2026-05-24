import { http } from "@/services/http";
import type { PagedResult } from "@/types/api";
import type {
  HatchingSeasonTemplate,
  HatchingSeasonTemplateDetail,
  CreateHatchingSeasonTemplatePayload,
  UpdateHatchingSeasonTemplatePayload,
} from "@/types/hatching";

interface ListTemplateParams {
  customerId?: string;
  createdByType?: string;
  page?: number;
  pageSize?: number;
}

const buildQuery = ({ customerId, createdByType, page = 1, pageSize = 20 }: ListTemplateParams) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (customerId) params.set("customerId", customerId);
  if (createdByType) params.set("createdByType", createdByType);
  return params.toString();
};

export const hatchingSeasonTemplateService = {
  list(params: ListTemplateParams = {}) {
    return http.get<PagedResult<HatchingSeasonTemplate>>(
      `/hatching-season-templates?${buildQuery(params)}`
    );
  },
  getById(id: string) {
    return http.get<HatchingSeasonTemplateDetail | null>(`/hatching-season-templates/${id}`);
  },
  create(payload: CreateHatchingSeasonTemplatePayload) {
    return http.post<string>("/hatching-season-templates", payload);
  },
  update(id: string, payload: UpdateHatchingSeasonTemplatePayload) {
    return http.put<boolean>(`/hatching-season-templates/${id}`, payload);
  },
  delete(id: string) {
    return http.request<boolean>(`/hatching-season-templates/${id}`, { method: "DELETE" });
  },
};
