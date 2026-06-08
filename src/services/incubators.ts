import { http } from "@/services/http";
import type { PagedResult } from "@/types/api";
import type { CreateIncubatorPayload, Incubator, IncubatorStatus } from "@/types/incubator";

interface ListIncubatorsParams {
  status?: IncubatorStatus | "all";
  modelId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

const buildIncubatorQuery = ({
  status,
  modelId,
  search,
  page = 1,
  pageSize = 10,
}: ListIncubatorsParams) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (status && status !== "all") {
    params.set("status", status);
  }

  if (modelId) {
    params.set("modelId", modelId);
  }

  if (search && search.trim()) {
    params.set("search", search.trim());
  }

  return params.toString();
};

export const incubatorService = {
  list(params: ListIncubatorsParams = {}) {
    return http.get<PagedResult<Incubator>>(`/incubators?${buildIncubatorQuery(params)}`);
  },
  create(payload: CreateIncubatorPayload) {
    return http.post<string[]>("/incubators", payload);
  },
  getById(id: string) {
    return http.get<Incubator | null>(`/incubators/${id}`);
  },
};
