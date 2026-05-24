import { http } from "@/services/http";
import type { PagedResult } from "@/types/api";
import type { IncubatorModel } from "@/types/incubator-model";
import type {
  CreateIncubatorModelPayload,
  UpdateIncubatorModelPayload,
} from "@/app/components/incubator-model-management";

interface ListIncubatorModelsParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

const buildQuery = ({ search, status, page = 1, pageSize = 20 }: ListIncubatorModelsParams) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search?.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);
  return params.toString();
};

export const incubatorModelService = {
  list(params: ListIncubatorModelsParams = {}) {
    return http.get<PagedResult<IncubatorModel>>(`/incubator-models?${buildQuery(params)}`);
  },
  searchByName(search: string, limit = 7) {
    return http.get<PagedResult<IncubatorModel>>(
      `/incubator-models?${buildQuery({ search, page: 1, pageSize: limit })}`,
    );
  },
  getById(id: string) {
    return http.get<IncubatorModel | null>(`/incubator-models/${id}`).then((model) => {
      if (!model) throw new Error("Không tìm thấy dòng máy.");
      return model;
    });
  },
  create(payload: CreateIncubatorModelPayload) {
    return http.post<string>("/incubator-models", payload);
  },
  update(id: string, payload: UpdateIncubatorModelPayload) {
    return http.put<boolean>(`/incubator-models/${id}`, payload);
  },
  delete(id: string) {
    return http.request<boolean>(`/incubator-models/${id}`, { method: "DELETE" });
  },
  uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return http.post<string>("/upload/image", formData);
  },
};